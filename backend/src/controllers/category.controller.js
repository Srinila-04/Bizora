import CategoryService from '../services/category.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getCategories(req.query.businessId);
      return ApiResponse.success(res, 'Categories retrieved', { categories });
    } catch (error) {
      return next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return ApiResponse.success(res, 'Category details retrieved', { category });
    } catch (error) {
      return next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(
        req.body.businessId,
        req.body,
        req.user.id,
        req.user.role
      );
      return ApiResponse.created(res, 'Category created successfully', { category });
    } catch (error) {
      return next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, 'Category updated successfully', { category });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const result = await CategoryService.deleteCategory(
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

export default CategoryController;

