import { body } from 'express-validator';
import { ORDER_STATUS_LIST } from '../constants/orderStatus.js';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createOrderValidator = [
  body('businessId')
    .notEmpty()
    .withMessage('Business ID is required')
    .matches(uuidRegex)
    .withMessage('Business ID must be a valid UUID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .matches(uuidRegex)
    .withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.variantId')
    .optional({ nullable: true })
    .matches(uuidRegex)
    .withMessage('Variant ID must be a valid UUID'),
  body('items.*.sku')
    .optional({ nullable: true })
    .trim(),
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('billingAddress')
    .optional()
    .isObject()
    .withMessage('Billing address must be an object'),
  body('notes')
    .optional()
    .trim()
];

export const updateOrderStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ORDER_STATUS_LIST)
    .withMessage(`Status must be one of: ${ORDER_STATUS_LIST.join(', ')}`),
  body('notes')
    .optional()
    .trim(),
  body('restockEligible')
    .optional()
    .isBoolean()
    .withMessage('restockEligible must be a boolean')
];

export const cancelOrderValidator = [
  body('cancelReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancel reason cannot exceed 500 characters')
];

export const dispatchOrderValidator = [
  body('courierName')
    .notEmpty()
    .withMessage('Courier name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Courier name cannot exceed 100 characters'),
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number cannot exceed 100 characters'),
  body('trackingUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Tracking URL must be a valid URL'),
  body('estimatedDeliveryDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

export const updateDeliveryStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['out_for_delivery', 'delivered', 'delivery_failed', 'returned'])
    .withMessage('Status must be out_for_delivery, delivered, delivery_failed, or returned'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('restockEligible')
    .optional()
    .isBoolean()
    .withMessage('restockEligible must be a boolean')
];

export const codCollectionValidator = [
  body('collectionStatus')
    .notEmpty()
    .withMessage('Collection status is required')
    .isIn(['collected', 'failed'])
    .withMessage('Collection status must be collected or failed'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

export default {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  dispatchOrderValidator,
  updateDeliveryStatusValidator,
  codCollectionValidator
};

