import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  X,
  Calendar,
  CreditCard,
  MapPin,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Send,
  Eye,
  DollarSign
} from 'lucide-react';
import {
  getBusinessOrders,
  updateOrderStatus,
  dispatchOrder,
  updateDeliveryStatus,
  recordCodCollection,
  getOrderDetails
} from '../services/order.service';
import { Pagination } from './Pagination';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled / Returned' }
];

export const MerchantOrdersSection = ({ businessId, businessName }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modals & Action States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Dispatch Modal
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
  const [dispatchFormData, setDispatchFormData] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDeliveryDate: '',
    notes: ''
  });
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  // COD Collection Modal
  const [codModalOrder, setCodModalOrder] = useState(null);
  const [codNotesInput, setCodNotesInput] = useState('');
  const [isSubmittingCod, setIsSubmittingCod] = useState(false);
  const [codError, setCodError] = useState('');

  // Status Action Loading tracker: { [orderId]: boolean }
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Copy helper
  const [copiedId, setCopiedId] = useState(null);
  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Fetch orders
  const loadOrders = useCallback(async (page = 1, limit = pagination.limit || 10) => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessOrders(businessId, {
        page,
        limit,
        status: activeStatus,
        search: searchQuery
      });
      setOrders(data.orders || []);
      setStats(data.stats || {});
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('[MerchantOrders] Failed to load orders:', err);
      setError(err.response?.data?.message || 'Failed to retrieve orders for this business.');
    } finally {
      setLoading(false);
    }
  }, [businessId, activeStatus, searchQuery, pagination.limit]);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  // Quick Status Transitions
  const handleTransitionStatus = async (orderId, newStatus, defaultNote = '') => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, {
        status: newStatus,
        notes: defaultNote || `Status updated to ${newStatus} by merchant`
      });
      await loadOrders(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${newStatus}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject / Cancel Order Prompt
  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for rejecting/cancelling this order (inventory will be restored):');
    if (!reason || !reason.trim()) return;

    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, {
        status: 'cancelled',
        notes: `Rejected by merchant: ${reason.trim()}`
      });
      await loadOrders(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Dispatch Modal
  const openDispatchModal = (order) => {
    setDispatchModalOrder(order);
    setDispatchFormData({
      courierName: order.courierName || '',
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0]
        : '',
      notes: ''
    });
    setDispatchError('');
  };

  // Submit Dispatch
  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    if (!dispatchFormData.courierName.trim() || !dispatchFormData.trackingNumber.trim()) {
      setDispatchError('Courier name and tracking number are required.');
      return;
    }

    setIsSubmittingDispatch(true);
    setDispatchError('');
    try {
      await dispatchOrder(dispatchModalOrder.id, {
        courierName: dispatchFormData.courierName.trim(),
        trackingNumber: dispatchFormData.trackingNumber.trim(),
        trackingUrl: dispatchFormData.trackingUrl.trim() || undefined,
        estimatedDeliveryDate: dispatchFormData.estimatedDeliveryDate || undefined,
        notes: dispatchFormData.notes.trim() || undefined
      });
      setDispatchModalOrder(null);
      await loadOrders(pagination.page);
    } catch (err) {
      setDispatchError(err.response?.data?.message || 'Failed to record dispatch details.');
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Open COD Confirmation Modal
  const openCodModal = (order) => {
    setCodModalOrder(order);
    setCodNotesInput('Cash received in full at delivery location.');
    setCodError('');
  };

  // Submit COD Collection Confirmation
  const handleCodSubmit = async (collectionStatus) => {
    if (!codModalOrder) return;
    setIsSubmittingCod(true);
    setCodError('');
    try {
      await recordCodCollection(codModalOrder.id, {
        collectionStatus,
        notes: codNotesInput.trim()
      });
      setCodModalOrder(null);
      await loadOrders(pagination.page);
    } catch (err) {
      setCodError(err.response?.data?.message || 'Failed to record COD collection.');
    } finally {
      setIsSubmittingCod(false);
    }
  };

  // Open Full Order Details View
  const handleViewOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const full = await getOrderDetails(orderId);
      setSelectedOrderDetails(full);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Helper formatting for status badges
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shipped / Dispatched</span>
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>Packed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50/80 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'delivery_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Delivery Failed</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Returned</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const renderPaymentBadge = (order) => {
    const isCod = order.payment?.paymentMethod === 'cash_on_delivery';
    const isPaid =
      order.paymentStatus?.toLowerCase() === 'paid' ||
      order.payment?.status?.toLowerCase() === 'completed';

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{isCod ? 'PAID (COD Collected)' : 'PAID (Online Verified)'}</span>
        </span>
      );
    }

    if (isCod) {
      if (order.payment?.codStatus === 'failed') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>COD Failed</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>UNPAID / COD (Due on Delivery)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>UNPAID</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Fulfilment KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="clay-card p-4 bg-white/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 block mb-1">
            Total Orders
          </span>
          <span className="text-xl font-extrabold text-[#3B1C5A]">{stats.totalOrders || 0}</span>
        </div>

        <div className="clay-card p-4 bg-white/80 border-amber-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
            Action Needed
          </span>
          <span className="text-xl font-extrabold text-amber-700">{stats.actionRequired || 0}</span>
        </div>

        <div className="clay-card p-4 bg-white/80 border-sky-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
            In Processing
          </span>
          <span className="text-xl font-extrabold text-sky-700">{stats.processing || 0}</span>
        </div>

        <div className="clay-card p-4 bg-white/80 border-indigo-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
            In Transit
          </span>
          <span className="text-xl font-extrabold text-indigo-700">{stats.inTransit || 0}</span>
        </div>

        <div className="clay-card p-4 bg-white/80 border-emerald-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Delivered
          </span>
          <span className="text-xl font-extrabold text-emerald-700">{stats.delivered || 0}</span>
        </div>

        <div className="clay-card p-4 bg-white/80 border-amber-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
            Pending COD
          </span>
          <span className="text-xl font-extrabold text-amber-800">{stats.pendingCodCount || 0}</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="clay-card p-4 sm:p-5 bg-white/90 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#79688A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Order # (e.g. ORD-...) or customer name..."
              className="clay-input w-full pl-9 pr-8 py-2 text-xs text-[#3B1C5A] bg-[#FAF7F2] border border-[#C6B7E2]/50 rounded-xl focus:bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#79688A] hover:text-[#3B1C5A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="clay-btn-primary px-4 py-2 text-xs font-bold shrink-0">
            Search
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === tab.id
                  ? 'bg-[#3B1C5A] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#79688A] hover:bg-[#F0EAFB] hover:text-[#3B1C5A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div className="clay-card p-12 text-center space-y-3 bg-white/70">
          <RefreshCw className="w-8 h-8 text-[#3B1C5A] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#79688A]">Loading merchant orders...</p>
        </div>
      ) : error ? (
        <div className="clay-card p-8 text-center space-y-3 bg-white/70 border-rose-200">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs font-bold text-rose-800">{error}</p>
          <button
            onClick={() => loadOrders(1)}
            className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-3 bg-white/70">
          <Package className="w-10 h-10 text-[#C6B7E2] mx-auto" />
          <h4 className="text-base font-extrabold text-[#3B1C5A]">No Orders Found</h4>
          <p className="text-xs text-[#79688A] max-w-sm mx-auto">
            {activeStatus !== 'all' || searchQuery
              ? 'No orders match your filter criteria. Try selecting "All Orders" or clearing your search query.'
              : 'Your store has not received any customer orders yet. Promote your storefront to start receiving orders!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCod = order.payment?.paymentMethod === 'cash_on_delivery';
            const isUnpaid = order.paymentStatus !== 'paid' && order.payment?.status !== 'completed';
            const isActionLoading = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="clay-card p-5 sm:p-6 bg-white/90 space-y-4 border border-[#C6B7E2]/40 hover:shadow-lg transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C6B7E2]/30">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-extrabold text-[#3B1C5A]">
                        {order.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderNumber)}
                        className="p-1 rounded text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#F0EAFB]"
                        title="Copy order number"
                      >
                        {copiedId === order.orderNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {renderStatusBadge(order.status)}
                      {renderPaymentBadge(order)}
                    </div>
                    <p className="text-[11px] text-[#79688A]">
                      Ordered on{' '}
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewOrderDetails(order.id)}
                      className="clay-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details & Timeline</span>
                    </button>
                  </div>
                </div>

                {/* Items and Customer Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Purchased Items List */}
                  <div className="lg:col-span-2 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#79688A] block">
                      Ordered Products ({order.items?.length || 0})
                    </span>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 flex items-center gap-3 text-xs"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-[#C6B7E2]/30 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-[#3B1C5A]/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h6 className="font-bold text-[#3B1C5A] truncate">{item.productName}</h6>
                            <p className="text-[11px] text-[#79688A]">
                              ₹{Number(item.unitPrice).toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="font-extrabold text-[#3B1C5A]">
                            ₹{Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Shipping Summary */}
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A] mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E6B44C]" />
                        <span>Delivery Address</span>
                      </div>
                      {order.shippingAddress ? (
                        <div className="text-[11px] text-[#79688A] space-y-0.5 leading-relaxed">
                          <p className="font-bold text-[#3B1C5A]">
                            {order.shippingAddress.recipientName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer'}
                          </p>
                          {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                          <p>{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#79688A]">Standard store delivery</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#C6B7E2]/20 flex justify-between items-center text-xs">
                      <span className="text-[#79688A] font-semibold">Total Value:</span>
                      <span className="text-sm font-extrabold text-[#3B1C5A]">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch / Courier Info Bar if present */}
                {(order.courierName || order.trackingNumber) && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-700" />
                      <div>
                        <span className="font-bold text-indigo-950">
                          {order.courierName || 'Courier Partner'}:
                        </span>{' '}
                        <span className="font-mono text-indigo-900 font-bold">{order.trackingNumber}</span>
                        {order.dispatchedAt && (
                          <span className="text-[11px] text-indigo-700 ml-2">
                            (Dispatched {new Date(order.dispatchedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
                          </span>
                        )}
                      </div>
                    </div>

                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Courier Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Fulfilment Action Control Strip */}
                <div className="pt-2 border-t border-[#C6B7E2]/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* State-specific transition buttons */}
                    {order.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'confirmed', 'Order accepted and confirmed by seller')}
                          className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          Accept Order
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleRejectOrder(order.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                        >
                          Reject / Cancel
                        </button>
                      </>
                    )}

                    {order.status === 'confirmed' && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'processing', 'Merchant started processing order')}
                          className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          Start Processing
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleRejectOrder(order.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}

                    {order.status === 'processing' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleTransitionStatus(order.id, 'packed', 'All items packed and ready for dispatch')}
                        className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Mark as Packed</span>
                      </button>
                    )}

                    {order.status === 'packed' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => openDispatchModal(order)}
                        className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Order...</span>
                      </button>
                    )}

                    {order.status === 'shipped' && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'out_for_delivery', 'Package out with delivery rider')}
                          className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Mark Out for Delivery</span>
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'delivered', 'Parcel delivered successfully to customer')}
                          className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      </>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'delivered', 'Package delivered safely to customer doorstep')}
                          className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Delivered</span>
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'delivery_failed', 'Delivery attempt failed (recipient not available)')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Delivery Failed
                        </button>
                      </>
                    )}

                    {order.status === 'delivery_failed' && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'out_for_delivery', 'Re-attempting delivery to customer')}
                          className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-attempt Delivery</span>
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleTransitionStatus(order.id, 'returned', 'Package returned to seller origin hub')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 hover:bg-orange-100 cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      </>
                    )}
                  </div>

                  {/* Cash on Delivery Collection Confirmation Button */}
                  {isCod && isUnpaid && (order.status === 'delivered' || order.status === 'shipped' || order.status === 'out_for_delivery') && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => openCodModal(order)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-[#3B1C5A] shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Confirm COD Collected (₹{Number(order.totalAmount).toFixed(2)})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Standardized Pagination */}
          {pagination.total > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(newPage) => loadOrders(newPage, pagination.limit)}
                onPageSizeChange={(newSize) => {
                  setPagination((prev) => ({ ...prev, limit: newSize }));
                  loadOrders(1, newSize);
                }}
                pageSizeOptions={[10, 25, 50]}
                showPageSizeSelector={true}
                itemName="orders"
                ariaLabel="Merchant Orders Pagination"
              />
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          DISPATCH PARCEL MODAL
          ======================================================================= */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="clay-card max-w-lg w-full bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#3B1C5A]" />
                <h3 className="font-extrabold text-base text-[#3B1C5A]">Dispatch Order #{dispatchModalOrder.orderNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="p-1 rounded-lg text-[#79688A] hover:text-[#3B1C5A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            <form onSubmit={handleDispatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70 mb-1">
                  Courier Partner Name *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchFormData.courierName}
                  onChange={(e) => setDispatchFormData({ ...dispatchFormData, courierName: e.target.value })}
                  placeholder="e.g. Blue Dart Express, Delhivery, DTDC, India Post"
                  className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70 mb-1">
                  Waybill / Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchFormData.trackingNumber}
                  onChange={(e) => setDispatchFormData({ ...dispatchFormData, trackingNumber: e.target.value })}
                  placeholder="e.g. BD129384752IN"
                  className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70 mb-1">
                  Online Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  value={dispatchFormData.trackingUrl}
                  onChange={(e) => setDispatchFormData({ ...dispatchFormData, trackingUrl: e.target.value })}
                  placeholder="https://track.courier.com/BD129384752IN"
                  className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70 mb-1">
                  Estimated Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={dispatchFormData.estimatedDeliveryDate}
                  onChange={(e) => setDispatchFormData({ ...dispatchFormData, estimatedDeliveryDate: e.target.value })}
                  className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70 mb-1">
                  Dispatch Notes
                </label>
                <textarea
                  rows="2"
                  value={dispatchFormData.notes}
                  onChange={(e) => setDispatchFormData({ ...dispatchFormData, notes: e.target.value })}
                  placeholder="Handed over to courier representative at hub..."
                  className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispatch}
                  className="clay-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingDispatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Dispatch & Notify Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          CONFIRM COD COLLECTION MODAL
          ======================================================================= */}
      {codModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="clay-card max-w-md w-full bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-2 text-amber-900">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-[#3B1C5A]">Confirm Cash on Delivery</h3>
              </div>
              <button
                type="button"
                onClick={() => setCodModalOrder(null)}
                className="p-1 rounded-lg text-[#79688A] hover:text-[#3B1C5A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {codError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{codError}</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#79688A]">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-[#3B1C5A]">{codModalOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-[#79688A]">
                <span>Customer:</span>
                <span className="font-bold text-[#3B1C5A]">
                  {codModalOrder.shippingAddress?.recipientName || codModalOrder.customer?.firstName || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 text-sm font-extrabold text-[#3B1C5A]">
                <span>Exact COD Amount Due:</span>
                <span className="text-base text-amber-900">
                  ₹{Number(codModalOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70">
                Collection Confirmation Notes:
              </label>
              <textarea
                rows="2"
                value={codNotesInput}
                onChange={(e) => setCodNotesInput(e.target.value)}
                placeholder="Exact cash collected by delivery agent and handed over to merchant hub..."
                className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                disabled={isSubmittingCod}
                onClick={() => handleCodSubmit('failed')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer w-full sm:w-auto text-center"
              >
                Record Failed Collection
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCodModalOrder(null)}
                  className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCod}
                  onClick={() => handleCodSubmit('collected')}
                  className="clay-btn-primary px-4 py-2 text-xs font-bold flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                >
                  {isSubmittingCod ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as PAID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          FULL ORDER DETAILS & TIMELINE MODAL (MERCHANT VIEW)
          ======================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="clay-card max-w-2xl w-full bg-white p-5 sm:p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/30">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#3B1C5A]">
                    {selectedOrderDetails.orderNumber}
                  </span>
                  {renderStatusBadge(selectedOrderDetails.status)}
                  {renderPaymentBadge(selectedOrderDetails)}
                </div>
                <p className="text-xs text-[#79688A]">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-lg text-[#79688A] hover:text-[#3B1C5A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Address Card */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/40 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                <MapPin className="w-4 h-4 text-[#E6B44C]" />
                <span>Customer Delivery Information</span>
              </div>
              <div className="text-[11px] text-[#79688A] space-y-0.5 leading-relaxed">
                <p className="font-bold text-[#3B1C5A]">
                  {selectedOrderDetails.shippingAddress?.recipientName || `${selectedOrderDetails.customer?.firstName || ''} ${selectedOrderDetails.customer?.lastName || ''}`.trim() || 'Customer'}
                </p>
                <p>Phone: {selectedOrderDetails.shippingAddress?.phone || selectedOrderDetails.customer?.phone || 'N/A'}</p>
                <p>Email: {selectedOrderDetails.customer?.email || 'N/A'}</p>
                {selectedOrderDetails.shippingAddress && (
                  <>
                    <p>{selectedOrderDetails.shippingAddress.addressLine1}</p>
                    {selectedOrderDetails.shippingAddress.addressLine2 && <p>{selectedOrderDetails.shippingAddress.addressLine2}</p>}
                    <p>
                      {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} - {selectedOrderDetails.shippingAddress.postalCode}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Shipment Tracking details if available */}
            {(selectedOrderDetails.courierName || selectedOrderDetails.trackingNumber) && (
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <Truck className="w-4 h-4 text-indigo-700" />
                  <span>Courier & Shipment Progress</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-900/60 block">Partner:</span>
                    <span className="font-bold text-[#3B1C5A]">{selectedOrderDetails.courierName || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-indigo-900/60 block">Waybill / Tracking:</span>
                    <span className="font-mono font-bold text-[#3B1C5A]">{selectedOrderDetails.trackingNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-[#79688A] uppercase tracking-wider">
                Products in this Order ({selectedOrderDetails.items?.length || 0})
              </h5>
              <div className="space-y-2">
                {selectedOrderDetails.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h6 className="font-bold text-[#3B1C5A]">{item.productName}</h6>
                      <p className="text-[11px] text-[#79688A]">
                        ₹{Number(item.unitPrice).toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#3B1C5A]">₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedOrderDetails.statusHistories && selectedOrderDetails.statusHistories.length > 0 && (
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-[#79688A] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chronological Activity & Status History</span>
                </h5>
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 space-y-3">
                  {selectedOrderDetails.statusHistories.map((entry, idx) => (
                    <div key={entry.id || idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3B1C5A] mt-1 shrink-0 ring-4 ring-[#F0EAFB]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#3B1C5A] uppercase text-[11px]">{entry.status}</span>
                          <span className="text-[10px] text-[#79688A]">
                            {new Date(entry.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {entry.notes && <p className="text-[11px] text-[#79688A] mt-0.5">{entry.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantOrdersSection;

