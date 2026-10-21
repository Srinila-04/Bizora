import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Store,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Zap,
  Lock,
  X,
  Smartphone,
  Truck,
  Loader2,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/client';
import {
  getPaymentConfig,
  createOrder,
  initializeOrderCheckout,
  launchRazorpayCheckout,
  verifyRazorpayPayment,
  confirmCashOnDelivery
} from '../services/checkout.service';

export const CustomerCartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    itemsByBusiness,
    updateQuantity,
    removeFromCart,
    clearCart,
    toastMessage
  } = useCart();

  // Modal and checkout states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedStoreCheckout, setSelectedStoreCheckout] = useState(null);
  const [singleItemCheckout, setSingleItemCheckout] = useState(null);

  // Address and payment states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentOption, setPaymentOption] = useState('razorpay'); // 'razorpay' | 'cod'
  const [paymentConfig, setPaymentConfig] = useState({
    isConfigured: false,
    keyId: null,
    mode: 'test'
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrderRecord, setConfirmedOrderRecord] = useState(null);

  // Fetch addresses and payment configuration on mount
  useEffect(() => {
    api.get('/addresses')
      .then((res) => {
        const list = res.data?.data?.addresses || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});

    getPaymentConfig()
      .then((cfg) => {
        if (cfg) {
          setPaymentConfig(cfg);
          if (!cfg.isConfigured) {
            setPaymentOption('cod');
          }
        }
      })
      .catch(() => {});
  }, []);

  const formattedSubtotal = `₹${cartSubtotal.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const estimatedTax = cartSubtotal * 0.18; // 18% GST estimate
  const formattedTax = `₹${estimatedTax.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const totalAmount = cartSubtotal;
  const formattedTotal = `₹${totalAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  // Helper to extract shipping address payload
  const getShippingAddressPayload = () => {
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    return selectedAddr
      ? {
          recipientName: selectedAddr.recipientName,
          phone: selectedAddr.phone,
          addressLine1: selectedAddr.addressLine1,
          addressLine2: selectedAddr.addressLine2,
          city: selectedAddr.city,
          state: selectedAddr.state,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country
        }
      : {
          recipientName: 'Valued Customer',
          phone: '',
          addressLine1: 'Standard Delivery',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600001',
          country: 'India'
        };
  };

  // Close modals and reset checkout state
  const resetCheckoutModal = () => {
    setCheckoutModalOpen(false);
    setSelectedStoreCheckout(null);
    setCheckoutError('');
    setIsProcessingOrder(false);
    setConfirmedOrderRecord(null);
  };

  const resetSingleItemModal = () => {
    setSingleItemCheckout(null);
    setCheckoutError('');
    setIsProcessingOrder(false);
    setConfirmedOrderRecord(null);
  };

  // Trigger main cart checkout
  const handleOpenCartCheckout = () => {
    setCheckoutError('');
    setConfirmedOrderRecord(null);
    if (itemsByBusiness.length === 1) {
      setSelectedStoreCheckout(itemsByBusiness[0]);
    } else {
      setSelectedStoreCheckout(null);
    }
    setCheckoutModalOpen(true);
  };

  // Trigger specific store checkout
  const handleOpenStoreCheckout = (group) => {
    setCheckoutError('');
    setConfirmedOrderRecord(null);
    setSelectedStoreCheckout(group);
    setCheckoutModalOpen(true);
  };

  // Execute order creation and payment
  const handleExecuteCheckout = async ({ businessId, items, itemsToRemove }) => {
    setIsProcessingOrder(true);
    setCheckoutError('');

    if (paymentOption === 'razorpay' && !paymentConfig.isConfigured) {
      setIsProcessingOrder(false);
      setCheckoutError(
        'Razorpay test mode is not configured. Please select Cash on Delivery or configure Razorpay test keys in backend/.env.'
      );
      return;
    }

    try {
      const shippingAddress = getShippingAddressPayload();

      if (paymentOption === 'cod') {
        const order = await createOrder({
          businessId,
          items,
          shippingAddress
        });
        const codResult = await confirmCashOnDelivery(order.id);
        setConfirmedOrderRecord({ order: codResult.order, payment: codResult.payment });
        itemsToRemove.forEach((pId) => removeFromCart(pId));
        setIsProcessingOrder(false);
        return;
      }

      // Online Razorpay Checkout
      const { order, gatewayData } = await initializeOrderCheckout({
        businessId,
        items,
        shippingAddress
      });

      // Razorpay Online Gateway
      await launchRazorpayCheckout({
        gatewayData,
        onSuccess: async (response) => {
          try {
            const verifiedResult = await verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'upi'
            });
            setConfirmedOrderRecord({ order: verifiedResult.order, payment: verifiedResult.payment });
            itemsToRemove.forEach((pId) => removeFromCart(pId));
            setIsProcessingOrder(false);
          } catch (verErr) {
            setCheckoutError(verErr.response?.data?.message || 'Payment signature verification failed');
            setIsProcessingOrder(false);
          }
        },
        onDismiss: () => {
          setIsProcessingOrder(false);
          setCheckoutError('Payment window was closed or cancelled. You can retry anytime.');
        },
        onFailure: (err) => {
          setIsProcessingOrder(false);
          setCheckoutError(err.description || 'Payment failed at gateway');
        }
      });
    } catch (err) {
      setIsProcessingOrder(false);
      setCheckoutError(
        err.response?.data?.message || err.message || 'Failed to initialize order checkout'
      );
    }
  };

  if (cartItems.length === 0 && !confirmedOrderRecord) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="clay-card p-8 sm:p-14 bg-white/95 border border-[#C6B7E2]/40 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-[#F0EAFB] flex items-center justify-center mx-auto text-[#40205E] shadow-sm">
            <ShoppingCart className="w-10 h-10 text-[#40205E]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#40205E] font-serif">
              Your Cart is Empty
            </h1>
            <p className="text-sm text-[#79688A] leading-relaxed">
              Explore thousands of curated products from independent Indian businesses and artisans on Bizora.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/customer/shop"
              className="clay-btn-primary px-6 py-3 text-sm font-bold inline-flex items-center gap-2 shadow-md"
            >
              <Package className="w-4 h-4 text-[#F5BD42]" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#40205E] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#F5BD42]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#C6B7E2]/30">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/customer/shop"
              className="p-1.5 rounded-xl hover:bg-[#F0EAFB] text-[#40205E] transition-colors"
              title="Return to Shop"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#40205E] font-serif tracking-tight">
              Customer Cart
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0EAFB] text-[#40205E] border border-[#C6B7E2]/50">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-[#79688A] mt-1 ml-9">
            Items from independent sellers grouped for safe, verified checkout.
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vendor Grouped Items */}
        <div className="lg:col-span-8 space-y-6">
          {itemsByBusiness.map((group) => (
            <div
              key={group.businessId}
              className="clay-card bg-white/95 border border-[#C6B7E2]/50 overflow-hidden shadow-sm"
            >
              {/* Seller Header */}
              <div className="bg-gradient-to-r from-[#F0EAFB]/70 to-[#F5F0E7]/60 px-5 py-3.5 border-b border-[#C6B7E2]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#40205E] text-[#F5BD42] flex items-center justify-center shadow-xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[#79688A] uppercase font-bold tracking-wider block text-[10px]">
                      Merchant
                    </span>
                    <Link
                      to={`/customer/stores/${group.businessId}`}
                      className="text-sm font-extrabold text-[#40205E] hover:underline"
                    >
                      {group.businessName}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-[#79688A] block">Store Subtotal</span>
                    <span className="text-xs font-extrabold text-[#40205E]">
                      ₹{group.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenStoreCheckout(group)}
                    className="clay-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Checkout Store</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F5BD42]" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#C6B7E2]/20">
                {group.items.map((item) => {
                  const itemTotalPrice = item.price * item.quantity;
                  const formattedItemTotal = `₹${itemTotalPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`;

                  return (
                    <div
                      key={item.productId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
                    >
                      {/* Product Thumbnail & Title */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Link
                          to={`/customer/products/${item.productId}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F0EAFB] overflow-hidden shrink-0 border border-[#C6B7E2]/40 flex items-center justify-center"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-[#40205E]/40" />
                          )}
                        </Link>

                        <div className="space-y-1 min-w-0 flex-1">
                          {item.categoryName && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5BD42] bg-[#40205E] px-2 py-0.5 rounded-full inline-block">
                              {item.categoryName}
                            </span>
                          )}
                          <Link
                            to={`/customer/products/${item.productId}`}
                            className="block font-bold text-sm sm:text-base text-[#40205E] hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-[#40205E]">
                              ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <span className="text-[#79688A] line-through text-[11px]">
                                ₹{item.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                          {item.stockQuantity <= 5 && item.stockQuantity > 0 && (
                            <p className="text-[10px] font-semibold text-amber-600">
                              Only {item.stockQuantity} left in stock
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C6B7E2]/20">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[#FAF7F2] rounded-xl border border-[#C6B7E2]/50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1 rounded-lg text-[#40205E] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#40205E] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            aria-label="Increase quantity"
                            className="p-1 rounded-lg text-[#40205E] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-[4.5rem]">
                          <span className="text-sm font-extrabold text-[#40205E]">
                            {formattedItemTotal}
                          </span>
                        </div>

                        {/* Quick Buy This Item Only Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSingleItemCheckout(item);
                            setCheckoutError('');
                            setConfirmedOrderRecord(null);
                          }}
                          title="Purchase only this product"
                          className="px-2.5 py-1.5 rounded-lg bg-[#E6B44C]/20 hover:bg-[#E6B44C] text-[#40205E] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-[#E6B44C]/50"
                        >
                          <Zap className="w-3.5 h-3.5 fill-[#40205E]" />
                          <span className="hidden sm:inline">Buy This Item</span>
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          title="Remove item"
                          className="p-1.5 text-[#79688A] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Gateway Info */}
        <div className="lg:col-span-4 space-y-5">
          {/* Summary Card */}
          <div className="clay-card p-6 bg-white/95 border border-[#C6B7E2]/50 shadow-md space-y-5">
            <h2 className="text-base font-extrabold text-[#40205E] font-serif pb-3 border-b border-[#C6B7E2]/30">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-[#79688A]">
              <div className="flex justify-between items-center">
                <span>Items Subtotal ({cartCount})</span>
                <span className="font-semibold text-[#40205E]">{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Shipping</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Free Express Delivery
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated GST (Inclusive)</span>
                <span className="text-[#79688A]">{formattedTax}</span>
              </div>
              <div className="pt-3 border-t border-[#C6B7E2]/30 flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#40205E]">Estimated Total</span>
                <span className="text-xl font-extrabold text-[#40205E]">{formattedTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleOpenCartCheckout}
              className="clay-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#F5BD42]" />
            </button>

            <Link
              to="/customer/shop"
              className="block text-center text-xs font-bold text-[#40205E] hover:underline pt-1"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Secure Payment Info Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0EAFB] to-[#F5F0E7] border border-[#C6B7E2]/60 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#40205E] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#40205E] shrink-0" />
              <span>Secure Multi-Vendor Checkout</span>
            </div>
            <p className="text-[11px] text-[#79688A] leading-relaxed">
              Orders are fulfilled directly by verified independent merchants. Payments are processed securely via Razorpay in Test Mode. Cash on Delivery is also supported.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#40205E]/70 font-semibold pt-1 border-t border-[#C6B7E2]/30">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Razorpay Test Gateway &bull; Zero Live Charges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Store Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#40205E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="clay-card max-w-lg w-full bg-white p-6 sm:p-7 space-y-5 border border-[#C6B7E2] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#40205E] text-[#F5BD42] flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#40205E] font-serif">
                    {confirmedOrderRecord
                      ? 'Order Confirmation'
                      : selectedStoreCheckout
                      ? `Checkout: ${selectedStoreCheckout.businessName}`
                      : 'Select Store Order to Checkout'}
                  </h3>
                  <p className="text-[11px] text-[#79688A]">
                    {confirmedOrderRecord
                      ? 'Verified payment record'
                      : 'Marketplace orders are placed per merchant'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetCheckoutModal}
                disabled={isProcessingOrder}
                className="p-1.5 rounded-lg text-[#79688A] hover:text-[#40205E] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Order is Confirmed */}
            {confirmedOrderRecord ? (
              <div className="text-center space-y-4 py-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-[#40205E]">
                    Order Placed Successfully!
                  </h4>
                  <p className="text-xs text-[#79688A] max-w-sm mx-auto">
                    Your order has been recorded securely with the seller.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl text-left text-xs space-y-2 border border-[#C6B7E2]/40">
                  <div className="flex justify-between items-center pb-2 border-b border-[#C6B7E2]/20">
                    <span className="text-[#79688A]">Order Reference:</span>
                    <span className="font-mono font-bold text-[#40205E] text-xs">
                      {confirmedOrderRecord.order?.orderNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Method:</span>
                    <span className="font-bold text-[#40205E] text-xs">
                      {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : 'Razorpay Online (Test)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Status:</span>
                    {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        UNPAID / PENDING (Pending Delivery)
                      </span>
                    ) : (confirmedOrderRecord.order?.paymentStatus?.toLowerCase() === 'paid' ||
                         confirmedOrderRecord.payment?.status?.toLowerCase() === 'completed' ||
                         confirmedOrderRecord.payment?.status?.toLowerCase() === 'paid') ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200">
                        PAID (Verified)
                      </span>
                    ) : (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        PENDING
                      </span>
                    )}
                  </div>

                  {confirmedOrderRecord.payment?.paymentMethod !== 'cash_on_delivery' && confirmedOrderRecord.payment?.transactionReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#79688A]">Gateway Payment ID:</span>
                      <span className="font-mono text-[11px] text-[#40205E] truncate max-w-[200px]">
                        {confirmedOrderRecord.payment.transactionReference}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-[#C6B7E2]/20 font-bold text-[#40205E] text-sm">
                    <span className="text-xs font-semibold text-[#79688A]">
                      {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Amount Payable on Delivery:'
                        : 'Total Paid:'}
                    </span>
                    <span>₹{parseFloat(confirmedOrderRecord.order?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] text-left flex items-start gap-2 ${
                  confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                }`}>
                  <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
                    confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? 'text-amber-700' : 'text-emerald-700'
                  }`} />
                  <p>
                    <strong>{confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery Placed:' : 'Payment Verified:'}</strong>{' '}
                    {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                      ? 'Order confirmed and inventory reserved. Please pay the exact amount when the package arrives.'
                      : 'Cryptographic signature verified by server. Order and inventory deduction finalized.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/customer/orders"
                    className="clay-btn-primary w-full py-3 text-xs font-bold text-center block"
                  >
                    View My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={resetCheckoutModal}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#40205E] py-1 text-center"
                  >
                    Return to Cart
                  </button>
                </div>
              </div>
            ) : !selectedStoreCheckout ? (
              /* Multi-Store Selection View */
              <div className="space-y-4">
                <p className="text-xs text-[#79688A]">
                  Your cart contains items from {itemsByBusiness.length} different sellers. Please choose which seller order to checkout:
                </p>

                <div className="space-y-3">
                  {itemsByBusiness.map((group) => (
                    <div
                      key={group.businessId}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#40205E]" />
                          <span className="font-bold text-xs text-[#40205E]">{group.businessName}</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#40205E]">
                          ₹{group.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#79688A]">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}:{' '}
                        {group.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStoreCheckout(group)}
                        className="clay-btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>Checkout this Store (₹{group.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#F5BD42]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Single Store Checkout Form */
              <div className="space-y-4">
                {/* Back to store list if multiple stores */}
                {itemsByBusiness.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStoreCheckout(null)}
                    disabled={isProcessingOrder}
                    className="text-xs font-semibold text-[#40205E] hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Choose a different store</span>
                  </button>
                )}

                {/* Items in this order */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/40 space-y-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#79688A] block">
                    Order Items ({selectedStoreCheckout.items.length})
                  </span>
                  {selectedStoreCheckout.items.map((i) => (
                    <div key={i.productId} className="flex justify-between items-center text-xs">
                      <span className="text-[#40205E] truncate max-w-[240px]">
                        {i.quantity} &times; {i.name}
                      </span>
                      <span className="font-semibold text-[#40205E]">
                        ₹{(i.price * i.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Selector */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#40205E] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#40205E]" />
                      <span>Delivery Address:</span>
                    </span>
                    <Link
                      to="/customer/account"
                      className="text-[11px] font-semibold text-[#40205E]/70 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>

                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#C6B7E2]/60 bg-[#FAF7F2] text-xs text-[#40205E] font-medium focus:ring-1 focus:ring-[#40205E]"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.recipientName} &bull; {addr.addressLine1}, {addr.city} ({addr.postalCode}) {addr.isDefault ? '[Default]' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                      Standard delivery will be used. You can add specific addresses in your Account page.
                    </div>
                  )}
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-bold text-[#40205E] block">Select Payment Mode:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Razorpay Test Mode Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('razorpay')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'razorpay'
                          ? 'border-[#40205E] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#40205E]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#40205E] text-[#F5BD42] flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#40205E] text-xs">Razorpay Online</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            paymentConfig.isConfigured
                              ? 'bg-[#F5BD42]/30 text-[#40205E]'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {paymentConfig.isConfigured ? 'TEST' : 'UNCONFIGURED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#79688A] mt-0.5">
                          {paymentConfig.isConfigured ? 'UPI, Cards, NetBanking' : 'Test keys missing (use COD)'}
                        </p>
                      </div>
                    </button>

                    {/* Cash on Delivery Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('cod')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'cod'
                          ? 'border-[#40205E] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#40205E]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[#40205E] text-xs block">Cash on Delivery</span>
                        <p className="text-[10px] text-[#79688A] mt-0.5">Pay upon delivery</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="pt-2 border-t border-[#C6B7E2]/30 space-y-1.5 text-xs text-[#79688A]">
                  <div className="flex justify-between">
                    <span>Store Items Subtotal:</span>
                    <span className="font-semibold text-[#40205E]">
                      ₹{selectedStoreCheckout.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Delivery:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#40205E] pt-2 border-t border-[#C6B7E2]/20">
                    <span>Total Amount Payable:</span>
                    <span>
                      ₹{selectedStoreCheckout.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleExecuteCheckout({
                        businessId: selectedStoreCheckout.businessId,
                        items: selectedStoreCheckout.items.map((i) => ({
                          productId: i.productId,
                          variantId: i.variantId || undefined,
                          quantity: i.quantity
                        })),
                        itemsToRemove: selectedStoreCheckout.items.map((i) => i.cartItemId || i.variantId || i.productId)
                      })
                    }
                    disabled={isProcessingOrder}
                    className="clay-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isProcessingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#F5BD42]" />
                        <span>Processing Order...</span>
                      </>
                    ) : paymentOption === 'cod' ? (
                      <>
                        <Check className="w-4 h-4 text-[#F5BD42]" />
                        <span>Confirm Cash on Delivery (₹{selectedStoreCheckout.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#F5BD42]" />
                        <span>Pay with Razorpay (₹{selectedStoreCheckout.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetCheckoutModal}
                    disabled={isProcessingOrder}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#40205E] py-1 text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Item Direct Purchase Modal */}
      {singleItemCheckout && (
        <div className="fixed inset-0 z-50 bg-[#40205E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="clay-card max-w-lg w-full bg-white p-6 sm:p-7 space-y-5 border border-[#C6B7E2] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6B44C]/25 text-[#40205E] flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-[#40205E]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#40205E] font-serif">
                    {confirmedOrderRecord ? 'Order Confirmed' : 'Purchase Single Product'}
                  </h3>
                  <p className="text-[11px] text-[#79688A]">
                    {confirmedOrderRecord ? 'Payment verified' : 'Checking out only this product from cart'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetSingleItemModal}
                disabled={isProcessingOrder}
                className="p-1.5 rounded-lg text-[#79688A] hover:text-[#40205E] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!confirmedOrderRecord ? (
              <div className="space-y-4">
                {/* Item Details */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/40 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-[#C6B7E2]/30 flex items-center justify-center">
                    {singleItemCheckout.image ? (
                      <img src={singleItemCheckout.image} alt={singleItemCheckout.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-[#40205E]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#F5BD42] bg-[#40205E] px-2 py-0.5 rounded-full inline-block mb-1">
                      {singleItemCheckout.categoryName || 'Product'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#40205E] line-clamp-1">
                      {singleItemCheckout.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-extrabold text-[#40205E]">
                        ₹{(singleItemCheckout.price * singleItemCheckout.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[#79688A]">
                        ({singleItemCheckout.quantity} &times; ₹{singleItemCheckout.price})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F0EAFB]/50 border border-[#C6B7E2]/30 text-xs">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#40205E]" />
                    <span className="font-semibold text-[#40205E]">Seller:</span>
                  </div>
                  <span className="font-bold text-[#40205E]">{singleItemCheckout.businessName}</span>
                </div>

                {/* Address Selector */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#40205E] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#40205E]" />
                      <span>Delivery Address:</span>
                    </span>
                    <Link
                      to="/customer/account"
                      className="text-[11px] font-semibold text-[#40205E]/70 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>

                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#C6B7E2]/60 bg-[#FAF7F2] text-xs text-[#40205E] font-medium focus:ring-1 focus:ring-[#40205E]"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.recipientName} &bull; {addr.addressLine1}, {addr.city} ({addr.postalCode}) {addr.isDefault ? '[Default]' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                      Standard delivery will be used. You can add specific addresses in your Account page.
                    </div>
                  )}
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-bold text-[#40205E] block">Select Payment Mode:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Razorpay Test Mode Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('razorpay')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'razorpay'
                          ? 'border-[#40205E] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#40205E]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#40205E] text-[#F5BD42] flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#40205E] text-xs">Razorpay Online</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            paymentConfig.isConfigured
                              ? 'bg-[#F5BD42]/30 text-[#40205E]'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {paymentConfig.isConfigured ? 'TEST' : 'UNCONFIGURED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#79688A] mt-0.5">
                          {paymentConfig.isConfigured ? 'UPI, Cards, NetBanking' : 'Test keys missing (use COD)'}
                        </p>
                      </div>
                    </button>

                    {/* Cash on Delivery Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('cod')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'cod'
                          ? 'border-[#40205E] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#40205E]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[#40205E] text-xs block">Cash on Delivery</span>
                        <p className="text-[10px] text-[#79688A] mt-0.5">Pay upon delivery</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="pt-2 border-t border-[#C6B7E2]/30 space-y-1.5 text-xs text-[#79688A]">
                  <div className="flex justify-between">
                    <span>Product Subtotal ({singleItemCheckout.quantity} {singleItemCheckout.quantity === 1 ? 'unit' : 'units'}):</span>
                    <span className="font-semibold text-[#40205E]">
                      ₹{(singleItemCheckout.price * singleItemCheckout.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Delivery:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#40205E] pt-2 border-t border-[#C6B7E2]/20">
                    <span>Total Amount:</span>
                    <span>
                      ₹{(singleItemCheckout.price * singleItemCheckout.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleExecuteCheckout({
                        businessId: singleItemCheckout.businessId,
                        items: [
                          {
                            productId: singleItemCheckout.productId,
                            variantId: singleItemCheckout.variantId || undefined,
                            quantity: singleItemCheckout.quantity
                          }
                        ],
                        itemsToRemove: [singleItemCheckout.cartItemId || singleItemCheckout.variantId || singleItemCheckout.productId]
                      })
                    }
                    disabled={isProcessingOrder}
                    className="clay-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isProcessingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#F5BD42]" />
                        <span>Processing Checkout...</span>
                      </>
                    ) : paymentOption === 'cod' ? (
                      <>
                        <Check className="w-4 h-4 text-[#F5BD42]" />
                        <span>Confirm Cash on Delivery (₹{(singleItemCheckout.price * singleItemCheckout.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#F5BD42]" />
                        <span>Pay with Razorpay (₹{(singleItemCheckout.price * singleItemCheckout.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetSingleItemModal}
                    disabled={isProcessingOrder}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#40205E] py-1 text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Single Order Success Confirmation */
              <div className="text-center space-y-4 py-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-[#40205E]">
                    Order Placed Successfully!
                  </h4>
                  <p className="text-xs text-[#79688A] max-w-sm mx-auto">
                    Your single purchase for <strong>{singleItemCheckout.quantity} &times; {singleItemCheckout.name}</strong> from <em>{singleItemCheckout.businessName}</em> has been securely recorded.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl text-left text-xs space-y-2 border border-[#C6B7E2]/40">
                  <div className="flex justify-between items-center pb-2 border-b border-[#C6B7E2]/20">
                    <span className="text-[#79688A]">Order Reference:</span>
                    <span className="font-mono font-bold text-[#40205E] text-xs">
                      {confirmedOrderRecord.order?.orderNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Method:</span>
                    <span className="font-bold text-[#40205E] text-xs">
                      {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : 'Razorpay Online (Test)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Status:</span>
                    {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        UNPAID / PENDING (Pending Delivery)
                      </span>
                    ) : (confirmedOrderRecord.order?.paymentStatus?.toLowerCase() === 'paid' ||
                         confirmedOrderRecord.payment?.status?.toLowerCase() === 'completed' ||
                         confirmedOrderRecord.payment?.status?.toLowerCase() === 'paid') ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200">
                        PAID (Verified)
                      </span>
                    ) : (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        PENDING
                      </span>
                    )}
                  </div>

                  {confirmedOrderRecord.payment?.paymentMethod !== 'cash_on_delivery' && confirmedOrderRecord.payment?.transactionReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#79688A]">Gateway Payment ID:</span>
                      <span className="font-mono text-[11px] text-[#40205E] truncate max-w-[200px]">
                        {confirmedOrderRecord.payment.transactionReference}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-[#C6B7E2]/20 font-bold text-[#40205E] text-sm">
                    <span className="text-xs font-semibold text-[#79688A]">
                      {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Amount Payable on Delivery:'
                        : 'Total Paid:'}
                    </span>
                    <span>₹{parseFloat(confirmedOrderRecord.order?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] text-left flex items-start gap-2 ${
                  confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                }`}>
                  <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
                    confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? 'text-amber-700' : 'text-emerald-700'
                  }`} />
                  <p>
                    <strong>{confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery Placed:' : 'Payment Verified:'}</strong>{' '}
                    {confirmedOrderRecord.payment?.paymentMethod === 'cash_on_delivery'
                      ? 'Order confirmed and inventory reserved. Please pay the exact amount when the package arrives.'
                      : 'Cryptographic signature verified by server. Order and inventory deduction finalized.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/customer/orders"
                    className="clay-btn-primary w-full py-3 text-xs font-bold text-center block"
                  >
                    View My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={resetSingleItemModal}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#40205E] py-1 text-center"
                  >
                    Return to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCartPage;
