import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Pagination } from '../components/Pagination';
import {
  Layers,
  Package,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  PlusCircle,
  History,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Loader2,
  X,
  Store,
  ArrowRight,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const MerchantInventoryPage = () => {
  const { user, businesses, selectedBusiness, switchBusiness } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalVariants: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inventoryValue: {
      totalCostValuation: 0,
      totalRetailValuation: 0,
      itemsWithCostCount: 0,
      totalItemsCount: 0,
      status: 'unavailable'
    }
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Expandable row state (track set of expanded product IDs)
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  // Modals state
  const [adjustModalItem, setAdjustModalItem] = useState(null); // { product, variant }
  const [adjustType, setAdjustType] = useState('receive'); // receive | damage_loss | correction | customer_return
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('Supplier shipment restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Threshold modal state
  const [thresholdModalItem, setThresholdModalItem] = useState(null);
  const [thresholdValue, setThresholdValue] = useState(5);
  const [isSubmittingThreshold, setIsSubmittingThreshold] = useState(false);

  // Add Variant modal state
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [variantForm, setVariantForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    costPrice: '',
    physicalStock: '0',
    lowStockThreshold: '5'
  });
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

  // Movement History Drawer state
  const [showMovementsDrawer, setShowMovementsDrawer] = useState(false);
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementFilterType, setMovementFilterType] = useState('all');
  const [movementPage, setMovementPage] = useState(1);
  const [movementTotalPages, setMovementTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Auto-dismiss alert feedback
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Load Categories for the active business
  const fetchCategories = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    try {
      const res = await api.get('/categories', {
        params: { businessId: selectedBusiness.id }
      });
      setCategories(res.data?.data?.categories || res.data?.data || []);
    } catch (err) {
      console.warn('Unable to load categories for inventory page:', err);
    }
  }, [selectedBusiness?.id]);

  // Load Inventory Summary (5-card metrics)
  const fetchSummary = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    setSummaryLoading(true);
    try {
      const res = await api.get('/inventory/summary', {
        params: { businessId: selectedBusiness.id }
      });
      if (res.data?.success && res.data.data) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedBusiness?.id]);

  // Load Paginated Inventory Items
  const fetchInventory = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    setLoading(true);
    try {
      const params = {
        businessId: selectedBusiness.id,
        page: currentPage,
        limit: pageSize
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter && categoryFilter !== 'all') params.categoryId = categoryFilter;
      if (stockStatusFilter && stockStatusFilter !== 'all') params.stockStatus = stockStatusFilter;

      const res = await api.get('/inventory/items', { params });
      if (res.data?.success) {
        const items = res.data.data.items || [];
        setInventoryItems(items);
        const meta = res.data.data.pagination;
        if (meta) {
          setTotalPages(meta.totalPages || 1);
          setTotalItems(meta.totalItems || items.length);
        }
      }
    } catch (err) {
      console.error('Failed to load inventory items:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, currentPage, pageSize, debouncedSearch, categoryFilter, stockStatusFilter]);

  // Load Stock Movements Audit Trail
  const fetchMovements = useCallback(async () => {
    if (!selectedBusiness?.id) return;
    setMovementsLoading(true);
    try {
      const params = {
        businessId: selectedBusiness.id,
        page: movementPage,
        limit: 15
      };
      if (movementFilterType && movementFilterType !== 'all') {
        params.movementType = movementFilterType;
      }
      const res = await api.get('/inventory/movements', { params });
      if (res.data?.success) {
        setMovements(res.data.data.movements || []);
        if (res.data.data.pagination) {
          setMovementTotalPages(res.data.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setMovementsLoading(false);
    }
  }, [selectedBusiness?.id, movementPage, movementFilterType]);

  // Initial and reactive data fetching
  useEffect(() => {
    if (selectedBusiness?.id) {
      fetchCategories();
      fetchSummary();
      fetchInventory();
    }
  }, [selectedBusiness?.id, fetchCategories, fetchSummary, fetchInventory]);

  useEffect(() => {
    if (showMovementsDrawer && selectedBusiness?.id) {
      fetchMovements();
    }
  }, [showMovementsDrawer, selectedBusiness?.id, fetchMovements]);

  // Toggle Row Expansion
  const toggleRowExpansion = (productId) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Open Adjust Modal
  const openAdjustModal = (product, variant = null) => {
    setAdjustModalItem({ product, variant });
    setAdjustType('receive');
    setAdjustQuantity('');
    setAdjustReason('Supplier shipment PO restock');
    setAdjustNotes('');
  };

  // Close Adjust Modal
  const closeAdjustModal = () => {
    setAdjustModalItem(null);
    setAdjustQuantity('');
    setAdjustNotes('');
  };

  // Live calculation of preview balances in modal
  const adjustmentPreview = useMemo(() => {
    if (!adjustModalItem) return null;
    const target = adjustModalItem.variant || adjustModalItem.product;
    const curPhysical = target.physicalStock || 0;
    const curReserved = target.reservedQuantity || 0;
    const curAvailable = Math.max(0, curPhysical - curReserved);

    const val = parseInt(adjustQuantity, 10);
    if (isNaN(val) || val < 0) {
      return { curPhysical, curReserved, curAvailable, newPhysical: curPhysical, newAvailable: curAvailable, isValid: false, error: null };
    }

    let newPhysical = curPhysical;
    let isValid = true;
    let error = null;

    if (adjustType === 'receive' || adjustType === 'customer_return') {
      newPhysical = curPhysical + val;
    } else if (adjustType === 'damage_loss') {
      if (curPhysical - val < curReserved) {
        isValid = false;
        error = `Cannot deduct ${val} units. ${curReserved} units are reserved for pending orders.`;
      } else {
        newPhysical = curPhysical - val;
      }
    } else if (adjustType === 'correction') {
      if (val < curReserved) {
        isValid = false;
        error = `Recount count (${val}) cannot be lower than active reserved orders (${curReserved}).`;
      } else {
        newPhysical = val;
      }
    }

    const newAvailable = Math.max(0, newPhysical - curReserved);
    return { curPhysical, curReserved, curAvailable, newPhysical, newAvailable, isValid, error };
  }, [adjustModalItem, adjustType, adjustQuantity]);

  // Submit Stock Adjustment
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustModalItem || !adjustmentPreview?.isValid || !adjustQuantity) return;

    setIsSubmittingAdjust(true);
    try {
      const payload = {
        businessId: selectedBusiness.id,
        productId: adjustModalItem.product.id,
        variantId: adjustModalItem.variant ? adjustModalItem.variant.id : null,
        adjustmentType: adjustType,
        quantity: parseInt(adjustQuantity, 10),
        reason: adjustReason.trim(),
        notes: adjustNotes.trim() || undefined
      };

      const res = await api.post('/inventory/adjust', payload);
      if (res.data?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Stock successfully updated: Physical ${res.data.data.updatedStock.physicalStock}, Available ${res.data.data.updatedStock.availableStock}`
        });
        closeAdjustModal();
        fetchSummary();
        fetchInventory();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to adjust stock';
      setFeedbackMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Open Threshold Modal
  const openThresholdModal = (product, variant = null) => {
    setThresholdModalItem({ product, variant });
    const target = variant || product;
    setThresholdValue(target.lowStockThreshold != null ? target.lowStockThreshold : 5);
  };

  // Submit Threshold Change
  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!thresholdModalItem) return;

    setIsSubmittingThreshold(true);
    try {
      const payload = {
        businessId: selectedBusiness.id,
        productId: thresholdModalItem.product.id,
        variantId: thresholdModalItem.variant ? thresholdModalItem.variant.id : null,
        lowStockThreshold: parseInt(thresholdValue, 10)
      };

      const res = await api.patch('/inventory/threshold', payload);
      if (res.data?.success) {
        setFeedbackMessage({ type: 'success', text: 'Low-stock threshold updated successfully' });
        setThresholdModalItem(null);
        fetchSummary();
        fetchInventory();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update threshold'
      });
    } finally {
      setIsSubmittingThreshold(false);
    }
  };

  // Open Add Variant Modal
  const openAddVariantModal = (product) => {
    setVariantModalProduct(product);
    const prefix = product.name ? product.name.slice(0, 3).toUpperCase() : 'PRD';
    setVariantForm({
      name: '',
      sku: `${product.sku || prefix}-VAR-${Math.floor(100 + Math.random() * 900)}`,
      barcode: '',
      price: product.price || '',
      costPrice: product.costPrice || '',
      physicalStock: '0',
      lowStockThreshold: '5'
    });
  };

  // Submit New Variant
  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!variantModalProduct || !variantForm.name.trim() || !variantForm.sku.trim()) return;

    setIsSubmittingVariant(true);
    try {
      const payload = {
        businessId: selectedBusiness.id,
        name: variantForm.name.trim(),
        sku: variantForm.sku.trim(),
        barcode: variantForm.barcode.trim() || undefined,
        price: variantForm.price ? parseFloat(variantForm.price) : undefined,
        costPrice: variantForm.costPrice ? parseFloat(variantForm.costPrice) : undefined,
        physicalStock: parseInt(variantForm.physicalStock, 10) || 0,
        lowStockThreshold: parseInt(variantForm.lowStockThreshold, 10) || 5
      };

      const res = await api.post(`/inventory/products/${variantModalProduct.id}/variants`, payload);
      if (res.data?.success) {
        setFeedbackMessage({ type: 'success', text: `New variant "${variantForm.name}" created successfully` });
        setVariantModalProduct(null);
        // Expand product row so merchant sees the newly added variant
        setExpandedProductIds((prev) => new Set([...prev, variantModalProduct.id]));
        fetchSummary();
        fetchInventory();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create variant'
      });
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#3B1C5A] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* FEEDBACK ALERT */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all animate-in fade-in duration-200 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PAGE HEADER & BUSINESS SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F6F1E8] p-5 sm:p-6 rounded-3xl border border-[#C6B7E2]/30 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#3B1C5A] text-[#E6B44C] rounded-2xl shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3B1C5A]">
                Inventory Management
              </h1>
            </div>
            <p className="text-sm text-[#3B1C5A]/70">
              Live stock levels, variant allocations, reorder alert thresholds, and audit movements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Business Switcher Dropdown */}
            {businesses && businesses.length > 0 && (
              <div className="flex items-center bg-white border border-[#C6B7E2]/40 rounded-2xl px-3 py-2 shadow-sm">
                <Store className="w-4 h-4 text-[#E6B44C] mr-2 shrink-0" />
                <select
                  value={selectedBusiness?.id || ''}
                  onChange={(e) => switchBusiness(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#3B1C5A] focus:outline-none cursor-pointer pr-2"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Audit History Drawer Button */}
            <button
              onClick={() => setShowMovementsDrawer(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/50 font-semibold text-sm rounded-2xl shadow-sm transition-all active:scale-95"
            >
              <History className="w-4 h-4 text-[#3B1C5A]" />
              <span>Audit Movements</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchSummary();
                fetchInventory();
              }}
              title="Refresh inventory data"
              className="p-2 bg-white hover:bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/50 rounded-2xl shadow-sm transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Products */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Products</span>
              <div className="p-2 bg-[#F6F1E8] text-[#3B1C5A] rounded-xl">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#3B1C5A]">
                {summaryLoading ? '...' : summary.totalProducts}
              </div>
              <p className="text-xs text-[#3B1C5A]/60 mt-1">Catalog items tracked</p>
            </div>
          </div>

          {/* Card 2: Total SKUs / Variants */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Total SKUs</span>
              <div className="p-2 bg-[#F6F1E8] text-[#3B1C5A] rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#3B1C5A]">
                {summaryLoading ? '...' : summary.totalVariants}
              </div>
              <p className="text-xs text-[#3B1C5A]/60 mt-1">Variant stock units</p>
            </div>
          </div>

          {/* Card 3: Low Stock */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Low Stock</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-amber-600">
                {summaryLoading ? '...' : summary.lowStockCount}
              </div>
              {summary.lowStockCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                  Needs Reorder
                </span>
              )}
            </div>
            <p className="text-xs text-[#3B1C5A]/60 mt-1">At or below threshold</p>
          </div>

          {/* Card 4: Out of Stock */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Out of Stock</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-rose-600">
                {summaryLoading ? '...' : summary.outOfStockCount}
              </div>
              {summary.outOfStockCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                  Critical
                </span>
              )}
            </div>
            <p className="text-xs text-[#3B1C5A]/60 mt-1">0 available units</p>
          </div>

          {/* Card 5: Inventory Valuation (Strict Cost Valuation Standard) */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Inventory Value</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {summaryLoading ? (
                <div className="text-2xl font-extrabold text-[#3B1C5A]">...</div>
              ) : summary.inventoryValue?.status === 'fully_configured' ? (
                <div>
                  <div className="text-2xl font-extrabold text-emerald-700">
                    ₹{summary.inventoryValue.totalCostValuation.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Cost Configured
                    </span>
                    <span className="text-[11px] text-[#3B1C5A]/50">
                      Retail: ₹{summary.inventoryValue.totalRetailValuation.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : summary.inventoryValue?.status === 'partially_configured' ? (
                <div>
                  <div className="text-2xl font-extrabold text-amber-700">
                    ₹{summary.inventoryValue.totalCostValuation.toLocaleString()}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      Partially Configured ({summary.inventoryValue.itemsWithCostCount}/{summary.inventoryValue.totalItemsCount})
                    </span>
                    <p className="text-[11px] text-[#3B1C5A]/50">
                      Retail: ₹{summary.inventoryValue.totalRetailValuation.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-[#3B1C5A]/60">
                    Unavailable
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700">
                      Cost Price Missing
                    </span>
                    <p className="text-[11px] text-[#3B1C5A]/50">
                      Retail: ₹{(summary.inventoryValue?.totalRetailValuation || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & CONTROLS TOOLBAR */}
        <div className="bg-white p-4 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#3B1C5A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, SKU, or variant SKU..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/30 rounded-2xl text-[#3B1C5A] placeholder-[#3B1C5A]/40 focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 text-sm font-medium bg-[#FCFAF6] border border-[#C6B7E2]/30 rounded-2xl text-[#3B1C5A] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 text-sm font-medium bg-[#FCFAF6] border border-[#C6B7E2]/30 rounded-2xl text-[#3B1C5A] focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || categoryFilter !== 'all' || stockStatusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStockStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F6F1E8] rounded-xl transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* INVENTORY TABLE WITH EXPANDABLE VARIANTS */}
        <div className="bg-white rounded-3xl border border-[#C6B7E2]/30 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#E6B44C] animate-spin" />
              <p className="text-sm font-medium text-[#3B1C5A]/60">Loading inventory data...</p>
            </div>
          ) : inventoryItems.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <div className="w-14 h-14 bg-[#F6F1E8] text-[#3B1C5A] rounded-3xl flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#3B1C5A]">No inventory items found</h3>
              <p className="text-sm text-[#3B1C5A]/60 max-w-md mx-auto">
                No products match the selected filters, or your business has not added any products yet.
              </p>
              <Link
                to="/merchant/products/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#3B1C5A] hover:bg-[#3B1C5A]/90 text-white rounded-2xl text-sm font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#E6B44C]" />
                <span>Create New Product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F6F1E8]/70 border-b border-[#C6B7E2]/30 text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    <th className="py-3.5 px-4 w-10"></th>
                    <th className="py-3.5 px-4">Product / Item</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Variants</th>
                    <th className="py-3.5 px-4 text-right">Physical</th>
                    <th className="py-3.5 px-4 text-right">Reserved</th>
                    <th className="py-3.5 px-4 text-right font-black">Available</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C6B7E2]/20 text-sm">
                  {inventoryItems.map((prod) => {
                    const isExpanded = expandedProductIds.has(prod.id);
                    const hasVariants = prod.variants && prod.variants.length > 0;
                    const firstImage = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null;

                    return (
                      <React.Fragment key={prod.id}>
                        {/* MAIN PRODUCT ROW */}
                        <tr className="hover:bg-[#FCFAF6] transition-colors group">
                          {/* Expansion toggle */}
                          <td className="py-4 px-4 text-center">
                            {hasVariants ? (
                              <button
                                onClick={() => toggleRowExpansion(prod.id)}
                                className="p-1 hover:bg-[#F6F1E8] rounded-lg transition-colors text-[#3B1C5A]/60 hover:text-[#3B1C5A]"
                                title={isExpanded ? 'Collapse variants' : 'Expand variants'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#3B1C5A]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            ) : null}
                          </td>

                          {/* Product Thumbnail & Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-11 h-11 rounded-xl bg-[#F6F1E8] border border-[#C6B7E2]/30 overflow-hidden shrink-0 flex items-center justify-center">
                                {firstImage ? (
                                  <img
                                    src={firstImage}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-[#3B1C5A]/40" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#3B1C5A] group-hover:text-[#E6B44C] transition-colors">
                                  {prod.name}
                                </div>
                                <div className="text-xs text-[#3B1C5A]/50">
                                  Updated: {new Date(prod.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="py-4 px-4 font-mono text-xs text-[#3B1C5A]/80 font-semibold">
                            {prod.sku || 'N/A'}
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4">
                            {prod.category?.name ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/30">
                                {prod.category.name}
                              </span>
                            ) : (
                              <span className="text-xs text-[#3B1C5A]/40">Uncategorized</span>
                            )}
                          </td>

                          {/* Variants Count */}
                          <td className="py-4 px-4 text-center">
                            {hasVariants ? (
                              <button
                                onClick={() => toggleRowExpansion(prod.id)}
                                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-[#C6B7E2]/25 text-[#3B1C5A] hover:bg-[#C6B7E2]/40 transition-colors"
                              >
                                {prod.variants.length} Variants
                              </button>
                            ) : (
                              <span className="text-xs text-[#3B1C5A]/50">Single item</span>
                            )}
                          </td>

                          {/* Physical Stock */}
                          <td className="py-4 px-4 text-right font-medium text-[#3B1C5A]">
                            {prod.physicalStock}
                          </td>

                          {/* Reserved Stock */}
                          <td className="py-4 px-4 text-right font-medium text-amber-700">
                            {prod.reservedQuantity > 0 ? `-${prod.reservedQuantity}` : '0'}
                          </td>

                          {/* Available Stock */}
                          <td className="py-4 px-4 text-right">
                            <span className="text-base font-black text-[#3B1C5A]">
                              {prod.availableStock}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center">
                            {prod.stockStatus === 'out_of_stock' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Out of Stock
                              </span>
                            ) : prod.stockStatus === 'low_stock' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Low Stock ({prod.availableStock})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Adjust Stock Button */}
                              <button
                                onClick={() => openAdjustModal(prod)}
                                className="px-3 py-1.5 bg-[#3B1C5A] hover:bg-[#3B1C5A]/90 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                              >
                                Adjust
                              </button>

                              {/* Threshold Button */}
                              <button
                                onClick={() => openThresholdModal(prod)}
                                title="Configure low-stock alert threshold"
                                className="p-1.5 bg-white hover:bg-[#F6F1E8] border border-[#C6B7E2]/40 rounded-xl text-[#3B1C5A] transition-colors"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Add Variant Button */}
                              <button
                                onClick={() => openAddVariantModal(prod)}
                                title="Add variant (e.g. Size/Color)"
                                className="p-1.5 bg-white hover:bg-[#F6F1E8] border border-[#C6B7E2]/40 rounded-xl text-[#3B1C5A] transition-colors"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-[#E6B44C]" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED SUB-TABLE FOR VARIANTS */}
                        {isExpanded && hasVariants && (
                          <tr className="bg-[#F6F1E8]/30">
                            <td colSpan={10} className="py-3 px-6 sm:px-10">
                              <div className="bg-white rounded-2xl border border-[#C6B7E2]/30 p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]">
                                    {prod.name} — Variants & Stock Units
                                  </span>
                                  <button
                                    onClick={() => openAddVariantModal(prod)}
                                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#3B1C5A] hover:text-[#E6B44C] transition-colors"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5 text-[#E6B44C]" />
                                    <span>Add Another Variant</span>
                                  </button>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b border-[#C6B7E2]/30 text-[#3B1C5A]/60 uppercase font-semibold">
                                        <th className="py-2 px-3">Variant Name</th>
                                        <th className="py-2 px-3">SKU</th>
                                        <th className="py-2 px-3">Selling Price</th>
                                        <th className="py-2 px-3">Cost Price</th>
                                        <th className="py-2 px-3 text-right">Physical</th>
                                        <th className="py-2 px-3 text-right">Reserved</th>
                                        <th className="py-2 px-3 text-right font-black">Available</th>
                                        <th className="py-2 px-3 text-center">Status</th>
                                        <th className="py-2 px-3 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#C6B7E2]/15">
                                      {prod.variants.map((v) => (
                                        <tr key={v.id} className="hover:bg-[#FCFAF6] transition-colors">
                                          <td className="py-2.5 px-3 font-semibold text-[#3B1C5A]">
                                            {v.name}
                                            {v.isDefault && (
                                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-700">
                                                Default
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono text-[#3B1C5A]/80">
                                            {v.sku}
                                          </td>
                                          <td className="py-2.5 px-3 font-medium text-[#3B1C5A]">
                                            ₹{v.price != null ? Number(v.price).toFixed(2) : Number(prod.price || 0).toFixed(2)}
                                          </td>
                                          <td className="py-2.5 px-3 font-medium text-[#3B1C5A]/70">
                                            {v.costPrice != null ? `₹${Number(v.costPrice).toFixed(2)}` : 'Unset'}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-semibold text-[#3B1C5A]">
                                            {v.physicalStock}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-semibold text-amber-700">
                                            {v.reservedQuantity > 0 ? `-${v.reservedQuantity}` : '0'}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-black text-[#3B1C5A]">
                                            {v.availableStock}
                                          </td>
                                          <td className="py-2.5 px-3 text-center">
                                            {v.stockStatus === 'out_of_stock' ? (
                                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                Out of Stock
                                              </span>
                                            ) : v.stockStatus === 'low_stock' ? (
                                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                Low ({v.availableStock})
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                In Stock
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                              <button
                                                onClick={() => openAdjustModal(prod, v)}
                                                className="px-2.5 py-1 bg-[#3B1C5A] hover:bg-[#3B1C5A]/90 text-white rounded-lg text-xs font-bold transition-all"
                                              >
                                                Adjust
                                              </button>
                                              <button
                                                onClick={() => openThresholdModal(prod, v)}
                                                title="Set variant low-stock threshold"
                                                className="p-1 hover:bg-[#F6F1E8] border border-[#C6B7E2]/30 rounded-lg text-[#3B1C5A]"
                                              >
                                                <SlidersHorizontal className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Standardized Pagination Bar */}
          {!loading && inventoryItems.length > 0 && (
            <div className="p-4 border-t border-[#C6B7E2]/30 bg-[#FCFAF6]/60">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                showPageSizeSelector={true}
                itemName="products"
              />
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. STOCK ADJUSTMENT MODAL (Receive, Damaged, Recount Correction, Return) */}
      {/* ========================================================================= */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#C6B7E2]/40 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div>
                <h3 className="text-lg font-extrabold text-[#3B1C5A]">Adjust Inventory Stock</h3>
                <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
                  {adjustModalItem.product.name}
                  {adjustModalItem.variant ? ` • ${adjustModalItem.variant.name}` : ''}
                  <span className="font-mono ml-1 text-gray-500">
                    ({adjustModalItem.variant?.sku || adjustModalItem.product.sku})
                  </span>
                </p>
              </div>
              <button
                onClick={closeAdjustModal}
                className="p-1.5 hover:bg-[#F6F1E8] rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* Adjustment Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('receive');
                      setAdjustReason('Supplier shipment restock');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-2xl border transition-all flex items-center justify-center space-x-1.5 ${
                      adjustType === 'receive'
                        ? 'bg-[#3B1C5A] text-white border-[#3B1C5A] shadow-sm'
                        : 'bg-[#FCFAF6] text-[#3B1C5A] border-[#C6B7E2]/40 hover:bg-[#F6F1E8]'
                    }`}
                  >
                    <span>📥 Receive Stock (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('damage_loss');
                      setAdjustReason('Damaged or lost stock');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-2xl border transition-all flex items-center justify-center space-x-1.5 ${
                      adjustType === 'damage_loss'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-[#FCFAF6] text-[#3B1C5A] border-[#C6B7E2]/40 hover:bg-[#F6F1E8]'
                    }`}
                  >
                    <span>⚠️ Damaged / Lost (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('correction');
                      setAdjustReason('Physical recount recount correction');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-2xl border transition-all flex items-center justify-center space-x-1.5 ${
                      adjustType === 'correction'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-[#FCFAF6] text-[#3B1C5A] border-[#C6B7E2]/40 hover:bg-[#F6F1E8]'
                    }`}
                  >
                    <span>🔍 Stock Recount (Set)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('customer_return');
                      setAdjustReason('Customer return RMA restock');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-2xl border transition-all flex items-center justify-center space-x-1.5 ${
                      adjustType === 'customer_return'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[#FCFAF6] text-[#3B1C5A] border-[#C6B7E2]/40 hover:bg-[#F6F1E8]'
                    }`}
                  >
                    <span>🔄 Customer Return (+)</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                  {adjustType === 'correction' ? 'Verified Physical Count' : 'Quantity to Adjust'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder={adjustType === 'correction' ? 'e.g. 50' : 'e.g. 10'}
                  className="w-full px-4 py-2.5 text-base font-bold bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
                />
              </div>

              {/* Dynamic Live Balance Preview Box */}
              {adjustmentPreview && (
                <div className="p-3.5 bg-[#F6F1E8] rounded-2xl border border-[#C6B7E2]/30 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/70 flex items-center justify-between">
                    <span>Stock Impact Preview</span>
                    <span>Rule: Available = Physical - Reserved</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-[#C6B7E2]/20">
                      <div className="text-[#3B1C5A]/50 text-[10px] uppercase font-bold">Physical</div>
                      <div className="font-extrabold text-[#3B1C5A] mt-0.5">
                        {adjustmentPreview.curPhysical} →{' '}
                        <span className="text-[#E6B44C]">{adjustmentPreview.newPhysical}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-[#C6B7E2]/20">
                      <div className="text-[#3B1C5A]/50 text-[10px] uppercase font-bold">Reserved</div>
                      <div className="font-extrabold text-amber-700 mt-0.5">
                        {adjustmentPreview.curReserved}
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-[#C6B7E2]/20">
                      <div className="text-[#3B1C5A]/50 text-[10px] uppercase font-bold">Available</div>
                      <div className="font-black text-[#3B1C5A] mt-0.5">
                        {adjustmentPreview.curAvailable} →{' '}
                        <span className="text-emerald-700">{adjustmentPreview.newAvailable}</span>
                      </div>
                    </div>
                  </div>

                  {adjustmentPreview.error && (
                    <div className="text-xs text-rose-600 font-semibold flex items-center space-x-1.5 pt-1">
                      <AlertOctagon className="w-4 h-4 shrink-0" />
                      <span>{adjustmentPreview.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier delivery, damaged in warehouse, RMA return..."
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                  Notes / References (Optional)
                </label>
                <textarea
                  rows="2"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="PO number, carrier info, or inspection notes..."
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  className="px-4 py-2 text-sm font-semibold text-[#3B1C5A]/70 hover:bg-[#F6F1E8] rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust || !adjustmentPreview?.isValid || !adjustQuantity}
                  className="px-5 py-2.5 bg-[#3B1C5A] hover:bg-[#3B1C5A]/90 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center space-x-2"
                >
                  {isSubmittingAdjust && <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />}
                  <span>Save Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOW STOCK THRESHOLD MODAL */}
      {/* ========================================================================= */}
      {thresholdModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#C6B7E2]/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <h3 className="text-lg font-extrabold text-[#3B1C5A]">Set Reorder Threshold</h3>
              <button
                onClick={() => setThresholdModalItem(null)}
                className="p-1.5 hover:bg-[#F6F1E8] rounded-xl text-[#3B1C5A]/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#3B1C5A]/70">
              Trigger a low-stock alert when available quantity drops at or below this value.
            </p>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                  Threshold (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  className="w-full px-4 py-2.5 text-base font-bold bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setThresholdModalItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-[#3B1C5A]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThreshold}
                  className="px-5 py-2.5 bg-[#3B1C5A] text-white font-bold text-sm rounded-2xl shadow-sm transition-all"
                >
                  {isSubmittingThreshold ? 'Saving...' : 'Update Threshold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD VARIANT MODAL */}
      {/* ========================================================================= */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#C6B7E2]/40 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div>
                <h3 className="text-lg font-extrabold text-[#3B1C5A]">Add Variant</h3>
                <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
                  Adding to {variantModalProduct.name}
                </p>
              </div>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="p-1.5 hover:bg-[#F6F1E8] rounded-xl text-[#3B1C5A]/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVariant} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Variant Name (e.g., Size, Color, Weight) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={variantForm.name}
                    onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                    placeholder="e.g. Large / Navy Blue or 500g"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Variant SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={variantForm.barcode}
                    onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })}
                    placeholder="UPC / EAN"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantForm.costPrice}
                    onChange={(e) => setVariantForm({ ...variantForm, costPrice: e.target.value })}
                    placeholder="For valuation"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Initial Physical Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variantForm.physicalStock}
                    onChange={(e) => setVariantForm({ ...variantForm, physicalStock: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-bold bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variantForm.lowStockThreshold}
                    onChange={(e) => setVariantForm({ ...variantForm, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFAF6] border border-[#C6B7E2]/40 rounded-2xl text-[#3B1C5A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setVariantModalProduct(null)}
                  className="px-4 py-2 text-sm font-semibold text-[#3B1C5A]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVariant}
                  className="px-5 py-2.5 bg-[#3B1C5A] text-white font-bold text-sm rounded-2xl shadow-sm transition-all"
                >
                  {isSubmittingVariant ? 'Creating...' : 'Create Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STOCK MOVEMENTS AUDIT HISTORY DRAWER */}
      {/* ========================================================================= */}
      {showMovementsDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#C6B7E2]/40 flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 bg-[#F6F1E8] border-b border-[#C6B7E2]/30 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#3B1C5A] text-[#E6B44C] rounded-2xl">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#3B1C5A]">Stock Movement Audit Log</h2>
                    <p className="text-xs text-[#3B1C5A]/60">
                      Append-only ledger of every inventory adjustment and order event.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMovementsDrawer(false)}
                  className="p-2 hover:bg-black/5 rounded-xl text-[#3B1C5A]/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Movement Type Filter */}
              <div className="p-4 border-b border-[#C6B7E2]/20 flex items-center justify-between bg-[#FCFAF6] shrink-0">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-[#3B1C5A]/50" />
                  <select
                    value={movementFilterType}
                    onChange={(e) => {
                      setMovementFilterType(e.target.value);
                      setMovementPage(1);
                    }}
                    className="text-xs font-semibold bg-white border border-[#C6B7E2]/40 rounded-xl px-2.5 py-1.5 text-[#3B1C5A] focus:outline-none"
                  >
                    <option value="all">All Events</option>
                    <option value="stock_received">Stock Received (+)</option>
                    <option value="damage_loss">Damage / Loss (-)</option>
                    <option value="correction">Recount Correction</option>
                    <option value="return_restock">Customer Return (+)</option>
                    <option value="order_reservation">Order Reservation</option>
                    <option value="order_fulfilled">Order Dispatched / Fulfilled</option>
                    <option value="order_release">Order Released / Cancelled</option>
                    <option value="initial_setup">Initial Setup</option>
                  </select>
                </div>

                <button
                  onClick={fetchMovements}
                  className="text-xs font-bold text-[#3B1C5A] hover:underline"
                >
                  Refresh Log
                </button>
              </div>

              {/* Movements List Table */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {movementsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E6B44C]" />
                    <span className="text-xs text-[#3B1C5A]/60 font-medium">Loading audit history...</span>
                  </div>
                ) : movements.length === 0 ? (
                  <div className="py-20 text-center text-sm text-[#3B1C5A]/50">
                    No stock movements recorded yet.
                  </div>
                ) : (
                  movements.map((mov) => {
                    const isPositive = mov.quantityChange > 0;
                    const isNeutral = mov.quantityChange === 0;

                    return (
                      <div
                        key={mov.id}
                        className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#C6B7E2]/25 shadow-sm space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                                mov.movementType === 'stock_received' || mov.movementType === 'return_restock'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : mov.movementType === 'damage_loss'
                                  ? 'bg-rose-100 text-rose-800'
                                  : mov.movementType === 'order_reservation'
                                  ? 'bg-amber-100 text-amber-800'
                                  : mov.movementType === 'order_fulfilled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {mov.movementType.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-gray-500 font-semibold">{mov.sku}</span>
                          </div>

                          <div className="font-mono text-xs font-black">
                            {isPositive ? (
                              <span className="text-emerald-700 font-bold">+{mov.quantityChange}</span>
                            ) : isNeutral ? (
                              <span className="text-gray-500">0</span>
                            ) : (
                              <span className="text-rose-700 font-bold">{mov.quantityChange}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-[#3B1C5A]">
                            {mov.product?.name || 'Item'}
                          </span>
                          {mov.variant?.name && (
                            <span className="text-[#3B1C5A]/70 ml-1">• {mov.variant.name}</span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#3B1C5A]/80 font-medium">
                          {mov.reason}
                          {mov.notes ? ` — "${mov.notes}"` : ''}
                        </div>

                        <div className="pt-2 border-t border-[#C6B7E2]/20 flex items-center justify-between text-[10px] text-[#3B1C5A]/50">
                          <div>
                            Physical: {mov.physicalStockBefore} → {mov.physicalStockAfter} | Avail:{' '}
                            {mov.availableBefore} → {mov.availableAfter}
                          </div>
                          <div>
                            {new Date(mov.createdAt).toLocaleString()} by{' '}
                            {mov.actor ? `${mov.actor.firstName || mov.actor.email}` : 'System'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Movements Pagination Footer */}
              {!movementsLoading && movements.length > 0 && movementTotalPages > 1 && (
                <div className="p-4 border-t border-[#C6B7E2]/30 bg-[#F6F1E8] flex items-center justify-between text-xs shrink-0">
                  <button
                    disabled={movementPage <= 1}
                    onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-white border border-[#C6B7E2]/40 rounded-xl font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="font-medium text-[#3B1C5A]/70">
                    Page {movementPage} of {movementTotalPages}
                  </span>
                  <button
                    disabled={movementPage >= movementTotalPages}
                    onClick={() => setMovementPage((p) => Math.min(movementTotalPages, p + 1))}
                    className="px-3 py-1.5 bg-white border border-[#C6B7E2]/40 rounded-xl font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantInventoryPage;

