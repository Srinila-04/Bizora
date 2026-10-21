import { body, param } from 'express-validator';

export const createBusinessValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Business name must be between 2 and 150 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Business category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Business description is required')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Business phone number is required')
    .isLength({ min: 7, max: 50 })
    .withMessage('Please provide a valid phone number'),
  body().custom((value, { req }) => {
    const hasAddress = req.body.address && req.body.address.trim().length > 0;
    const hasAddressDetails = req.body.addressDetails && typeof req.body.addressDetails === 'object';
    if (!hasAddress && !hasAddressDetails) {
      throw new Error('Business address is required');
    }
    return true;
  }),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid contact email'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: false })
    .withMessage('Please provide a valid website URL'),
  body('taxId')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tax / GST ID cannot exceed 100 characters'),
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  body('addressDetails')
    .optional()
    .isObject()
    .withMessage('Address details must be an object'),
  body('logo')
    .optional({ checkFalsy: true })
    .trim(),
  body('banner')
    .optional({ checkFalsy: true })
    .trim(),
  body('themeSettings')
    .optional()
    .isObject()
    .withMessage('Theme settings must be an object')
];

export const updateBusinessValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business name cannot be empty')
    .isLength({ min: 2, max: 150 }),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 3000 }),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('address')
    .optional()
    .trim(),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: false })
    .withMessage('Please provide a valid website URL'),
  body('taxId')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('logo')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '' || typeof value === 'string') return true;
      throw new Error('Logo must be a valid string or null');
    }),
  body('banner')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '' || typeof value === 'string') return true;
      throw new Error('Banner must be a valid string or null');
    }),
  body('socialLinks')
    .optional()
    .isObject(),
  body('addressDetails')
    .optional()
    .isObject(),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Status must be active, inactive, or archived')
];

export const updateThemeValidator = [
  body('template')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Template ID must be between 2 and 100 characters and contain only letters, numbers, hyphens, or underscores'),
  body('primaryColor')
    .optional()
    .isHexColor()
    .withMessage('Primary color must be a valid hex color code'),
  body('secondaryColor')
    .optional()
    .isHexColor()
    .withMessage('Secondary color must be a valid hex color code'),
  body('font')
    .optional()
    .isString(),
  body('layout')
    .optional()
    .isString(),
  body('isDraft')
    .optional()
    .isBoolean()
    .withMessage('isDraft must be a boolean flag'),
  body('draft')
    .optional()
    .isObject()
    .withMessage('Draft settings must be an object'),
  body('cardLayout')
    .optional()
    .isObject(),
  body('headerLayout')
    .optional()
    .isObject(),
  body('contentOverrides')
    .optional()
    .isObject(),
  body('sectionOrder')
    .optional()
    .isArray(),
  body('customSections')
    .optional()
    .isObject()
];

export const deleteBusinessValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Business ID is required')
    .isUUID()
    .withMessage('Invalid business ID format')
];

export default {
  createBusinessValidator,
  updateBusinessValidator,
  updateThemeValidator,
  deleteBusinessValidator
};

