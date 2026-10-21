import { body } from 'express-validator';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('costPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  body('categoryId')
    .optional({ nullable: true })
    .matches(uuidRegex)
    .withMessage('Invalid category ID'),
  body('description')
    .optional()
    .trim(),
  body('sku')
    .optional({ nullable: true })
    .trim(),
  body('barcode')
    .optional({ nullable: true })
    .trim(),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of image URLs/paths'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'archived'])
    .withMessage("status must be one of: 'draft', 'active', 'archived'"),
  body('displayStyle')
    .optional()
    .isIn(['standard', 'editorial', 'detailed'])
    .withMessage("displayStyle must be one of: 'standard', 'editorial', 'detailed'")
];

export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 200 }),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  body('costPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 }),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 }),
  body('categoryId')
    .optional({ nullable: true })
    .matches(uuidRegex),
  body('description')
    .optional()
    .trim(),
  body('sku')
    .optional({ nullable: true })
    .trim(),
  body('barcode')
    .optional({ nullable: true })
    .trim(),
  body('images')
    .optional()
    .isArray(),
  body('isPublished')
    .optional()
    .isBoolean(),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'archived']),
  body('displayStyle')
    .optional()
    .isIn(['standard', 'editorial', 'detailed'])
    .withMessage("displayStyle must be one of: 'standard', 'editorial', 'detailed'")
];

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }),
  body('description')
    .optional()
    .trim(),
  body('imageUrl')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
];

export const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 }),
  body('description')
    .optional()
    .trim(),
  body('imageUrl')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
];

export default {
  createProductValidator,
  updateProductValidator,
  createCategoryValidator,
  updateCategoryValidator
};
