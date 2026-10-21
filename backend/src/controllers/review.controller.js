import ReviewService from '../services/review.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class ReviewController {
  static async getProductReviews(req, res, next) {
    try {
      const result = await ReviewService.getProductReviews(req.params.productId, req.query);
      return ApiResponse.success(res, 'Product reviews retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user.id, req.body);
      return ApiResponse.created(res, 'Review submitted successfully', { review });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const result = await ReviewService.deleteReview(req.params.id, req.user.id, req.user.role);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

export default ReviewController;

