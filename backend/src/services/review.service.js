import { Review, Product, Order, OrderItem, User, Business } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { PAYMENT_STATUS } from '../constants/orderStatus.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class ReviewService {
  static async getProductReviews(productId, query = {}) {
    const { page, limit, offset } = parsePagination(query, 10, 50);

    const { count, rows } = await Review.findAndCountAll({
      where: {
        productId,
        status: 'published'
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    return {
      reviews: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async createReview(customerId, { productId, rating, comment }) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check if customer is a verified purchaser
    const verifiedOrder = await Order.findOne({
      where: {
        customerId,
        businessId: product.businessId,
        paymentStatus: PAYMENT_STATUS.PAID
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { productId }
        }
      ]
    });

    const isVerifiedPurchase = !!verifiedOrder;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { customerId, productId }
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.isVerifiedPurchase = isVerifiedPurchase;
      await existingReview.save();
      return existingReview;
    }

    return Review.create({
      productId,
      customerId,
      businessId: product.businessId,
      rating,
      comment,
      isVerifiedPurchase,
      status: 'published'
    });
  }

  static async deleteReview(reviewId, userId, userRole) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (userRole !== 'admin' && review.customerId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this review');
    }

    await review.destroy();
    return { message: 'Review deleted successfully' };
  }
}

export default ReviewService;

