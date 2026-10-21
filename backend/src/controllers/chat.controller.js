import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ChatService from '../services/chat.service.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import {
  verifyImageMagicBytes,
  deleteChatFile
} from '../middleware/chatUpload.middleware.js';
import { emitToConversation, emitToUser, emitToBusiness } from '../sockets/index.js';
import { Conversation, Business } from '../database/models/index.js';

export class ChatController {
  /**
   * Get conversations list for customer or merchant business.
   */
  static async getConversations(req, res, next) {
    try {
      const { businessId, filter, search, page, limit } = req.query;

      const result = await ChatService.getUserConversations({
        userId: req.user.id,
        userRole: req.user.role,
        businessId,
        filter,
        search,
        page,
        limit
      });

      return ApiResponse.success(res, 'Conversations retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get single conversation details.
   */
  static async getConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const conversation = await ChatService.getConversationDetails(
        conversationId,
        req.user.id,
        req.user.role
      );

      return ApiResponse.success(res, 'Conversation retrieved successfully', { conversation });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Start or retrieve an existing conversation with a merchant.
   */
  static async startConversation(req, res, next) {
    try {
      const { businessId, productId, orderId, message } = req.body;
      let attachment = null;

      if (req.file) {
        const isValidImage = await verifyImageMagicBytes(req.file.path);
        if (!isValidImage) {
          deleteChatFile(req.file.filename);
          throw ApiError.badRequest(
            'Invalid image content. The uploaded file is corrupted or not a valid image format.',
            'INVALID_IMAGE_MAGIC_BYTES'
          );
        }

        attachment = {
          id: uuidv4(),
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: `/api/v1/chat/attachments/${req.file.filename}`
        };
      }

      const conversation = await ChatService.getOrCreateConversation({
        customerId: req.user.id,
        businessId,
        productId,
        orderId,
        initialMessage: message,
        attachment
      });

      // Broadcast real-time notification to merchant
      const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'A Customer';
      const previewText = message || (attachment ? '📷 [Image Attachment]' : 'Started a conversation');
      const notifyData = {
        type: 'chat_message',
        title: `New inquiry from ${senderName}`,
        message: previewText,
        conversationId: conversation.id,
        businessId: conversation.businessId,
        senderId: req.user.id,
        senderName,
        timestamp: new Date().toISOString()
      };

      emitToBusiness(conversation.businessId, 'notification:new', notifyData);
      emitToBusiness(conversation.businessId, 'conversation:updated', { conversationId: conversation.id, lastMessage: conversation.lastMessage });
      emitToUser(req.user.id, 'conversation:updated', { conversationId: conversation.id, lastMessage: conversation.lastMessage });

      return ApiResponse.created(res, 'Conversation initiated successfully', { conversation });
    } catch (error) {
      if (req.file) {
        deleteChatFile(req.file.filename);
      }
      return next(error);
    }
  }

  /**
   * Get paginated messages in a conversation.
   */
  static async getMessages(req, res, next) {
    try {
      const result = await ChatService.getMessages(
        req.params.conversationId,
        req.user.id,
        req.user.role,
        req.query
      );

      return ApiResponse.success(res, 'Messages retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Send a new text or image message into a conversation.
   */
  static async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      let attachments = null;

      if (req.file) {
        const isValidImage = await verifyImageMagicBytes(req.file.path);
        if (!isValidImage) {
          deleteChatFile(req.file.filename);
          throw ApiError.badRequest(
            'Invalid image content. The uploaded file is corrupted or not a valid image format.',
            'INVALID_IMAGE_MAGIC_BYTES'
          );
        }

        attachments = [
          {
            id: uuidv4(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: `/api/v1/chat/attachments/${req.file.filename}`
          }
        ];
      }

      const { senderType } = await ChatService.verifyConversationAccess(
        conversationId,
        req.user.id,
        req.user.role
      );

      const message = await ChatService.saveMessage({
        conversationId,
        senderId: req.user.id,
        senderType,
        content: content ? content.trim() : null,
        attachments
      });

      // 1. Instantly push message to the conversation room (both sides receive without refreshing!)
      emitToConversation(conversationId, 'message:new', {
        conversationId,
        message
      });

      // 2. Fetch conversation to notify the recipient
      const conv = await Conversation.findByPk(conversationId, {
        include: [{ model: Business, as: 'business' }]
      });

      if (conv) {
        const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || (senderType === 'customer' ? 'Customer' : 'Merchant');
        const previewText = message.content || (message.attachments?.length ? '📷 [Image Attachment]' : 'New message');

        if (senderType === 'customer') {
          const notifyData = {
            type: 'chat_message',
            title: `New message from ${senderName}`,
            message: previewText,
            conversationId,
            businessId: conv.businessId,
            senderId: req.user.id,
            senderName,
            timestamp: new Date().toISOString()
          };
          emitToBusiness(conv.businessId, 'notification:new', notifyData);
        } else {
          const businessName = conv.business?.name || 'Merchant';
          const notifyData = {
            type: 'chat_message',
            title: `New message from ${businessName}`,
            message: previewText,
            conversationId,
            businessId: conv.businessId,
            senderId: req.user.id,
            senderName: businessName,
            timestamp: new Date().toISOString()
          };
          emitToUser(conv.customerId, 'notification:new', notifyData);
        }

        // 3. Update conversation inboxes in real time
        emitToUser(conv.customerId, 'conversation:updated', { conversationId, lastMessage: message });
        emitToBusiness(conv.businessId, 'conversation:updated', { conversationId, lastMessage: message });
      }

      return ApiResponse.created(res, 'Message sent successfully', { message });
    } catch (error) {
      if (req.file) {
        deleteChatFile(req.file.filename);
      }
      return next(error);
    }
  }

  /**
   * Mark all unread messages in conversation as read.
   */
  static async markAsRead(req, res, next) {
    try {
      const result = await ChatService.markConversationAsRead(
        req.params.conversationId,
        req.user.id,
        req.user.role
      );

      emitToConversation(req.params.conversationId, 'message:read', {
        conversationId: req.params.conversationId,
        readBy: req.user.id
      });

      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update conversation status (open, resolved, reopened).
   */
  static async updateStatus(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { status } = req.body;

      const conversation = await ChatService.updateConversationStatus(
        conversationId,
        req.user.id,
        req.user.role,
        status
      );

      emitToConversation(conversationId, 'conversation:status', {
        conversationId,
        status
      });
      emitToConversation(conversationId, 'conversation:updated', {
        conversationId,
        status
      });
      if (conversation) {
        emitToBusiness(conversation.businessId, 'conversation:status', { conversationId, status });
        emitToBusiness(conversation.businessId, 'conversation:updated', { conversationId, status });
        emitToUser(conversation.customerId, 'conversation:status', { conversationId, status });
        emitToUser(conversation.customerId, 'conversation:updated', { conversationId, status });
      }

      return ApiResponse.success(res, `Conversation status updated to ${status}`, { conversation });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get unread message counts for customer or merchant business.
   */
  static async getUnreadCounts(req, res, next) {
    try {
      const { businessId } = req.query;
      const result = await ChatService.getUnreadCounts(
        req.user.id,
        req.user.role,
        businessId
      );

      return ApiResponse.success(res, 'Unread count retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Serve chat attachment securely with authentication and membership verification.
   */
  static async getAttachment(req, res, next) {
    try {
      const { filename } = req.params;
      const { filePath, mimeType, originalName } = await ChatService.getAttachmentFile(
        filename,
        req.user.id,
        req.user.role
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);

      return res.sendFile(filePath);
    } catch (error) {
      return next(error);
    }
  }
}

export default ChatController;
