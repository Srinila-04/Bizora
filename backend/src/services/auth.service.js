import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, RefreshToken, AuditLog, Notification, sequelize } from '../database/models/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken
} from '../utils/token.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import logger from '../utils/logger.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service.js';

export class AuthService {
  static async register({ firstName, lastName, fullName, email, phone, password, role = ROLES.CUSTOMER }, meta = {}) {
    let finalFirstName = firstName;
    let finalLastName = lastName;

    if (fullName && (!finalFirstName || !finalLastName)) {
      const parts = fullName.trim().split(/\s+/);
      finalFirstName = finalFirstName || parts[0] || 'User';
      finalLastName = finalLastName || parts.slice(1).join(' ') || parts[0];
    } else {
      finalFirstName = finalFirstName || 'User';
      finalLastName = finalLastName || finalFirstName;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent privilege escalation
    const finalRole = role === ROLES.ADMIN ? ROLES.CUSTOMER : role;

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailVerificationToken = generateRandomToken(32);
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      firstName: finalFirstName,
      lastName: finalLastName,
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      role: finalRole,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
    });

    const tokens = await this._issueTokens(user, meta);

    await AuditLog.create({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress
    });

    return {
      user: user.toJSON(),
      tokens,
      verificationToken: emailVerificationToken // For development / testing notification
    };
  }

  static async login({ email, identifier, phone, password }, meta = {}) {
    const rawIdentifier = (identifier || email || phone || '').trim();
    if (!rawIdentifier) {
      throw ApiError.badRequest('Email address or mobile number is required.', 'IDENTIFIER_REQUIRED');
    }

    let user = null;
    if (rawIdentifier.includes('@')) {
      user = await User.findOne({ where: { email: rawIdentifier.toLowerCase() } });
    } else {
      // Look up by phone first, and fallback to email
      user = await User.findOne({ where: { phone: rawIdentifier } });
      if (!user) {
        user = await User.findOne({ where: { email: rawIdentifier.toLowerCase() } });
      }
    }

    if (!user) {
      throw ApiError.unauthorized('Invalid email/mobile or password.', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('This account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email/mobile or password.', 'INVALID_CREDENTIALS');
    }

    const tokens = await this._issueTokens(user, meta);

    await AuditLog.create({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress
    });

    return {
      user: user.toJSON(),
      tokens
    };
  }

  static async refreshTokens(rawRefreshToken, meta = {}) {
    if (!rawRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({
      where: {
        tokenHash,
        userId: decoded.userId
      }
    });

    if (!storedToken || storedToken.isRevoked || storedToken.isExpired) {
      throw ApiError.unauthorized('Refresh token has expired or been revoked', 'TOKEN_REVOKED');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive', 'USER_INACTIVE');
    }

    // Refresh Token Rotation: Revoke current token and issue replacement
    const newTokens = await this._issueTokens(user, meta);

    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    storedToken.replacedByToken = hashToken(newTokens.refreshToken);
    await storedToken.save();

    return {
      tokens: newTokens
    };
  }

  static async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ where: { tokenHash } });
    if (storedToken && !storedToken.isRevoked) {
      storedToken.isRevoked = true;
      storedToken.revokedAt = new Date();
      await storedToken.save();
    }
  }

  static async logoutAll(userId) {
    await RefreshToken.update(
      {
        isRevoked: true,
        revokedAt: new Date()
      },
      {
        where: {
          userId,
          isRevoked: false
        }
      }
    );
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect.', 'INVALID_CURRENT_PASSWORD');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Revoke all existing sessions
    await this.logoutAll(userId);

    await AuditLog.create({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id
    });

    try {
      await Notification.create({
        userId: user.id,
        title: 'Password Changed Successfully',
        message: 'Your account password was updated. If you did not make this change, please contact support immediately.',
        type: 'system',
        data: { action: 'PASSWORD_CHANGED' }
      });
    } catch (notifErr) {
      logger.warn(`[AuthService] Could not log password notification: ${notifErr.message}`);
    }

    return { message: 'Password changed successfully. Please log in with your new password.' };
  }

  static async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Always return success message to avoid account enumeration
    if (!user) {
      return {
        message: 'If an account with that email exists, password reset instructions have been sent.'
      };
    }

    const resetToken = generateRandomToken(32);
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send real email with reset link via Google / Gmail SMTP
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.firstName,
        resetToken
      });
      logger.info(`[AuthService] Password reset email successfully sent to ${user.email}`);
    } catch (mailError) {
      logger.warn(`[AuthService] Could not dispatch email to ${user.email}: ${mailError.message}`);
    }

    return {
      message: 'If an account with that email exists, password reset instructions have been sent.',
      resetToken // provided for API consumer/testing workflow
    };
  }

  static async resetPassword({ token, password }) {
    const hashed = hashToken(token);
    const user = await User.findOne({
      where: {
        passwordResetToken: hashed,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw ApiError.badRequest('Password reset token is invalid or has expired.', 'INVALID_RESET_TOKEN');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all sessions
    await this.logoutAll(user.id);

    return { message: 'Password has been reset successfully. You may now log in.' };
  }

  static async verifyEmail(token) {
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw ApiError.badRequest('Email verification token is invalid or has expired.', 'INVALID_VERIFICATION_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    try {
      await Notification.create({
        userId: user.id,
        title: 'Email Address Verified',
        message: 'Your email address has been verified successfully. Your account is fully secured.',
        type: 'system',
        data: { action: 'EMAIL_VERIFIED' }
      });
    } catch (notifErr) {
      logger.warn(`[AuthService] Could not log verify email notification: ${notifErr.message}`);
    }

    return { message: 'Email verified successfully.' };
  }

  static async resendVerification(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || user.isEmailVerified) {
      return { message: 'If your account requires verification, a new link has been sent.' };
    }

    const token = generateRandomToken(32);
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Dispatch real email via SMTP
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.firstName,
        verificationToken: token
      });
      logger.info(`[AuthService] Verification email sent to ${user.email}`);
    } catch (mailError) {
      logger.warn(`[AuthService] Could not dispatch verification email to ${user.email}: ${mailError.message}`);
    }

    try {
      await Notification.create({
        userId: user.id,
        title: 'Email Verification Sent',
        message: `An email verification link has been sent to ${user.email}. Please check your inbox.`,
        type: 'system',
        data: { action: 'EMAIL_VERIFICATION_SENT' }
      });
    } catch (notifErr) {
      logger.warn(`[AuthService] Could not log verification sent notification: ${notifErr.message}`);
    }

    return {
      message: 'If your account requires verification, a new link has been sent.'
    };
  }

  static async _issueTokens(user, meta = {}) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({
      ...payload,
      jti: generateRandomToken(16)
    });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      deviceInfo: meta.deviceInfo || 'web',
      ipAddress: meta.ipAddress || null,
      expiresAt
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '15m'
    };
  }
}

export default AuthService;

