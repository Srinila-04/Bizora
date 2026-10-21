import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createGatewayOrderValidator,
  verifyPaymentValidator,
  cashOnDeliveryValidator
} from '../validators/payment.validator.js';

const router = Router();

// 1. Webhook endpoint (Public from Razorpay servers, secured by HMAC-SHA256 signature)
router.post('/webhook', PaymentController.handleWebhook);

// 2. Public payment configuration (Key ID, Mode, Currency)
router.get('/config', PaymentController.getConfig);

// 3. Customer-authenticated payment endpoints
router.use(authenticate);

router.get('/order/:orderId', PaymentController.getPaymentByOrderId);
router.post(
  '/create-gateway-order',
  validateRequest(createGatewayOrderValidator),
  PaymentController.createGatewayOrder
);
router.post(
  '/verify',
  validateRequest(verifyPaymentValidator),
  PaymentController.verifyPayment
);
router.post(
  '/cash-on-delivery',
  validateRequest(cashOnDeliveryValidator),
  PaymentController.cashOnDelivery
);

export default router;
