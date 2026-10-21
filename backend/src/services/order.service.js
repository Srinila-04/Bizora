import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import {
  Order,
  OrderItem,
  Product,
  ProductVariant,
  StockMovement,
  Business,
  User,
  Payment,
  OrderStatusHistory,
  PaymentStatusHistory,
  Notification
} from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ORDER_STATUS, PAYMENT_STATUS, ORDER_STATUS_TRANSITIONS } from '../constants/orderStatus.js';
import { PAYMENT_TRANSACTION_STATUS, PAYMENT_METHODS, COD_STATUS } from '../constants/paymentStatus.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class OrderService {
  static generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${random}`;
  }

  static async createOrder(customerId, data) {
    const { businessId, items, shippingAddress, billingAddress, notes } = data;

    const business = await Business.findByPk(businessId);
    if (!business || business.status !== 'active') {
      throw ApiError.badRequest('Business does not exist or is currently inactive');
    }

    const t = await sequelize.transaction();

    try {
      let subtotal = 0;
      const orderItemsToCreate = [];
      const stockMovementsToCreate = [];

      for (const item of items) {
        // Row locking with SELECT ... FOR UPDATE to avoid race condition / overselling
        const product = await Product.findByPk(item.productId, {
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!product) {
          throw ApiError.badRequest(`Product with ID ${item.productId} was not found`);
        }

        if (product.businessId !== businessId) {
          throw ApiError.badRequest(`Product ${product.name} does not belong to the selected business`);
        }

        if (product.status !== 'active' || !product.isPublished) {
          throw ApiError.badRequest(`Product ${product.name} is currently unavailable for purchase`);
        }

        // Validate variant if specified or default
        let variant = null;
        if (item.variantId) {
          variant = await ProductVariant.findByPk(item.variantId, {
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          if (!variant || variant.productId !== product.id || variant.businessId !== businessId) {
            throw ApiError.badRequest(`Variant with ID ${item.variantId} does not belong to product "${product.name}"`);
          }

          if (variant.status !== 'active') {
            throw ApiError.badRequest(`Variant "${variant.name}" is currently unavailable for purchase`);
          }

          const variantAvail = variant.stockQuantity != null
            ? variant.stockQuantity
            : Math.max(0, (variant.physicalStock || 0) - (variant.reservedQuantity || 0));

          if (variantAvail < item.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for "${product.name} (${variant.name})". Only ${variantAvail} available.`
            );
          }
        }

        // If product has variants but customer didn't specify variantId, select active default variant
        if (!variant) {
          const defaultVariant = await ProductVariant.findOne({
            where: { productId: product.id, businessId, status: 'active' },
            order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          if (defaultVariant) {
            variant = defaultVariant;
            const defAvail = variant.stockQuantity != null
              ? variant.stockQuantity
              : Math.max(0, (variant.physicalStock || 0) - (variant.reservedQuantity || 0));
            if (defAvail < item.quantity) {
              throw ApiError.badRequest(
                `Insufficient stock for "${product.name}". Only ${defAvail} available.`
              );
            }
          }
        }

        // Parent product available stock check
        if (product.stockQuantity < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.`
          );
        }

        // Update variant stock if present
        if (variant) {
          const vPhys = variant.physicalStock != null && variant.physicalStock > 0
            ? variant.physicalStock
            : variant.stockQuantity;
          const vReserved = variant.reservedQuantity || 0;
          const vAvail = variant.stockQuantity;

          variant.physicalStock = vPhys;
          variant.reservedQuantity = vReserved + item.quantity;
          variant.stockQuantity = Math.max(0, vAvail - item.quantity);
          await variant.save({ transaction: t });
        }

        const oldPhys = product.physicalStock != null && product.physicalStock > 0
          ? product.physicalStock
          : product.stockQuantity;
        const oldReserved = product.reservedQuantity || 0;
        const oldAvail = product.stockQuantity;

        // Deduct available inventory & track active reservation on parent product
        product.physicalStock = oldPhys;
        product.reservedQuantity = oldReserved + item.quantity;
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
        await product.save({ transaction: t });

        const unitPrice = variant && variant.price != null
          ? parseFloat(variant.price)
          : parseFloat(product.price);
        const itemSubtotal = parseFloat((unitPrice * item.quantity).toFixed(2));
        subtotal += itemSubtotal;

        const firstImage = Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : null;

        const itemSku = variant ? variant.sku : product.sku;

        orderItemsToCreate.push({
          productId: product.id,
          variantId: variant ? variant.id : null,
          sku: itemSku,
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          image: firstImage
        });

        stockMovementsToCreate.push({
          productId: product.id,
          variantId: variant ? variant.id : null,
          sku: itemSku || 'N/A',
          quantity: item.quantity,
          physicalStock: oldPhys,
          reservedBefore: oldReserved,
          availableBefore: oldAvail
        });
      }

      // Server-calculated totals: Never trust client-submitted calculations
      const shippingAmount = 0.00;
      const taxAmount = 0.00;
      const discountAmount = 0.00;
      const totalAmount = parseFloat((subtotal + shippingAmount + taxAmount - discountAmount).toFixed(2));

      const orderNumber = this.generateOrderNumber();

      const order = await Order.create(
        {
          orderNumber,
          businessId,
          customerId,
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.UNPAID,
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount,
          totalAmount,
          currency: 'INR',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30-minute reservation TTL
          shippingAddress: shippingAddress || {},
          billingAddress: billingAddress || {},
          notes
        },
        { transaction: t }
      );

      // Create snapshot order items
      for (const orderItem of orderItemsToCreate) {
        orderItem.orderId = order.id;
      }
      await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

      // Create audit stock movements for reservations
      for (const mov of stockMovementsToCreate) {
        await StockMovement.create(
          {
            businessId,
            productId: mov.productId,
            variantId: mov.variantId,
            sku: mov.sku,
            movementType: 'order_reservation',
            quantityChange: -mov.quantity,
            physicalStockBefore: mov.physicalStock,
            physicalStockAfter: mov.physicalStock,
            reservedBefore: mov.reservedBefore,
            reservedAfter: mov.reservedBefore + mov.quantity,
            availableBefore: mov.availableBefore,
            availableAfter: Math.max(0, mov.availableBefore - mov.quantity),
            reason: 'Order placed, stock reserved',
            orderId: order.id,
            orderNumber: order.orderNumber,
            actorId: customerId,
            actorRole: ROLES.CUSTOMER
          },
          { transaction: t }
        );
      }

      // Create initial order history
      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: ORDER_STATUS.PENDING,
          notes: 'Order placed by customer, stock reserved for 30 minutes',
          changedBy: customerId
        },
        { transaction: t }
      );

      // Create initial pending payment record
      await Payment.create(
        {
          orderId: order.id,
          businessId,
          customerId,
          paymentMethod: 'upi',
          amount: totalAmount,
          currency: 'INR',
          status: 'pending',
          provider: 'razorpay'
        },
        { transaction: t }
      );

      await t.commit();

      // Notify business owner asynchronously
      Notification.create({
        userId: business.ownerId,
        title: `New Order #${orderNumber}`,
        message: `You have received a new order for $${totalAmount.toFixed(2)}.`,
        type: 'order',
        data: { orderId: order.id, orderNumber }
      }).catch(() => {});

      return this.getOrderById(order.id, customerId, ROLES.CUSTOMER);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async getOrderById(orderId, userId, userRole) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }]
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'slug', 'email', 'phone', 'logo', 'ownerId']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistories',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Authorization check: must be customer, business owner, or admin
    const isCustomer = order.customerId === userId;
    const isOwner = order.business && order.business.ownerId === userId;
    const isAdmin = userRole === ROLES.ADMIN;

    if (!isCustomer && !isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have authorization to view this order');
    }

    return order;
  }

  static async getCustomerOrders(customerId, query = {}) {
    const { page, limit, offset } = parsePagination(query, 10, 50);

    const where = { customerId };
    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.search && query.search.trim()) {
      where.orderNumber = { [Op.like]: `%${query.search.trim()}%` };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'slug', 'logo']
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'paymentMethod', 'status', 'amount', 'currency', 'transactionReference']
        }
      ]
    });

    return {
      orders: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async getBusinessOrders(businessId, userId, userRole, query = {}) {
    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to access orders for this business');
    }

    const { page, limit, offset } = parsePagination(query, 10, 50);

    const where = { businessId };
    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }
    if (query.paymentStatus && query.paymentStatus !== 'all') {
      where.paymentStatus = query.paymentStatus;
    }
    if (query.search && query.search.trim()) {
      where.orderNumber = { [Op.like]: `%${query.search.trim()}%` };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }]
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistories',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    // Summary statistics for merchant dashboard
    const allBusinessOrders = await Order.findAll({
      where: { businessId },
      include: [{ model: Payment, as: 'payment' }]
    });

    const stats = {
      totalOrders: allBusinessOrders.length,
      actionRequired: allBusinessOrders.filter(
        (o) => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.CONFIRMED
      ).length,
      processing: allBusinessOrders.filter(
        (o) => o.status === ORDER_STATUS.PROCESSING || o.status === ORDER_STATUS.PACKED
      ).length,
      inTransit: allBusinessOrders.filter(
        (o) => o.status === ORDER_STATUS.SHIPPED || o.status === ORDER_STATUS.OUT_FOR_DELIVERY
      ).length,
      delivered: allBusinessOrders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
      cancelled: allBusinessOrders.filter(
        (o) => o.status === ORDER_STATUS.CANCELLED || o.status === ORDER_STATUS.RETURNED
      ).length,
      pendingCodCount: allBusinessOrders.filter(
        (o) => o.payment?.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && o.paymentStatus !== PAYMENT_STATUS.PAID
      ).length
    };

    return {
      orders: rows,
      stats,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async updateOrderStatus(orderId, userId, userRole, newStatus, notes, payload = {}) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Business, as: 'business' },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (userRole !== ROLES.ADMIN && order.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to modify this order');
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      return order; // Idempotent: no duplicate transition
    }

    // Validate state transition matrix
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[oldStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid order status transition from '${oldStatus}' to '${newStatus}'. Allowed transitions: ${
          allowedTransitions.join(', ') || 'None (terminal state)'
        }`
      );
    }

    const t = await sequelize.transaction();
    try {
      order.status = newStatus;

      // Handle fulfillment dates & details
      if (newStatus === ORDER_STATUS.PACKED) {
        order.packedAt = new Date();
      } else if (newStatus === ORDER_STATUS.SHIPPED) {
        order.dispatchedAt = new Date();
        if (payload.courierName) order.courierName = payload.courierName;
        if (payload.trackingNumber) order.trackingNumber = payload.trackingNumber;
        if (payload.trackingUrl) order.trackingUrl = payload.trackingUrl;
        if (payload.estimatedDeliveryDate) order.estimatedDeliveryDate = payload.estimatedDeliveryDate;
        if (payload.deliveryNotes) order.deliveryNotes = payload.deliveryNotes;

        // Fulfill reserved stock: decrement physical stock and decrement reserved quantity (available stock stays unchanged)
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.productId) {
              const product = await Product.findByPk(item.productId, {
                transaction: t,
                lock: t.LOCK.UPDATE
              });
              if (product) {
                const physBefore = product.physicalStock || product.stockQuantity;
                const resBefore = product.reservedQuantity || 0;
                product.physicalStock = Math.max(0, physBefore - item.quantity);
                product.reservedQuantity = Math.max(0, resBefore - item.quantity);
                await product.save({ transaction: t });

                let variant = null;
                if (item.variantId) {
                  variant = await ProductVariant.findByPk(item.variantId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                  });
                }
                if (!variant) {
                  variant = await ProductVariant.findOne({
                    where: { productId: product.id, businessId: order.businessId },
                    order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                  });
                }
                if (variant) {
                  variant.physicalStock = Math.max(0, (variant.physicalStock || 0) - item.quantity);
                  variant.reservedQuantity = Math.max(0, (variant.reservedQuantity || 0) - item.quantity);
                  await variant.save({ transaction: t });
                }

                await StockMovement.create(
                  {
                    businessId: order.businessId,
                    productId: item.productId,
                    variantId: variant ? variant.id : item.variantId || null,
                    sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                    movementType: 'order_fulfilled',
                    quantityChange: -item.quantity,
                    physicalStockBefore: physBefore,
                    physicalStockAfter: product.physicalStock,
                    reservedBefore: resBefore,
                    reservedAfter: product.reservedQuantity,
                    availableBefore: product.stockQuantity,
                    availableAfter: product.stockQuantity,
                    reason: 'Order dispatched / fulfilled',
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    actorId: userId,
                    actorRole: userRole
                  },
                  { transaction: t }
                );
              }
            }
          }
        }
      } else if (newStatus === ORDER_STATUS.OUT_FOR_DELIVERY) {
        order.outForDeliveryAt = new Date();
      } else if (newStatus === ORDER_STATUS.DELIVERED) {
        order.deliveredAt = new Date();
        // NOTE: For Cash on Delivery, delivering package does NOT automatically mark payment as paid!
        // Payment remains unpaid until collection confirmation is explicitly verified.
      } else if (
        (newStatus === ORDER_STATUS.CANCELLED || newStatus === ORDER_STATUS.RETURNED || newStatus === ORDER_STATUS.REFUNDED) &&
        oldStatus !== ORDER_STATUS.CANCELLED &&
        oldStatus !== ORDER_STATUS.RETURNED &&
        oldStatus !== ORDER_STATUS.REFUNDED
      ) {
        order.cancelledAt = new Date();
        order.cancelReason = notes || `Status updated to ${newStatus}`;

        const fulfilledStatuses = [ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED];
        const wasFulfilled = fulfilledStatuses.includes(oldStatus) || Boolean(order.dispatchedAt);

        // Restore stock in transaction safely with row locks
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.productId) {
              const product = await Product.findByPk(item.productId, {
                transaction: t,
                lock: t.LOCK.UPDATE
              });
              if (product) {
                const physBefore = product.physicalStock != null ? product.physicalStock : product.stockQuantity;
                const resBefore = product.reservedQuantity || 0;
                const availBefore = product.stockQuantity;

                let variant = null;
                if (item.variantId) {
                  variant = await ProductVariant.findByPk(item.variantId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                  });
                }
                if (!variant) {
                  variant = await ProductVariant.findOne({
                    where: { productId: product.id, businessId: order.businessId },
                    order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                  });
                }

                if (!wasFulfilled) {
                  // Scenario A: Cancelled BEFORE dispatch/fulfillment -> Release reserved stock
                  product.reservedQuantity = Math.max(0, resBefore - item.quantity);
                  product.stockQuantity += item.quantity;
                  await product.save({ transaction: t });

                  if (variant) {
                    variant.reservedQuantity = Math.max(0, (variant.reservedQuantity || 0) - item.quantity);
                    variant.stockQuantity = (variant.stockQuantity || 0) + item.quantity;
                    await variant.save({ transaction: t });
                  }

                  await StockMovement.create(
                    {
                      businessId: order.businessId,
                      productId: item.productId,
                      variantId: variant ? variant.id : item.variantId || null,
                      sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                      movementType: 'order_release',
                      quantityChange: item.quantity,
                      physicalStockBefore: physBefore,
                      physicalStockAfter: physBefore,
                      reservedBefore: resBefore,
                      reservedAfter: product.reservedQuantity,
                      availableBefore: availBefore,
                      availableAfter: product.stockQuantity,
                      reason: `Order ${newStatus}: stock reservation released`,
                      orderId: order.id,
                      orderNumber: order.orderNumber,
                      actorId: userId,
                      actorRole: userRole
                    },
                    { transaction: t }
                  );
                } else {
                  // Scenario B: Returned / Cancelled AFTER dispatch/fulfillment
                  // Commitment point already converted reservation to physical deduction.
                  const isEligibleForRestock = payload.restockEligible === true;

                  if (isEligibleForRestock) {
                    // Restock item to warehouse inventory
                    product.physicalStock = physBefore + item.quantity;
                    product.stockQuantity = availBefore + item.quantity;
                    await product.save({ transaction: t });

                    if (variant) {
                      variant.physicalStock = (variant.physicalStock != null ? variant.physicalStock : 0) + item.quantity;
                      variant.stockQuantity = (variant.stockQuantity || 0) + item.quantity;
                      await variant.save({ transaction: t });
                    }

                    await StockMovement.create(
                      {
                        businessId: order.businessId,
                        productId: item.productId,
                        variantId: variant ? variant.id : item.variantId || null,
                        sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                        movementType: 'return_restock',
                        quantityChange: item.quantity,
                        physicalStockBefore: physBefore,
                        physicalStockAfter: product.physicalStock,
                        reservedBefore: resBefore,
                        reservedAfter: resBefore,
                        availableBefore: availBefore,
                        availableAfter: product.stockQuantity,
                        reason: `Order ${newStatus}: item returned to stock (restocked)`,
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        actorId: userId,
                        actorRole: userRole
                      },
                      { transaction: t }
                    );
                  } else {
                    // Damaged/ineligible for restocking: do NOT increment physical or available stock
                    await StockMovement.create(
                      {
                        businessId: order.businessId,
                        productId: item.productId,
                        variantId: variant ? variant.id : item.variantId || null,
                        sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                        movementType: 'damage_loss',
                        quantityChange: 0,
                        physicalStockBefore: physBefore,
                        physicalStockAfter: physBefore,
                        reservedBefore: resBefore,
                        reservedAfter: resBefore,
                        availableBefore: availBefore,
                        availableAfter: availBefore,
                        reason: `Order ${newStatus}: item returned but ineligible for restock (damaged/non-returnable)`,
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        actorId: userId,
                        actorRole: userRole
                      },
                      { transaction: t }
                    );
                  }
                }
              }
            }
          }
        }
      }

      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: newStatus,
          notes: notes || `Order status updated to ${newStatus}`,
          changedBy: userId
        },
        { transaction: t }
      );

      await t.commit();

      // Notify customer
      const trackingInfoText = order.trackingNumber
        ? ` via ${order.courierName || 'Courier'} (Tracking: ${order.trackingNumber})`
        : '';
      Notification.create({
        userId: order.customerId,
        title: `Order #${order.orderNumber} ${newStatus.toUpperCase().replace(/_/g, ' ')}`,
        message: `Your order is now ${newStatus.replace(/_/g, ' ')}${trackingInfoText}.`,
        type: 'order',
        data: {
          orderId: order.id,
          status: newStatus,
          courierName: order.courierName,
          trackingNumber: order.trackingNumber
        }
      }).catch(() => {});

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Dispatch Order with Courier & Tracking details
   */
  static async dispatchOrder(orderId, userId, userRole, dispatchData) {
    const { courierName, trackingNumber, trackingUrl, estimatedDeliveryDate, notes } = dispatchData;

    const order = await Order.findByPk(orderId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (userRole !== ROLES.ADMIN && order.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to dispatch this order');
    }

    // Must be in a dispatchable state
    if (
      order.status !== ORDER_STATUS.PACKED &&
      order.status !== ORDER_STATUS.PROCESSING &&
      order.status !== ORDER_STATUS.CONFIRMED
    ) {
      throw ApiError.badRequest(
        `Order cannot be dispatched from '${order.status}' status. It must be confirmed, processing, or packed.`
      );
    }

    return this.updateOrderStatus(
      orderId,
      userId,
      userRole,
      ORDER_STATUS.SHIPPED,
      notes || `Dispatched via ${courierName} (Tracking #${trackingNumber})`,
      {
        courierName,
        trackingNumber,
        trackingUrl,
        estimatedDeliveryDate,
        deliveryNotes: notes
      }
    );
  }

  /**
   * Record Cash on Delivery (COD) collection and reconciliation
   */
  static async recordCodCollection(orderId, userId, userRole, { collectionStatus, notes }) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Business, as: 'business' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (userRole !== ROLES.ADMIN && order.business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to record COD collection for this order');
    }

    const payment = order.payment;
    if (!payment || payment.paymentMethod !== PAYMENT_METHODS.CASH_ON_DELIVERY) {
      throw ApiError.badRequest('This order was not placed with Cash on Delivery');
    }

    if (payment.status === PAYMENT_TRANSACTION_STATUS.COMPLETED && payment.codStatus === COD_STATUS.COLLECTED) {
      return { order, payment, message: 'COD payment has already been collected and verified.' };
    }

    const t = await sequelize.transaction();
    try {
      if (collectionStatus === COD_STATUS.COLLECTED) {
        payment.codStatus = COD_STATUS.COLLECTED;
        payment.codCollectedAt = new Date();
        payment.codCollectedBy = userId;
        payment.codNotes = notes || 'Cash on Delivery collected by merchant / delivery agent';
        payment.status = PAYMENT_TRANSACTION_STATUS.COMPLETED;
        payment.transactionReference =
          payment.transactionReference ||
          `COD-COLLECTED-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await payment.save({ transaction: t });

        order.paymentStatus = PAYMENT_STATUS.PAID;
        await order.save({ transaction: t });

        await PaymentStatusHistory.create(
          {
            paymentId: payment.id,
            status: PAYMENT_TRANSACTION_STATUS.COMPLETED,
            reason: notes || 'Cash on Delivery successfully collected in full',
            changedBy: userId
          },
          { transaction: t }
        );

        await OrderStatusHistory.create(
          {
            orderId: order.id,
            status: order.status,
            notes: `COD payment of ₹${Number(order.totalAmount).toFixed(2)} received and marked as PAID.`,
            changedBy: userId
          },
          { transaction: t }
        );

        await t.commit();

        // Notify customer
        Notification.create({
          userId: order.customerId,
          title: `COD Payment Received for Order #${order.orderNumber}`,
          message: `Your Cash on Delivery payment of ₹${Number(order.totalAmount).toFixed(2)} has been safely collected.`,
          type: 'order',
          data: { orderId: order.id, amount: order.totalAmount }
        }).catch(() => {});

        return { order, payment, message: 'Cash on Delivery payment confirmed and marked as PAID.' };
      } else if (collectionStatus === COD_STATUS.FAILED) {
        payment.codStatus = COD_STATUS.FAILED;
        payment.status = PAYMENT_TRANSACTION_STATUS.FAILED;
        payment.codNotes = notes || 'Customer was unable or refused to complete cash payment';
        await payment.save({ transaction: t });

        await PaymentStatusHistory.create(
          {
            paymentId: payment.id,
            status: PAYMENT_TRANSACTION_STATUS.FAILED,
            reason: notes || 'Cash on Delivery collection failed',
            changedBy: userId
          },
          { transaction: t }
        );

        await OrderStatusHistory.create(
          {
            orderId: order.id,
            status: order.status,
            notes: `COD payment collection attempt failed: ${notes || 'Payment not collected'}.`,
            changedBy: userId
          },
          { transaction: t }
        );

        await t.commit();
        return { order, payment, message: 'Cash on Delivery collection marked as failed.' };
      } else {
        throw ApiError.badRequest('Invalid collection status. Must be collected or failed.');
      }
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Cash on Delivery reconciliation summary for a business
   */
  static async getCodReconciliation(businessId, userId, userRole, query = {}) {
    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to view COD reconciliation for this business');
    }

    // 1. Fetch all COD orders to compute accurate summary metrics
    const allCodOrders = await Order.findAll({
      where: { businessId },
      include: [
        {
          model: Payment,
          as: 'payment',
          where: { paymentMethod: PAYMENT_METHODS.CASH_ON_DELIVERY }
        }
      ]
    });

    let totalCodOrders = allCodOrders.length;
    let totalCodAmount = 0;
    let collectedCount = 0;
    let collectedAmount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let failedCount = 0;
    let failedAmount = 0;

    for (const order of allCodOrders) {
      const amt = parseFloat(Number(order.totalAmount || 0).toFixed(2));
      totalCodAmount += amt;

      if (order.payment?.codStatus === COD_STATUS.COLLECTED || order.paymentStatus === PAYMENT_STATUS.PAID) {
        collectedCount += 1;
        collectedAmount += amt;
      } else if (order.payment?.codStatus === COD_STATUS.FAILED) {
        failedCount += 1;
        failedAmount += amt;
      } else {
        pendingCount += 1;
        pendingAmount += amt;
      }
    }

    // 2. Paginate COD orders list
    const { page, limit, offset } = parsePagination(query, 10, 50);

    const where = { businessId };
    if (query.search && query.search.trim()) {
      where.orderNumber = { [Op.like]: `%${query.search.trim()}%` };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: Payment,
          as: 'payment',
          where: { paymentMethod: PAYMENT_METHODS.CASH_ON_DELIVERY }
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    return {
      summary: {
        totalCodOrders,
        totalCodAmount: parseFloat(totalCodAmount.toFixed(2)),
        collectedCount,
        collectedAmount: parseFloat(collectedAmount.toFixed(2)),
        pendingCount,
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        failedCount,
        failedAmount: parseFloat(failedAmount.toFixed(2))
      },
      orders: rows,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async cancelOrder(orderId, customerId, cancelReason) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Business, as: 'business' }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.customerId !== customerId) {
      throw ApiError.forbidden('You are not authorized to cancel this order');
    }

    if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CONFIRMED) {
      throw ApiError.badRequest(
        `Order cannot be cancelled in '${order.status}' status. Please contact the seller.`
      );
    }

    const t = await sequelize.transaction();
    try {
      order.status = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason || 'Cancelled by customer';
      await order.save({ transaction: t });

      // Restore inventory and release reservations
      for (const item of order.items) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, {
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          if (product) {
            const phys = product.physicalStock || product.stockQuantity;
            const resBefore = product.reservedQuantity || 0;
            const availBefore = product.stockQuantity;

            product.reservedQuantity = Math.max(0, resBefore - item.quantity);
            product.stockQuantity += item.quantity;
            await product.save({ transaction: t });

            let variant = null;
            if (item.variantId) {
              variant = await ProductVariant.findByPk(item.variantId, {
                transaction: t,
                lock: t.LOCK.UPDATE
              });
            }
            if (!variant) {
              variant = await ProductVariant.findOne({
                where: { productId: product.id, businessId: order.businessId },
                order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
                transaction: t,
                lock: t.LOCK.UPDATE
              });
            }
            if (variant) {
              variant.reservedQuantity = Math.max(0, (variant.reservedQuantity || 0) - item.quantity);
              variant.stockQuantity += item.quantity;
              await variant.save({ transaction: t });
            }

            await StockMovement.create(
              {
                businessId: order.businessId,
                productId: item.productId,
                variantId: variant ? variant.id : item.variantId || null,
                sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                movementType: 'order_release',
                quantityChange: item.quantity,
                physicalStockBefore: phys,
                physicalStockAfter: phys,
                reservedBefore: resBefore,
                reservedAfter: product.reservedQuantity,
                availableBefore: availBefore,
                availableAfter: product.stockQuantity,
                reason: 'Customer cancelled order: reservation released',
                orderId: order.id,
                orderNumber: order.orderNumber,
                actorId: customerId,
                actorRole: ROLES.CUSTOMER
              },
              { transaction: t }
            );
          }
        }
      }

      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: ORDER_STATUS.CANCELLED,
          notes: cancelReason || 'Cancelled by customer',
          changedBy: customerId
        },
        { transaction: t }
      );

      await t.commit();

      // Notify business owner
      Notification.create({
        userId: order.business.ownerId,
        title: `Order #${order.orderNumber} Cancelled`,
        message: `Order #${order.orderNumber} was cancelled by the customer.`,
        type: 'order',
        data: { orderId: order.id }
      }).catch(() => {});

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Release expired unpaid orders and restore inventory stock safely
   */
  static async releaseExpiredOrders() {
    const expiredOrders = await Order.findAll({
      where: {
        status: ORDER_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.UNPAID,
        expiresAt: { [Op.lt]: new Date() }
      },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' }
      ]
    });

    let releasedCount = 0;

    for (const order of expiredOrders) {
      const t = await sequelize.transaction();
      try {
        // Re-fetch and lock the order row within transaction to prevent race conditions with concurrent payment verification
        const lockedOrder = await Order.findByPk(order.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
          include: [
            { model: OrderItem, as: 'items' },
            { model: Payment, as: 'payment' }
          ]
        });

        // Ensure order is still pending and unpaid before modifying stock or status
        if (
          !lockedOrder ||
          lockedOrder.status !== ORDER_STATUS.PENDING ||
          lockedOrder.paymentStatus !== PAYMENT_STATUS.UNPAID
        ) {
          await t.rollback();
          continue;
        }

        // Restore stock with row lock on products and release reservation
        if (Array.isArray(lockedOrder.items)) {
          for (const item of lockedOrder.items) {
            const product = await Product.findByPk(item.productId, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });
            if (product) {
              const phys = product.physicalStock || product.stockQuantity;
              const resBefore = product.reservedQuantity || 0;
              const availBefore = product.stockQuantity;

              product.reservedQuantity = Math.max(0, resBefore - item.quantity);
              product.stockQuantity += item.quantity;
              await product.save({ transaction: t });

              let variant = null;
              if (item.variantId) {
                variant = await ProductVariant.findByPk(item.variantId, {
                  transaction: t,
                  lock: t.LOCK.UPDATE
                });
              }
              if (!variant) {
                variant = await ProductVariant.findOne({
                  where: { productId: product.id, businessId: lockedOrder.businessId },
                  order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
                  transaction: t,
                  lock: t.LOCK.UPDATE
                });
              }
              if (variant) {
                variant.reservedQuantity = Math.max(0, (variant.reservedQuantity || 0) - item.quantity);
                variant.stockQuantity += item.quantity;
                await variant.save({ transaction: t });
              }

              await StockMovement.create(
                {
                  businessId: lockedOrder.businessId,
                  productId: item.productId,
                  variantId: variant ? variant.id : item.variantId || null,
                  sku: item.sku || (variant ? variant.sku : product.sku) || 'N/A',
                  movementType: 'order_release',
                  quantityChange: item.quantity,
                  physicalStockBefore: phys,
                  physicalStockAfter: phys,
                  reservedBefore: resBefore,
                  reservedAfter: product.reservedQuantity,
                  availableBefore: availBefore,
                  availableAfter: product.stockQuantity,
                  reason: 'Order TTL expired: reservation auto-released',
                  orderId: lockedOrder.id,
                  orderNumber: lockedOrder.orderNumber,
                  actorId: null,
                  actorRole: 'system'
                },
                { transaction: t }
              );
            }
          }
        }

        lockedOrder.status = ORDER_STATUS.CANCELLED;
        lockedOrder.cancelReason = 'Order payment window expired (stock reservation auto-released)';
        lockedOrder.cancelledAt = new Date();
        lockedOrder.expiresAt = null;
        await lockedOrder.save({ transaction: t });

        if (lockedOrder.payment) {
          lockedOrder.payment.status = 'failed';
          await lockedOrder.payment.save({ transaction: t });
        }

        await OrderStatusHistory.create(
          {
            orderId: lockedOrder.id,
            status: ORDER_STATUS.CANCELLED,
            notes: 'Expired pending order automatically released and stock restored',
            changedBy: null
          },
          { transaction: t }
        );

        await t.commit();
        releasedCount++;
      } catch (err) {
        await t.rollback();
      }
    }

    return releasedCount;
  }
}

export default OrderService;

