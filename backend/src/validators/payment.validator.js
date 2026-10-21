import { body } from 'express-validator';
import { PAYMENT_METHOD_LIST } from '../constants/paymentStatus.js';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createGatewayOrderValidator = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .matches(uuidRegex)
    .withMessage('Order ID must be a valid UUID')
];

export const verifyPaymentValidator = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .matches(uuidRegex)
    .withMessage('Order ID must be a valid UUID'),
  body('razorpayOrderId')
    .notEmpty()
    .trim()
    .withMessage('Razorpay Order ID is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .trim()
    .withMessage('Razorpay Payment ID is required'),
  body('razorpaySignature')
    .notEmpty()
    .trim()
    .withMessage('Razorpay Signature is required'),
  body('paymentMethod')
    .optional()
    .isIn(PAYMENT_METHOD_LIST)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHOD_LIST.join(', ')}`)
];

export const cashOnDeliveryValidator = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .matches(uuidRegex)
    .withMessage('Order ID must be a valid UUID')
];

export default {
  createGatewayOrderValidator,
  verifyPaymentValidator,
  cashOnDeliveryValidator
};

