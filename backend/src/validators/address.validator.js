import { body, param } from 'express-validator';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createAddressValidator = [
  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required')
    .isLength({ max: 100 })
    .withMessage('Recipient name cannot exceed 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required')
    .isLength({ min: 7, max: 50 })
    .withMessage('Contact phone number must be between 7 and 50 characters'),
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Street address (Line 1) is required')
    .isLength({ max: 255 })
    .withMessage('Street address cannot exceed 255 characters'),
  body('addressLine2')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address Line 2 cannot exceed 255 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City / District is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State / Region is required')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal / PIN code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

export const updateAddressValidator = [
  param('id')
    .matches(uuidRegex)
    .withMessage('Invalid address ID format'),
  body('recipientName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Recipient name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Recipient name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact phone number cannot be empty')
    .isLength({ min: 7, max: 50 })
    .withMessage('Contact phone number must be between 7 and 50 characters'),
  body('addressLine1')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address (Line 1) cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Street address cannot exceed 255 characters'),
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address Line 2 cannot exceed 255 characters'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City / District cannot be empty')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State / Region cannot be empty')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal / PIN code cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

export const addressIdParamValidator = [
  param('id')
    .matches(uuidRegex)
    .withMessage('Invalid address ID format')
];

export default {
  createAddressValidator,
  updateAddressValidator,
  addressIdParamValidator
};

