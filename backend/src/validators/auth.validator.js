import { body } from 'express-validator';
import { ROLES } from '../constants/roles.js';

const passwordComplexity = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[@$!%*?&#]/)
  .withMessage('Password must contain at least one special character (@$!%*?&#)');

export const registerValidator = [
  body().custom((value, { req }) => {
    const hasFirst = req.body.firstName && req.body.firstName.trim().length > 0;
    const hasFull = req.body.fullName && req.body.fullName.trim().length > 0;
    if (!hasFirst && !hasFull) {
      throw new Error('First name or full name is required');
    }
    return true;
  }),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('First name cannot exceed 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name cannot exceed 100 characters'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Full name cannot exceed 200 characters'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone cannot exceed 50 characters'),
  passwordComplexity,
  body('role')
    .optional()
    .isIn([ROLES.CUSTOMER, ROLES.BUSINESS_OWNER])
    .withMessage(`Role must be either '${ROLES.CUSTOMER}' or '${ROLES.BUSINESS_OWNER}'`)
];

export const customerRegisterValidator = [
  body().custom((value, { req }) => {
    const hasFirst = req.body.firstName && req.body.firstName.trim().length > 0;
    const hasFull = req.body.fullName && req.body.fullName.trim().length > 0;
    if (!hasFirst && !hasFull) {
      throw new Error('Full Name is required');
    }
    return true;
  }),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Mobile number cannot exceed 50 characters'),
  passwordComplexity
];

export const merchantRegisterValidator = [
  body().custom((value, { req }) => {
    const hasFirst = req.body.firstName && req.body.firstName.trim().length > 0;
    const hasFull = req.body.fullName && req.body.fullName.trim().length > 0;
    if (!hasFirst && !hasFull) {
      throw new Error("Owner's Full Name is required");
    }
    return true;
  }),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required for merchant registration')
    .isLength({ min: 7, max: 50 })
    .withMessage('Please provide a valid mobile number'),
  passwordComplexity
];

export const loginValidator = [
  body().custom((value, { req }) => {
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    if (!identifier || (typeof identifier === 'string' && !identifier.trim())) {
      throw new Error('Email address or mobile number is required');
    }
    return true;
  }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .matches(/[@$!%*?&#]/)
    .withMessage('New password must contain at least one special character (@$!%*?&#)')
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
];

export const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&#]/)
    .withMessage('Password must contain at least one special character (@$!%*?&#)')
];

export const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 100 }),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 100 }),
  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone cannot exceed 50 characters')
];

export default {
  registerValidator,
  customerRegisterValidator,
  merchantRegisterValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator
};

