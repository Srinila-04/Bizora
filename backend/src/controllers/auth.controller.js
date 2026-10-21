import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { getCookieOptions, generateRandomToken } from '../utils/token.js';
import { User, Notification } from '../database/models/index.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../services/email.service.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      };
      const result = await AuthService.register(req.body, meta);

      // Set HTTP-only refresh token cookie
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());

      return ApiResponse.created(res, 'User registration successful', result);
    } catch (error) {
      return next(error);
    }
  }

  static async registerCustomer(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      };
      const result = await AuthService.register({
        ...req.body,
        role: 'customer'
      }, meta);

      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
      return ApiResponse.created(res, 'Customer account created successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async registerMerchant(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      };
      const result = await AuthService.register({
        ...req.body,
        role: 'business_owner'
      }, meta);

      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
      return ApiResponse.created(res, 'Merchant account created successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      };
      const result = await AuthService.login(req.body, meta);

      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());

      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      return next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
      const meta = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      };
      const result = await AuthService.refreshTokens(rawRefreshToken, meta);

      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());

      return ApiResponse.success(res, 'Tokens refreshed successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const rawRefreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
      await AuthService.logout(rawRefreshToken);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.user.id);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, 'Logged out from all sessions successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      return ApiResponse.success(res, 'Current user profile retrieved', {
        user: req.user.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateMe(req, res, next) {
    try {
      const { firstName, lastName, email, phone, avatar } = req.body;
      const user = req.user;

      if (firstName !== undefined) user.firstName = firstName.trim();
      if (lastName !== undefined) user.lastName = lastName.trim();
      if (phone !== undefined) user.phone = phone ? phone.trim() : null;
      if (avatar !== undefined) user.avatar = avatar;

      let emailChanged = false;
      if (email !== undefined && typeof email === 'string') {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail && normalizedEmail !== user.email) {
          // Check uniqueness across users
          const existing = await User.findOne({ where: { email: normalizedEmail } });
          if (existing && existing.id !== user.id) {
            throw ApiError.conflict('An account with this email address already exists.');
          }
          user.email = normalizedEmail;
          user.isEmailVerified = false; // Reset verification status for new email
          const token = generateRandomToken(32);
          user.emailVerificationToken = token;
          user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
          emailChanged = true;

          try {
            await sendVerificationEmail({
              to: user.email,
              name: user.firstName,
              verificationToken: token
            });
            logger.info(`[AuthController] Verification email sent to updated email ${user.email}`);
          } catch (mailError) {
            logger.warn(`[AuthController] Could not dispatch verification email to ${user.email}: ${mailError.message}`);
          }

          try {
            await Notification.create({
              userId: user.id,
              title: 'Email Address Updated',
              message: `Your login email was updated to ${user.email}. A verification link has been sent to complete verification.`,
              type: 'system',
              data: { action: 'EMAIL_UPDATED' }
            });
          } catch (notifErr) {
            logger.warn(`[AuthController] Could not create email update notification: ${notifErr.message}`);
          }
        }
      }

      await user.save();
      return ApiResponse.success(res, 'Profile updated successfully', {
        user: user.toJSON(),
        emailChanged
      });
    } catch (error) {
      return next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      return ApiResponse.success(res, result.message, { resetToken: result.resetToken });
    } catch (error) {
      return next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const token = req.body.token || req.query.token;
      const result = await AuthService.verifyEmail(token);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async resendVerification(req, res, next) {
    try {
      const result = await AuthService.resendVerification(req.body.email);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;

