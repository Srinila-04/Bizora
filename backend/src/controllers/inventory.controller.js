import InventoryService from '../services/inventory.service.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

export class InventoryController {
  static async getSummary(req, res, next) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        throw ApiError.badRequest('businessId query parameter is required');
      }

      const summary = await InventoryService.getInventorySummary(
        businessId,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, 'Inventory summary retrieved successfully', summary);
    } catch (error) {
      return next(error);
    }
  }

  static async getItems(req, res, next) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        throw ApiError.badRequest('businessId query parameter is required');
      }

      const result = await InventoryService.getInventoryItems(
        businessId,
        req.user.id,
        req.user.role,
        req.query
      );
      return ApiResponse.success(res, 'Inventory items retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async adjustStock(req, res, next) {
    try {
      const { businessId } = req.body;
      if (!businessId) {
        throw ApiError.badRequest('businessId is required');
      }

      const result = await InventoryService.adjustStock(
        businessId,
        req.user.id,
        req.user.role,
        req.body
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateThreshold(req, res, next) {
    try {
      const { businessId } = req.body;
      if (!businessId) {
        throw ApiError.badRequest('businessId is required');
      }

      const result = await InventoryService.updateThreshold(
        businessId,
        req.user.id,
        req.user.role,
        req.body
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async getMovements(req, res, next) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        throw ApiError.badRequest('businessId query parameter is required');
      }

      const result = await InventoryService.getStockMovements(
        businessId,
        req.user.id,
        req.user.role,
        req.query
      );
      return ApiResponse.success(res, 'Stock movement history retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async createVariant(req, res, next) {
    try {
      const { businessId } = req.body;
      const { productId } = req.params;
      if (!businessId) {
        throw ApiError.badRequest('businessId is required');
      }

      const variant = await InventoryService.createVariant(
        businessId,
        req.user.id,
        req.user.role,
        productId,
        req.body
      );
      return ApiResponse.created(res, 'Variant created successfully', { variant });
    } catch (error) {
      return next(error);
    }
  }
}

export default InventoryController;

