import api from '../api/client';

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Checkout] Failed to load external Razorpay checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Fetch public payment configuration
 */
export const getPaymentConfig = async () => {
  try {
    const res = await api.get('/payments/config');
    return res.data?.data || { mode: 'test', currency: 'INR', keyId: 'rzp_test_placeholder' };
  } catch {
    return { mode: 'test', currency: 'INR', keyId: 'rzp_test_placeholder' };
  }
};

/**
 * Create order on backend (used by both COD and online payments)
 */
export const createOrder = async ({ businessId, items, shippingAddress }) => {
  const orderRes = await api.post('/orders', {
    businessId,
    items,
    shippingAddress
  });

  const order = orderRes.data?.data?.order;
  if (!order || !order.id) {
    throw new Error('Failed to create order on server');
  }
  return order;
};

/**
 * Create order and initialize gateway payment session on backend
 */
export const initializeOrderCheckout = async ({ businessId, items, shippingAddress }) => {
  const order = await createOrder({ businessId, items, shippingAddress });

  // Create gateway order on backend for online payment
  try {
    const gatewayRes = await api.post('/payments/create-gateway-order', {
      orderId: order.id
    });

    const gatewayData = gatewayRes.data?.data;
    return { order, gatewayData };
  } catch (err) {
    if (err.response?.status === 502 || err.message?.includes('502')) {
      throw new Error('Payment gateway service is temporarily unavailable (502 Bad Gateway). Please verify your backend server is running and try again.');
    }
    const msg = err.response?.data?.message || err.message || 'Failed to initialize Razorpay checkout session';
    throw new Error(msg);
  }
};

/**
 * Verify payment with backend signature verification
 */
export const verifyRazorpayPayment = async ({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = 'upi'
}) => {
  try {
    const res = await api.post('/payments/verify', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod
    });

    return res.data?.data;
  } catch (err) {
    if (err.response?.status === 502 || err.message?.includes('502')) {
      throw new Error('Payment verification server is temporarily unreachable (502 Bad Gateway). Please check your connection and retry.');
    }
    const msg = err.response?.data?.message || err.message || 'Payment signature verification failed';
    throw new Error(msg);
  }
};

/**
 * Confirm order with Cash on Delivery
 */
export const confirmCashOnDelivery = async (orderId) => {
  const res = await api.post('/payments/cash-on-delivery', { orderId });
  return res.data?.data;
};

/**
 * Launch Razorpay Checkout Modal
 */
export const launchRazorpayCheckout = async ({
  gatewayData,
  onSuccess,
  onDismiss,
  onFailure
}) => {
  // Guard against unconfigured gateway
  if (!gatewayData?.keyId || gatewayData.keyId.includes('placeholder') || gatewayData.gatewayOrderId?.startsWith('order_test_')) {
    throw new Error('Razorpay test mode is not configured. Please try again later.');
  }

  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
  }

  const options = {
    key: gatewayData.keyId,
    amount: gatewayData.amount, // in paise
    currency: gatewayData.currency || 'INR',
    name: 'Bizora Digital Market',
    description: `Order #${gatewayData.orderNumber} - ${gatewayData.businessName}`,
    order_id: gatewayData.gatewayOrderId,
    prefill: {
      name: gatewayData.customer?.name || '',
      email: gatewayData.customer?.email || '',
      contact: gatewayData.customer?.phone || ''
    },
    theme: {
      color: '#3B1C5A'
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      }
    },
    handler: async (response) => {
      // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) {
        onSuccess(response);
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (errResp) => {
    if (onFailure) {
      onFailure(errResp.error);
    }
  });

  rzp.open();
};

export default {
  loadRazorpayScript,
  getPaymentConfig,
  initializeOrderCheckout,
  verifyRazorpayPayment,
  confirmCashOnDelivery,
  launchRazorpayCheckout
};

