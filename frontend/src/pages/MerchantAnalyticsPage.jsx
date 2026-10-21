import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import AnimatedSalesTrendGraph, { formatINR } from '../components/AnimatedSalesTrendGraph';
import {
  BarChart3,
  Store,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Sparkles,
  HelpCircle,
  Package
} from 'lucide-react';

const DATE_RANGE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' }
];

export const MerchantAnalyticsPage = () => {
  const { user, businesses, selectedBusiness, switchBusiness } = useAuth();

  // Filter States
  const [selectedRange, setSelectedRange] = useState('7d');
  const [granularity, setGranularity] = useState('daily');
  const [showComparison, setShowComparison] = useState(true);

  // Custom Date Range State
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Automatically adjust default granularity when range changes
  const handleRangeChange = (rangeId) => {
    setSelectedRange(rangeId);
    if (rangeId === 'today' || rangeId === 'yesterday') {
      setGranularity('hourly');
    } else if (rangeId === '7d' || rangeId === '30d' || rangeId === 'this_month') {
      setGranularity('daily');
    } else if (rangeId === 'last_month') {
      setGranularity('daily');
    }
  };

  // Fetch Analytics Data for currently selected business
  const fetchAnalytics = useCallback(async () => {
    if (!selectedBusiness?.id) return;

    setLoading(true);
    setError(null);

    try {
      let url = `/businesses/${selectedBusiness.id}/analytics?range=${selectedRange}&granularity=${granularity}`;

      if (selectedRange === 'custom') {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const res = await api.get(url);
      if (res.data?.success) {
        setAnalyticsData(res.data.data.analytics);
      } else {
        setError('Failed to load analytics data.');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Unable to load analytics. Please ensure your session is active.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, selectedRange, granularity, customStartDate, customEndDate]);

  // Refetch when business or main query parameters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analyticsData?.summary;
  const comparison = summary?.comparison;
  const trend = analyticsData?.trend || [];
  const bestSelling = analyticsData?.bestSellingProducts || [];
  const statusBreakdown = analyticsData?.orderStatusBreakdown || {};

  return (
    <div className="w-full min-h-screen bg-[#FCFAF6] text-[#3B1C5A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER & BUSINESS SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F6F1E8] p-5 sm:p-6 rounded-3xl border border-[#C6B7E2]/30 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#3B1C5A] text-[#E6B44C] rounded-2xl shadow-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3B1C5A]">
                  Sales & Analytics
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#3B1C5A]/70">
              Live performance metrics, sales trend curves, payment collections, and product insights for your store.
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

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              title="Refresh sales analytics"
              className="p-2.5 bg-white hover:bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/50 rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E6B44C]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. FILTER CONTROLS BAR (Date Range Pills, Custom Inputs, Granularity & Comparison Toggle) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Preset Range Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/50 mr-1 hidden sm:inline-block">
                Period:
              </span>
              {DATE_RANGE_PRESETS.map((preset) => {
                const isActive = selectedRange === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleRangeChange(preset.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#3B1C5A] text-[#E6B44C] shadow-md shadow-[#3B1C5A]/15 scale-100'
                        : 'bg-[#F6F1E8] text-[#3B1C5A]/80 hover:bg-[#C6B7E2]/30'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Granularity & Comparison Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Granularity Selector */}
              <div className="flex items-center bg-[#F6F1E8] p-1 rounded-xl border border-[#C6B7E2]/30">
                <span className="text-[11px] font-bold text-[#3B1C5A]/60 px-2">Group by:</span>
                {['hourly', 'daily', 'weekly', 'monthly'].map((gran) => {
                  const isActive = granularity === gran;
                  // Disable hourly if range is longer than 7 days
                  const isHourlyDisabled = gran === 'hourly' && ['30d', 'last_month'].includes(selectedRange);
                  // Disable monthly if range is today/yesterday/7d
                  const isMonthlyDisabled = gran === 'monthly' && ['today', 'yesterday', '7d'].includes(selectedRange);

                  if (isHourlyDisabled || isMonthlyDisabled) return null;

                  return (
                    <button
                      key={gran}
                      onClick={() => setGranularity(gran)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        isActive
                          ? 'bg-white text-[#3B1C5A] shadow-sm font-bold'
                          : 'text-[#3B1C5A]/70 hover:text-[#3B1C5A]'
                      }`}
                    >
                      {gran}
                    </button>
                  );
                })}
              </div>

              {/* Comparison Checkbox Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer bg-[#F6F1E8] px-3 py-1.5 rounded-xl border border-[#C6B7E2]/30 hover:bg-[#C6B7E2]/20 transition-colors">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="rounded text-[#3B1C5A] focus:ring-[#E6B44C] h-4 w-4"
                />
                <span className="text-xs font-bold text-[#3B1C5A]">Show Previous Period</span>
              </label>
            </div>
          </div>

          {/* Inline Custom Date Inputs (only when Custom Range is active) */}
          {selectedRange === 'custom' && (
            <div className="pt-3 border-t border-[#C6B7E2]/20 flex flex-wrap items-center gap-4 bg-[#FCFAF6] p-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#3B1C5A]/70">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#C6B7E2]/40 rounded-xl text-xs font-semibold text-[#3B1C5A] focus:outline-none focus:border-[#3B1C5A]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#3B1C5A]/70">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#C6B7E2]/40 rounded-xl text-xs font-semibold text-[#3B1C5A] focus:outline-none focus:border-[#3B1C5A]"
                />
              </div>

              <button
                onClick={fetchAnalytics}
                className="px-4 py-1.5 bg-[#3B1C5A] text-white hover:bg-[#3B1C5A]/90 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>

        {/* 3. SIX CLAYMORPHISM METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Card 1: Net Sales */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Net Sales</span>
              <div className="p-2 bg-[#F6F1E8] text-[#3B1C5A] rounded-xl">
                <DollarSign className="w-4 h-4 text-[#3B1C5A]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#3B1C5A]">
                {loading ? '...' : formatINR(summary?.netSales || 0)}
              </div>
              {comparison && showComparison && (
                <div className="flex items-center mt-1 text-[11px] font-semibold">
                  {comparison.salesGrowth >= 0 ? (
                    <span className="text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +{comparison.salesGrowth}%
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {comparison.salesGrowth}%
                    </span>
                  )}
                  <span className="text-[#3B1C5A]/50 ml-1">vs prev</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Gross Sales */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Gross Sales</span>
              <div className="p-2 bg-[#F6F1E8] text-[#3B1C5A] rounded-xl">
                <ShoppingBag className="w-4 h-4 text-[#3B1C5A]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#3B1C5A]">
                {loading ? '...' : formatINR(summary?.grossSales || 0)}
              </div>
              <p className="text-[11px] text-[#3B1C5A]/50 mt-1">Pre-discount order total</p>
            </div>
          </div>

          {/* Card 3: Verified Collections */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Collected Funds</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-700">
                {loading ? '...' : formatINR(summary?.verifiedCollections || 0)}
              </div>
              <p className="text-[11px] text-[#3B1C5A]/50 mt-1">Online paid & COD collected</p>
            </div>
          </div>

          {/* Card 4: COD Pending Collection */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">COD Pending</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-700">
                {loading ? '...' : formatINR(summary?.codPendingCollection || 0)}
              </div>
              <p className="text-[11px] text-[#3B1C5A]/50 mt-1">Dispatched/Awaiting cash</p>
            </div>
          </div>

          {/* Card 5: Total Orders */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Total Orders</span>
              <div className="p-2 bg-[#F6F1E8] text-[#3B1C5A] rounded-xl">
                <Package className="w-4 h-4 text-[#3B1C5A]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#3B1C5A]">
                {loading ? '...' : (summary?.totalOrders || 0)}
              </div>
              {comparison && showComparison && (
                <div className="flex items-center mt-1 text-[11px] font-semibold">
                  {comparison.ordersGrowth >= 0 ? (
                    <span className="text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +{comparison.ordersGrowth}%
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {comparison.ordersGrowth}%
                    </span>
                  )}
                  <span className="text-[#3B1C5A]/50 ml-1">vs prev</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Average Order Value (AOV) */}
          <div className="bg-white p-5 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">Avg. Order Value</span>
              <div className="p-2 bg-[#F6F1E8] text-[#E6B44C] rounded-xl">
                <Sparkles className="w-4 h-4 text-[#E6B44C]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#3B1C5A]">
                {loading ? '...' : formatINR(summary?.averageOrderValue || 0)}
              </div>
              <p className="text-[11px] text-[#3B1C5A]/50 mt-1">Per active order</p>
            </div>
          </div>
        </div>

        {/* 4. MAIN ANIMATED SALES TREND GRAPH SECTION */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#C6B7E2]/30 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold tracking-tight text-[#3B1C5A]">
                  Sales Trend & Revenue Curve
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E6B44C]/20 text-[#3B1C5A]">
                  {selectedRange.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#3B1C5A]/60 mt-1">
                Real-time animated timeline of store revenue. Hover or touch along the curve to inspect individual data points.
              </p>
            </div>

            {/* Quick Summary Pill in Chart Header */}
            {summary && (
              <div className="flex items-center bg-[#F6F1E8] px-4 py-2 rounded-2xl border border-[#C6B7E2]/30 self-start sm:self-auto">
                <span className="text-xs text-[#3B1C5A]/70 mr-2 font-medium">Period Net:</span>
                <span className="text-sm font-extrabold text-[#3B1C5A]">
                  {formatINR(summary.netSales || 0)}
                </span>
              </div>
            )}
          </div>

          {/* The Animated SVG Graph */}
          <div className="pt-2">
            <AnimatedSalesTrendGraph
              trend={trend}
              currencySymbol="₹"
              showComparison={showComparison}
              loading={loading}
              error={error}
              onRetry={fetchAnalytics}
              granularity={granularity}
              range={selectedRange}
            />
          </div>
        </div>

        {/* 5. PERFORMANCE INSIGHTS (Best-Selling Products & Order Status Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1 & 2: Top Best-Selling Products */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#C6B7E2]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#3B1C5A]">
                  Best-Selling Products
                </h3>
                <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
                  Top performing items ordered during this period
                </p>
              </div>
              <span className="text-xs font-bold text-[#E6B44C] bg-[#3B1C5A] px-3 py-1 rounded-xl">
                Top 5
              </span>
            </div>

            {bestSelling && bestSelling.length > 0 ? (
              <div className="divide-y divide-[#C6B7E2]/20">
                {bestSelling.map((prod, idx) => (
                  <div key={prod.productId || idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#F6F1E8] text-[#3B1C5A] font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#3B1C5A] truncate">
                          {prod.productName || 'Catalog Product'}
                        </div>
                        <div className="text-xs text-[#3B1C5A]/60 mt-0.5">
                          {prod.totalQuantitySold} {prod.totalQuantitySold === 1 ? 'unit sold' : 'units sold'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[#3B1C5A]">
                        {formatINR(prod.totalProductRevenue)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Revenue Contribution
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F6F1E8] text-[#3B1C5A]/40 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#3B1C5A]">No product sales recorded yet</p>
                <p className="text-xs text-[#3B1C5A]/60 mt-1 max-w-xs">
                  Once customer orders are confirmed, top selling items will appear in this leaderboard.
                </p>
              </div>
            )}
          </div>

          {/* Column 3: Order Status & Financial Ledger Summary */}
          <div className="bg-white p-6 rounded-3xl border border-[#C6B7E2]/30 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#3B1C5A]">
                Fulfillment Status
              </h3>
              <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
                Breakdown of orders in the selected period
              </p>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'Delivered', key: 'delivered', color: 'bg-emerald-500', text: 'text-emerald-700' },
                  { label: 'Processing / Packed', key: 'processing', color: 'bg-blue-500', text: 'text-blue-700' },
                  { label: 'Shipped', key: 'shipped', color: 'bg-indigo-500', text: 'text-indigo-700' },
                  { label: 'Pending Payment/Review', key: 'pending', color: 'bg-amber-500', text: 'text-amber-700' },
                  { label: 'Cancelled / Refunded', key: 'cancelled', color: 'bg-rose-500', text: 'text-rose-700' }
                ].map((item) => {
                  const count = statusBreakdown[item.key] || 0;
                  const total = summary?.allOrdersCount || 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#3B1C5A]/80">{item.label}</span>
                        <span className={item.text}>{count} orders ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F6F1E8] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Ledger Mini-Card */}
            <div className="p-4 bg-[#F6F1E8] rounded-2xl border border-[#C6B7E2]/30 space-y-2 text-xs">
              <div className="font-extrabold text-[#3B1C5A] uppercase tracking-wider text-[10px]">
                Financial Summary
              </div>
              <div className="flex items-center justify-between text-[#3B1C5A]/70">
                <span>Gross Revenue:</span>
                <span className="font-bold text-[#3B1C5A]">{formatINR(summary?.grossSales || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-[#3B1C5A]/70">
                <span>Discounts Given:</span>
                <span className="font-bold text-rose-600">-{formatINR(summary?.discountAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-[#3B1C5A]/70">
                <span>Refunds / Returns:</span>
                <span className="font-bold text-rose-600">-{formatINR(summary?.refundAmount || 0)}</span>
              </div>
              <div className="pt-2 border-t border-[#C6B7E2]/30 flex items-center justify-between font-extrabold text-[#3B1C5A]">
                <span>Net Store Sales:</span>
                <span className="text-sm text-[#3B1C5A]">{formatINR(summary?.netSales || 0)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MerchantAnalyticsPage;

