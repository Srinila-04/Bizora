import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import {
  getCodReconciliation,
  recordCodCollection
} from '../services/order.service';
import { Pagination } from './Pagination';

export const MerchantCodReconciliation = ({ businessId, businessName }) => {
  const [data, setData] = useState({ summary: {}, orders: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick collection modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Copy helper
  const [copiedId, setCopiedId] = useState(null);
  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const loadReconciliation = useCallback(async (page = 1, limit = pagination.limit || 10) => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCodReconciliation(businessId, { page, limit });
      setData(res || { summary: {}, orders: [] });
      setPagination(res?.pagination || { page, limit, total: res?.orders?.length || 0, totalPages: 1 });
    } catch (err) {
      console.error('[CodReconciliation] Error:', err);
      setError(err.response?.data?.message || 'Failed to load COD reconciliation data.');
    } finally {
      setLoading(false);
    }
  }, [businessId, pagination.limit]);

  useEffect(() => {
    loadReconciliation(1);
  }, [loadReconciliation]);

  const openCollectModal = (order) => {
    setSelectedOrder(order);
    setNotesInput('Cash on Delivery verified and received at store/hub.');
    setActionError('');
  };

  const handleConfirmCollection = async (collectionStatus) => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await recordCodCollection(selectedOrder.id, {
        collectionStatus,
        notes: notesInput.trim()
      });
      setSelectedOrder(null);
      await loadReconciliation();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to record collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = data.summary || {};
  const orders = data.orders || [];

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="clay-card p-5 sm:p-6 bg-white/90 space-y-2 border border-[#C6B7E2]/40">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-amber-600" />
          <h3 className="text-xl font-extrabold text-[#3B1C5A]">
            Cash on Delivery (COD) Reconciliation & Cash Ledger
          </h3>
        </div>
        <p className="text-xs text-[#79688A] leading-relaxed max-w-2xl">
          Track and reconcile offline cash collected for <strong>{businessName}</strong>. For compliance and accounting integrity, cash collected by riders must be explicitly verified before updating an order to PAID.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5 bg-white/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#79688A] block mb-1">
            Total COD Bookings
          </span>
          <span className="text-2xl font-extrabold text-[#3B1C5A] block">
            ₹{Number(summary.totalCodAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-[#79688A]">
            {summary.totalCodOrders || 0} order{summary.totalCodOrders !== 1 ? 's' : ''} placed
          </span>
        </div>

        <div className="clay-card p-5 bg-white/80 border-emerald-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Cash Collected & Verified
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 block">
            ₹{Number(summary.collectedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-emerald-800">
            {summary.collectedCount || 0} order{summary.collectedCount !== 1 ? 's' : ''} safely collected
          </span>
        </div>

        <div className="clay-card p-5 bg-white/80 border-amber-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
            Outstanding / In-Transit Cash
          </span>
          <span className="text-2xl font-extrabold text-amber-800 block">
            ₹{Number(summary.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-amber-900">
            {summary.pendingCount || 0} payment{summary.pendingCount !== 1 ? 's' : ''} awaiting collection
          </span>
        </div>

        <div className="clay-card p-5 bg-white/80 border-rose-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
            Failed Collections
          </span>
          <span className="text-2xl font-extrabold text-rose-700 block">
            ₹{Number(summary.failedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-rose-800">
            {summary.failedCount || 0} delivery attempt{summary.failedCount !== 1 ? 's' : ''} failed
          </span>
        </div>
      </div>

      {/* COD Orders Table */}
      <div className="clay-card p-5 sm:p-6 bg-white/90 space-y-4 border border-[#C6B7E2]/40">
        <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
          <h4 className="font-extrabold text-base text-[#3B1C5A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>COD Orders Ledger ({orders.length})</span>
          </h4>
          <button
            type="button"
            onClick={loadReconciliation}
            className="clay-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#3B1C5A] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#79688A]">Loading COD ledger...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2 border border-rose-200 rounded-2xl bg-rose-50/50">
            <AlertCircle className="w-7 h-7 text-rose-500 mx-auto" />
            <p className="text-xs font-bold text-rose-800">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <DollarSign className="w-10 h-10 text-[#C6B7E2] mx-auto" />
            <h5 className="font-bold text-sm text-[#3B1C5A]">No Cash on Delivery Orders</h5>
            <p className="text-xs text-[#79688A] max-w-sm mx-auto">
              Your store has not received any Cash on Delivery orders yet. Orders placed with COD will appear here for reconciliation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#C6B7E2]/30 text-[11px] font-bold text-[#79688A] uppercase tracking-wider">
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Order Status</th>
                  <th className="py-3 px-2">Amount Due</th>
                  <th className="py-3 px-2">Collection Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C6B7E2]/20">
                {orders.map((order) => {
                  const codStatus = order.payment?.codStatus || 'pending';
                  const isPaid = order.paymentStatus === 'paid' || codStatus === 'collected';

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-[#3B1C5A]">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.orderNumber)}
                            className="p-1 rounded text-[#79688A] hover:text-[#3B1C5A]"
                          >
                            {copiedId === order.orderNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-[#79688A]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3 px-2 font-medium text-[#3B1C5A]">
                        <div>
                          <span>
                            {order.shippingAddress?.recipientName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer'}
                          </span>
                          {order.shippingAddress?.phone && (
                            <span className="block text-[10px] text-[#79688A]">{order.shippingAddress.phone}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EAFB] text-[#3B1C5A] capitalize">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-extrabold text-[#3B1C5A]">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-2">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>COLLECTED</span>
                          </span>
                        ) : codStatus === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>FAILED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right">
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => openCollectModal(order)}
                            className="clay-btn-primary px-3 py-1 text-[11px] font-bold cursor-pointer"
                          >
                            Confirm Collected
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Standardized COD Pagination */}
        {pagination.total > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(newPage) => loadReconciliation(newPage, pagination.limit)}
              onPageSizeChange={(newSize) => {
                setPagination((prev) => ({ ...prev, limit: newSize }));
                loadReconciliation(1, newSize);
              }}
              pageSizeOptions={[10, 25, 50]}
              showPageSizeSelector={true}
              itemName="COD orders"
              ariaLabel="Cash on Delivery Ledger Pagination"
            />
          </div>
        )}
      </div>

      {/* Quick Collect Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#3B1C5A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="clay-card max-w-md w-full bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <h4 className="font-extrabold text-base text-[#3B1C5A]">Confirm COD Collection</h4>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-[#79688A] hover:text-[#3B1C5A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#79688A]">Order Reference:</span>
                <span className="font-mono font-bold text-[#3B1C5A]">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#3B1C5A] pt-2 border-t border-amber-200/60">
                <span>Exact Cash Collected:</span>
                <span className="text-amber-900">
                  ₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-[11px] font-bold uppercase text-[#3B1C5A]/70">
                Verification Notes:
              </label>
              <textarea
                rows="2"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="clay-input w-full px-3.5 py-2 rounded-xl border border-[#C6B7E2]/50 text-xs text-[#3B1C5A] focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="clay-btn-secondary px-3.5 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConfirmCollection('collected')}
                className="clay-btn-primary px-4 py-2 font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Cash Received'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantCodReconciliation;

