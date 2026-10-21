import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Store,
  Eye,
  Heart,
  Check,
  ShoppingBag,
  Sparkles,
  Tag,
  Layers,
  Cpu,
  ShieldCheck,
  Plus,
  ArrowRight,
  Award,
  Coffee
} from 'lucide-react';
import { resolveStorefrontTemplate } from '../config/storefrontTemplates';
import { normalizeCategoryKey } from '../config/categoryRegistry';
import { useCart } from '../context/CartContext';

export const ProductCard = ({
  product,
  onViewDetails,
  onToggleWishlist,
  isWishlisted,
  onSelectBusiness,
  previewStyle,
  templateStyle,
  template = null
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);

  // Safe cart context access
  let cart = null;
  try {
    cart = useCart();
  } catch (e) {
    cart = null;
  }

  // Resolve template styling
  const businessTemplate = template || resolveStorefrontTemplate(product.business);
  const layoutType =
    previewStyle === 'editorial'
      ? 'editorial-spacious'
      : previewStyle === 'detailed'
      ? 'specs-dense'
      : templateStyle === 'editorial'
      ? 'editorial-spacious'
      : templateStyle === 'detailed'
      ? 'specs-dense'
      : businessTemplate?.layoutType || 'story-boutique';

  const cardLayout = businessTemplate?.cardLayout || {};
  const tokens = businessTemplate?.tokens || {
    primary: '#3B1C5A',
    secondary: '#E6B44C',
    cardBg: 'bg-white/95',
    border: 'border-[#C6B7E2]/40',
    textPrimary: 'text-[#3B1C5A]',
    textSecondary: 'text-[#3B1C5A]/70',
    textMuted: 'text-[#3B1C5A]/50',
    fontHeading: 'font-sans font-bold',
    priceColor: 'text-[#3B1C5A]',
    btnPrimary: 'clay-pill',
    roundedCard: 'rounded-3xl',
    badgePrimary: 'clay-badge-gold'
  };

  // Extract first image if available
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

  const numericPrice = parseFloat(product.price);
  const numericComparePrice = parseFloat(product.compareAtPrice);
  const formattedPrice = !isNaN(numericPrice)
    ? `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : product.price;

  const hasDiscount =
    !isNaN(numericPrice) &&
    !isNaN(numericComparePrice) &&
    numericComparePrice > numericPrice;

  const discountPercent = hasDiscount
    ? Math.round(((numericComparePrice - numericPrice) / numericComparePrice) * 100)
    : 0;

  const formattedComparePrice = hasDiscount
    ? `₹${numericComparePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : product.compareAtPrice && !isNaN(numericComparePrice)
    ? `₹${numericComparePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const hasStockInfo = product.stockQuantity !== undefined && product.stockQuantity !== null;
  const isOutOfStock = hasStockInfo && Number(product.stockQuantity) <= 0;
  const isLowStock =
    hasStockInfo &&
    Number(product.stockQuantity) > 0 &&
    Number(product.stockQuantity) <= (product.lowStockThreshold || 5);

  const isPreview = Boolean(previewStyle);
  const productLink = `/customer/products/${product.id}`;

  const categoryKey = normalizeCategoryKey(
    product.category?.name || product.business?.category || businessTemplate?.categoryId || ''
  );

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isPreview) return;
    if (cart && cart.addToCart) {
      cart.addToCart(product, 1);
      setQuickAdded(true);
      setTimeout(() => setQuickAdded(false), 2000);
    }
  };

  const CardLink = ({ to, className, children, ...props }) => {
    if (isPreview) {
      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    }
    return (
      <Link to={to} className={className} {...props}>
        {children}
      </Link>
    );
  };

  // =========================================================================
  // LAYOUT 1: EDITORIAL SPACIOUS (Fashion, High Luxury, Designer Boutique)
  // High aspect ratio (3:4), minimal badges, size pills, spacious typography
  // =========================================================================
  if (layoutType === 'editorial-spacious') {
    const aspectClass = cardLayout.imageAspect || 'aspect-[3/4]';

    return (
      <div className={`clay-card overflow-hidden flex flex-col ${tokens.cardBg || 'bg-white/95'} border ${tokens.border || 'border-neutral-200'} hover:shadow-2xl transition-all duration-300 group ${tokens.roundedCard || 'rounded-3xl'}`}>
        {/* Editorial High-Aspect Imagery */}
        <CardLink
          to={productLink}
          className={`relative ${aspectClass} w-full bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] overflow-hidden flex items-center justify-center block cursor-pointer`}
        >
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FAF6EE] via-[#F4EFE6] to-[#EAE0D0]">
              <div className="w-16 h-16 rounded-2xl bg-white/90 clay-card flex items-center justify-center text-[#3B1C5A] shadow-xs">
                <ShoppingBag className="w-8 h-8 text-[#E6B44C]" />
              </div>
              <span className="text-xs font-serif font-bold text-[#3B1C5A]/70 mt-3 text-center">
                {product.category?.name || 'Lookbook Collection'}
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start pointer-events-none">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-xs">
              {product.category?.name || cardLayout.categoryTag || 'Editorial'}
            </span>
            {hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Fashion / Apparel Size Pill Selector Overlay on hover */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl text-[10px] text-white font-mono font-bold">
              <span className="px-1.5 py-0.5 bg-white/20 rounded">S</span>
              <span className="px-1.5 py-0.5 bg-white/20 rounded">M</span>
              <span className="px-1.5 py-0.5 bg-white/20 rounded">L</span>
              <span className="px-1.5 py-0.5 bg-white/20 rounded">XL</span>
            </div>
            <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md">
              Quick View
            </span>
          </div>

          {/* Wishlist toggle */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-3.5 right-3.5 p-2 rounded-2xl backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/85 text-slate-700 hover:text-rose-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </CardLink>

        {/* Editorial Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            {product.business?.name && (
              <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
                <Store className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <span className="truncate">{product.business.name}</span>
              </div>
            )}

            <CardLink to={productLink} className="block">
              <h3
                className={`font-serif font-black ${tokens.textPrimary || 'text-slate-900'} text-base sm:text-lg leading-snug line-clamp-2 hover:opacity-80 transition-opacity`}
                title={product.name}
              >
                {product.name}
              </h3>
            </CardLink>

            {product.description && (
              <p className={`text-xs ${tokens.textSecondary || 'text-slate-600'} line-clamp-2 leading-relaxed font-serif`}>
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className={`text-base sm:text-lg font-serif font-black ${tokens.priceColor || 'text-slate-900'}`}>
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-xs text-slate-400 line-through -mt-0.5">
                  {formattedComparePrice}
                </span>
              )}
            </div>

            <CardLink
              to={productLink}
              className={`${tokens.btnPrimary || 'clay-pill'} px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`}
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </CardLink>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYOUT 2: SPECS DENSE (Electronics, Tech Gadgets, Hardware, Garage)
  // Structured specifications, SKU code, unit inventory meter, compare tags
  // =========================================================================
  if (layoutType === 'specs-dense') {
    const aspectClass = cardLayout.imageAspect || 'aspect-[16/10]';

    return (
      <div className={`clay-card overflow-hidden flex flex-col ${tokens.cardBg || 'bg-white'} border-2 ${tokens.border || 'border-slate-300'} hover:shadow-xl transition-all duration-300 group ${tokens.roundedCard || 'rounded-2xl'}`}>
        {/* Technical Specification Bar on Card Top */}
        <div className="bg-slate-900 px-3.5 py-1.5 text-white flex items-center justify-between text-[10px] font-mono border-b border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate text-slate-300">{product.business?.name || 'Verified Tech OEM'}</span>
          </div>
          {product.sku ? (
            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono font-bold shrink-0">
              SKU: {product.sku}
            </span>
          ) : (
            <span className="text-cyan-400 font-bold shrink-0">OEM SPEC</span>
          )}
        </div>

        {/* Compact Image */}
        <CardLink
          to={productLink}
          className={`relative ${aspectClass} w-full bg-slate-950 overflow-hidden flex items-center justify-center block cursor-pointer group-hover:opacity-95 transition-opacity`}
        >
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-cyan-400">
              <Cpu className="w-10 h-10 mb-2 opacity-80" />
              <span className="text-[10px] font-mono text-slate-400">Hardware Spec</span>
            </div>
          )}

          {/* Badges container */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
            {product.category?.name && (
              <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-400/50 text-[9px] font-mono font-bold backdrop-blur-xs">
                {product.category.name}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-mono font-black shadow-xs">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist toggle */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-900/80 text-white/80 hover:text-rose-400 hover:bg-slate-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </CardLink>

        {/* Detailed Information Container */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            {/* Product Name */}
            <CardLink to={productLink} className="block">
              <h3
                className="font-mono font-black text-slate-900 text-sm leading-snug hover:text-cyan-700 line-clamp-2 transition-colors"
                title={product.name}
              >
                {product.name}
              </h3>
            </CardLink>

            {/* Structured Specifications Callout Box */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[10.5px] font-mono text-slate-600 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>Architecture:</span>
                <span className="font-bold text-slate-800">Verified OEM Grade</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fulfillment:</span>
                <span className="font-bold text-emerald-700">Direct From Merchant</span>
              </div>
            </div>

            {/* Stock Availability indicator with Units */}
            {hasStockInfo && (
              <div className="flex items-center gap-1.5 pt-0.5 font-mono text-[10px]">
                {isOutOfStock ? (
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    OUT OF STOCK (0 units)
                  </span>
                ) : isLowStock ? (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    CRITICAL: Only {product.stockQuantity} remaining
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available ({product.stockQuantity} units)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base font-mono font-black text-slate-900">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-[10px] font-mono text-slate-400 line-through -mt-0.5">
                  {formattedComparePrice}
                </span>
              )}
            </div>

            <CardLink
              to={productLink}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Inspect Specs</span>
            </CardLink>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYOUT 3: COMPACT QUICK (Grocery, Fresh Produce, Pantry, Quick Basket)
  // High-efficiency card with prominent price and 1-click Quick Add action
  // =========================================================================
  if (layoutType === 'compact-quick') {
    const aspectClass = cardLayout.imageAspect || 'aspect-square';

    return (
      <div className={`clay-card overflow-hidden flex flex-col ${tokens.cardBg || 'bg-white'} border ${tokens.border || 'border-emerald-200'} hover:shadow-lg transition-all duration-200 group ${tokens.roundedCard || 'rounded-2xl'}`}>
        {/* Square Rapid Image */}
        <CardLink
          to={productLink}
          className={`relative ${aspectClass} w-full bg-[#F0FDF4] overflow-hidden flex items-center justify-center block cursor-pointer`}
        >
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-emerald-50 text-emerald-800">
              <ShoppingBag className="w-8 h-8 text-emerald-600 mb-1" />
              <span className="text-[10px] font-bold">Fresh Item</span>
            </div>
          )}

          {/* Freshness Badge */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
              {cardLayout.categoryTag || 'Fresh'}
            </span>
          </div>

          {/* Wishlist toggle */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-md text-slate-700 hover:text-rose-600 transition-all shadow-xs"
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </CardLink>

        {/* Compact Details & Quick Basket CTA */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <CardLink to={productLink} className="block">
              <h3
                className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 hover:text-emerald-700 transition-colors"
                title={product.name}
              >
                {product.name}
              </h3>
            </CardLink>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span className="truncate">{product.business?.name}</span>
              {hasStockInfo && !isOutOfStock && (
                <span className="text-emerald-700 font-bold shrink-0">In Stock</span>
              )}
            </div>
          </div>

          {/* Price & Immediate Quick Add Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-black text-emerald-950">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-[10px] text-slate-400 line-through block -mt-0.5">
                  {formattedComparePrice}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isPreview}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                quickAdded
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {quickAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYOUT 4: STORY BOUTIQUE (Artisan, Botanical, Handcrafted, Cafe, Classic)
  // Warm terracotta, soft clay shadows, maker authenticity, tasting notes
  // =========================================================================
  return (
    <div className={`clay-card overflow-hidden flex flex-col ${tokens.cardBg || 'bg-white/95'} border ${tokens.border || 'border-[#C6B7E2]/40'} hover:shadow-xl transition-all duration-300 group ${tokens.roundedCard || 'rounded-3xl'}`}>
      {/* Product Image */}
      <CardLink
        to={productLink}
        className="relative h-48 sm:h-52 w-full bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] overflow-hidden flex items-center justify-center block cursor-pointer group-hover:opacity-95 transition-opacity"
      >
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#F8F5FD] via-[#FAF6EE] to-[#EFE7D8]">
            <div className="w-14 h-14 rounded-2xl bg-white/90 clay-card flex items-center justify-center text-[#3B1C5A] shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-7 h-7 text-[#E6B44C]" />
            </div>
            <span className="text-[11px] font-semibold text-[#3B1C5A]/60 mt-2 text-center line-clamp-1 px-2 font-serif">
              {product.category?.name || 'Curated Artisan'}
            </span>
          </div>
        )}

        {/* Badges container in top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
          {product.category?.name && (
            <span className={`${tokens.badgePrimary || 'clay-badge-gold'} px-2.5 py-0.5 ${tokens.roundedBadge || 'rounded-full'} text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs`}>
              {product.category.name}
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#40205E] text-[#F5BD42] border border-[#F5BD42]/30 shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist toggle action */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/80 text-[#3B1C5A]/70 hover:text-rose-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}
      </CardLink>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Business Store indicator */}
          {product.business?.name && (
            <div className="flex items-center space-x-1.5 text-[11px] font-medium text-[#3B1C5A]/65 mb-1.5 font-serif">
              <Store className="w-3.5 h-3.5 text-[#3B1C5A]/50 shrink-0" />
              <CardLink
                to={`/customer/stores/${product.businessId || product.business?.id}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate hover:text-[#40205E] hover:underline font-semibold transition-colors"
                title={`Visit ${product.business.name}'s individual storefront`}
              >
                {product.business.name}
              </CardLink>
            </div>
          )}

          {/* Product Name */}
          <CardLink to={productLink} className="block">
            <h3
              className={`font-black ${tokens.textPrimary || 'text-[#3B1C5A]'} text-base leading-snug line-clamp-2 transition-colors ${tokens.fontHeading || 'font-serif'}`}
              title={product.name}
            >
              {product.name}
            </h3>
          </CardLink>

          {/* Description Snippet */}
          {product.description && (
            <p className={`text-xs ${tokens.textSecondary || 'text-[#3B1C5A]/70'} line-clamp-2 mt-1.5 leading-relaxed font-serif`}>
              {product.description}
            </p>
          )}

          {/* Stock availability indicator */}
          {hasStockInfo && (
            <div className="mt-2.5">
              {isOutOfStock ? (
                <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Only {product.stockQuantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Actions Row */}
        <div className="pt-3 border-t border-[#C6B7E2]/30 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className={`text-base font-extrabold ${tokens.priceColor || 'text-[#3B1C5A]'}`}>
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-[11px] text-[#3B1C5A]/50 line-through -mt-0.5">
                {formattedComparePrice}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <CardLink
              to={productLink}
              className={`${tokens.btnPrimary || 'clay-pill'} px-3.5 py-1.5 ${tokens.roundedBtn || 'rounded-xl'} text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </CardLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
