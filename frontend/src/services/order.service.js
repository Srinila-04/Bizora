import api from '../api/client';

/**
 * Fetch paginated orders for the authenticated customer
 */
export const getCustomerOrders = async ({ page = 1, limit = 10, status = '', search = '' } = {}) => {
  const params = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const res = await api.get('/orders', { params });
  return res.data?.data || { orders: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
};

/**
 * Fetch complete order details including items, seller info, payment, tracking and status histories
 */
export const getOrderDetails = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data?.data?.order;
};

/**
 * Request cancellation of an order (eligible only in pending/confirmed state)
 */
export const cancelOrder = async (orderId, cancelReason = '') => {
  const res = await api.post(`/orders/${orderId}/cancel`, { cancelReason });
  return res.data?.data?.order;
};

/**
 * Fetch orders belonging to a merchant's business
 */
export const getBusinessOrders = async (businessId, { page = 1, limit = 10, status = '', search = '', paymentStatus = '' } = {}) => {
  const params = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }
  if (paymentStatus && paymentStatus !== 'all') {
    params.paymentStatus = paymentStatus;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const res = await api.get(`/orders/business/${businessId}`, { params });
  return res.data?.data || { orders: [], stats: {}, pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
};

/**
 * Update an order's status (seller / admin)
 */
export const updateOrderStatus = async (orderId, { status, notes }) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status, notes });
  return res.data?.data?.order;
};

/**
 * Dispatch an order with courier and tracking details
 */
export const dispatchOrder = async (orderId, { courierName, trackingNumber, trackingUrl, estimatedDeliveryDate, notes }) => {
  const res = await api.patch(`/orders/${orderId}/dispatch`, {
    courierName,
    trackingNumber,
    trackingUrl,
    estimatedDeliveryDate,
    notes
  });
  return res.data?.data?.order;
};

/**
 * Update delivery status (out_for_delivery, delivered, delivery_failed, returned)
 */
export const updateDeliveryStatus = async (orderId, { status, notes }) => {
  const res = await api.patch(`/orders/${orderId}/delivery-status`, { status, notes });
  return res.data?.data?.order;
};

/**
 * Confirm Cash on Delivery collection (or record failed collection)
 */
export const recordCodCollection = async (orderId, { collectionStatus, notes }) => {
  const res = await api.post(`/orders/${orderId}/cod-collection`, { collectionStatus, notes });
  return res.data?.data;
};

/**
 * Fetch Cash on Delivery reconciliation summary and paginated ledger for a merchant's business
 */
export const getCodReconciliation = async (businessId, { page = 1, limit = 10, search = '' } = {}) => {
  const params = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const res = await api.get(`/orders/business/${businessId}/cod-reconciliation`, { params });
  return res.data?.data;
};

export default {
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  getBusinessOrders,
  updateOrderStatus,
  dispatchOrder,
  updateDeliveryStatus,
  recordCodCollection,
  getCodReconciliation
};
