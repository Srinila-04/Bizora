import { body, query } from 'express-validator';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const stockAdjustmentValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .matches(uuidRegex)
    .withMessage('Invalid product ID'),
  body('variantId')
    .optional({ nullable: true })
    .matches(uuidRegex)
    .withMessage('Invalid variant ID'),
  body('adjustmentType')
    .notEmpty()
    .withMessage('Adjustment type is required')
    .isIn(['receive', 'damage_loss', 'correction', 'customer_return', 'manual_adjustment'])
    .withMessage('Invalid adjustment type. Must be receive, damage_loss, correction, customer_return, or manual_adjustment'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Reason must be between 2 and 255 characters'),
  body('notes')
    .optional({ nullable: true })
    .trim()
];

export const updateThresholdValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .matches(uuidRegex)
    .withMessage('Invalid product ID'),
  body('variantId')
    .optional({ nullable: true })
    .matches(uuidRegex)
    .withMessage('Invalid variant ID'),
  body('lowStockThreshold')
    .notEmpty()
    .withMessage('Low stock threshold is required')
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

export const createVariantValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Variant name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Variant name must be between 1 and 200 characters'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('SKU must be between 2 and 100 characters'),
  body('barcode')
    .optional({ nullable: true })
    .trim(),
  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Price must be non-negative'),
  body('costPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Cost price must be non-negative'),
  body('physicalStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Physical stock must be non-negative'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be non-negative')
];

