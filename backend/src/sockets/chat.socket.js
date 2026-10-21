import { verifyAccessToken } from '../utils/token.js';
import { User, Business, Conversation } from '../database/models/index.js';
import ChatService from '../services/chat.service.js';
import logger from '../utils/logger.js';

export const setupChatSocket = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error('User account inactive or not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      logger.warn(`Socket authentication failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.id}, Role: ${socket.user.role})`);

    // 1. Join user's personal room for direct notifications
    socket.join(`user:${socket.user.id}`);

    // 2. If business owner, join their owned business rooms
    if (socket.user.role === 'business_owner') {
      try {
        const businesses = await Business.findAll({
          where: { ownerId: socket.user.id },
          attributes: ['id']
        });
        businesses.forEach((b) => {
          socket.join(`business:${b.id}`);
          logger.debug(`Socket ${socket.id} auto-joined business:${b.id}`);
        });
      } catch (err) {
        logger.error(`Error auto-joining business rooms for user ${socket.user.id}: ${err.message}`);
      }
    }

    // Client event: business:join
    socket.on('business:join', async (data) => {
      const { businessId } = data || {};
      if (businessId) {
        socket.join(`business:${businessId}`);
        logger.debug(`Socket ${socket.id} joined business:${businessId}`);
      }
    });

    // Client event: conversation:join
    socket.on('conversation:join', async (data, callback) => {
      try {
        const { conversationId } = data || {};
        if (!conversationId) {
          throw new Error('conversationId is required');
        }

        // Authorize conversation membership before room join
        await ChatService.verifyConversationAccess(
          conversationId,
          socket.user.id,
          socket.user.role
        );

        const room = `conversation:${conversationId}`;
        socket.join(room);
        logger.debug(`Socket ${socket.id} joined room ${room}`);

        if (typeof callback === 'function') {
          callback({ success: true, message: `Joined room ${room}` });
        }
      } catch (err) {
        socket.emit('chat:error', { message: err.message, code: 'JOIN_ERROR' });
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Client event: conversation:leave
    socket.on('conversation:leave', (data) => {
      const { conversationId } = data || {};
      if (conversationId) {
        const room = `conversation:${conversationId}`;
        socket.leave(room);
        logger.debug(`Socket ${socket.id} left room ${room}`);
      }
    });

    // Client event: message:send
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, attachments } = data || {};

        const hasText = typeof content === 'string' && content.trim().length > 0;
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

        if (!conversationId || (!hasText && !hasAttachments)) {
          throw new Error('conversationId and text or attachment are required');
        }

        // Verify membership and determine senderType
        const { senderType } = await ChatService.verifyConversationAccess(
          conversationId,
          socket.user.id,
          socket.user.role
        );

        // Persist message to MySQL before acknowledging
        const savedMessage = await ChatService.saveMessage({
          conversationId,
          senderId: socket.user.id,
          senderType,
          content: hasText ? content.trim() : null,
          attachments: hasAttachments ? attachments : null
        });

        const room = `conversation:${conversationId}`;
        // Server event: message:new
        io.to(room).emit('message:new', {
          conversationId,
          message: savedMessage
        });

        // Broadcast notifications & list updates to recipient
        const conversation = await Conversation.findByPk(conversationId, {
          include: [{ model: Business, as: 'business' }]
        });
        if (conversation) {
          const senderName = `${socket.user.firstName || ''} ${socket.user.lastName || ''}`.trim() || 'A user';
          const previewText = savedMessage.content || (savedMessage.attachments?.length ? '📷 [Image Attachment]' : 'New message');

          if (senderType === 'customer') {
            const notifyData = {
              type: 'chat_message',
              title: `New message from ${senderName}`,
              message: previewText,
              conversationId,
              businessId: conversation.businessId,
              senderId: socket.user.id,
              senderName,
              timestamp: new Date().toISOString()
            };
            io.to(`business:${conversation.businessId}`).emit('notification:new', notifyData);
          } else {
            const businessName = conversation.business?.name || 'Merchant';
            const notifyData = {
              type: 'chat_message',
              title: `New message from ${businessName}`,
              message: previewText,
              conversationId,
              businessId: conversation.businessId,
              senderId: socket.user.id,
              senderName: businessName,
              timestamp: new Date().toISOString()
            };
            io.to(`user:${conversation.customerId}`).emit('notification:new', notifyData);
          }

          io.to(`user:${conversation.customerId}`).emit('conversation:updated', { conversationId, lastMessage: savedMessage });
          io.to(`business:${conversation.businessId}`).emit('conversation:updated', { conversationId, lastMessage: savedMessage });
        }

        if (typeof callback === 'function') {
          callback({ success: true, message: savedMessage });
        }
      } catch (err) {
        logger.error(`Error in message:send: ${err.message}`);
        socket.emit('chat:error', { message: err.message, code: 'SEND_ERROR' });
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Client event: message:read
    socket.on('message:read', async (data, callback) => {
      try {
        const { conversationId } = data || {};
        if (!conversationId) {
          throw new Error('conversationId is required');
        }

        await ChatService.markConversationAsRead(
          conversationId,
          socket.user.id,
          socket.user.role
        );

        const room = `conversation:${conversationId}`;
        // Server event: message:read
        io.to(room).emit('message:read', {
          conversationId,
          readBy: socket.user.id,
          readAt: new Date()
        });

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (err) {
        socket.emit('chat:error', { message: err.message, code: 'READ_ERROR' });
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default setupChatSocket;

