import { Business } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export const requireBusinessOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const businessId = req.params.businessId || req.params.id;

    if (!businessId) {
      throw ApiError.badRequest('Business identifier is required');
    }

    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (req.user.role !== ROLES.ADMIN && business.ownerId !== req.user.id) {
      throw ApiError.forbidden('You do not have permission to manage this business');
    }

    req.business = business;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default requireBusinessOwner;

