import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access restricted to roles: ${roles.join(', ')}`));
    }

    return next();
  };
};

export default authorizeRoles;

