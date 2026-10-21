import { Op } from 'sequelize';
import { Category, Business } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export class CategoryService {
  static async generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async getCategories(businessId = null) {
    const where = { isActive: true };
    if (businessId) {
      where[Op.or] = [{ businessId: null }, { businessId }];
    }
    return Category.findAll({
      where,
      order: [['name', 'ASC']]
    });
  }

  static async getCategoryById(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  static async createCategory(businessId, data, userId, userRole) {
    if (businessId) {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw ApiError.notFound('Business not found');
      }
      if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to add categories to this business');
      }
    }

    const slug = await this.generateSlug(data.name);

    return Category.create({
      businessId: businessId || null,
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static async updateCategory(id, data, userId, userRole) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (category.businessId) {
      const business = await Business.findByPk(category.businessId);
      if (business && userRole !== ROLES.ADMIN && business.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to update this category');
      }
    } else if (userRole !== ROLES.ADMIN) {
      throw ApiError.forbidden('Only administrators can update global marketplace categories');
    }

    if (data.name) {
      category.name = data.name;
      category.slug = await this.generateSlug(data.name);
    }
    if (data.description !== undefined) category.description = data.description;
    if (data.imageUrl !== undefined) category.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await category.save();
    return category;
  }

  static async deleteCategory(id, userId, userRole) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (category.businessId) {
      const business = await Business.findByPk(category.businessId);
      if (business && userRole !== ROLES.ADMIN && business.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to delete this category');
      }
    } else if (userRole !== ROLES.ADMIN) {
      throw ApiError.forbidden('Only administrators can delete global categories');
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
}

export default CategoryService;

