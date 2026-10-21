import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Store,
  Package,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { startConversation } from '../services/chat.service';

export const ContactMerchantModal = ({
  isOpen,
  onClose,
  businessId = null,
  businessName = 'Merchant',
  productId = null,
  productName = null,
  productImage = null,
  productPrice = null,
  orderId = null
}) => {
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [createdConversation, setCreatedConversation] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WEBP, and GIF images are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image attachment must not exceed 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setAttachmentFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && !attachmentFile) {
      setError('Please provide a message or an image attachment.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const conv = await startConversation({
        businessId,
        productId,
        orderId,
        message: trimmed || null,
        attachment: attachmentFile || null
      });

      setCreatedConversation(conv);
    } catch (err) {
      console.error('Failed to contact merchant:', err);
      // Preserve message text on failure!
      setError(
        err.response?.data?.message || 'Failed to send inquiry. Your text has been preserved.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleGoToConversation = () => {
    if (createdConversation) {
      onClose();
      navigate(`/customer/account?tab=messages&conversationId=${createdConversation.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/50 backdrop-blur-xs">
      <div className="clay-card w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#C6B7E2]/50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#C6B7E2]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif">
                Contact {businessName}
              </h3>
              <p className="text-xs text-[#3B1C5A]/60">
                Direct in-app messaging with the merchant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In State */}
        {!user ? (
          <div className="py-6 text-center space-y-4">
            <Store className="w-12 h-12 text-[#E6B44C] mx-auto opacity-80" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#3B1C5A]">Sign In Required</h4>
              <p className="text-xs text-[#3B1C5A]/70 max-w-xs mx-auto">
                Please log in to your Bizora customer account to send direct messages to independent merchants.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="clay-btn-primary px-5 py-2 text-xs font-bold"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={onClose}
                className="clay-btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : createdConversation ? (
          /* Success confirmation state */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-[#3B1C5A]">Message Delivered!</h4>
              <p className="text-xs text-[#3B1C5A]/70 max-w-sm mx-auto">
                Your inquiry has been sent to <span className="font-bold">{businessName}</span>. You can track replies anytime in your Customer Account.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleGoToConversation}
                className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Open Full Conversation</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E6B44C]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="clay-btn-secondary px-4 py-2.5 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSendMessage} className="space-y-4">
            {/* Product context card if discussing a product */}
            {productName && (
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 flex items-center gap-3">
                {productImage && (
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-12 h-12 object-cover rounded-xl border border-[#C6B7E2]/30 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#E6B44C] uppercase tracking-wider block">
                    Regarding Product
                  </span>
                  <p className="text-xs font-bold text-[#3B1C5A] truncate">{productName}</p>
                  {productPrice && (
                    <p className="text-[11px] font-semibold text-[#3B1C5A]/70">
                      ₹{parseFloat(productPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Attachment Preview */}
            {attachmentPreview && (
              <div className="relative inline-flex items-center gap-2 p-2 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/50">
                <img
                  src={attachmentPreview}
                  alt="Attachment Preview"
                  className="w-12 h-12 object-cover rounded-xl border border-[#C6B7E2]/30"
                />
                <div className="text-xs pr-6">
                  <p className="font-bold text-[#3B1C5A] max-w-[150px] truncate">
                    {attachmentFile?.name}
                  </p>
                  <p className="text-[10px] text-[#3B1C5A]/60">
                    {(attachmentFile?.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Textarea */}
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about product details, availability, custom requests, or shipping..."
                rows={4}
                maxLength={2000}
                required={!attachmentFile}
                className="clay-input w-full p-3.5 text-xs sm:text-sm bg-white rounded-2xl border-2 border-[#C6B7E2]/60 focus:border-[#3B1C5A] resize-none"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-[#3B1C5A]/40 font-medium">
                {message.length} / 2000
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSelectAttachment}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="clay-btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                title="Attach an image related to product or inquiry (max 5MB)"
              >
                <Paperclip className="w-4 h-4 text-[#3B1C5A]" />
                <span>Attach Photo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || (!message.trim() && !attachmentFile)}
                  className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5 text-[#E6B44C]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactMerchantModal;

