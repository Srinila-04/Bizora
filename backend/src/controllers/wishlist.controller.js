import WishlistService from '../services/wishlist.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class WishlistController {
  static async getWishlist(req, res, next) {
    try {
      const items = await WishlistService.getWishlist(req.user.id);
      return ApiResponse.success(res, 'Wishlist retrieved', { items });
    } catch (error) {
      return next(error);
    }
  }

  static async addToWishlist(req, res, next) {
    try {
      const { item, created } = await WishlistService.addToWishlist(req.user.id, req.body.productId);
      return ApiResponse.success(
        res,
        created ? 'Product added to wishlist' : 'Product already in wishlist',
        { item }
      );
    } catch (error) {
      return next(error);
    }
  }

  static async removeFromWishlist(req, res, next) {
    try {
      const result = await WishlistService.removeFromWishlist(req.user.id, req.params.productId);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

export default WishlistController;

