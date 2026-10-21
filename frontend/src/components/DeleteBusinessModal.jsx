import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, Store, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * DeleteBusinessModal
 * A confirmation dialog for deleting or archiving a merchant business.
 *
 * Prominently presents:
 * - The business name and category
 * - Clear warning about permanent removal and archival behavior for existing orders
 * - Cancel and Delete Business confirmation buttons
 * - Disabled states and spinner during deletion to prevent accidental duplicate requests
 * - Error display if the deletion request fails
 */
export const DeleteBusinessModal = ({
  isOpen,
  onClose,
  onConfirm,
  business,
  isDeleting = false,
  errorMessage = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press if not actively deleting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !mounted || !business) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-business-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#3B1C5A]/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }}
      onClick={!isDeleting ? onClose : undefined}
    >
      <div
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#C6B7E2]/70 animate-in zoom-in-95 duration-200 space-y-5 text-left relative mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close delete dialog"
          className="absolute top-4 right-4 p-2 rounded-full text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Warning Icon */}
        <div className="flex items-start space-x-4 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-business-modal-title" className="text-lg font-bold text-[#3B1C5A] leading-snug">
              Delete Business
            </h3>
            <p className="text-xs text-[#79688A] mt-1 leading-relaxed">
              Confirm storefront deletion
            </p>
          </div>
        </div>

        {/* Target Business Callout Card */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-extrabold text-[#3B1C5A] block truncate">
              {business.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#3B1C5A]/60 truncate">
                {business.category || 'Storefront'}
              </span>
              {business.slug && (
                <span className="text-[10px] font-mono text-[#3B1C5A]/50 bg-white/80 px-1.5 py-0.2 rounded border border-[#C6B7E2]/30">
                  /store/{business.slug}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warning Details */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-[#3B1C5A]/80 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Important Warning</span>
          </div>
          <p className="text-[11.5px] text-amber-900/80">
            Deleting <strong className="text-[#3B1C5A]">"{business.name}"</strong> will remove this storefront and its catalog products. If this business has past customer orders or transactions, it will be safely archived to preserve customer records. This action cannot be undone.
          </p>
        </div>

        {/* Error Alert if deletion failed */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#C6B7E2]/25">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="clay-btn-secondary px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:bg-[#FAF7F2] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting Business...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Business</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteBusinessModal;

