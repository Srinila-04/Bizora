import ProductService from '../services/product.service.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { Business } from '../database/models/index.js';
import { ROLES } from '../constants/roles.js';

export class ProductController {
  static async getProducts(req, res, next) {
    try {
      const isOwnerView = req.query.isOwnerView === 'true' && !!req.user;

      if (isOwnerView && req.query.businessId) {
        const business = await Business.findByPk(req.query.businessId);
        if (!business) {
          throw ApiError.notFound('Business not found');
        }
        if (req.user.role !== ROLES.ADMIN && business.ownerId !== req.user.id) {
          throw ApiError.forbidden('You do not have permission to access products for this business');
        }
      }

      const result = await ProductService.getProducts({
        ...req.query,
        isOwnerView
      });
      return ApiResponse.success(res, 'Products retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getProductSummary(req, res, next) {
    try {
      const summary = await ProductService.getProductSummary(
        req.query.businessId,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, 'Product summary retrieved successfully', { summary });
    } catch (error) {
      return next(error);
    }
  }

  static async getProductDetails(req, res, next) {
    try {
      const product = await ProductService.getProductDetails(req.params.id, req.query.businessId);
      return ApiResponse.success(res, 'Product details retrieved', { product });
    } catch (error) {
      return next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.user.id, req.user.role, req.body);
      return ApiResponse.created(res, 'Product created successfully', { product });
    } catch (error) {
      return next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      return ApiResponse.success(res, 'Product updated successfully', { product });
    } catch (error) {
      return next(error);
    }
  }

  static async duplicateProduct(req, res, next) {
    try {
      const product = await ProductService.duplicateProduct(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ApiResponse.created(res, 'Product duplicated successfully', { product });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;


