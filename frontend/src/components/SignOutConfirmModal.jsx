import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

/**
 * SignOutConfirmModal
 * A polished confirmation modal dialog asking:
 * "Are you sure you want to sign out?"
 *
 * Uses React createPortal to mount directly into document.body.
 * This ensures the modal is ALWAYS rendered in the absolute center
 * of the viewport/page regardless of parent container CSS transforms,
 * filters, or sidebar widths.
 *
 * Brand Palette:
 * - Deep Purple: #3B1C5A (header, primary action)
 * - Lavender: #F0EAFB / #C6B7E2 (accent surface, borders)
 * - Gold: #E6B44C (icon highlight)
 */
export default function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSigningOut = false,
  title = 'Are you sure you want to sign out?',
  description = 'You will be signed out of your current session on this device. You can sign back in anytime with your credentials.',
  confirmText = 'Yes, Sign Out'
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSigningOut, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
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
      onClick={!isSigningOut ? onClose : undefined}
    >
      <div
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#C6B7E2]/70 animate-in zoom-in-95 duration-200 space-y-5 text-left relative mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-full text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAFB] border-2 border-[#C6B7E2]/60 flex items-center justify-center text-[#3B1C5A] shrink-0 shadow-xs">
            <LogOut className="w-5 h-5 text-[#3B1C5A]" />
          </div>
          <div>
            <h3 id="signout-modal-title" className="text-lg font-bold text-[#3B1C5A] leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[#79688A] mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#C6B7E2]/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isSigningOut}
            className="clay-btn-secondary px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:bg-[#FAF7F2] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSigningOut}
            className="px-6 py-2.5 rounded-full bg-[#3B1C5A] hover:bg-[#2E1546] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isSigningOut ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
