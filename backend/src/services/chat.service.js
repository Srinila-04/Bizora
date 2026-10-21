import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import {
  Conversation,
  Message,
  User,
  Business,
  Product,
  Order,
  Notification
} from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import { chatUploadDir } from '../middleware/chatUpload.middleware.js';

export class ChatService {
  /**
   * List conversations for either a Customer or a Merchant's specific Business.
   */
  static async getUserConversations({
    userId,
    userRole,
    businessId = null,
    filter = 'all',
    search = '',
    page = 1,
    limit = 20
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conversationWhere = {};

    if (businessId) {
      // Merchant mode: verify merchant ownership of the business
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw ApiError.notFound('Business not found');
      }

      const isOwner = business.ownerId === userId;
      const isAdmin = userRole === ROLES.ADMIN;
      if (!isOwner && !isAdmin) {
        throw ApiError.forbidden('You do not have permission to view conversations for this business');
      }

      conversationWhere.businessId = businessId;
    } else {
      // Customer mode: list authenticated customer's conversations
      conversationWhere.customerId = userId;
    }

    // Filter by status
    if (filter === 'resolved') {
      conversationWhere.status = 'resolved';
    } else if (filter === 'open') {
      conversationWhere.status = { [Op.in]: ['open', 'reopened'] };
    }

    // Search filter across customer name, business name, product name
    const customerWhere = {};
    const businessWhere = {};
    const productWhere = {};

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      if (businessId) {
        // Merchant searching: search customer name or product name
        customerWhere[Op.or] = [
          { firstName: { [Op.like]: term } },
          { lastName: { [Op.like]: term } },
          { email: { [Op.like]: term } }
        ];
      } else {
        // Customer searching: search business name or product name
        businessWhere.name = { [Op.like]: term };
      }
    }

    // Fetch conversations with associations
    const { count, rows } = await Conversation.findAndCountAll({
      where: conversationWhere,
      include: [
        {
          model: Business,
          as: 'business',
          where: Object.keys(businessWhere).length > 0 ? businessWhere : undefined,
          attributes: ['id', 'name', 'slug', 'logo', 'category', 'ownerId']
        },
        {
          model: User,
          as: 'customer',
          where: Object.keys(customerWhere).length > 0 ? customerWhere : undefined,
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'images', 'sku'],
          required: false
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'paymentStatus', 'createdAt'],
          required: false
        }
      ],
      order: [
        ['lastMessageAt', 'DESC'],
        ['updatedAt', 'DESC']
      ],
      distinct: true,
      limit: limitNum,
      offset
    });

    // Compute unread message counts & latest message for each conversation
    const conversationsWithUnread = await Promise.all(
      rows.map(async (conv) => {
        const convJson = conv.toJSON();

        // Count unread messages meant for this viewer
        const unreadCount = await Message.count({
          where: {
            conversationId: conv.id,
            senderId: { [Op.ne]: userId },
            isRead: false
          }
        });

        // Accurately retrieve true latest message for this conversation
        const latestMessage = await Message.findOne({
          where: { conversationId: conv.id },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'content', 'attachments', 'senderId', 'senderType', 'isRead', 'createdAt']
        });

        convJson.unreadCount = unreadCount;
        convJson.lastMessage = latestMessage || null;
        if (latestMessage?.createdAt) {
          if (!convJson.lastMessageAt || new Date(latestMessage.createdAt) > new Date(convJson.lastMessageAt)) {
            convJson.lastMessageAt = latestMessage.createdAt;
          }
        }

        return convJson;
      })
    );

    // In-memory filter for specialized filters like unread or awaiting_reply
    let filteredResults = conversationsWithUnread;
    if (filter === 'unread') {
      filteredResults = conversationsWithUnread.filter((c) => c.unreadCount > 0);
    } else if (filter === 'awaiting_reply') {
      if (businessId) {
        // Awaiting merchant reply: last message from customer and conversation not resolved
        filteredResults = conversationsWithUnread.filter(
          (c) => c.status !== 'resolved' && c.lastMessage && c.lastMessage.senderType === 'customer'
        );
      } else {
        // Awaiting customer reply: last message from merchant
        filteredResults = conversationsWithUnread.filter(
          (c) => c.status !== 'resolved' && c.lastMessage && c.lastMessage.senderType === 'business_owner'
        );
      }
    }

    // Ensure strict descending ordering by latest message timestamp so newest conversation is always at the top
    filteredResults.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });

    return {
      conversations: filteredResults,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1
      }
    };
  }

  /**
   * Start or reuse a conversation for a product, order, or general merchant inquiry.
   */
  static async getOrCreateConversation({
    customerId,
    businessId,
    productId = null,
    orderId = null,
    initialMessage = null,
    attachment = null
  }) {
    let resolvedBusinessId = businessId;

    // Validate Product association if provided
    if (productId) {
      const product = await Product.findByPk(productId, {
        include: [{ model: Business, as: 'business' }]
      });

      if (!product) {
        throw ApiError.notFound('Product not found');
      }

      if (resolvedBusinessId && resolvedBusinessId !== product.businessId) {
        throw ApiError.badRequest('Product does not belong to the specified business');
      }

      resolvedBusinessId = product.businessId;
    }

    // Validate Order association if provided
    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      if (order.customerId !== customerId) {
        throw ApiError.forbidden('You do not have access to this order');
      }

      if (resolvedBusinessId && resolvedBusinessId !== order.businessId) {
        throw ApiError.badRequest('Order does not belong to the specified business');
      }

      resolvedBusinessId = order.businessId;
    }

    if (!resolvedBusinessId) {
      throw ApiError.badRequest('A target business could not be identified for this conversation');
    }

    const business = await Business.findByPk(resolvedBusinessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (business.ownerId === customerId) {
      throw ApiError.badRequest('You cannot start a conversation with your own business');
    }

    // Reuse logic based on context
    const reuseWhere = {
      customerId,
      businessId: resolvedBusinessId
    };

    if (productId) {
      reuseWhere.productId = productId;
    } else if (orderId) {
      reuseWhere.orderId = orderId;
    } else {
      // General inquiry context: no product and no order
      reuseWhere.productId = null;
      reuseWhere.orderId = null;
    }

    let conversation = await Conversation.findOne({ where: reuseWhere });

    const hasInitialText = initialMessage && initialMessage.trim().length > 0;
    const hasAttachment = Boolean(attachment);

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        customerId,
        businessId: resolvedBusinessId,
        productId: productId || null,
        orderId: orderId || null,
        status: 'open',
        lastMessageAt: new Date()
      });
    } else if (hasInitialText || hasAttachment) {
      // If reusing a resolved conversation and sending a new message, automatically reopen it
      if (conversation.status === 'resolved') {
        conversation.status = 'reopened';
      }
      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    // Persist initial message if provided
    if (hasInitialText || hasAttachment) {
      await this.saveMessage({
        conversationId: conversation.id,
        senderId: customerId,
        senderType: 'customer',
        content: hasInitialText ? initialMessage.trim() : null,
        attachments: hasAttachment ? [attachment] : null
      });
    }

    return this.getConversationDetails(conversation.id, customerId, ROLES.CUSTOMER);
  }

  /**
   * Verify whether the authenticated user is allowed to access the conversation.
   */
  static async verifyConversationAccess(conversationId, userId, userRole) {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        { model: Business, as: 'business' },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'avatar', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'images', 'sku'] },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'paymentStatus', 'createdAt'] }
      ]
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isCustomer = conversation.customerId === userId;
    const isOwner = conversation.business && conversation.business.ownerId === userId;
    const isAdmin = userRole === ROLES.ADMIN;

    if (!isCustomer && !isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this conversation');
    }

    const senderType = isOwner ? 'business_owner' : 'customer';
    const recipientId = isOwner ? conversation.customerId : conversation.business.ownerId;

    return {
      conversation,
      isCustomer,
      isOwner,
      isAdmin,
      senderType,
      recipientId
    };
  }

  /**
   * Get complete conversation header details with authorized access verification.
   */
  static async getConversationDetails(conversationId, userId, userRole) {
    const { conversation } = await this.verifyConversationAccess(conversationId, userId, userRole);
    const convJson = conversation.toJSON();

    convJson.unreadCount = await Message.count({
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });

    return convJson;
  }

  /**
   * Get paginated message history for a conversation.
   */
  static async getMessages(conversationId, userId, userRole, { page = 1, limit = 50 }) {
    const { conversation } = await this.verifyConversationAccess(conversationId, userId, userRole);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      limit: limitNum,
      offset,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    return {
      conversation: {
        id: conversation.id,
        businessId: conversation.businessId,
        customerId: conversation.customerId,
        productId: conversation.productId,
        orderId: conversation.orderId,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
        business: conversation.business,
        customer: conversation.customer,
        product: conversation.product,
        order: conversation.order
      },
      messages: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1
      }
    };
  }

  /**
   * Save a new text and/or image attachment message.
   */
  static async saveMessage({ conversationId, senderId, senderType, content, attachments = null }) {
    const hasText = typeof content === 'string' && content.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!hasText && !hasAttachments) {
      throw ApiError.badRequest('Message cannot be empty. Please provide text or an attachment.');
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    // Create the message
    const message = await Message.create({
      conversationId,
      senderId,
      senderType,
      content: hasText ? content.trim() : null,
      attachments: hasAttachments ? attachments : null,
      isRead: false
    });

    // Conversation lifecycle updates:
    // If a customer replies to a resolved conversation, automatically reopen it
    const now = new Date();
    const updates = { lastMessageAt: now, updatedAt: now };
    if (conversation.status === 'resolved' && senderType === 'customer') {
      updates.status = 'reopened';
    }

    await Conversation.update(updates, { where: { id: conversationId } });

    return Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
  }

  /**
   * Mark all unread messages sent by the other party as read.
   */
  static async markConversationAsRead(conversationId, userId, userRole) {
    await this.verifyConversationAccess(conversationId, userId, userRole);

    await Message.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      }
    );

    return { success: true, message: 'Messages marked as read' };
  }

  /**
   * Explicitly transition conversation status: 'open', 'resolved', 'reopened'.
   */
  static async updateConversationStatus(conversationId, userId, userRole, newStatus) {
    if (!['open', 'resolved', 'reopened'].includes(newStatus)) {
      throw ApiError.badRequest('Invalid status. Allowed values: open, resolved, reopened.');
    }

    const { conversation, isOwner, isCustomer } = await this.verifyConversationAccess(
      conversationId,
      userId,
      userRole
    );

    // Customer can reopen a resolved conversation
    // Merchant can mark as resolved or reopen
    if (isCustomer && newStatus === 'resolved') {
      throw ApiError.forbidden('Only merchants can resolve conversations');
    }

    conversation.status = newStatus;
    await conversation.save();

    return conversation;
  }

  /**
   * Get unread message counts scoped to Customer or a Merchant's selected Business.
   */
  static async getUnreadCounts(userId, userRole, businessId = null) {
    if (businessId) {
      // Merchant mode: scoped strictly to the selected business
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw ApiError.notFound('Business not found');
      }

      if (business.ownerId !== userId && userRole !== ROLES.ADMIN) {
        throw ApiError.forbidden('You do not have access to this business');
      }

      // Count unread customer messages in conversations belonging to this business
      const conversations = await Conversation.findAll({
        where: { businessId },
        attributes: ['id']
      });

      const conversationIds = conversations.map((c) => c.id);
      if (conversationIds.length === 0) {
        return { unreadCount: 0, businessId };
      }

      const unreadCount = await Message.count({
        where: {
          conversationId: { [Op.in]: conversationIds },
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      });

      return { unreadCount, businessId };
    }

    // Customer mode: count unread messages in conversations where user is customer
    const conversations = await Conversation.findAll({
      where: { customerId: userId },
      attributes: ['id']
    });

    const conversationIds = conversations.map((c) => c.id);
    if (conversationIds.length === 0) {
      return { unreadCount: 0 };
    }

    const unreadCount = await Message.count({
      where: {
        conversationId: { [Op.in]: conversationIds },
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });

    return { unreadCount };
  }

  /**
   * Secure attachment retriever: verifies user is a participant of the conversation before serving.
   */
  static async getAttachmentFile(filename, userId, userRole) {
    const safeFilename = path.basename(filename);

    // Find the message that holds this attachment
    const messages = await Message.findAll({
      where: {
        attachments: { [Op.not]: null }
      },
      attributes: ['id', 'conversationId', 'attachments']
    });

    const matchingMessage = messages.find((m) => {
      const atts = m.attachments;
      if (!Array.isArray(atts)) return false;
      return atts.some((a) => a.filename === safeFilename);
    });

    if (!matchingMessage) {
      throw ApiError.notFound('Attachment not found');
    }

    // Authorize that the requester is a participant of this conversation
    await this.verifyConversationAccess(matchingMessage.conversationId, userId, userRole);

    const filePath = path.resolve(chatUploadDir, safeFilename);
    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('Attachment file not found on disk');
    }

    const matchingAttachment = matchingMessage.attachments.find(
      (a) => a.filename === safeFilename
    );

    return {
      filePath,
      filename: safeFilename,
      mimeType: matchingAttachment?.mimeType || 'image/jpeg',
      originalName: matchingAttachment?.originalName || safeFilename
    };
  }
}

export default ChatService;
