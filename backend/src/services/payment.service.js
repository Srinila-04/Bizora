import crypto from 'crypto';
import Razorpay from 'razorpay';
import sequelize from '../config/database.js';
import config from '../config/env.js';
import {
  Payment,
  PaymentStatusHistory,
  Order,
  OrderStatusHistory,
  Business,
  User,
  Product
} from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import logger from '../utils/logger.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants/orderStatus.js';
import { PAYMENT_TRANSACTION_STATUS, PAYMENT_METHODS } from '../constants/paymentStatus.js';
import { ROLES } from '../constants/roles.js';

let razorpayClient = null;

const getRazorpayClient = () => {
  if (razorpayClient) return razorpayClient;
  const { keyId, keySecret } = config.payment.razorpay;
  if (keyId && keySecret && !keyId.includes('placeholder')) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpayClient;
};

export class PaymentService {
  /**
   * Safe public configuration (never exposes secrets)
   */
  static getPaymentConfig() {
    const isConfigured = Boolean(
      config.payment.razorpay.keyId &&
      config.payment.razorpay.keySecret &&
      !config.payment.razorpay.keyId.includes('placeholder')
    );

    return {
      provider: config.payment.provider,
      mode: config.payment.mode,
      keyId: isConfigured ? config.payment.razorpay.keyId : null,
      currency: config.payment.currency || 'INR',
      isConfigured
    };
  }

  /**
   * Retrieve payment details for an order with authorization check
   */
  static async getPaymentByOrderId(orderId, userId, userRole) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Business, as: 'business' },
        {
          model: Payment,
          as: 'payment',
          include: [{ model: PaymentStatusHistory, as: 'statusHistories' }]
        }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const isCustomer = order.customerId === userId;
    const isOwner = order.business && order.business.ownerId === userId;
    const isAdmin = userRole === ROLES.ADMIN;

    if (!isCustomer && !isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to view payments for this order');
    }

    return order.payment;
  }

  /**
   * Create or retrieve a Razorpay Gateway Order for checkout
   * Ensures amounts are calculated on server in integer paise
   */
  static async createGatewayOrder(orderId, userId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Business, as: 'business' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.customerId !== userId) {
      throw ApiError.forbidden('You can only initiate payment for your own orders');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw ApiError.badRequest('This order has already been paid for');
    }

    if (order.status === ORDER_STATUS.CANCELLED || order.status === ORDER_STATUS.REFUNDED) {
      throw ApiError.badRequest('Cannot process payment for a cancelled or refunded order');
    }

    // Check if order payment window has expired
    if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
      throw ApiError.badRequest('The payment window for this order has expired. Please place a new order.');
    }

    // Amount calculation in integer paise (₹78.00 -> 7800 paise)
    const totalAmountFloat = parseFloat(Number(order.totalAmount).toFixed(2));
    const amountInPaise = Math.round(totalAmountFloat * 100);

    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      throw ApiError.badRequest('Invalid order total amount for payment calculation');
    }

    let payment = order.payment;
    if (!payment) {
      payment = await Payment.create({
        orderId: order.id,
        businessId: order.businessId,
        customerId: order.customerId,
        paymentMethod: PAYMENT_METHODS.UPI,
        amount: order.totalAmount,
        currency: 'INR',
        status: PAYMENT_TRANSACTION_STATUS.PENDING,
        provider: 'razorpay'
      });
    }

    // Prevent duplicate gateway order creation: reuse active gatewayOrderId if already generated
    let gatewayOrderId = payment.gatewayOrderId;

    if (!gatewayOrderId) {
      if (config.isTest) {
        // Isolated automated testing harness ONLY (e.g. running vitest)
        gatewayOrderId = `order_test_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
        logger.info(`[Razorpay Test Harness] Created test harness order: ${gatewayOrderId}`);
      } else {
        const client = getRazorpayClient();
        if (client) {
          try {
            const rzpOrder = await client.orders.create({
              amount: amountInPaise,
              currency: 'INR',
              receipt: order.orderNumber,
              notes: {
                orderId: order.id,
                customerId: userId,
                businessId: order.businessId
              }
            });
            gatewayOrderId = rzpOrder.id;
          } catch (gatewayErr) {
            const detailMsg = gatewayErr.error?.description || gatewayErr.message || 'Payment gateway order creation failed';
            logger.error(`[Razorpay] Order creation failed (${gatewayErr.statusCode || 'N/A'}): ${detailMsg}`);
            throw ApiError.badRequest(`Razorpay gateway error: ${detailMsg}`);
          }
        } else {
          // Stop online checkout if Razorpay credentials are missing or placeholder
          throw ApiError.badRequest(
            'Razorpay test mode is not configured. Please try again later.'
          );
        }
      }

      payment.gatewayOrderId = gatewayOrderId;
      payment.currency = 'INR';
      payment.amount = order.totalAmount;
      payment.status = PAYMENT_TRANSACTION_STATUS.PENDING;
      await payment.save();
    }

    const customerUser = await User.findByPk(userId);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: amountInPaise, // in paise for Razorpay Checkout
      displayAmount: totalAmountFloat, // in INR for display
      currency: 'INR',
      gatewayOrderId,
      keyId: config.payment.razorpay.keyId || 'rzp_test_placeholder',
      mode: config.payment.mode,
      customer: {
        name: customerUser ? `${customerUser.firstName} ${customerUser.lastName}`.trim() : 'Customer',
        email: customerUser ? customerUser.email : '',
        phone: customerUser ? (customerUser.phone || '') : ''
      },
      businessName: order.business ? order.business.name : 'Bizora Store'
    };
  }

  /**
   * Verify Razorpay payment signature and advance order to confirmed & paid
   */
  static async verifyPaymentSignature({
    orderId,
    userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentMethod = 'upi'
  }) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Payment, as: 'payment' },
        { model: Business, as: 'business' }
      ]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.customerId !== userId) {
      throw ApiError.forbidden('You are not authorized to verify payment for this order');
    }

    const payment = order.payment;
    if (!payment) {
      throw ApiError.notFound('Payment record not found for this order');
    }

    // Idempotency: If order is already paid with this transaction, return success cleanly
    if (order.paymentStatus === PAYMENT_STATUS.PAID && payment.status === PAYMENT_TRANSACTION_STATUS.COMPLETED) {
      return {
        verified: true,
        order,
        payment,
        message: 'Payment has already been verified and recorded.'
      };
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw ApiError.badRequest('Cannot verify payment for a cancelled order');
    }

    // Validate that gateway order ID matches
    if (payment.gatewayOrderId && payment.gatewayOrderId !== razorpayOrderId) {
      throw ApiError.badRequest('Gateway Order ID mismatch for this order', 'ORDER_ID_MISMATCH');
    }

    // Verify cryptographic HMAC-SHA256 signature
    const secret = config.payment.razorpay.keySecret;
    if (!secret || (!config.isTest && secret.includes('placeholder'))) {
      throw ApiError.badRequest('Razorpay test mode is not configured. Please try again later.');
    }

    const bodyToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyToSign)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      logger.warn(`[Payment] Invalid signature attempt for Order ${order.orderNumber}`);
      throw ApiError.badRequest('Invalid payment signature verification failed', 'INVALID_SIGNATURE');
    }

    // Execute database transaction to record payment and confirm order
    const t = await sequelize.transaction();
    try {
      const lockedOrder = await Order.findByPk(order.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!lockedOrder) {
        throw ApiError.notFound('Order not found');
      }

      if (lockedOrder.status === ORDER_STATUS.CANCELLED) {
        throw ApiError.badRequest('Cannot verify payment for a cancelled or expired order');
      }

      const lockedPayment = await Payment.findByPk(payment.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!lockedPayment) {
        throw ApiError.notFound('Payment record not found for this order');
      }

      lockedPayment.status = PAYMENT_TRANSACTION_STATUS.COMPLETED;
      lockedPayment.transactionReference = razorpayPaymentId;
      lockedPayment.gatewaySignature = razorpaySignature;
      lockedPayment.paymentMethod = paymentMethod;
      lockedPayment.provider = 'razorpay';
      lockedPayment.metadata = {
        ...(lockedPayment.metadata || {}),
        verifiedAt: new Date().toISOString(),
        gateway: 'razorpay',
        razorpayOrderId,
        razorpayPaymentId
      };
      await lockedPayment.save({ transaction: t });

      await PaymentStatusHistory.create(
        {
          paymentId: lockedPayment.id,
          status: PAYMENT_TRANSACTION_STATUS.COMPLETED,
          reason: `Payment verified via Razorpay. Payment ID: ${razorpayPaymentId}`,
          changedBy: userId
        },
        { transaction: t }
      );

      // Finalize order status and clear expiration reservation
      lockedOrder.paymentStatus = PAYMENT_STATUS.PAID;
      if (lockedOrder.status === ORDER_STATUS.PENDING) {
        lockedOrder.status = ORDER_STATUS.CONFIRMED;
      }
      lockedOrder.expiresAt = null; // Reservation confirmed
      await lockedOrder.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          orderId: lockedOrder.id,
          status: lockedOrder.status,
          notes: `Payment verified successfully (Ref: ${razorpayPaymentId})`,
          changedBy: userId
        },
        { transaction: t }
      );

      await t.commit();
      logger.info(`[Payment] Order ${lockedOrder.orderNumber} successfully paid and verified.`);

      return {
        verified: true,
        order: lockedOrder,
        payment: lockedPayment,
        message: 'Payment verified and order confirmed successfully.'
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Cash on Delivery (COD) Checkout Workflow
   */
  static async processCashOnDelivery(orderId, userId) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment, as: 'payment' }]
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.customerId !== userId) {
      throw ApiError.forbidden('You can only confirm checkout for your own orders');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw ApiError.badRequest('This order has already been paid for');
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw ApiError.badRequest('Cannot process COD for a cancelled order');
    }

    const t = await sequelize.transaction();
    try {
      let payment = order.payment;
      if (!payment) {
        payment = await Payment.create(
          {
            orderId: order.id,
            businessId: order.businessId,
            customerId: order.customerId,
            paymentMethod: PAYMENT_METHODS.CASH_ON_DELIVERY,
            amount: order.totalAmount,
            currency: 'INR',
            status: PAYMENT_TRANSACTION_STATUS.PENDING,
            provider: 'cash_on_delivery'
          },
          { transaction: t }
        );
      } else {
        payment.paymentMethod = PAYMENT_METHODS.CASH_ON_DELIVERY;
        payment.provider = 'cash_on_delivery';
        payment.status = PAYMENT_TRANSACTION_STATUS.PENDING;
        await payment.save({ transaction: t });
      }

      order.paymentStatus = PAYMENT_STATUS.UNPAID;
      order.status = ORDER_STATUS.CONFIRMED;
      order.expiresAt = null; // Order confirmed for delivery
      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: ORDER_STATUS.CONFIRMED,
          notes: 'Order confirmed with Cash on Delivery payment option',
          changedBy: userId
        },
        { transaction: t }
      );

      await t.commit();
      return { order, payment, message: 'Order placed successfully with Cash on Delivery' };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Process incoming Razorpay webhook event with rawBody HMAC-SHA256 signature verification
   */
  static async processWebhook({ rawBody, signature }) {
    const webhookSecret = config.payment.razorpay.webhookSecret || (config.isTest ? 'placeholder_webhook_secret_dev' : null);
    if (!webhookSecret) {
      throw ApiError.badRequest('Razorpay webhook secret is not configured in backend');
    }

    if (!rawBody || !signature) {
      throw ApiError.badRequest('Missing webhook payload or signature');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('[Webhook] Razorpay webhook signature verification failed');
      throw ApiError.badRequest('Invalid webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    logger.info(`[Webhook] Received Razorpay event: ${event.event}`);

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        const payment = await Payment.findOne({ where: { gatewayOrderId } });
        if (payment && payment.status !== PAYMENT_TRANSACTION_STATUS.COMPLETED) {
          const t = await sequelize.transaction();
          try {
            const lockedPayment = await Payment.findByPk(payment.id, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });

            if (!lockedPayment || lockedPayment.status === PAYMENT_TRANSACTION_STATUS.COMPLETED) {
              await t.rollback();
              return { received: true, event: event.event };
            }

            const lockedOrder = await Order.findByPk(lockedPayment.orderId, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });

            if (!lockedOrder) {
              await t.rollback();
              return { received: true, event: event.event };
            }

            if (lockedOrder.status === ORDER_STATUS.CANCELLED) {
              // Order was cancelled/expired and stock was restored.
              // Do NOT mark order as paid. Flag payment for manual refund.
              lockedPayment.status = PAYMENT_TRANSACTION_STATUS.FAILED;
              lockedPayment.transactionReference = paymentId || lockedPayment.transactionReference;
              lockedPayment.metadata = {
                ...(lockedPayment.metadata || {}),
                requiresRefund: true,
                refundReason: 'Payment captured for cancelled/expired order'
              };
              await lockedPayment.save({ transaction: t });
              await t.commit();
              logger.warn(`[Webhook] Payment captured for CANCELLED order ${lockedOrder.orderNumber}. Flagged for refund.`);
              return { received: true, event: event.event, requiresRefund: true };
            }

            lockedPayment.status = PAYMENT_TRANSACTION_STATUS.COMPLETED;
            lockedPayment.transactionReference = paymentId || lockedPayment.transactionReference;
            await lockedPayment.save({ transaction: t });

            lockedOrder.paymentStatus = PAYMENT_STATUS.PAID;
            if (lockedOrder.status === ORDER_STATUS.PENDING) {
              lockedOrder.status = ORDER_STATUS.CONFIRMED;
            }
            lockedOrder.expiresAt = null;
            await lockedOrder.save({ transaction: t });

            await t.commit();
            logger.info(`[Webhook] Asynchronously finalized Order ${lockedOrder.orderNumber} via webhook.`);
          } catch (err) {
            await t.rollback();
            logger.error(`[Webhook] Error finalizing payment in webhook: ${err.message}`);
          }
        }
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      if (gatewayOrderId) {
        const payment = await Payment.findOne({ where: { gatewayOrderId } });
        if (payment && payment.status === PAYMENT_TRANSACTION_STATUS.PENDING) {
          payment.status = PAYMENT_TRANSACTION_STATUS.FAILED;
          payment.metadata = {
            ...(payment.metadata || {}),
            failedReason: paymentEntity.error_description || 'Payment failed at gateway'
          };
          await payment.save();
          logger.info(`[Webhook] Recorded failed payment for Gateway Order: ${gatewayOrderId}`);
        }
      }
    }

    return { received: true, event: event.event };
  }
}

export default PaymentService;
