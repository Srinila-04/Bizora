import BusinessService from '../services/business.service.js';
import AnalyticsService from '../services/analytics.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class BusinessController {
  static async createBusiness(req, res, next) {
    try {
      const business = await BusinessService.createBusiness(req.user.id, req.body);
      return ApiResponse.created(res, 'Business created successfully', { business });
    } catch (error) {
      return next(error);
    }
  }

  static async getMyBusinesses(req, res, next) {
    try {
      const businesses = await BusinessService.getUserBusinesses(req.user.id);
      return ApiResponse.success(res, 'User businesses retrieved', { businesses });
    } catch (error) {
      return next(error);
    }
  }

  static async getMarketplaceBusinesses(req, res, next) {
    try {
      const result = await BusinessService.getMarketplaceBusinesses(req.query);
      return ApiResponse.success(res, 'Marketplace businesses retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getBusinessDetails(req, res, next) {
    try {
      const business = await BusinessService.getBusinessDetails(req.params.id);
      return ApiResponse.success(res, 'Business details retrieved', { business });
    } catch (error) {
      return next(error);
    }
  }

  static async updateBusiness(req, res, next) {
    try {
      const business = await BusinessService.updateBusiness(
        req.params.id,
        req.user.id,
        req.body,
        req.user.role
      );
      return ApiResponse.success(res, 'Business updated successfully', { business });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteBusiness(req, res, next) {
    try {
      const result = await BusinessService.deleteOrArchiveBusiness(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async togglePublish(req, res, next) {
    try {
      const result = await BusinessService.togglePublish(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateTheme(req, res, next) {
    try {
      const business = await BusinessService.updateThemeSettings(
        req.params.id,
        req.user.id,
        req.body,
        req.user.role
      );
      return ApiResponse.success(res, 'Theme settings updated successfully', { business });
    } catch (error) {
      return next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getBusinessAnalytics(
        req.params.id,
        req.user.id,
        req.user.role,
        req.query
      );
      return ApiResponse.success(res, 'Business analytics retrieved', { analytics });
    } catch (error) {
      return next(error);
    }
  }
}

export default BusinessController;

