import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../database/models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is inactive or no longer exists');
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token has expired', 'TOKEN_EXPIRED'));
    }
    return next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findByPk(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Silently continue for optional authentication
      }
    }
    return next();
  } catch (err) {
    return next();
  }
};

export default {
  authenticate,
  optionalAuth
};

