import { Router } from 'express';
import ChatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { uploadChatAttachment } from '../middleware/chatUpload.middleware.js';
import {
  startConversationValidator,
  sendMessageValidator,
  updateStatusValidator,
  getConversationsValidator
} from '../validators/chat.validator.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// 1. Unread counts
router.get('/unread-counts', ChatController.getUnreadCounts);

// 2. Conversations
router.get(
  '/conversations',
  validateRequest(getConversationsValidator),
  ChatController.getConversations
);

router.post(
  '/conversations',
  uploadChatAttachment.single('attachment'),
  validateRequest(startConversationValidator),
  ChatController.startConversation
);

router.get('/conversations/:conversationId', ChatController.getConversation);

// 3. Messages
router.get('/conversations/:conversationId/messages', ChatController.getMessages);

router.post(
  '/conversations/:conversationId/messages',
  uploadChatAttachment.single('attachment'),
  validateRequest(sendMessageValidator),
  ChatController.sendMessage
);

// 4. Read receipt & conversation lifecycle
router.patch('/conversations/:conversationId/read', ChatController.markAsRead);
router.patch(
  '/conversations/:conversationId/status',
  validateRequest(updateStatusValidator),
  ChatController.updateStatus
);

// 5. Secure attachment download
router.get('/attachments/:filename', ChatController.getAttachment);

export default router;
