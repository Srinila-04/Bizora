import PaymentService from '../services/payment.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class PaymentController {
  /**
   * Get public payment configuration (mode, public keyId, currency)
   */
  static async getConfig(req, res, next) {
    try {
      const paymentConfig = PaymentService.getPaymentConfig();
      return ApiResponse.success(res, 'Payment configuration retrieved', paymentConfig);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve payment details for an order
   */
  static async getPaymentByOrderId(req, res, next) {
    try {
      const payment = await PaymentService.getPaymentByOrderId(
        req.params.orderId,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, 'Payment details retrieved', { payment });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Initialize a Razorpay Gateway Order for checkout
   */
  static async createGatewayOrder(req, res, next) {
    try {
      const gatewayOrder = await PaymentService.createGatewayOrder(req.body.orderId, req.user.id);
      return ApiResponse.success(res, 'Gateway order created successfully', gatewayOrder);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static async verifyPayment(req, res, next) {
    try {
      const {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod
      } = req.body;

      const result = await PaymentService.verifyPaymentSignature({
        orderId,
        userId: req.user.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod
      });

      return ApiResponse.success(res, result.message, {
        verified: true,
        order: result.order,
        payment: result.payment
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Confirm order with Cash on Delivery
   */
  static async cashOnDelivery(req, res, next) {
    try {
      const result = await PaymentService.processCashOnDelivery(req.body.orderId, req.user.id);
      return ApiResponse.success(res, result.message, {
        order: result.order,
        payment: result.payment
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle Razorpay Webhooks with rawBody signature verification
   */
  static async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody;

      const result = await PaymentService.processWebhook({ rawBody, signature });
      return res.status(200).json({
        status: 'ok',
        event: result.event,
        requiresRefund: result.requiresRefund || false
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default PaymentController;
