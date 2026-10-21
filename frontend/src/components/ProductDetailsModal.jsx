import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Store, Tag, Package, CheckCircle2, AlertTriangle, ExternalLink, Edit3, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ContactMerchantModal } from './ContactMerchantModal';

export const ProductDetailsModal = ({ product, isOpen, onClose, onToggleWishlist, isWishlisted }) => {
  const { isMerchant } = useAuth();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  if (!isOpen || !product) return null;

  const numericPrice = parseFloat(product.price);
  const numericComparePrice = parseFloat(product.compareAtPrice);
  const formattedPrice = !isNaN(numericPrice)
    ? `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : product.price;

  const formattedComparePrice = product.compareAtPrice && !isNaN(numericComparePrice)
    ? `₹${numericComparePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const hasStock = product.stockQuantity > 0;
  const isLowStock = hasStock && product.stockQuantity <= (product.lowStockThreshold || 5);

  let imageUrl = null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
    } catch {
      if (product.images.trim()) imageUrl = product.images;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-sm">
      <div className="clay-card w-full max-w-2xl bg-white p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#C6B7E2]/40 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {product.category?.name && (
                <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              {product.business?.name && (
                isMerchant ? (
                  <span className="clay-pill px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 text-[#3B1C5A]">
                    <Store className="w-3 h-3 text-[#E6B44C]" />
                    <span>{product.business.name}</span>
                  </span>
                ) : (
                  <Link
                    to={`/customer/stores/${product.businessId || product.business?.id}`}
                    onClick={onClose}
                    className="clay-pill px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 hover:text-[#40205E] transition-colors"
                    title={`Visit ${product.business.name}'s dedicated storefront`}
                  >
                    <Store className="w-3 h-3 text-[#E6B44C]" />
                    <span className="underline">{product.business.name}</span>
                  </Link>
                )
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B1C5A] tracking-tight font-serif">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 space-y-5 text-sm text-[#3B1C5A]/80 leading-relaxed pr-1">
          {/* Product Image preview or placeholder */}
          <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] flex items-center justify-center relative border border-[#C6B7E2]/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex flex-col items-center justify-center p-6 text-center ${imageUrl ? 'hidden' : ''}`}>
              <div className="w-16 h-16 rounded-2xl bg-white/80 clay-card flex items-center justify-center text-[#3B1C5A] mb-3">
                <Package className="w-8 h-8 text-[#E6B44C]" />
              </div>
              <span className="font-serif font-bold text-lg text-[#3B1C5A]">{product.name}</span>
              <span className="text-xs text-[#3B1C5A]/60 mt-1">Verified Bizora Merchant Product</span>
            </div>
          </div>

          {/* Pricing & Stock Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#3B1C5A]">{formattedPrice}</span>
                {formattedComparePrice && (
                  <span className="text-sm text-[#3B1C5A]/50 line-through">
                    {formattedComparePrice}
                  </span>
                )}
              </div>
              {product.sku && (
                <span className="text-[11px] font-mono text-[#3B1C5A]/60">SKU: {product.sku}</span>
              )}
            </div>

            <div>
              {hasStock ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    In Stock {product.stockQuantity !== undefined ? `(${product.stockQuantity} available)` : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Currently Out of Stock</span>
                </div>
              )}
              {isLowStock && (
                <span className="text-[10px] text-amber-700 font-bold block mt-1 text-right">
                  Only a few units remaining!
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#3B1C5A]/60 mb-2">Description</h4>
            <p className="text-sm leading-relaxed text-[#3B1C5A]/80 whitespace-pre-line">
              {product.description || 'No detailed description provided by the merchant yet.'}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#C6B7E2]/30 flex items-center justify-between shrink-0">
          {!isMerchant && onToggleWishlist && (
            <button
              onClick={() => onToggleWishlist(product)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isWishlisted
                  ? 'clay-pill text-rose-600 border-rose-200 font-bold'
                  : 'clay-btn-secondary'
              }`}
            >
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {!isMerchant && (
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="clay-pill px-3.5 py-2 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#C6B7E2]/50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>Contact Merchant</span>
              </button>
            )}

            {isMerchant ? (
              <Link
                to={`/merchant/products/${product.id}/edit`}
                onClick={onClose}
                className="clay-pill px-4 py-2 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Edit Product</span>
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to={`/customer/products/${product.id}`}
                onClick={onClose}
                className="clay-pill px-4 py-2 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Full Product Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={onClose}
              className="clay-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Contact Merchant Modal */}
      <ContactMerchantModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        businessId={product.businessId || product.business?.id}
        businessName={product.business?.name || 'Merchant'}
        productId={product.id}
        productName={product.name}
        productImage={imageUrl}
        productPrice={numericPrice}
      />
    </div>
  );
};

export default ProductDetailsModal;

