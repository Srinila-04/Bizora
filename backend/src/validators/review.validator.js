import { body } from 'express-validator';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createReviewValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .matches(uuidRegex)
    .withMessage('Product ID must be a valid UUID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters')
];

export const addToWishlistValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .matches(uuidRegex)
    .withMessage('Product ID must be a valid UUID')
];

export default {
  createReviewValidator,
  addToWishlistValidator
};
