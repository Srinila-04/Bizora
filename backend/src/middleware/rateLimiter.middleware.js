import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 300, // Generous in dev, 300 in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: []
    }
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strictly limit each IP to 20 sensitive auth attempts (login/register/password recovery)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      details: []
    }
  }
});

export const userMeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Dedicated comfortable limit for /auth/me session checks
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many profile requests, please try again shortly.',
    error: {
      code: 'USER_RATE_LIMIT_EXCEEDED',
      details: []
    }
  }
});

export default {
  globalLimiter,
  authLimiter,
  userMeLimiter
};

