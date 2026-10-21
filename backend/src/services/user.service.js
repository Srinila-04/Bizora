import { User, Business } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class UserService {
  static async getUsers(query = {}) {
    const { page, limit, offset } = parsePagination(query, 20, 100);
    const { role } = query;

    const where = {};
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] }
    });

    return {
      users: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async getUserById(id) {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'businesses',
          attributes: ['id', 'name', 'slug', 'isPublished', 'status']
        }
      ]
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user.toJSON();
  }

  static async updateUserStatus(userId, { isActive }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActive = isActive;
    await user.save();

    return user.toJSON();
  }
}

export default UserService;

