import { body, query, param } from 'express-validator';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const startConversationValidator = [
  body('businessId')
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidRegex)
    .withMessage('Business ID must be a valid UUID'),
  body('productId')
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidRegex)
    .withMessage('Product ID must be a valid UUID'),
  body('orderId')
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidRegex)
    .withMessage('Order ID must be a valid UUID'),
  body('message')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Initial message cannot exceed 2000 characters'),
  body().custom((value, { req }) => {
    const hasBusiness = req.body.businessId && req.body.businessId !== 'null' && req.body.businessId !== 'undefined';
    const hasProduct = req.body.productId && req.body.productId !== 'null' && req.body.productId !== 'undefined';
    if (!hasBusiness && !hasProduct) {
      throw new Error('Either businessId or productId must be provided to initiate a conversation');
    }
    return true;
  })
];

export const sendMessageValidator = [
  param('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .matches(uuidRegex)
    .withMessage('Conversation ID must be a valid UUID'),
  body('content')
    .optional({ checkFalsy: false })
    .custom((val, { req }) => {
      const hasText = typeof val === 'string' && val.trim().length > 0;
      const hasFile = Boolean(req.file);
      const hasAttachments = Boolean(req.body.attachments);

      if (!hasText && !hasFile && !hasAttachments) {
        throw new Error('Message cannot be empty. Please provide text or an attachment.');
      }

      if (hasText && val.trim().length > 2000) {
        throw new Error('Message content cannot exceed 2000 characters');
      }

      return true;
    })
];

export const updateStatusValidator = [
  param('conversationId')
    .notEmpty()
    .matches(uuidRegex)
    .withMessage('Valid Conversation ID is required'),
  body('status')
    .notEmpty()
    .isIn(['open', 'resolved', 'reopened'])
    .withMessage('Status must be one of: open, resolved, reopened')
];

export const getConversationsValidator = [
  query('businessId')
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidRegex)
    .withMessage('businessId must be a valid UUID'),
  query('filter')
    .optional()
    .isIn(['all', 'unread', 'awaiting_reply', 'resolved', 'open'])
    .withMessage('Filter must be one of: all, unread, awaiting_reply, resolved, open'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export default {
  startConversationValidator,
  sendMessageValidator,
  updateStatusValidator,
  getConversationsValidator
};
