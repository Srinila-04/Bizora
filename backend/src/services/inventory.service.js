import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import {
  Product,
  ProductVariant,
  StockMovement,
  Business,
  Category,
  User,
  Order
} from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class InventoryService {
  /**
   * Helper to verify business authorization
   */
  static async verifyBusinessAccess(businessId, userId, userRole) {
    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }
    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to manage inventory for this business');
    }
    return business;
  }

  /**
   * Get 5 inventory summary metrics for the business
   */
  static async getInventorySummary(businessId, userId, userRole) {
    await this.verifyBusinessAccess(businessId, userId, userRole);

    // 1. Total active products
    const totalProducts = await Product.count({
      where: {
        businessId,
        status: { [Op.ne]: 'archived' }
      }
    });

    // 2. Fetch all products and their variants to calculate SKUs and stock states
    const products = await Product.findAll({
      where: {
        businessId,
        status: { [Op.ne]: 'archived' }
      },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: { [Op.ne]: 'archived' } },
          required: false
        }
      ]
    });

    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let itemsWithCostCount = 0;

    for (const prod of products) {
      const variants = prod.variants || [];
      if (variants.length > 0) {
        for (const v of variants) {
          totalItems++;
          const physical = v.physicalStock != null ? v.physicalStock : (v.stockQuantity || 0);
          const reserved = v.reservedQuantity || 0;
          const available = Math.max(0, physical - reserved);
          const threshold = v.lowStockThreshold != null ? v.lowStockThreshold : 5;

          if (available === 0) {
            outOfStockCount++;
          } else if (available <= threshold) {
            lowStockCount++;
          }

          const effectivePrice = v.price != null ? Number(v.price) : Number(prod.price || 0);
          totalRetailValuation += effectivePrice * physical;

          const effectiveCost = v.costPrice != null ? Number(v.costPrice) : (prod.costPrice != null ? Number(prod.costPrice) : null);
          if (effectiveCost != null && effectiveCost > 0) {
            totalCostValuation += effectiveCost * physical;
            itemsWithCostCount++;
          }
        }
      } else {
        totalItems++;
        const physical = prod.physicalStock != null ? prod.physicalStock : (prod.stockQuantity || 0);
        const reserved = prod.reservedQuantity || 0;
        const available = Math.max(0, physical - reserved);
        const threshold = prod.lowStockThreshold != null ? prod.lowStockThreshold : 5;

        if (available === 0) {
          outOfStockCount++;
        } else if (available <= threshold) {
          lowStockCount++;
        }

        const effectivePrice = Number(prod.price || 0);
        totalRetailValuation += effectivePrice * physical;

        const effectiveCost = prod.costPrice != null ? Number(prod.costPrice) : null;
        if (effectiveCost != null && effectiveCost > 0) {
          totalCostValuation += effectiveCost * physical;
          itemsWithCostCount++;
        }
      }
    }

    // Determine inventory valuation configuration status
    let valuationStatus = 'unavailable';
    if (totalItems > 0) {
      if (itemsWithCostCount === totalItems) {
        valuationStatus = 'fully_configured';
      } else if (itemsWithCostCount > 0) {
        valuationStatus = 'partially_configured';
      }
    }

    return {
      totalProducts,
      totalVariants: totalItems,
      lowStockCount,
      outOfStockCount,
      inventoryValue: {
        totalCostValuation: parseFloat(totalCostValuation.toFixed(2)),
        totalRetailValuation: parseFloat(totalRetailValuation.toFixed(2)),
        itemsWithCostCount,
        totalItemsCount: totalItems,
        status: valuationStatus
      }
    };
  }

  /**
   * Get paginated inventory items with variants
   */
  static async getInventoryItems(businessId, userId, userRole, query = {}) {
    await this.verifyBusinessAccess(businessId, userId, userRole);
    const { page, limit, offset } = parsePagination(query, 10, 50);

    const productWhere = {
      businessId,
      status: { [Op.ne]: 'archived' }
    };

    if (query.categoryId && query.categoryId !== 'all') {
      productWhere.categoryId = query.categoryId;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: productWhere,
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: { [Op.ne]: 'archived' } },
          required: false
        }
      ]
    });

    // Format products and their variants with normalized stock figures
    let formatted = products.map((prod) => {
      const prodJson = prod.toJSON();
      const rawVariants = prodJson.variants || [];

      // Calculate aggregate product stocks from variants or product fields
      let totalPhysical = 0;
      let totalReserved = 0;
      let totalAvailable = 0;

      const mappedVariants = rawVariants.map((v) => {
        const vPhysical = v.physicalStock || 0;
        const vReserved = v.reservedQuantity || 0;
        const vAvailable = Math.max(0, vPhysical - vReserved);
        const vThreshold = v.lowStockThreshold != null ? v.lowStockThreshold : 5;

        totalPhysical += vPhysical;
        totalReserved += vReserved;
        totalAvailable += vAvailable;

        let vStockStatus = 'in_stock';
        if (vAvailable === 0) {
          vStockStatus = 'out_of_stock';
        } else if (vAvailable <= vThreshold) {
          vStockStatus = 'low_stock';
        }

        return {
          ...v,
          physicalStock: vPhysical,
          reservedQuantity: vReserved,
          availableStock: vAvailable,
          stockStatus: vStockStatus
        };
      });

      // If product has no explicit variants, use product's own stock fields
      if (mappedVariants.length === 0) {
        totalPhysical = prod.physicalStock || 0;
        totalReserved = prod.reservedQuantity || 0;
        totalAvailable = Math.max(0, totalPhysical - totalReserved);
      }

      const pThreshold = prod.lowStockThreshold != null ? prod.lowStockThreshold : 5;
      let pStockStatus = 'in_stock';
      if (totalAvailable === 0) {
        pStockStatus = 'out_of_stock';
      } else if (totalAvailable <= pThreshold) {
        pStockStatus = 'low_stock';
      }

      return {
        ...prodJson,
        physicalStock: totalPhysical,
        reservedQuantity: totalReserved,
        availableStock: totalAvailable,
        stockStatus: pStockStatus,
        variantsCount: mappedVariants.length,
        variants: mappedVariants
      };
    });

    // Apply search filter in memory if searching by variant SKU / name
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      formatted = formatted.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(s);
        const skuMatch = item.sku && item.sku.toLowerCase().includes(s);
        const variantMatch = item.variants.some(
          (v) => (v.name && v.name.toLowerCase().includes(s)) || (v.sku && v.sku.toLowerCase().includes(s))
        );
        return nameMatch || skuMatch || variantMatch;
      });
    }

    // Apply stock status filter
    if (query.stockStatus && query.stockStatus !== 'all') {
      formatted = formatted.filter((item) => item.stockStatus === query.stockStatus);
    }

    return {
      items: formatted,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  /**
   * Adjust stock for a variant or product
   * Supported types:
   *  - 'receive': +quantity
   *  - 'damage_loss': -quantity
   *  - 'correction': recount difference (new physical - old physical)
   *  - 'customer_return': +quantity
   */
  static async adjustStock(businessId, userId, userRole, payload) {
    await this.verifyBusinessAccess(businessId, userId, userRole);
    const { productId, variantId, adjustmentType, quantity, reason, notes } = payload;

    if (!['receive', 'damage_loss', 'correction', 'customer_return', 'manual_adjustment'].includes(adjustmentType)) {
      throw ApiError.badRequest(`Unsupported adjustment type: ${adjustmentType}`);
    }

    if (!reason || !reason.trim()) {
      throw ApiError.badRequest('A reason for the stock adjustment is required');
    }

    const t = await sequelize.transaction();
    try {
      // 1. Lock product row
      const product = await Product.findByPk(productId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!product || product.businessId !== businessId) {
        throw ApiError.notFound('Product not found in this business');
      }

      // 2. Lock variant row if specified, or find default variant
      let variant = null;
      if (variantId) {
        variant = await ProductVariant.findByPk(variantId, {
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        if (!variant || variant.productId !== productId) {
          throw ApiError.notFound('Variant not found for this product');
        }
      } else {
        // Try finding default variant or first variant
        variant = await ProductVariant.findOne({
          where: { productId, businessId },
          order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
          transaction: t,
          lock: t.LOCK.UPDATE
        });
      }

      const targetEntity = variant || product;
      const sku = targetEntity.sku || product.sku || 'N/A';

      const oldPhysical = targetEntity.physicalStock || 0;
      const oldReserved = targetEntity.reservedQuantity || 0;
      const oldAvailable = Math.max(0, oldPhysical - oldReserved);

      let delta = 0;
      let newPhysical = oldPhysical;

      if (adjustmentType === 'receive' || adjustmentType === 'customer_return') {
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          throw ApiError.badRequest('Quantity must be a positive integer');
        }
        delta = qty;
        newPhysical = oldPhysical + delta;
      } else if (adjustmentType === 'damage_loss') {
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          throw ApiError.badRequest('Quantity must be a positive integer');
        }
        if (oldPhysical - qty < oldReserved) {
          throw ApiError.badRequest(
            `Cannot deduct ${qty} units. ${oldReserved} units are currently reserved for pending orders.`
          );
        }
        delta = -qty;
        newPhysical = oldPhysical + delta;
      } else if (adjustmentType === 'correction') {
        const targetPhysical = parseInt(quantity, 10);
        if (isNaN(targetPhysical) || targetPhysical < 0) {
          throw ApiError.badRequest('Corrected physical stock must be a non-negative integer');
        }
        if (targetPhysical < oldReserved) {
          throw ApiError.badRequest(
            `Corrected count (${targetPhysical}) cannot be lower than active reserved stock (${oldReserved}).`
          );
        }
        delta = targetPhysical - oldPhysical;
        newPhysical = targetPhysical;
      } else if (adjustmentType === 'manual_adjustment') {
        const qty = parseInt(quantity, 10);
        if (isNaN(qty)) {
          throw ApiError.badRequest('Adjustment quantity must be an integer');
        }
        if (oldPhysical + qty < oldReserved) {
          throw ApiError.badRequest('Resulting physical stock cannot be lower than reserved stock');
        }
        delta = qty;
        newPhysical = oldPhysical + delta;
      }

      const newAvailable = Math.max(0, newPhysical - oldReserved);

      // Save updated stock on variant
      if (variant) {
        variant.physicalStock = newPhysical;
        variant.stockQuantity = newAvailable;
        await variant.save({ transaction: t });

        // Update parent product stock to reflect sum of all variants
        const allVariants = await ProductVariant.findAll({
          where: { productId, status: { [Op.ne]: 'archived' } },
          transaction: t
        });
        const aggPhysical = allVariants.reduce((sum, v) => sum + (v.physicalStock || 0), 0);
        const aggReserved = allVariants.reduce((sum, v) => sum + (v.reservedQuantity || 0), 0);
        product.physicalStock = aggPhysical;
        product.reservedQuantity = aggReserved;
        product.stockQuantity = Math.max(0, aggPhysical - aggReserved);
        await product.save({ transaction: t });
      } else {
        // Save on product directly
        product.physicalStock = newPhysical;
        product.stockQuantity = newAvailable;
        await product.save({ transaction: t });
      }

      // Map adjustmentType to movementType
      const typeMap = {
        receive: 'stock_received',
        damage_loss: 'damage_loss',
        correction: 'correction',
        customer_return: 'return_restock',
        manual_adjustment: 'manual_adjustment'
      };

      const movement = await StockMovement.create(
        {
          businessId,
          productId,
          variantId: variant ? variant.id : null,
          sku,
          movementType: typeMap[adjustmentType] || 'manual_adjustment',
          quantityChange: delta,
          physicalStockBefore: oldPhysical,
          physicalStockAfter: newPhysical,
          reservedBefore: oldReserved,
          reservedAfter: oldReserved,
          availableBefore: oldAvailable,
          availableAfter: newAvailable,
          reason,
          notes: notes || null,
          actorId: userId,
          actorRole: userRole
        },
        { transaction: t }
      );

      await t.commit();

      return {
        message: 'Stock adjusted successfully',
        movement,
        updatedStock: {
          physicalStock: newPhysical,
          reservedQuantity: oldReserved,
          availableStock: newAvailable
        }
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * Update low-stock threshold for a product or variant
   */
  static async updateThreshold(businessId, userId, userRole, payload) {
    await this.verifyBusinessAccess(businessId, userId, userRole);
    const { productId, variantId, lowStockThreshold } = payload;

    const threshold = parseInt(lowStockThreshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      throw ApiError.badRequest('Low stock threshold must be a non-negative number');
    }

    if (variantId) {
      const variant = await ProductVariant.findByPk(variantId);
      if (!variant || variant.businessId !== businessId) {
        throw ApiError.notFound('Variant not found');
      }
      variant.lowStockThreshold = threshold;
      await variant.save();
      return { message: 'Variant threshold updated', variant };
    }

    const product = await Product.findByPk(productId);
    if (!product || product.businessId !== businessId) {
      throw ApiError.notFound('Product not found');
    }
    product.lowStockThreshold = threshold;
    await product.save();

    // Also update any default variants for consistency
    await ProductVariant.update(
      { lowStockThreshold: threshold },
      { where: { productId, businessId } }
    );

    return { message: 'Product threshold updated', product };
  }

  /**
   * Get append-only stock movement audit logs
   */
  static async getStockMovements(businessId, userId, userRole, query = {}) {
    await this.verifyBusinessAccess(businessId, userId, userRole);
    const { page, limit, offset } = parsePagination(query, 15, 100);

    const where = { businessId };

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.variantId) {
      where.variantId = query.variantId;
    }

    if (query.movementType && query.movementType !== 'all') {
      where.movementType = query.movementType;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(query.startDate), new Date(query.endDate)]
      };
    }

    const { count, rows } = await StockMovement.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images']
        },
        {
          model: ProductVariant,
          as: 'variant',
          attributes: ['id', 'name', 'sku']
        },
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    return {
      movements: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  /**
   * Create a new variant for a product
   */
  static async createVariant(businessId, userId, userRole, productId, payload) {
    await this.verifyBusinessAccess(businessId, userId, userRole);
    const { name, sku, barcode, attributes, price, costPrice, physicalStock, lowStockThreshold } = payload;

    const product = await Product.findByPk(productId);
    if (!product || product.businessId !== businessId) {
      throw ApiError.notFound('Product not found in this business');
    }

    if (!name || !name.trim()) {
      throw ApiError.badRequest('Variant name is required');
    }

    if (!sku || !sku.trim()) {
      throw ApiError.badRequest('SKU is required');
    }

    // Check SKU duplicate
    const existingSku = await ProductVariant.findOne({
      where: { businessId, sku: sku.trim() }
    });
    if (existingSku) {
      throw ApiError.conflict(`A variant with SKU "${sku.trim()}" already exists in your business`);
    }

    const initialPhysical = Math.max(0, parseInt(physicalStock || 0, 10));

    const t = await sequelize.transaction();
    try {
      const variant = await ProductVariant.create(
        {
          businessId,
          productId,
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode || null,
          attributes: attributes || {},
          price: price != null ? parseFloat(price) : product.price,
          costPrice: costPrice != null ? parseFloat(costPrice) : product.costPrice,
          physicalStock: initialPhysical,
          reservedQuantity: 0,
          stockQuantity: initialPhysical,
          lowStockThreshold: lowStockThreshold != null ? parseInt(lowStockThreshold, 10) : 5,
          isDefault: false,
          status: 'active'
        },
        { transaction: t }
      );

      // Create initial stock movement
      if (initialPhysical > 0) {
        await StockMovement.create(
          {
            businessId,
            productId,
            variantId: variant.id,
            sku: variant.sku,
            movementType: 'initial_setup',
            quantityChange: initialPhysical,
            physicalStockBefore: 0,
            physicalStockAfter: initialPhysical,
            reservedBefore: 0,
            reservedAfter: 0,
            availableBefore: 0,
            availableAfter: initialPhysical,
            reason: 'Variant creation with initial stock',
            actorId: userId,
            actorRole: userRole
          },
          { transaction: t }
        );
      }

      // Re-sync parent product physical and available stock
      const allVariants = await ProductVariant.findAll({
        where: { productId, status: { [Op.ne]: 'archived' } },
        transaction: t
      });
      const aggPhysical = allVariants.reduce((sum, v) => sum + (v.physicalStock || 0), 0);
      const aggReserved = allVariants.reduce((sum, v) => sum + (v.reservedQuantity || 0), 0);
      product.physicalStock = aggPhysical;
      product.reservedQuantity = aggReserved;
      product.stockQuantity = Math.max(0, aggPhysical - aggReserved);
      await product.save({ transaction: t });

      await t.commit();
      return variant;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

export default InventoryService;

