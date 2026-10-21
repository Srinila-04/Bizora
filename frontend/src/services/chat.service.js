import api from '../api/client';

/**
 * Fetch paginated conversations for the current customer or a merchant's business
 */
export const getConversations = async ({
  businessId = null,
  filter = 'all',
  search = '',
  page = 1,
  limit = 20
} = {}) => {
  const params = { page, limit };
  if (businessId) params.businessId = businessId;
  if (filter && filter !== 'all') params.filter = filter;
  if (search && search.trim()) params.search = search.trim();

  const res = await api.get('/chat/conversations', { params });
  return (
    res.data?.data || {
      conversations: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 1 }
    }
  );
};

/**
 * Fetch single conversation details with participants and linked context
 */
export const getConversation = async (conversationId) => {
  const res = await api.get(`/chat/conversations/${conversationId}`);
  return res.data?.data?.conversation;
};

/**
 * Start or retrieve an existing conversation with a merchant
 */
export const startConversation = async ({
  businessId,
  productId,
  orderId,
  message,
  attachment
}) => {
  let res;
  if (attachment) {
    const formData = new FormData();
    if (businessId) formData.append('businessId', businessId);
    if (productId) formData.append('productId', productId);
    if (orderId) formData.append('orderId', orderId);
    if (message) formData.append('message', message);
    formData.append('attachment', attachment);

    res = await api.post('/chat/conversations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } else {
    const payload = {};
    if (businessId) payload.businessId = businessId;
    if (productId) payload.productId = productId;
    if (orderId) payload.orderId = orderId;
    if (message) payload.message = message;

    res = await api.post('/chat/conversations', payload);
  }
  return res.data?.data?.conversation;
};

/**
 * Fetch paginated message history for a conversation
 */
export const getMessages = async (conversationId, { page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
  return (
    res.data?.data || {
      conversation: null,
      messages: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 1 }
    }
  );
};

/**
 * Send a message into a conversation with optional image attachment
 */
export const sendMessage = async (conversationId, { content, attachment }) => {
  let res;
  if (attachment) {
    const formData = new FormData();
    if (content) formData.append('content', content);
    formData.append('attachment', attachment);

    res = await api.post(`/chat/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } else {
    res = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content
    });
  }
  return res.data?.data?.message;
};

/**
 * Mark all unread incoming messages in a conversation as read
 */
export const markConversationAsRead = async (conversationId) => {
  const res = await api.patch(`/chat/conversations/${conversationId}/read`);
  return res.data;
};

/**
 * Update conversation status (open, resolved, reopened)
 */
export const updateConversationStatus = async (conversationId, status) => {
  const res = await api.patch(`/chat/conversations/${conversationId}/status`, { status });
  return res.data?.data?.conversation;
};

/**
 * Retrieve unread count for current customer or selected merchant business
 */
export const getUnreadCounts = async (businessId = null) => {
  const params = {};
  if (businessId) params.businessId = businessId;
  const res = await api.get('/chat/unread-counts', { params });
  return res.data?.data?.unreadCount || 0;
};

export default {
  getConversations,
  getConversation,
  startConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  updateConversationStatus,
  getUnreadCounts
};

