import { Op } from 'sequelize';
import { Product, ProductVariant, Business, Category, Review } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class ProductService {
  static async generateSlug(name, businessId) {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug || 'product';
    let counter = 1;

    while (await Product.findOne({ where: { slug, businessId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  static async getProducts({
    businessId,
    categoryId,
    search,
    minPrice,
    maxPrice,
    inStock,
    stockStatus,
    status,
    isOwnerView = false,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  }) {
    const where = {};

    if (businessId) {
      where.businessId = businessId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (!isOwnerView) {
      where.isPublished = true;
      where.status = 'active';
    } else if (status && status !== 'all') {
      if (status === 'draft') {
        where[Op.or] = [{ status: 'draft' }, { isPublished: false }];
      } else if (status === 'active') {
        where.status = 'active';
        where.isPublished = true;
      } else {
        where.status = status;
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in_stock') {
        where.stockQuantity = { [Op.gt]: 0 };
      } else if (stockStatus === 'low_stock') {
        where[Op.and] = [
          { stockQuantity: { [Op.gt]: 0 } },
          Product.sequelize.where(Product.sequelize.col('stockQuantity'), '<=', Product.sequelize.col('lowStockThreshold'))
        ];
      } else if (stockStatus === 'out_of_stock') {
        where.stockQuantity = { [Op.lte]: 0 };
      }
    } else if (inStock === 'true' || inStock === true) {
      where.stockQuantity = { [Op.gt]: 0 };
    }

    const validSortFields = ['createdAt', 'name', 'price', 'stockQuantity'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { page: safePage, limit: safeLimit, offset } = parsePagination({ page, limit }, 20, 100);

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: safeLimit,
      offset,
      order: [[orderField, orderDirection]],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Business,
          as: 'business',
          attributes: [
            'id', 'name', 'slug', 'isPublished', 'status', 'logo', 'banner',
            'category', 'address', 'addressDetails', 'themeSettings'
          ]
        }
      ]
    });

    return {
      products: rows,
      pagination: formatPaginationMeta(count, safePage, safeLimit)
    };
  }

  static async getProductDetails(idOrSlug, businessId = null) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const where = isUUID ? { id: idOrSlug } : { slug: idOrSlug };

    if (businessId && !isUUID) {
      where.businessId = businessId;
    }

    const product = await Product.findOne({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Business,
          as: 'business',
          attributes: [
            'id', 'name', 'slug', 'isPublished', 'status', 'logo', 'banner',
            'category', 'address', 'addressDetails', 'phone', 'email',
            'description', 'website', 'themeSettings'
          ]
        },
        {
          model: Review,
          as: 'reviews',
          where: { status: 'published' },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: { [Op.ne]: 'archived' } },
          required: false
        }
      ]
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (!product.business || product.business.status === 'archived') {
      throw ApiError.notFound('Product or business is unavailable');
    }

    return product;
  }

  static async createProduct(userId, userRole, data) {
    const business = await Business.findByPk(data.businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to add products to this business');
    }

    if (data.categoryId) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw ApiError.badRequest('Invalid category: specified category does not exist');
      }
      if (category.businessId && category.businessId !== business.id) {
        throw ApiError.badRequest('Category does not belong to this business');
      }
    }

    const slug = await this.generateSlug(data.name, business.id);

    return Product.create({
      businessId: business.id,
      categoryId: data.categoryId || null,
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      costPrice: data.costPrice || null,
      sku: data.sku || null,
      barcode: data.barcode || null,
      stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : 0,
      lowStockThreshold: data.lowStockThreshold !== undefined ? data.lowStockThreshold : 5,
      images: data.images || [],
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      status: data.status || (data.isPublished === false ? 'draft' : 'active'),
      displayStyle: data.displayStyle || 'standard'
    });
  }

  static async updateProduct(productId, userId, userRole, updateData) {
    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (userRole !== ROLES.ADMIN && product.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to modify this product');
    }

    if (updateData.categoryId !== undefined) {
      if (updateData.categoryId) {
        const category = await Category.findByPk(updateData.categoryId);
        if (!category) {
          throw ApiError.badRequest('Invalid category specified');
        }
        if (category.businessId && category.businessId !== product.businessId) {
          throw ApiError.badRequest('Category does not belong to this business');
        }
      }
      product.categoryId = updateData.categoryId;
    }

    if (updateData.name && updateData.name !== product.name) {
      product.name = updateData.name;
      product.slug = await this.generateSlug(updateData.name, product.businessId);
    }

    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.compareAtPrice !== undefined) product.compareAtPrice = updateData.compareAtPrice;
    if (updateData.costPrice !== undefined) product.costPrice = updateData.costPrice;
    if (updateData.sku !== undefined) product.sku = updateData.sku;
    if (updateData.barcode !== undefined) product.barcode = updateData.barcode;
    if (updateData.stockQuantity !== undefined) product.stockQuantity = updateData.stockQuantity;
    if (updateData.lowStockThreshold !== undefined) product.lowStockThreshold = updateData.lowStockThreshold;
    if (updateData.images !== undefined) product.images = updateData.images;
    if (updateData.isPublished !== undefined) product.isPublished = updateData.isPublished;
    if (updateData.status !== undefined) product.status = updateData.status;
    if (updateData.displayStyle !== undefined) product.displayStyle = updateData.displayStyle;

    await product.save();
    return product;
  }

  static async getProductSummary(businessId, userId, userRole) {
    if (!businessId) {
      throw ApiError.badRequest('businessId is required');
    }

    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to access product summaries for this business');
    }

    const total = await Product.count({ where: { businessId } });
    const active = await Product.count({
      where: {
        businessId,
        status: 'active',
        isPublished: true
      }
    });
    const draft = await Product.count({
      where: {
        businessId,
        [Op.or]: [{ status: 'draft' }, { isPublished: false }]
      }
    });
    const outOfStock = await Product.count({
      where: {
        businessId,
        stockQuantity: { [Op.lte]: 0 }
      }
    });

    return {
      total,
      active,
      draft,
      outOfStock
    };
  }

  static async duplicateProduct(productId, userId, userRole) {
    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (userRole !== ROLES.ADMIN && product.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to duplicate this product');
    }

    const newName = `${product.name} (Copy)`;
    const newSlug = await this.generateSlug(newName, product.businessId);
    const newSku = product.sku ? `${product.sku}-copy` : null;

    const duplicated = await Product.create({
      businessId: product.businessId,
      categoryId: product.categoryId,
      name: newName,
      slug: newSlug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      sku: newSku,
      barcode: product.barcode,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      images: Array.isArray(product.images) ? [...product.images] : [],
      isPublished: false,
      status: 'draft',
      displayStyle: product.displayStyle || 'standard'
    });

    return duplicated;
  }

  static async deleteProduct(productId, userId, userRole) {
    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (userRole !== ROLES.ADMIN && product.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this product');
    }

    await product.destroy();
    return { message: 'Product deleted successfully' };
  }
}

export default ProductService;

