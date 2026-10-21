import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Pagination } from '../components/Pagination';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Eye,
  Edit,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Store,
  ChevronDown,
  X,
  ExternalLink
} from 'lucide-react';

export const MerchantProductsPage = () => {
  const { user, businesses, selectedBusiness, switchBusiness } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    draft: 0,
    outOfStock: 0
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal States
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Categories for the active business
  const fetchCategories = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    try {
      const res = await api.get('/categories', {
        params: { businessId: selectedBusiness.id }
      });
      setCategories(res.data?.data?.categories || res.data?.data || []);
    } catch (err) {
      console.warn('Unable to load categories for merchant business:', err);
    }
  }, [selectedBusiness?.id]);

  // Load Summary Aggregates
  const fetchSummary = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    setSummaryLoading(true);
    try {
      const res = await api.get('/products/summary', {
        params: { businessId: selectedBusiness.id }
      });
      if (res.data?.data?.summary) {
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      console.warn('Unable to load product summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedBusiness?.id]);

  // Load Products with filters
  const fetchProducts = useCallback(async () => {
    if (!selectedBusiness?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        businessId: selectedBusiness.id,
        isOwnerView: true,
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (categoryFilter) params.categoryId = categoryFilter;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (stockStatusFilter && stockStatusFilter !== 'all') params.stockStatus = stockStatusFilter;

      const res = await api.get('/products', { params });
      const data = res.data?.data;
      const productList = data?.products || [];
      const paginationMeta = data?.pagination;

      setProducts(productList);
      if (paginationMeta) {
        setTotalPages(paginationMeta.totalPages || 1);
        setTotalItems(paginationMeta.totalItems || productList.length);
      } else {
        setTotalPages(1);
        setTotalItems(productList.length);
      }
    } catch (err) {
      console.error('Failed to load merchant products:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load products. Please check connection.'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, currentPage, pageSize, debouncedSearch, categoryFilter, statusFilter, stockStatusFilter, sortBy, sortOrder]);

  // Initial and reactive loading
  useEffect(() => {
    fetchCategories();
    fetchSummary();
  }, [fetchCategories, fetchSummary]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Temporary feedback toast timer
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCategoryFilter('');
    setStatusFilter('all');
    setStockStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    categoryFilter ||
    statusFilter !== 'all' ||
    stockStatusFilter !== 'all' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'DESC'
  );

  // Toggle publish / active status
  const handleTogglePublish = async (product) => {
    if (actionLoadingId) return;
    setActionLoadingId(product.id);
    try {
      const nextIsPublished = !product.isPublished;
      const nextStatus = nextIsPublished ? 'active' : 'draft';

      await api.patch(`/products/${product.id}`, {
        isPublished: nextIsPublished,
        status: nextStatus
      });

      setFeedbackMessage({
        type: 'success',
        text: `Product "${product.name}" is now ${nextIsPublished ? 'Published & Active' : 'saved as Draft'}.`
      });

      await Promise.all([fetchProducts(), fetchSummary()]);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update publication status.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Duplicate product
  const handleDuplicate = async (product) => {
    if (actionLoadingId) return;
    setActionLoadingId(product.id);
    try {
      const res = await api.post(`/products/${product.id}/duplicate`);
      setFeedbackMessage({
        type: 'success',
        text: `Created duplicate draft "${res.data?.data?.product?.name || 'Product (Copy)'}".`
      });
      await Promise.all([fetchProducts(), fetchSummary()]);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to duplicate product.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm delete product
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deleteConfirmProduct.id}`);
      setFeedbackMessage({
        type: 'success',
        text: `Product "${deleteConfirmProduct.name}" deleted successfully.`
      });
      setDeleteConfirmProduct(null);
      await Promise.all([fetchProducts(), fetchSummary()]);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete product.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for Display Style Badges
  const renderStyleBadge = (style) => {
    switch (style) {
      case 'editorial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#3B1C5A] text-[#E6B44C] border border-[#E6B44C]/30 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#E6B44C]" />
            <span>Editorial</span>
          </span>
        );
      case 'detailed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#F0EAFB] text-[#3B1C5A] border border-[#C6B7E2]/60 shadow-xs">
            <Layers className="w-3 h-3 text-[#3B1C5A]" />
            <span>Detailed</span>
          </span>
        );
      case 'standard':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-white text-[#3B1C5A]/80 border border-[#C6B7E2]/40 shadow-xs">
            <Package className="w-3 h-3 text-[#3B1C5A]/60" />
            <span>Standard</span>
          </span>
        );
    }
  };

  // Helper for Stock Status
  const renderStockBadge = (stockQuantity, lowStockThreshold = 5) => {
    const qty = Number(stockQuantity);
    if (qty <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Out of Stock (0)
        </span>
      );
    }
    if (qty <= lowStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Low Stock ({qty})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        In Stock ({qty})
      </span>
    );
  };

  // Helper for Publication Status
  const renderPublicationBadge = (isPublished, status) => {
    if (status === 'archived') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
          Archived
        </span>
      );
    }
    if (isPublished && status === 'active') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Active
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FAF6EE] text-[#3B1C5A]/70 border border-[#C6B7E2]/50">
        Draft
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          role="alert"
          className={`clay-card p-4 rounded-2xl flex items-center justify-between border animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          1. HEADER & STORE SELECTOR
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60 mb-1">
            <span>Catalog Management</span>
            <span>•</span>
            <span className="text-[#3B1C5A] font-extrabold">{selectedBusiness?.name || 'Store'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3B1C5A] font-serif">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-[#3B1C5A]/75 mt-0.5">
            Manage your products, pricing, stock, and per-product presentation display styles.
          </p>
        </div>

        {/* Header Actions: Store Switcher (if multiple) & + Add Product */}
        <div className="flex flex-wrap items-center gap-3">
          {businesses.length > 1 && (
            <div className="relative">
              <label htmlFor="merchant-business-selector" className="sr-only">
                Select Store
              </label>
              <select
                id="merchant-business-selector"
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const target = businesses.find((b) => b.id === e.target.value);
                  if (target) switchBusiness(target);
                }}
                className="clay-input text-xs font-bold py-2.5 pl-3 pr-8 rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    Store: {biz.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Link
            to="/merchant/products/new"
            className="clay-btn-accent px-5 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center space-x-2 rounded-2xl cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. SUMMARY CARDS ROW
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="clay-card p-4 rounded-2xl bg-white/95 border border-[#C6B7E2]/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#3B1C5A]/65 uppercase tracking-wider">
              Total Products
            </span>
            <div className="text-2xl font-extrabold text-[#3B1C5A]">
              {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#E6B44C]" /> : summary.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F0EAFB] text-[#3B1C5A] flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Active Products */}
        <div className="clay-card p-4 rounded-2xl bg-white/95 border border-[#C6B7E2]/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#3B1C5A]/65 uppercase tracking-wider">
              Active / Published
            </span>
            <div className="text-2xl font-extrabold text-emerald-700">
              {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : summary.active}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Draft Products */}
        <div className="clay-card p-4 rounded-2xl bg-white/95 border border-[#C6B7E2]/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#3B1C5A]/65 uppercase tracking-wider">
              Draft Products
            </span>
            <div className="text-2xl font-extrabold text-[#E6B44C]">
              {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#E6B44C]" /> : summary.draft}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] text-[#E6B44C] flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="clay-card p-4 rounded-2xl bg-white/95 border border-[#C6B7E2]/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#3B1C5A]/65 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="text-2xl font-extrabold text-rose-600">
              {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin text-rose-500" /> : summary.outOfStock}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SEARCH, FILTERS & SORTING TOOLBAR
          ========================================================================= */}
      <div className="clay-card p-4 sm:p-5 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#3B1C5A]/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title or SKU..."
              className="clay-input w-full pl-10 pr-4 py-2 text-xs bg-white rounded-2xl border border-[#C6B7E2]/50 text-[#3B1C5A] placeholder-[#3B1C5A]/45"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-[#3B1C5A]/50 hover:text-[#3B1C5A]"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
              className="clay-input text-xs font-bold py-2 px-3 rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="clay-input text-xs font-bold py-2 px-3 rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active / Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by stock availability"
              className="clay-input text-xs font-bold py-2 px-3 rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
            >
              <option value="all">Stock: All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Sort Selector */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              aria-label="Sort product catalog"
              className="clay-input text-xs font-bold py-2 px-3 rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
            >
              <option value="createdAt:DESC">Newest First</option>
              <option value="createdAt:ASC">Oldest First</option>
              <option value="name:ASC">Name A–Z</option>
              <option value="price:ASC">Price: Low to High</option>
              <option value="price:DESC">Price: High to Low</option>
              <option value="stockQuantity:DESC">Stock: High to Low</option>
            </select>

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="clay-btn-secondary px-3 py-2 text-xs font-bold inline-flex items-center gap-1 rounded-2xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. PRODUCT LISTING TABLE / CARDS
          ========================================================================= */}
      {loading ? (
        <div className="clay-card p-12 text-center bg-white/95 rounded-3xl border border-[#C6B7E2]/40 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C] mx-auto" />
          <h3 className="text-base font-bold text-[#3B1C5A]">Loading Products...</h3>
          <p className="text-xs text-[#3B1C5A]/60">Fetching verified catalog data for {selectedBusiness?.name}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="clay-card p-12 text-center bg-white/95 rounded-3xl border border-[#C6B7E2]/40 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF6EE] text-[#E6B44C] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-8 h-8 text-[#3B1C5A]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#3B1C5A] font-serif">
              {hasActiveFilters ? 'No Products Match Filters' : 'No Products Added Yet'}
            </h3>
            <p className="text-xs text-[#3B1C5A]/70 mt-1">
              {hasActiveFilters
                ? 'Try adjusting your search query, category, or status filters.'
                : 'Start growing your business catalog by adding your first product with customized display styles.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="clay-btn-secondary px-5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : (
            <Link
              to="/merchant/products/new"
              className="clay-btn-accent px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-2xl cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Your First Product</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (hidden on small viewports) */}
          <div className="hidden lg:block clay-card rounded-3xl bg-white/95 border border-[#C6B7E2]/40 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#C6B7E2]/40 text-[#3B1C5A]/70 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Product</th>
                    <th scope="col" className="py-3.5 px-3">SKU</th>
                    <th scope="col" className="py-3.5 px-3">Category</th>
                    <th scope="col" className="py-3.5 px-3">Price</th>
                    <th scope="col" className="py-3.5 px-3">Stock</th>
                    <th scope="col" className="py-3.5 px-3">Status</th>
                    <th scope="col" className="py-3.5 px-3">Display Style</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C6B7E2]/30">
                  {products.map((product) => {
                    const firstImage = Array.isArray(product.images) && product.images[0];
                    const numPrice = parseFloat(product.price);
                    const formattedPrice = !isNaN(numPrice)
                      ? `₹${numPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : product.price;

                    return (
                      <tr key={product.id} className="hover:bg-[#F9F6F0]/80 transition-colors">
                        {/* Product Thumbnail & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] shrink-0 border border-[#C6B7E2]/40 flex items-center justify-center">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-[#3B1C5A]/40" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-[#3B1C5A] truncate hover:text-[#40205E] max-w-xs text-xs sm:text-sm">
                                {product.name}
                              </h4>
                              <span className="text-[10px] text-[#3B1C5A]/50 font-mono truncate block">
                                /{product.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-3 font-mono text-[11px] text-[#3B1C5A]/80 font-bold">
                          {product.sku || '—'}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3">
                          {product.category?.name ? (
                            <span className="clay-badge-gold px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#3B1C5A]/45">Uncategorized</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3 font-extrabold text-[#3B1C5A] text-sm whitespace-nowrap">
                          {formattedPrice}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderStockBadge(product.stockQuantity, product.lowStockThreshold)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderPublicationBadge(product.isPublished, product.status)}
                        </td>

                        {/* Display Style */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderStyleBadge(product.displayStyle)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            {/* View Modal Action */}
                            <button
                              type="button"
                              onClick={() => setViewProduct(product)}
                              title="View Details"
                              aria-label={`View details of ${product.name}`}
                              className="p-1.5 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Action */}
                            <Link
                              to={`/merchant/products/${product.id}/edit`}
                              title="Edit Product"
                              aria-label={`Edit ${product.name}`}
                              className="p-1.5 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Duplicate Action */}
                            <button
                              type="button"
                              disabled={actionLoadingId === product.id}
                              onClick={() => handleDuplicate(product)}
                              title="Duplicate as Draft"
                              aria-label={`Duplicate ${product.name}`}
                              className="p-1.5 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-40"
                            >
                              {actionLoadingId === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Toggle Publish / Draft Action */}
                            <button
                              type="button"
                              disabled={actionLoadingId === product.id}
                              onClick={() => handleTogglePublish(product)}
                              title={product.isPublished ? 'Unpublish to Draft' : 'Publish Product'}
                              aria-label={product.isPublished ? `Unpublish ${product.name}` : `Publish ${product.name}`}
                              className="p-1.5 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-40"
                            >
                              {product.isPublished ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                              )}
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmProduct(product)}
                              title="Delete Product"
                              aria-label={`Delete ${product.name}`}
                              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (Visible on screens < lg) */}
          <div className="lg:hidden space-y-3">
            {products.map((product) => {
              const firstImage = Array.isArray(product.images) && product.images[0];
              const numPrice = parseFloat(product.price);
              const formattedPrice = !isNaN(numPrice)
                ? `₹${numPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : product.price;

              return (
                <div
                  key={product.id}
                  className="clay-card p-4 rounded-2xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] shrink-0 border border-[#C6B7E2]/40 flex items-center justify-center">
                      {firstImage ? (
                        <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-[#3B1C5A]/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {renderPublicationBadge(product.isPublished, product.status)}
                        {renderStyleBadge(product.displayStyle)}
                      </div>
                      <h4 className="font-extrabold text-[#3B1C5A] text-sm line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-[#3B1C5A] text-base">{formattedPrice}</span>
                        {product.sku && (
                          <span className="text-[10px] font-mono text-[#3B1C5A]/60">SKU: {product.sku}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#C6B7E2]/30 flex items-center justify-between gap-2">
                    <div>{renderStockBadge(product.stockQuantity, product.lowStockThreshold)}</div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setViewProduct(product)}
                        className="p-1.5 rounded-lg text-[#3B1C5A]/70 hover:bg-[#F0EAFB]"
                        aria-label="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/merchant/products/${product.id}/edit`}
                        className="p-1.5 rounded-lg text-[#3B1C5A]/70 hover:bg-[#F0EAFB]"
                        aria-label="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product)}
                        className="p-1.5 rounded-lg text-[#3B1C5A]/70 hover:bg-[#F0EAFB]"
                        aria-label="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(product)}
                        className="p-1.5 rounded-lg text-[#3B1C5A]/70 hover:bg-[#F0EAFB]"
                        aria-label="Toggle publish"
                      >
                        {product.isPublished ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmProduct(product)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Component Integration */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 25, 50]}
            showPageSizeSelector={true}
            itemName="products"
          />
        </div>
      )}

      {/* =========================================================================
          5. VIEW PRODUCT MODAL REUSE
          ========================================================================= */}
      {viewProduct && (
        <ProductDetailsModal
          isOpen={Boolean(viewProduct)}
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}

      {/* =========================================================================
          6. DELETE CONFIRMATION DIALOG
          ========================================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-xs">
          <div className="clay-card w-full max-w-md bg-white p-6 rounded-3xl border border-[#C6B7E2]/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#3B1C5A] font-serif">
                Delete Product?
              </h3>
              <p className="text-xs text-[#3B1C5A]/75 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-extrabold text-[#3B1C5A]">"{deleteConfirmProduct.name}"</span>?
                This action cannot be undone. Historical order snapshots referencing this product will be preserved.
              </p>
            </div>

            <div className="pt-3 border-t border-[#C6B7E2]/30 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmProduct(null)}
                className="clay-btn-secondary px-4 py-2 text-xs font-bold rounded-2xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantProductsPage;

