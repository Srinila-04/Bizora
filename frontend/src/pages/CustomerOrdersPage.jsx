import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Package,
  Search,
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  X,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  MapPin,
  FileText,
  AlertTriangle,
  RotateCcw,
  Tag,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import {
  getCustomerOrders,
  getOrderDetails,
  cancelOrder
} from '../services/order.service';
import { Pagination } from '../components/Pagination';
import { ContactMerchantModal } from '../components/ContactMerchantModal';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' }
];

export const CustomerOrdersPage = () => {
  const { id: orderIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const activeStatus = searchParams.get('status') || 'all';
  const selectedOrderIdFromUrl = orderIdParam || searchParams.get('orderId');

  // Orders listing state
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Order Details Modal / View state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Contact merchant about order state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactOrder, setContactOrder] = useState(null);

  // Cancel order modal state
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Copy order reference helper
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const handleCopyOrderNumber = (orderNumber) => {
    navigator.clipboard?.writeText(orderNumber);
    setCopiedOrderId(orderNumber);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  // Fetch paginated orders list
  const loadOrders = useCallback(async (page = 1, limit = pagination.limit || 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerOrders({
        page,
        limit,
        status: activeStatus,
        search: activeSearch
      });
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, page, limit, totalPages: 1 });
    } catch (err) {
      console.error('[Orders] Failed to load orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to retrieve your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, activeSearch, pagination.limit]);

  // Load orders on filter/search change
  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  // Handle direct order details from URL
  useEffect(() => {
    if (selectedOrderIdFromUrl) {
      openOrderDetails(selectedOrderIdFromUrl);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderIdFromUrl]);

  // Fetch full details for modal
  const openOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const fullOrder = await getOrderDetails(orderId);
      setSelectedOrder(fullOrder);
    } catch (err) {
      console.error('[Orders] Failed to load details:', err);
      setDetailsError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    if (orderIdParam) {
      navigate('/customer/orders');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('orderId');
      setSearchParams(newParams);
    }
  };

  // Status Tab selection
  const handleSelectStatus = (statusId) => {
    const newParams = new URLSearchParams(searchParams);
    if (statusId === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', statusId);
    }
    newParams.delete('orderId');
    setSearchParams(newParams);
  };

  // Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  // Handle Order Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);
    setCancelError('');

    try {
      await cancelOrder(cancellingOrder.id, cancelReasonInput);
      setCancellingOrder(null);
      setCancelReasonInput('');
      // Reload current orders list
      loadOrders(pagination.page);
      if (selectedOrder && selectedOrder.id === cancellingOrder.id) {
        openOrderDetails(cancellingOrder.id);
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel this order. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Helper formatting for order status badge
  const renderOrderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">Delivered</span>
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
            <span className="capitalize">Shipped</span>
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span className="capitalize">Packed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span className="capitalize">Processing</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50/80 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">Confirmed</span>
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
            <span className="capitalize">Cancelled</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="capitalize">Refunded</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="capitalize">Pending</span>
          </span>
        );
    }
  };

  // Helper formatting for payment badge
  const renderPaymentBadge = (order) => {
    const method = order.payment?.paymentMethod;
    const isCod = method === 'cash_on_delivery';
    const isPaid =
      order.paymentStatus?.toLowerCase() === 'paid' ||
      order.payment?.status?.toLowerCase() === 'completed' ||
      order.payment?.status?.toLowerCase() === 'paid';

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{isCod ? 'PAID (COD Collected)' : 'PAID (Verified)'}</span>
        </span>
      );
    }

    if (isCod) {
      if (order.payment?.codStatus === 'failed') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>COD Collection Failed</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>UNPAID / COD (Due on Delivery)</span>
        </span>
      );
    }

    if (order.paymentStatus?.toLowerCase() === 'failed' || order.payment?.status?.toLowerCase() === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>PAYMENT FAILED</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>PENDING</span>
      </span>
    );
  };

  // Client-side quick filter on already loaded rows for product names
  const filteredOrders = useMemo(() => {
    if (!activeSearch) return orders;
    const term = activeSearch.toLowerCase();
    return orders.filter((o) => {
      if (o.orderNumber?.toLowerCase().includes(term)) return true;
      if (o.business?.name?.toLowerCase().includes(term)) return true;
      if (o.items?.some((i) => i.productName?.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [orders, activeSearch]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 selection:bg-[#E6B44C] selection:text-[#3B1C5A]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#C6B7E2]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#79688A]">
            <Link to="/customer/home" className="hover:text-[#3B1C5A] hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/customer/account" className="hover:text-[#3B1C5A] hover:underline">
              Account
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#3B1C5A] font-bold">My Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#40205E] text-[#F5BD42] flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] font-serif">
                My Orders
              </h1>
              <p className="text-xs text-[#79688A]">
                View your purchases and track your orders.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <Link
          to="/customer/shop"
          className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <ShoppingBag className="w-4 h-4 text-[#3B1C5A]" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Search & Status Filters Bar */}
      <div className="clay-card p-4 sm:p-5 bg-white/95 border border-[#C6B7E2]/50 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#79688A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order number or product name..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#C6B7E2]/60 bg-[#FAF7F2] text-xs text-[#3B1C5A] placeholder:text-[#79688A]/70 focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/30 focus:border-[#3B1C5A] transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#79688A] hover:text-[#3B1C5A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Result Count */}
          {/* <div className="text-xs font-medium text-[#79688A] flex items-center gap-1.5 self-end md:self-auto">
            <span>Showing:</span>
            <strong className="text-[#3B1C5A] font-bold">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </strong>
            {pagination.total > 0 && (
              <span className="text-[11px] text-[#79688A]/80">
                (Total: {pagination.total})
              </span>
            )}
          </div> */}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#C6B7E2]/20 no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#3B1C5A] text-[#F5BD42] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#79688A] hover:bg-[#F0EAFB] hover:text-[#3B1C5A] border border-[#C6B7E2]/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton List */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="clay-card p-6 bg-white/80 border border-[#C6B7E2]/40 rounded-3xl animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 bg-[#FAF7F2] rounded-lg" />
                <div className="h-6 w-24 bg-[#FAF7F2] rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#FAF7F2]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-[#FAF7F2] rounded" />
                  <div className="h-3 w-1/3 bg-[#FAF7F2] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="clay-card p-10 bg-white border border-rose-200 text-center space-y-4 shadow-md rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#3B1C5A]">Unable to Load Orders</h3>
            <p className="text-xs text-[#79688A] max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadOrders(pagination.page)}
            className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-10 sm:p-14 bg-white/95 border border-[#C6B7E2]/40 text-center space-y-5 shadow-sm rounded-3xl">
          <div className="w-18 h-18 rounded-3xl bg-[#F0EAFB] text-[#40205E] flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-9 h-9" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-[#3B1C5A] font-serif">
              {activeSearch
                ? 'No matching orders found'
                : activeStatus !== 'all'
                ? `No ${activeStatus} orders`
                : 'You have no orders yet'}
            </h3>
            <p className="text-xs text-[#79688A] leading-relaxed">
              {activeSearch
                ? `We couldn't find any orders matching "${activeSearch}". Try checking the spelling or resetting filters.`
                : 'Explore artisan handcrafted products and organic goods across Bizora Indian marketplace.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {activeSearch || activeStatus !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  handleClearSearch();
                  handleSelectStatus('all');
                }}
                className="clay-btn-secondary px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : null}
            <Link
              to="/customer/shop"
              className="clay-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#F5BD42]" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-4 sm:space-y-5">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const primaryItem = order.items?.[0];
            const additionalItemsCount = (order.items?.length || 0) - 1;

            return (
              <div
                key={order.id}
                className="clay-card p-5 sm:p-6 bg-white border border-[#C6B7E2]/50 hover:border-[#3B1C5A]/40 transition-all shadow-sm rounded-3xl space-y-4"
              >
                {/* Order Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C6B7E2]/30">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Order Reference Number */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#79688A]">Order:</span>
                      <span className="font-mono text-xs font-extrabold text-[#3B1C5A] bg-[#FAF7F2] px-2 py-0.5 rounded-lg border border-[#C6B7E2]/40">
                        {order.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderNumber(order.orderNumber)}
                        title="Copy Order Reference"
                        className="p-1 rounded text-[#79688A] hover:text-[#3B1C5A] transition-colors cursor-pointer"
                      >
                        {copiedOrderId === order.orderNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Order Date */}
                    <span className="text-[11px] text-[#79688A] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#79688A]/70" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                  </div>

                  {/* Badges: Status and Payment */}
                  <div className="flex flex-wrap items-center gap-2">
                    {renderPaymentBadge(order)}
                    {renderOrderStatusBadge(order.status)}
                  </div>
                </div>

                {/* Seller & Items Overview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left Column: Product Thumbnail and Summary (8 cols) */}
                  <div className="md:col-span-8 flex items-center gap-3.5">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {primaryItem?.image ? (
                        <img
                          src={primaryItem.image}
                          alt={primaryItem.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/shop-header-character.png';
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-[#3B1C5A]/30" />
                      )}
                      {additionalItemsCount > 0 && (
                        <div className="absolute bottom-1 right-1 bg-[#3B1C5A]/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                          +{additionalItemsCount}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Seller info */}
                      {order.business?.name && (
                        <div className="flex items-center gap-1.5 text-xs text-[#79688A]">
                          <Store className="w-3.5 h-3.5 text-[#E6B44C]" />
                          <span className="font-semibold text-[#3B1C5A] truncate">
                            {order.business.name}
                          </span>
                        </div>
                      )}

                      {/* Primary Product Name */}
                      <h4 className="text-xs sm:text-sm font-bold text-[#3B1C5A] line-clamp-1">
                        {primaryItem?.productName || 'Order Items'}
                      </h4>

                      {/* Quantities */}
                      <p className="text-[11px] text-[#79688A]">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in this order
                        {additionalItemsCount > 0 && ` (${primaryItem?.quantity || 1} × ${primaryItem?.productName} + ${additionalItemsCount} more)`}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Action Buttons (4 cols) */}
                  <div className="md:col-span-4 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#C6B7E2]/20">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-[#79688A] block uppercase tracking-wider font-semibold">
                        Total Amount
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-[#3B1C5A]">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Allow Cancel if pending/confirmed */}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelError('');
                            setCancelReasonInput('');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setContactOrder(order);
                          setContactModalOpen(true);
                        }}
                        className="clay-pill px-3 py-1.5 rounded-xl border border-[#C6B7E2]/50 text-[#3B1C5A] hover:bg-[#FAF7F2] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Contact merchant regarding this order"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                        <span>Message Seller</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openOrderDetails(order.id)}
                        className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#F5BD42]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Strip: Payment Method & Address snapshot */}
                <div className="pt-2.5 border-t border-[#C6B7E2]/20 flex flex-wrap items-center justify-between text-[11px] text-[#79688A] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#3B1C5A]/80">Payment:</span>
                    <span>
                      {order.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : 'Razorpay Online'}
                    </span>
                    {order.payment?.transactionReference && (
                      <span className="font-mono text-[10px] text-[#79688A]/80">
                        ({order.payment.transactionReference})
                      </span>
                    )}
                  </div>

                  {order.shippingAddress?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#79688A]" />
                      <span>
                        Deliver to: {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.postalCode})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Standardized Pagination Controls */}
          {pagination.total > 0 && (
            <div className="pt-4">
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
                ariaLabel="Customer Orders Pagination"
              />
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          ORDER DETAILS MODAL VIEW
          ===================================================================== */}
      {(selectedOrder || detailsLoading) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="clay-card max-w-2xl w-full bg-white p-5 sm:p-7 space-y-6 border border-[#C6B7E2] shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] overflow-y-auto">
            {detailsLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#3B1C5A] mx-auto" />
                <p className="text-xs font-bold text-[#79688A]">Loading complete order details...</p>
              </div>
            ) : selectedOrder ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-[#3B1C5A]">
                        {selectedOrder.orderNumber}
                      </span>
                      {renderOrderStatusBadge(selectedOrder.status)}
                    </div>
                    <p className="text-xs text-[#79688A]">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
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
                    onClick={closeOrderDetails}
                    aria-label="Close details"
                    className="p-1.5 rounded-lg text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Seller Information */}
                {selectedOrder.business && (
                  <div className="p-3.5 rounded-2xl bg-[#F0EAFB]/50 border border-[#C6B7E2]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#3B1C5A] text-[#F5BD42] flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#79688A] block font-semibold">Seller</span>
                        <h5 className="font-bold text-[#3B1C5A]">{selectedOrder.business.name}</h5>
                      </div>
                    </div>
                    {selectedOrder.business.id && (
                      <Link
                        to={`/customer/stores/${selectedOrder.business.id}`}
                        className="text-xs font-bold text-[#3B1C5A] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {/* Shipment & Courier Tracking Card (Displayed when order has dispatch data) */}
                {(selectedOrder.trackingNumber || selectedOrder.courierName || selectedOrder.dispatchedAt) && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-indigo-700" />
                        <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                          Courier & Shipment Details
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 capitalize">
                        {selectedOrder.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100/80">
                        <span className="text-[10px] font-bold uppercase text-indigo-900/60 block">Courier Service</span>
                        <span className="font-extrabold text-[#3B1C5A] text-xs sm:text-sm">
                          {selectedOrder.courierName || 'Standard Delivery'}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-indigo-900/60 block">Tracking Reference</span>
                          <span className="font-mono font-bold text-[#3B1C5A] text-xs">
                            {selectedOrder.trackingNumber || 'Pending Assignment'}
                          </span>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyOrderNumber(selectedOrder.trackingNumber)}
                            className="p-1 rounded text-indigo-700 hover:bg-indigo-50 transition-colors"
                            title="Copy tracking number"
                          >
                            {copiedOrderId === selectedOrder.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {selectedOrder.dispatchedAt && (
                        <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100/80">
                          <span className="text-[10px] font-bold uppercase text-indigo-900/60 block">Dispatched Date</span>
                          <span className="font-semibold text-[#3B1C5A] text-xs">
                            {new Date(selectedOrder.dispatchedAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}

                      {selectedOrder.estimatedDeliveryDate && (
                        <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100/80">
                          <span className="text-[10px] font-bold uppercase text-indigo-900/60 block">Estimated Arrival</span>
                          <span className="font-bold text-emerald-700 text-xs">
                            {new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedOrder.trackingUrl && (
                      <div className="pt-0.5">
                        <a
                          href={selectedOrder.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
                        >
                          <span>Track parcel directly on courier website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Items in this order */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#79688A] uppercase tracking-wider">
                    Purchased Products ({selectedOrder.items?.length || 0})
                  </h4>

                  <div className="space-y-2.5">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 flex items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-[#C6B7E2]/30 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/shop-header-character.png';
                              }}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-[#3B1C5A]/30" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-[#3B1C5A] line-clamp-1">
                            {item.productName}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-[#79688A] mt-0.5">
                            <span>
                              ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span>×</span>
                            <span className="font-bold text-[#3B1C5A]">{item.quantity} unit{item.quantity > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-[#3B1C5A]">
                            ₹{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two Column Layout: Delivery Address & Payment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Address */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                      <MapPin className="w-4 h-4 text-[#E6B44C]" />
                      <span>Shipping Address</span>
                    </div>

                    {selectedOrder.shippingAddress ? (
                      <div className="text-[#79688A] space-y-0.5 leading-relaxed text-[11px]">
                        <p className="font-bold text-[#3B1C5A]">
                          {selectedOrder.shippingAddress.recipientName || 'Valued Customer'}
                        </p>
                        {selectedOrder.shippingAddress.phone && (
                          <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                        )}
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                        </p>
                        <p>{selectedOrder.shippingAddress.country || 'India'}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#79688A]">Standard delivery</p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                      <CreditCard className="w-4 h-4 text-[#E6B44C]" />
                      <span>Payment Summary</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#79688A]">Method:</span>
                        <span className="font-bold text-[#3B1C5A]">
                          {selectedOrder.payment?.paymentMethod === 'cash_on_delivery'
                            ? 'Cash on Delivery'
                            : 'Razorpay Online'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#79688A]">Payment Status:</span>
                        {renderPaymentBadge(selectedOrder)}
                      </div>

                      {selectedOrder.payment?.transactionReference && (
                        <div className="flex justify-between items-center pt-1 border-t border-[#C6B7E2]/20">
                          <span className="text-[#79688A]">Payment ID:</span>
                          <span className="font-mono text-[10px] text-[#3B1C5A] truncate max-w-[150px]">
                            {selectedOrder.payment.transactionReference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 space-y-2 text-xs">
                  <div className="flex justify-between text-[#79688A]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-[#3B1C5A]">
                      ₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#79688A]">
                    <span>Express Delivery:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Free Express)</span>
                  </div>

                  {Number(selectedOrder.taxAmount) > 0 && (
                    <div className="flex justify-between text-[#79688A]">
                      <span>Estimated GST:</span>
                      <span className="text-[#3B1C5A]">
                        ₹{Number(selectedOrder.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount:</span>
                      <span>-₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-[#C6B7E2]/30 text-sm font-extrabold text-[#3B1C5A]">
                    <span>
                      {selectedOrder.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Amount Payable on Delivery:'
                        : 'Total Amount Paid:'}
                    </span>
                    <span className="text-base sm:text-lg">
                      ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Order Status History Timeline */}
                {selectedOrder.statusHistories && selectedOrder.statusHistories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#79688A] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Order Activity & Status History</span>
                    </h4>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 space-y-3">
                      {selectedOrder.statusHistories.map((entry, idx) => (
                        <div key={entry.id || idx} className="flex items-start gap-3 relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#3B1C5A] mt-1 shrink-0 ring-4 ring-[#F0EAFB]" />
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold text-[#3B1C5A] uppercase text-[11px]">
                                {entry.status}
                              </span>
                              <span className="text-[10px] text-[#79688A]">
                                {new Date(entry.createdAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-[11px] text-[#79688A] mt-0.5 leading-relaxed">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#C6B7E2]/30">
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingOrder(selectedOrder);
                        setCancelError('');
                        setCancelReasonInput('');
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setContactOrder(selectedOrder);
                        setContactModalOpen(true);
                      }}
                      className="clay-pill px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-[#3B1C5A] hover:bg-[#FAF7F2] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                      <span>Message Seller</span>
                    </button>

                    <button
                      type="button"
                      onClick={closeOrderDetails}
                      className="clay-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      Back to My Orders
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          CANCEL ORDER CONFIRMATION MODAL
          ===================================================================== */}
      {cancellingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="clay-card max-w-md w-full bg-white p-6 space-y-4 border border-rose-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#3B1C5A]">Cancel Order?</h3>
                <p className="text-xs text-[#79688A]">Reference: {cancellingOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-[#79688A] leading-relaxed">
              Are you sure you want to cancel this order? The reserved inventory will be restored back to the merchant store.
            </p>

            <div className="space-y-1">
              <label htmlFor="cancel-reason-input" className="text-xs font-bold text-[#3B1C5A]">
                Reason for cancellation (optional):
              </label>
              <textarea
                id="cancel-reason-input"
                rows="2"
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="e.g., Changed my mind, ordered by mistake..."
                className="w-full p-2.5 rounded-xl border border-[#C6B7E2]/60 bg-[#FAF7F2] text-xs text-[#3B1C5A] focus:outline-none focus:ring-1 focus:ring-[#3B1C5A]"
              />
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isSubmittingCancel}
                className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                {isSubmittingCancel && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Merchant Modal */}
      {contactOrder && (
        <ContactMerchantModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setContactOrder(null);
          }}
          businessId={contactOrder.businessId}
          businessName={contactOrder.business?.name || 'Merchant'}
          orderId={contactOrder.id}
          productId={contactOrder.items?.[0]?.productId || null}
          productName={contactOrder.items?.[0]?.productName || null}
          productImage={contactOrder.items?.[0]?.image || null}
          productPrice={contactOrder.items?.[0]?.price || null}
        />
      )}
    </div>
  );
};

export default CustomerOrdersPage;
