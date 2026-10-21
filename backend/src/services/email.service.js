import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

export const isSmtpConfigured = () => {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP credentials are not configured in environment variables');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send password reset email with secure token link
 */
export const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@bizora.com';
  const displayName = name ? name.trim() : 'Valued Customer';

  if (process.env.NODE_ENV === 'test') {
    logger.debug(`[email.service] Test environment: simulated password reset email to ${to}`);
    return { messageId: `test-reset-${Date.now()}`, accepted: [to] };
  }

  if (!isSmtpConfigured()) {
    logger.warn(`[email.service] SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Password reset email to ${to} was skipped.`);
    return { messageId: `skipped-reset-${Date.now()}`, skipped: true };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Bizora Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #FAF7F2;
          margin: 0;
          padding: 30px 16px;
          color: #3B1C5A;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #EADBCC;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(59, 28, 90, 0.08);
        }
        .header {
          background: #3B1C5A;
          padding: 36px 24px;
          text-align: center;
        }
        .logo-title {
          color: #FAF7F2;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .logo-tagline {
          color: #E6B44C;
          font-size: 13px;
          font-weight: 600;
          margin-top: 6px;
          letter-spacing: 0.3px;
        }
        .body-content {
          padding: 36px 32px;
          background: #ffffff;
        }
        .greeting {
          font-size: 19px;
          font-weight: 700;
          color: #3B1C5A;
          margin-bottom: 14px;
        }
        .message {
          font-size: 14.5px;
          line-height: 1.65;
          color: #4A3E56;
          margin-bottom: 20px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .btn-primary {
          display: inline-block;
          background-color: #3B1C5A;
          color: #FAF7F2 !important;
          text-decoration: none;
          padding: 15px 36px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 14.5px;
          box-shadow: 0 6px 18px rgba(59, 28, 90, 0.22);
          border: 2px solid #E6B44C;
        }
        .note-box {
          font-size: 12.5px;
          color: #635373;
          line-height: 1.55;
          background: #F0EAFB;
          padding: 18px;
          border-radius: 20px;
          border: 1px solid #C6B7E2;
          margin-top: 24px;
        }
        .raw-link {
          word-break: break-all;
          font-size: 11.5px;
          color: #3B1C5A;
          font-weight: 600;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #8C7B9E;
          background: #FAF7F2;
          border-top: 1px solid #EADBCC;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">BIZORA</h1>
          <div class="logo-tagline">Digital Market &bull; Password Recovery</div>
        </div>
        <div class="body-content">
          <div class="greeting">Hello ${displayName},</div>
          <p class="message">
            We received a request to reset your password for your Bizora account associated with <strong>${to}</strong>.
          </p>
          <p class="message">
            Click the secure button below to set a new password. For your security, this link will expire in <strong>1 hour</strong>.
          </p>
          <div class="btn-wrapper">
            <a href="${resetLink}" target="_blank" class="btn-primary">
              Reset My Password &rarr;
            </a>
          </div>
          <div class="note-box">
            <strong>Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your account remains protected.
            <div style="margin-top: 12px;">
              If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${resetLink}" class="raw-link">${resetLink}</a>
            </div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bizora Digital Market. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();
  return await transporter.sendMail({
    from: senderEmail.includes('<') ? senderEmail : `"Bizora Digital Market" <${senderEmail}>`,
    to,
    subject: 'Reset Your Bizora Account Password',
    html,
  });
};

/**
 * Send email verification link with secure token
 */
export const sendVerificationEmail = async ({ to, name, verificationToken }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyLink = `${clientUrl}/merchant/account?verifyToken=${encodeURIComponent(verificationToken)}`;
  const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@bizora.com';
  const displayName = name ? name.trim() : 'Valued Merchant';

  if (process.env.NODE_ENV === 'test') {
    logger.debug(`[email.service] Test environment: simulated verification email to ${to}`);
    return { messageId: `test-verify-${Date.now()}`, accepted: [to] };
  }

  if (!isSmtpConfigured()) {
    logger.warn(`[email.service] SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Verification email to ${to} was skipped.`);
    return { messageId: `skipped-verify-${Date.now()}`, skipped: true };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Bizora Email Address</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #FAF7F2;
          margin: 0;
          padding: 30px 16px;
          color: #3B1C5A;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #EADBCC;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(59, 28, 90, 0.08);
        }
        .header {
          background: #3B1C5A;
          padding: 36px 24px;
          text-align: center;
        }
        .logo-title {
          color: #FAF7F2;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .logo-tagline {
          color: #E6B44C;
          font-size: 13px;
          font-weight: 600;
          margin-top: 6px;
          letter-spacing: 0.3px;
        }
        .body-content {
          padding: 36px 32px;
          background: #ffffff;
        }
        .greeting {
          font-size: 19px;
          font-weight: 700;
          color: #3B1C5A;
          margin-bottom: 14px;
        }
        .message {
          font-size: 14.5px;
          line-height: 1.65;
          color: #4A3E56;
          margin-bottom: 20px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .btn-primary {
          display: inline-block;
          background-color: #3B1C5A;
          color: #FAF7F2 !important;
          text-decoration: none;
          padding: 15px 36px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 14.5px;
          box-shadow: 0 6px 18px rgba(59, 28, 90, 0.22);
          border: 2px solid #E6B44C;
        }
        .note-box {
          font-size: 12.5px;
          color: #635373;
          line-height: 1.55;
          background: #F0EAFB;
          padding: 18px;
          border-radius: 20px;
          border: 1px solid #C6B7E2;
          margin-top: 24px;
        }
        .raw-link {
          word-break: break-all;
          font-size: 11.5px;
          color: #3B1C5A;
          font-weight: 600;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #8C7B9E;
          background: #FAF7F2;
          border-top: 1px solid #EADBCC;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">BIZORA</h1>
          <div class="logo-tagline">Merchant Account &bull; Email Verification</div>
        </div>
        <div class="body-content">
          <div class="greeting">Hello ${displayName},</div>
          <p class="message">
            Thank you for registering with Bizora. Please verify your email address (<strong>${to}</strong>) to secure your merchant account and ensure timely business notifications.
          </p>
          <p class="message">
            Click the button below to confirm your email. For your security, this verification link will expire in <strong>24 hours</strong>.
          </p>
          <div class="btn-wrapper">
            <a href="${verifyLink}" target="_blank" class="btn-primary">
              Verify Email Address &rarr;
            </a>
          </div>
          <div class="note-box">
            <strong>Security Notice:</strong> If you did not request this verification or do not have a Bizora merchant account, no action is required.
            <div style="margin-top: 12px;">
              If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${verifyLink}" class="raw-link">${verifyLink}</a>
            </div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bizora Digital Market. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();
  return await transporter.sendMail({
    from: senderEmail.includes('<') ? senderEmail : `"Bizora Digital Market" <${senderEmail}>`,
    to,
    subject: 'Verify Your Bizora Account Email',
    html,
  });
};

export default {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
