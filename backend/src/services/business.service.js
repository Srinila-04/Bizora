import path from 'path';
import { Op } from 'sequelize';
import {
  sequelize,
  Business,
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Review,
  Payment,
  Wishlist,
  ProductVariant,
  StockMovement,
  Conversation,
  Message
} from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';
import { deleteUploadedFile } from '../middleware/upload.middleware.js';

export class BusinessService {
  static async generateSlug(name) {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug || 'business';
    let counter = 1;

    while (await Business.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  static async createBusiness(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // A single user can own multiple businesses
    const slug = await this.generateSlug(data.name);

    let address = data.address;
    if (!address && data.addressDetails && typeof data.addressDetails === 'object') {
      const { street, city, state, postalCode, country } = data.addressDetails;
      address = [street, city, state, postalCode, country].filter(Boolean).join(', ');
    }

    const business = await Business.create({
      ownerId: userId,
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      email: data.email || user.email,
      phone: data.phone || user.phone,
      address: address || null,
      addressDetails: data.addressDetails || null,
      website: data.website || null,
      taxId: data.taxId || null,
      socialLinks: data.socialLinks || {},
      logo: data.logo || null,
      banner: data.banner || null,
      themeSettings: data.themeSettings || {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        font: 'Inter',
        layout: 'standard'
      },
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      status: 'active'
    });

    // If user was customer, ensure their role allows business ownership
    if (user.role === ROLES.CUSTOMER) {
      user.role = ROLES.BUSINESS_OWNER;
      await user.save();
    }

    return business;
  }

  static async getUserBusinesses(userId) {
    return Business.findAll({
      where: {
        ownerId: userId,
        status: { [Op.ne]: 'archived' }
      },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getMarketplaceBusinesses(query = {}) {
    const { page, limit, offset } = parsePagination(query, 12, 500);
    const { search, category, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const where = {
      status: 'active'
    };

    if (query.publishedOnly === 'true') {
      where.isPublished = true;
    }

    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { category: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    const validSortFields = ['createdAt', 'name'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Business.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDirection]],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    return {
      businesses: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async getBusinessDetails(idOrSlug) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const where = isUUID ? { id: idOrSlug } : { slug: idOrSlug };

    const business = await Business.findOne({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Category,
          as: 'categories',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!business || business.status === 'archived') {
      throw ApiError.notFound('Business not found');
    }

    return business;
  }

  static async updateBusiness(businessId, userId, updateData, userRole) {
    const business = await Business.findByPk(businessId);
    if (!business || business.status === 'archived') {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to update this business');
    }

    if (updateData.name && updateData.name !== business.name) {
      business.name = updateData.name;
    }
    if (updateData.description !== undefined) business.description = updateData.description;
    if (updateData.category !== undefined) business.category = updateData.category;
    if (updateData.email !== undefined) business.email = updateData.email;
    if (updateData.phone !== undefined) business.phone = updateData.phone;
    if (updateData.address !== undefined) business.address = updateData.address;
    if (updateData.addressDetails !== undefined) business.addressDetails = updateData.addressDetails;
    if (updateData.website !== undefined) business.website = updateData.website;
    if (updateData.taxId !== undefined) business.taxId = updateData.taxId;
    if (updateData.socialLinks !== undefined) business.socialLinks = updateData.socialLinks;
    if (updateData.logo !== undefined) {
      const newLogo = updateData.logo === '' ? null : updateData.logo;
      if (business.logo && business.logo !== newLogo && business.logo.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(business.logo));
      }
      business.logo = newLogo;
    }
    if (updateData.banner !== undefined) {
      const newBanner = updateData.banner === '' ? null : updateData.banner;
      if (business.banner && business.banner !== newBanner && business.banner.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(business.banner));
      }
      business.banner = newBanner;
    }
    if (updateData.isPublished !== undefined) business.isPublished = updateData.isPublished;
    if (updateData.status !== undefined) business.status = updateData.status;

    await business.save();
    return business;
  }

  static async deleteOrArchiveBusiness(businessId, userId, userRole) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId);
    if (!isUUID) {
      throw ApiError.badRequest('Invalid business ID format');
    }

    const business = await Business.findByPk(businessId);
    if (!business || business.status === 'archived') {
      throw ApiError.notFound('Business not found or already deleted');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this business');
    }

    // Check if business has existing orders or payment records that must be retained
    const orderCount = await Order.count({ where: { businessId } });
    const paymentCount = await Payment.count({ where: { businessId } });
    const hasFinancialRecords = orderCount > 0 || paymentCount > 0;

    if (hasFinancialRecords) {
      // Soft-delete / archive business to preserve order and payment records for customer and audit retention
      await sequelize.transaction(async (t) => {
        business.status = 'archived';
        business.isPublished = false;
        await business.save({ transaction: t });

        // Unpublish products so they are no longer visible or purchasable
        await Product.update(
          { isPublished: false },
          { where: { businessId }, transaction: t }
        );
      });

      return {
        success: true,
        archived: true,
        message: `Business "${business.name}" has been successfully deleted and archived`
      };
    }

    // If no orders or payments exist, safely delete the business and its associated data
    await sequelize.transaction(async (t) => {
      // 1. Find all product IDs for this business
      const products = await Product.findAll({
        where: { businessId },
        attributes: ['id'],
        transaction: t
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        await Wishlist.destroy({ where: { productId: { [Op.in]: productIds } }, transaction: t });
        await Review.destroy({ where: { productId: { [Op.in]: productIds } }, transaction: t });
        await StockMovement.destroy({ where: { productId: { [Op.in]: productIds } }, transaction: t });
        await ProductVariant.destroy({ where: { productId: { [Op.in]: productIds } }, transaction: t });
        await Product.destroy({ where: { id: { [Op.in]: productIds } }, transaction: t });
      }

      // 2. Delete business-level child records
      await Review.destroy({ where: { businessId }, transaction: t });
      await StockMovement.destroy({ where: { businessId }, transaction: t });
      await ProductVariant.destroy({ where: { businessId }, transaction: t });
      await Category.destroy({ where: { businessId }, transaction: t });

      // 3. Clean up conversations & messages
      const conversations = await Conversation.findAll({
        where: { businessId },
        attributes: ['id'],
        transaction: t
      });
      const convIds = conversations.map((c) => c.id);
      if (convIds.length > 0) {
        await Message.destroy({ where: { conversationId: { [Op.in]: convIds } }, transaction: t });
        await Conversation.destroy({ where: { id: { [Op.in]: convIds } }, transaction: t });
      }

      // 4. Clean up uploaded logo and banner files
      if (business.logo && business.logo.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(business.logo));
      }
      if (business.banner && business.banner.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(business.banner));
      }

      // 5. Delete the business record itself
      await business.destroy({ transaction: t });
    });

    return {
      success: true,
      deleted: true,
      message: `Business "${business.name}" has been deleted successfully`
    };
  }

  static async togglePublish(businessId, userId, userRole) {
    const business = await Business.findByPk(businessId);
    if (!business || business.status === 'archived') {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to modify storefront visibility');
    }

    business.isPublished = !business.isPublished;
    await business.save();

    return {
      isPublished: business.isPublished,
      message: `Storefront has been ${business.isPublished ? 'published to marketplace' : 'unpublished'}`
    };
  }

  static async updateThemeSettings(businessId, userId, themeData, userRole) {
    const business = await Business.findByPk(businessId);
    if (!business || business.status === 'archived') {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to customize this storefront theme');
    }

    const currentTheme = business.themeSettings || {};
    const isDraft = Boolean(themeData.isDraft);

    if (isDraft) {
      // Save draft settings without changing the currently published storefront
      const { isDraft: _, ...draftValues } = themeData;
      business.themeSettings = {
        ...currentTheme,
        draft: {
          ...(currentTheme.draft || {}),
          ...draftValues,
          updatedAt: new Date().toISOString()
        }
      };
    } else {
      // Publish live to customers
      const { isDraft: _, ...publishValues } = themeData;
      business.themeSettings = {
        ...currentTheme,
        ...publishValues
      };
    }

    business.changed('themeSettings', true);
    await business.save();
    return business;
  }
}

export default BusinessService;

