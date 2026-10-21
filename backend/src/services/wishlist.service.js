import { Wishlist, Product, Business } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';

export class WishlistService {
  static async getWishlist(customerId) {
    return Wishlist.findAll({
      where: { customerId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'name', 'slug', 'logo']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  static async addToWishlist(customerId, productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const [item, created] = await Wishlist.findOrCreate({
      where: { customerId, productId },
      defaults: { customerId, productId }
    });

    return { item, created };
  }

  static async removeFromWishlist(customerId, productId) {
    const count = await Wishlist.destroy({
      where: { customerId, productId }
    });

    if (count === 0) {
      throw ApiError.notFound('Product was not found in your wishlist');
    }

    return { message: 'Product removed from wishlist' };
  }
}

export default WishlistService;

