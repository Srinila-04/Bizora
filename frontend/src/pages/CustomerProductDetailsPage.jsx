import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { Pagination } from '../components/Pagination';
import { matchBusinessLocation } from '../utils/indiaLocations';
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  MapPin,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Loader2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Tag,
  Plus,
  Minus,
  Zap,
  X,
  Lock,
  CreditCard,
  Smartphone,
  Check,
  Cpu,
  Layers,
  Award,
  Leaf,
  Coffee,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ContactMerchantModal } from '../components/ContactMerchantModal';
import { ProductCard } from '../components/ProductCard';
import { getStorefrontTemplate } from '../config/storefrontTemplates';
import { normalizeCategoryKey } from '../config/categoryRegistry';
import { StorefrontContextBanner, StorefrontHeaderBanner } from '../components/StorefrontTemplateRenderer';
import {
  createOrder,
  initializeOrderCheckout,
  launchRazorpayCheckout,
  verifyRazorpayPayment,
  confirmCashOnDelivery,
  getPaymentConfig
} from '../services/checkout.service';

export const CustomerProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist, toastMessage } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [relatedStoreProducts, setRelatedStoreProducts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Real checkout state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentOption, setPaymentOption] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrderRecord, setConfirmedOrderRecord] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({ isConfigured: false, mode: 'test' });

  // Load customer addresses & gateway config when Buy Now modal opens
  useEffect(() => {
    if (isBuyNowOpen) {
      setCheckoutError('');
      api.get('/addresses')
        .then((res) => {
          const list = res.data?.data?.addresses || [];
          setAddresses(list);
          const def = list.find((a) => a.isDefault) || list[0];
          if (def) setSelectedAddressId(def.id);
        })
        .catch(() => {});

      getPaymentConfig()
        .then((cfg) => setPaymentConfig(cfg))
        .catch(() => {});
    }
  }, [isBuyNowOpen]);

  // Handle real test-mode checkout
  const handleProceedCheckout = async () => {
    setIsProcessingOrder(true);
    setCheckoutError('');

    if (paymentOption === 'razorpay' && !paymentConfig.isConfigured) {
      setCheckoutError('Razorpay test mode is not configured. Please select Cash on Delivery or configure Razorpay test keys in backend/.env.');
      setIsProcessingOrder(false);
      return;
    }

    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      const shippingAddress = selectedAddr
        ? {
            recipientName: selectedAddr.recipientName,
            phone: selectedAddr.phone,
            addressLine1: selectedAddr.addressLine1,
            addressLine2: selectedAddr.addressLine2,
            city: selectedAddr.city,
            state: selectedAddr.state,
            postalCode: selectedAddr.postalCode,
            country: selectedAddr.country
          }
        : {
            recipientName: 'Valued Customer',
            phone: '',
            addressLine1: 'Standard Delivery',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600001',
            country: 'India'
          };

      if (paymentOption === 'cod') {
        const order = await createOrder({
          businessId: product.businessId,
          items: [{ productId: product.id, variantId: selectedVariant?.id || undefined, quantity }],
          shippingAddress
        });
        const codResult = await confirmCashOnDelivery(order.id);
        setConfirmedOrderRecord({ order: codResult.order, payment: codResult.payment });
        setOrderConfirmed(true);
        setIsProcessingOrder(false);
        // Refresh product stock
        api.get(`/products/${id}`).then((r) => setProduct(r.data?.data?.product)).catch(() => {});
        return;
      }

      // Online Razorpay Checkout
      const { order, gatewayData } = await initializeOrderCheckout({
        businessId: product.businessId,
        items: [{ productId: product.id, variantId: selectedVariant?.id || undefined, quantity }],
        shippingAddress
      });

      // Razorpay Online Gateway
      await launchRazorpayCheckout({
        gatewayData,
        onSuccess: async (response) => {
          try {
            const verifiedResult = await verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'upi'
            });
            setConfirmedOrderRecord({ order: verifiedResult.order, payment: verifiedResult.payment });
            setOrderConfirmed(true);
            setIsProcessingOrder(false);
            api.get(`/products/${id}`).then((r) => setProduct(r.data?.data?.product)).catch(() => {});
          } catch (verErr) {
            setCheckoutError(verErr.response?.data?.message || 'Payment signature verification failed');
            setIsProcessingOrder(false);
          }
        },
        onDismiss: () => {
          setIsProcessingOrder(false);
          setCheckoutError('Payment was cancelled or closed before completion. You can retry anytime.');
        },
        onFailure: (err) => {
          setIsProcessingOrder(false);
          setCheckoutError(err.description || 'Payment failed at gateway');
        }
      });
    } catch (err) {
      setCheckoutError(err.response?.data?.message || err.message || 'Checkout failed');
      setIsProcessingOrder(false);
    }
  };

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data?.data?.product || res.data?.data || null;
      if (!data) {
        throw new Error('Product not found');
      }
      setProduct(data);
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        const defaultVar = data.variants.find((v) => v.isDefault) || data.variants[0];
        setSelectedVariantId(defaultVar?.id || null);
      }
      setSelectedImageIndex(0);

      // Fetch related products from this merchant storefront
      const bId = data.businessId || data.business?.id;
      if (bId) {
        api.get('/products', { params: { businessId: bId, limit: 5 } })
          .then((moreRes) => {
            const list = moreRes.data?.data?.products || [];
            setRelatedStoreProducts(list.filter((p) => p.id !== data.id).slice(0, 4));
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load product details. The product may have been moved or removed.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const template = useMemo(() => getStorefrontTemplate(product?.business), [product]);
  const { tokens } = template;

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProductDetails]);

  // Extract images array
  const images = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        if (product.images.trim()) return [product.images];
      }
    }
    return [];
  }, [product]);

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return variants.find((v) => v.id === selectedVariantId) || variants[0];
  }, [variants, selectedVariantId]);

  // Base Product Price & Discounts (Reflects selected variant if available)
  const numericPrice = selectedVariant && selectedVariant.price != null
    ? parseFloat(selectedVariant.price)
    : (product ? parseFloat(product.price) : 0);
  const numericCompare = selectedVariant && selectedVariant.compareAtPrice != null
    ? parseFloat(selectedVariant.compareAtPrice)
    : (product && product.compareAtPrice ? parseFloat(product.compareAtPrice) : 0);
  const hasDiscount = !isNaN(numericPrice) && !isNaN(numericCompare) && numericCompare > numericPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numericCompare - numericPrice) / numericCompare) * 100)
    : 0;
  const savingsAmount = hasDiscount ? (numericCompare - numericPrice).toFixed(2) : 0;

  const formattedPrice = !isNaN(numericPrice)
    ? `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '₹0.00';

  const formattedComparePrice = hasDiscount
    ? `₹${numericCompare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  // Dynamic Quantity Total (Calculated separately for quantity section)
  const totalPrice = numericPrice * quantity;
  const formattedTotalPrice = !isNaN(totalPrice)
    ? `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '₹0.00';

  // Inventory & Stock
  const effectiveStock = selectedVariant
    ? (selectedVariant.stockQuantity !== undefined && selectedVariant.stockQuantity !== null
      ? Number(selectedVariant.stockQuantity)
      : null)
    : (product && product.stockQuantity !== undefined && product.stockQuantity !== null
      ? Number(product.stockQuantity)
      : null);

  const hasStockInfo = effectiveStock !== null && !isNaN(effectiveStock);
  const isOutOfStock = hasStockInfo && effectiveStock <= 0;
  const lowThreshold = selectedVariant?.lowStockThreshold || product?.lowStockThreshold || 5;
  const isLowStock = hasStockInfo && effectiveStock > 0 && effectiveStock <= lowThreshold;

  // Business Location
  const businessLocationString = React.useMemo(() => {
    if (!product?.business) return 'Verified Indian Merchant';
    const b = product.business;
    const addr = b.addressDetails || {};
    const parts = [];
    if (addr.district || addr.city) parts.push(addr.district || addr.city);
    if (addr.state) parts.push(addr.state);
    if (parts.length > 0) return parts.join(', ');
    if (b.address) return b.address;
    return 'India';
  }, [product]);

  // Ratings calculation
  const productRating = product?.averageRating !== undefined && product?.averageRating !== null
    ? parseFloat(product.averageRating)
    : null;

  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const [reviewPage, setReviewPage] = useState(1);
  const reviewPageSize = 4;
  const reviewsTotalPages = Math.max(1, Math.ceil(reviews.length / reviewPageSize));
  const safeReviewPage = Math.min(Math.max(1, reviewPage), reviewsTotalPages);
  const paginatedReviews = useMemo(() => {
    const start = (safeReviewPage - 1) * reviewPageSize;
    return reviews.slice(start, start + reviewPageSize);
  }, [reviews, safeReviewPage, reviewPageSize]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-6">
        <div className="h-6 w-48 bg-white/70 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-96 rounded-3xl bg-white/70 animate-pulse clay-card" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-white/70 rounded-lg animate-pulse" />
            <div className="h-6 w-1/3 bg-white/70 rounded-lg animate-pulse" />
            <div className="h-24 w-full bg-white/70 rounded-2xl animate-pulse" />
            <div className="h-12 w-48 bg-white/70 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="clay-card p-10 bg-white/95 border border-rose-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-[#3B1C5A]">Product or Storefront Unavailable</h2>
          <p className="text-sm text-[#3B1C5A]/70 leading-relaxed">
            {error || 'The product or merchant storefront you requested is currently unavailable or inactive.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/customer/business-store"
              className="clay-btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-[#3B1C5A]" />
              <span>Browse Stores</span>
            </Link>
            <Link
              to="/customer/shop"
              className="clay-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#E6B44C]" />
              <span>Back to Marketplace Shop</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {(toastMessage || addedToCartToast) && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B1C5A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-[#E6B44C]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#E6B44C] shrink-0" />
          <span className="text-white font-medium">
            {addedToCartToast ? `Added ${quantity} unit(s) of "${product.name}" to cart!` : toastMessage}
          </span>
        </div>
      )}

      {/* Merchant Storefront Context Banner */}
      {product.business && (
        <StorefrontContextBanner
          business={product.business}
          isProductPage={true}
          backUrl="/customer/shop"
        />
      )}

      {/* Merchant Storefront Branding Header */}
      {product.business && (
        <StorefrontHeaderBanner
          business={product.business}
          showFullDetails={false}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-medium text-[#3B1C5A]/60">
        <Link to="/customer/home" className="hover:text-[#3B1C5A] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#3B1C5A]/40" />
        <Link to="/customer/shop" className="hover:text-[#3B1C5A] transition-colors">
          Shop
        </Link>
        {product.business && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#3B1C5A]/40" />
            <Link
              to={`/customer/stores/${product.businessId || product.business?.id}`}
              className="hover:text-[#3B1C5A] transition-colors font-semibold"
            >
              {product.business.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#3B1C5A]/40" />
            <Link
              to={`/customer/shop?category=${product.category.id}`}
              className="hover:text-[#3B1C5A] transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#3B1C5A]/40" />
        <span className="text-[#3B1C5A] font-bold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Back Button & Store Quick Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#3B1C5A]" />
          <span>Back</span>
        </button>

        {product.business?.name && (
          <Link
            to={`/customer/stores/${product.businessId || product.business?.id}`}
            className="text-xs font-bold text-[#3B1C5A] hover:text-[#E6B44C] flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Store: <strong className="underline">{product.business.name}</strong></span>
          </Link>
        )}
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="clay-card overflow-hidden bg-white/95 border border-[#C6B7E2]/50 p-2 sm:p-3 relative group">
            {/* Primary Main Image */}
            <div className="relative h-80 sm:h-96 md:h-[420px] w-full rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] overflow-hidden flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/shop-header-character.png';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/90 clay-card flex items-center justify-center text-[#3B1C5A] shadow-xs mb-3">
                    <ShoppingBag className="w-8 h-8 text-[#E6B44C]" />
                  </div>
                  <span className="text-xs font-semibold text-[#3B1C5A]/60">
                    {product.category?.name || 'Curated Product'}
                  </span>
                </div>
              )}

              {/* Wishlist Button on Image */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-white/85 text-[#3B1C5A]/70 hover:text-rose-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Discount Tag */}
              {hasDiscount && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#40205E] text-[#F5BD42] border border-[#F5BD42]/30 shadow-md">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails row if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 pt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#3B1C5A] ring-2 ring-[#3B1C5A]/30 scale-105'
                        : 'border-[#C6B7E2]/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="clay-card p-3 bg-white/80 border border-[#C6B7E2]/30 text-center space-y-1">
              <Truck className="w-4 h-4 text-[#E6B44C] mx-auto" />
              <p className="text-[11px] font-bold text-[#3B1C5A]">Verified Delivery</p>
              <p className="text-[10px] text-[#3B1C5A]/60">Direct from seller</p>
            </div>
            <div className="clay-card p-3 bg-white/80 border border-[#C6B7E2]/30 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#E6B44C] mx-auto" />
              <p className="text-[11px] font-bold text-[#3B1C5A]">Secure Checkout</p>
              <p className="text-[10px] text-[#3B1C5A]/60">100% encrypted</p>
            </div>
            <div className="clay-card p-3 bg-white/80 border border-[#C6B7E2]/30 text-center space-y-1">
              <RotateCcw className="w-4 h-4 text-[#E6B44C] mx-auto" />
              <p className="text-[11px] font-bold text-[#3B1C5A]">Easy Returns</p>
              <p className="text-[10px] text-[#3B1C5A]/60">Merchant policy</p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Purchase (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className={`${tokens.cardBg} ${tokens.border} ${tokens.roundedCard} p-6 sm:p-8 border shadow-sm space-y-5 transition-all`}>
            {/* Category & Status Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {product.category?.name && (
                <span className={`${tokens.badgePrimary} ${tokens.roundedBadge} px-3 py-1 text-xs font-bold uppercase tracking-wider`}>
                  {product.category.name}
                </span>
              )}

              {/* Stock Status Badge */}
              {hasStockInfo && (
                <div>
                  {isOutOfStock ? (
                    <span className="inline-block text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      Currently Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Only {effectiveStock} unit(s) left in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({effectiveStock} units available)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Product Title */}
            <h1 className={`text-2xl sm:text-3xl font-extrabold ${tokens.textPrimary} tracking-tight ${tokens.fontHeading} leading-tight`}>
              {product.name}
            </h1>

            {/* Product Rating & Code */}
            <div className="flex items-center flex-wrap gap-4 text-xs text-[#3B1C5A]/70 pt-1 pb-2 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                <Star className="w-4 h-4 text-[#E6B44C] fill-[#E6B44C]" />
                <span>
                  {productRating !== null
                    ? `${productRating.toFixed(1)} / 5.0`
                    : 'Unrated (New product)'}
                </span>
                <span className="text-[#3B1C5A]/50 font-normal">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {(selectedVariant?.sku || product.sku) && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#3B1C5A]/50">SKU:</span>
                  <span className="font-mono text-[#3B1C5A]">{selectedVariant?.sku || product.sku}</span>
                </div>
              )}
            </div>

            {/* Main Product Price (Fixed product price) */}
            <div className={`space-y-1.5 p-4 ${tokens.roundedCard} ${tokens.tagBg} border ${tokens.border}`}>
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl sm:text-4xl font-extrabold ${tokens.priceColor} tracking-tight`}>
                  {formattedPrice}
                </span>
                {formattedComparePrice && (
                  <span className="text-lg text-[#3B1C5A]/50 line-through">
                    {formattedComparePrice}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs font-bold text-emerald-700">
                  Save ₹{savingsAmount} ({discountPercent}% OFF) with marketplace discount
                </p>
              )}
              <p className="text-[11px] text-[#3B1C5A]/55">
                Inclusive of all taxes. Free shipping on orders fulfilled by merchant.
              </p>
            </div>

            {/* Variant / Option Selector */}
            {variants.length > 0 && (
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B1C5A] uppercase tracking-wider block">
                    Choose Option / Variant:
                  </span>
                  {selectedVariant && (
                    <span className="text-[11px] font-semibold text-[#79688A]">
                      Selected: <strong className="text-[#3B1C5A]">{selectedVariant.name}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vStock = v.stockQuantity != null ? Number(v.stockQuantity) : 0;
                    const vOutOfStock = vStock <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={vOutOfStock}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#3B1C5A] text-white border-[#3B1C5A] shadow-md ring-2 ring-[#E6B44C]/60'
                            : vOutOfStock
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through'
                            : 'bg-white text-[#3B1C5A] border-[#C6B7E2]/60 hover:border-[#3B1C5A] shadow-xs'
                        }`}
                      >
                        <span>{v.name}</span>
                        {v.price && (
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#E6B44C]' : 'text-[#79688A]'}`}>
                            ₹{Number(v.price).toFixed(2)}
                          </span>
                        )}
                        {vOutOfStock && <span className="text-[9px] text-rose-500 font-semibold">(Sold out)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Price Changes Based on Quantity */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <label htmlFor="quantity-selector" className="text-xs font-bold text-[#3B1C5A]">
                    Quantity:
                  </label>
                  <div className="flex items-center bg-[#FAF7F2] rounded-xl border border-[#C6B7E2]/50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label="Decrease quantity"
                      className="p-1.5 rounded-lg text-[#3B1C5A] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span id="quantity-selector" className="px-3 text-xs font-bold text-[#3B1C5A] min-w-[2.25rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => (hasStockInfo ? Math.min(product.stockQuantity, q + 1) : q + 1))}
                      disabled={isOutOfStock || (hasStockInfo && quantity >= product.stockQuantity)}
                      aria-label="Increase quantity"
                      className="p-1.5 rounded-lg text-[#3B1C5A] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price Changes Based on Quantity (Dedicated Section) */}
                <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-2 rounded-xl border border-[#C6B7E2]/40 shadow-xs">
                  <span className="text-xs font-semibold text-[#3B1C5A]/65">
                    {quantity > 1 ? `Total (${quantity} items):` : 'Subtotal:'}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#3B1C5A]">
                    {formattedTotalPrice}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {/* Instant Single-Product Purchase */}
                <button
                  type="button"
                  onClick={() => setIsBuyNowOpen(true)}
                  disabled={isOutOfStock}
                  className={`px-5 py-3 ${tokens.roundedBtn} bg-[#E6B44C] hover:bg-[#d4a33f] text-[#3B1C5A] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1`}
                >
                  <Zap className="w-4 h-4 text-[#3B1C5A] fill-[#3B1C5A]" />
                  <span>Buy Now ({quantity} Item{quantity > 1 ? 's' : ''})</span>
                </button>

                {/* Add to multi-item cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`${tokens.btnPrimary} ${tokens.roundedBtn} px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-1`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`clay-btn-secondary ${tokens.roundedBtn} px-4 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    wishlisted ? 'border-rose-300 text-rose-600 bg-rose-50' : ''
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="hidden sm:inline">{wishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Ask the Merchant Quick Action */}
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl border border-[#C6B7E2]/50 bg-white/70 hover:bg-[#F0EAFB] text-[#3B1C5A] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:border-[#3B1C5A]/40"
              >
                <MessageSquare className="w-4 h-4 text-[#E6B44C]" />
                <span>Have a question about this item? Ask the Merchant</span>
              </button>
            </div>

            {/* Description Section */}
            {product.description && (
              <div className="pt-4 border-t border-[#C6B7E2]/30 space-y-2">
                <h3 className="text-xs font-bold text-[#3B1C5A] uppercase tracking-wider">
                  Product Description
                </h3>
                <p className="text-xs sm:text-sm text-[#3B1C5A]/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Category-Specific Specifications & Guidance Panel */}
          {(() => {
            const catKey = normalizeCategoryKey(
              product.category?.name || product.business?.category || template?.categoryId || ''
            );

            if (catKey === 'electronics-gadgets' || catKey === 'automotive-hardware') {
              return (
                <div className={`p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-slate-900 text-white border-2 border-cyan-800/60 shadow-md space-y-4 font-mono`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Cpu className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Technical Specifications & Compatibility
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                      OEM VERIFIED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Item SKU / Identification:</span>
                      <span className="font-bold text-white font-mono">{product.sku || 'OEM-Standard-SKU'}</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Inventory Status:</span>
                      <span className="font-bold text-emerald-400">
                        {product.stockQuantity !== undefined ? `${product.stockQuantity} units available in warehouse` : 'In Stock'}
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Hardware Authenticity:</span>
                      <span className="font-bold text-slate-200">100% Genuine Direct Supply</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Fulfillment Facility:</span>
                      <span className="font-bold text-slate-200">Dispatched from {businessLocationString}</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (catKey === 'fashion-apparel') {
              return (
                <div className={`clay-card p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-white/95 border ${tokens.border || 'border-neutral-200'} shadow-sm space-y-4`}>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-900 font-serif">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Lookbook Curation & Sizing Guide
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                      True to Size
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-serif">
                        Select Garment Size
                      </label>
                      <div className="flex items-center gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-slate-900 text-white shadow-md scale-105'
                                : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                        <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Fabric & Finish:</span>
                        <span className="text-slate-800 font-medium">Premium weave with breathable finish</span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                        <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Garment Care:</span>
                        <span className="text-slate-800 font-medium">Dry clean recommended / Gentle cycle</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (catKey === 'beauty-personal-care' || catKey === 'health-wellness') {
              return (
                <div className={`clay-card p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-rose-50/60 border border-rose-200 shadow-sm space-y-4`}>
                  <div className="flex items-center justify-between border-b border-rose-200 pb-3">
                    <div className="flex items-center gap-2 text-rose-950">
                      <Leaf className="w-4 h-4 text-rose-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Clean Ingredients & Application Routine
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                      Dermatologically Tested
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100 space-y-1">
                      <span className="text-rose-700 font-bold text-[10px] block uppercase">Step 1: Prep</span>
                      <span className="text-slate-700">Cleanse face thoroughly with warm water.</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100 space-y-1">
                      <span className="text-rose-700 font-bold text-[10px] block uppercase">Step 2: Apply</span>
                      <span className="text-slate-700">Gently smooth product in upward motions.</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100 space-y-1">
                      <span className="text-rose-700 font-bold text-[10px] block uppercase">Step 3: Nourish</span>
                      <span className="text-slate-700">Allow absorption before barrier cream.</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (catKey === 'home-living') {
              return (
                <div className={`clay-card p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-[#FAF6F0] border border-amber-200 shadow-sm space-y-4`}>
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <div className="flex items-center gap-2 text-[#3E2723]">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-serif">
                        Dimensions & Room Architecture Blueprint
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 font-serif">
                      Room Scale Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/90 p-3 rounded-xl border border-amber-100 space-y-1">
                      <span className="text-amber-800 text-[10px] font-bold block uppercase">Spatial Guidance:</span>
                      <span className="text-[#3E2723]">Engineered for living room, study, or bedroom placement.</span>
                    </div>
                    <div className="bg-white/90 p-3 rounded-xl border border-amber-100 space-y-1">
                      <span className="text-amber-800 text-[10px] font-bold block uppercase">Craft & Joinery:</span>
                      <span className="text-[#3E2723]">Solid craftsmanship with artisan timber & fabric finishes.</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (catKey === 'food-beverage') {
              return (
                <div className={`clay-card p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-4`}>
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2 text-emerald-950">
                      <Coffee className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Harvest Freshness & Flavor Profile
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      Small Batch
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 space-y-1">
                      <span className="text-emerald-800 text-[10px] font-bold block uppercase">Tasting & Quality:</span>
                      <span className="text-emerald-950 font-medium">Small-batch roasted and prepared using 100% natural ingredients.</span>
                    </div>
                    <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 space-y-1">
                      <span className="text-emerald-800 text-[10px] font-bold block uppercase">Storage Recommendation:</span>
                      <span className="text-emerald-950 font-medium">Store in an airtight container away from humidity and heat.</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (catKey === 'artisanal-handmade') {
              return (
                <div className={`clay-card p-6 ${tokens.roundedCard || 'rounded-3xl'} bg-amber-50 border border-amber-200 shadow-sm space-y-4`}>
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <div className="flex items-center gap-2 text-amber-950 font-serif">
                      <Award className="w-4 h-4 text-amber-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Artisan Workshop & Provenance Certificate
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 font-serif">
                      Handcrafted Guild
                    </span>
                  </div>
                  <div className="bg-white/90 p-4 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1 font-serif">
                    <p className="leading-relaxed">
                      Every piece is individually handcrafted in small atelier workshops by {product.business?.name}. Slight variations in texture and finish are hallmarks of genuine master craftsmanship.
                    </p>
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Seller & Storefront Information Card */}
          {product.business && (
            <div className="clay-card p-6 bg-white/95 border border-[#C6B7E2]/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EAFB] border border-[#C6B7E2]/50 flex items-center justify-center text-[#3B1C5A] shadow-xs">
                    <Store className="w-6 h-6 text-[#3B1C5A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-[#3B1C5A]">
                        {product.business.name}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified Bizora Merchant" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#3B1C5A]/65 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#E6B44C]" />
                      <span>{businessLocationString}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="clay-pill px-3.5 py-1.5 text-xs font-bold text-[#3B1C5A] bg-[#FAF7F2] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#C6B7E2]/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>Contact Merchant</span>
                  </button>

                  <Link
                    to={`/customer/stores/${product.businessId || product.business?.id}`}
                    className="clay-pill px-3.5 py-1.5 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Visit Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {product.business.description && (
                <p className="text-xs text-[#3B1C5A]/70 line-clamp-2 leading-relaxed">
                  {product.business.description}
                </p>
              )}

              <div className="pt-2 text-[11px] text-[#3B1C5A]/60 flex items-center justify-between border-t border-[#C6B7E2]/20">
                <span>Verified Independent Business</span>
                <span className="font-semibold text-[#3B1C5A]">Category: {product.business.category || 'General'}</span>
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="clay-card p-6 bg-white/95 border border-[#C6B7E2]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#C6B7E2]/30 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#3B1C5A]">
                  Verified Customer Reviews
                </h3>
                <p className="text-[11px] text-[#3B1C5A]/60">
                  Direct feedback on this product
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#3B1C5A]">
                <Star className="w-3.5 h-3.5 text-[#E6B44C] fill-[#E6B44C]" />
                <span>
                  {productRating !== null ? `${productRating.toFixed(1)} / 5` : 'No ratings yet'}
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-[#3B1C5A]/60 py-2 italic">
                There are no reviews for this product yet. Be the first customer to purchase and share feedback!
              </p>
            ) : (
              <div className="space-y-3">
                {paginatedReviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#3B1C5A]">
                        {rev.user ? `${rev.user.firstName} ${rev.user.lastName || ''}`.trim() : 'Verified Customer'}
                      </span>
                      <div className="flex items-center gap-0.5 text-[#E6B44C]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= (rev.rating || 5) ? 'fill-[#E6B44C]' : 'opacity-30'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-[#3B1C5A]/75 leading-relaxed">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}

                {/* Standardized Reviews Pagination */}
                {reviews.length > reviewPageSize && (
                  <div className="pt-2">
                    <Pagination
                      currentPage={safeReviewPage}
                      totalPages={reviewsTotalPages}
                      totalItems={reviews.length}
                      pageSize={reviewPageSize}
                      onPageChange={setReviewPage}
                      itemName="reviews"
                      ariaLabel="Customer Reviews Pagination"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More Products from this Merchant Storefront */}
      {relatedStoreProducts.length > 0 && product.business && (
        <section aria-label="More Products from this Store" className="pt-6 border-t border-[#C6B7E2]/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E6B44C]" />
                <h3 className={`text-lg sm:text-xl font-bold ${tokens.textPrimary} ${tokens.fontHeading}`}>
                  More from {product.business.name}
                </h3>
              </div>
              <p className={`text-xs ${tokens.textSecondary} mt-0.5`}>
                Explore other products from this merchant storefront ({template.name})
              </p>
            </div>

            <Link
              to={`/customer/stores/${product.businessId || product.business?.id}`}
              className="text-xs font-bold text-[#3B1C5A] hover:text-[#E6B44C] flex items-center gap-1 transition-colors"
            >
              <span>View All Products in Store</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedStoreProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                template={template}
                templateStyle={template.cardDisplayStyle}
                isWishlisted={isWishlisted(relProd.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* Instant Single-Product Purchase Modal */}
      {isBuyNowOpen && product && (
        <div className="fixed inset-0 z-50 bg-[#40205E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="clay-card max-w-lg w-full bg-white p-6 sm:p-7 space-y-5 border border-[#C6B7E2] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6B44C]/25 text-[#3B1C5A] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#3B1C5A] fill-[#3B1C5A]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#3B1C5A] font-serif">
                    Instant Purchase
                  </h3>
                  <p className="text-[11px] text-[#79688A]">
                    Direct checkout for this single product only
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBuyNowOpen(false);
                  setOrderConfirmed(false);
                }}
                className="p-1.5 rounded-lg text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!orderConfirmed ? (
              <>
                {/* Product Summary Row */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/40 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-[#C6B7E2]/30 flex items-center justify-center">
                    {images[0] ? (
                      <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#3B1C5A]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {product.category?.name && (
                      <span className="text-[10px] font-bold text-[#E6B44C] bg-[#3B1C5A] px-2 py-0.5 rounded-full inline-block mb-1">
                        {product.category.name}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-bold text-[#3B1C5A] line-clamp-1">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-extrabold text-[#3B1C5A]">{formattedPrice}</span>
                      <span className="text-[#79688A]">× {quantity} {quantity === 1 ? 'unit' : 'units'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Selector */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3B1C5A] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E6B44C]" />
                      <span>Delivery Address</span>
                    </span>
                    <Link
                      to="/customer/account"
                      className="text-[11px] font-semibold text-[#3B1C5A]/70 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>

                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#C6B7E2]/60 bg-[#FAF7F2] text-xs text-[#3B1C5A] font-medium focus:ring-1 focus:ring-[#3B1C5A]"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.recipientName} &bull; {addr.addressLine1}, {addr.city} ({addr.postalCode}) {addr.isDefault ? '[Default]' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                      Standard delivery will be used. You can add specific addresses in your Account page.
                    </div>
                  )}
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-bold text-[#3B1C5A] block">Select Payment Mode:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Razorpay Test Mode Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('razorpay')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'razorpay'
                          ? 'border-[#3B1C5A] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#3B1C5A]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#3B1C5A] text-xs">Razorpay Online</span>
                          {paymentConfig.isConfigured ? (
                            <span className="text-[9px] bg-[#E6B44C]/30 text-[#3B1C5A] font-bold px-1.5 py-0.2 rounded">TEST</span>
                          ) : (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">UNCONFIGURED</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#79688A] mt-0.5">UPI, Cards, NetBanking</p>
                      </div>
                    </button>

                    {/* Cash on Delivery Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('cod')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                        paymentOption === 'cod'
                          ? 'border-[#3B1C5A] bg-[#F0EAFB]/80 shadow-sm ring-1 ring-[#3B1C5A]'
                          : 'border-[#C6B7E2]/50 bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[#3B1C5A] text-xs block">Cash on Delivery</span>
                        <p className="text-[10px] text-[#79688A] mt-0.5">Pay upon delivery</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="pt-2 border-t border-[#C6B7E2]/30 space-y-1.5 text-xs text-[#79688A]">
                  <div className="flex justify-between">
                    <span>Product Subtotal ({quantity} {quantity === 1 ? 'unit' : 'units'}):</span>
                    <span className="font-semibold text-[#3B1C5A]">{formattedTotalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#3B1C5A] pt-2 border-t border-[#C6B7E2]/20">
                    <span>Total Amount Payable:</span>
                    <span className="text-base text-[#3B1C5A]">{formattedTotalPrice}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleProceedCheckout}
                    disabled={isProcessingOrder}
                    className="clay-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isProcessingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                        <span>Processing Checkout...</span>
                      </>
                    ) : paymentOption === 'cod' ? (
                      <>
                        <Check className="w-4 h-4 text-[#E6B44C]" />
                        <span>Confirm Cash on Delivery ({formattedTotalPrice})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#E6B44C]" />
                        <span>Pay with Razorpay ({formattedTotalPrice})</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBuyNowOpen(false);
                      setCheckoutError('');
                    }}
                    disabled={isProcessingOrder}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#3B1C5A] py-1 text-center cursor-pointer"
                  >
                    Cancel and return to product
                  </button>
                </div>
              </>
            ) : (
              /* Order Confirmed Screen */
              <div className="text-center space-y-4 py-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-[#3B1C5A]">
                    Order Placed Successfully!
                  </h4>
                  <p className="text-xs text-[#79688A] max-w-sm mx-auto">
                    Your purchase for <strong>{quantity} × {product.name}</strong> from <em>{product.business?.name}</em> has been securely recorded.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl text-left text-xs space-y-2 border border-[#C6B7E2]/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Order Reference:</span>
                    <span className="font-mono font-bold text-[#3B1C5A] bg-white px-2 py-0.5 rounded border border-[#C6B7E2]/40">
                      {confirmedOrderRecord?.order?.orderNumber || 'ORD-BIZORA'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Item Quantity:</span>
                    <span className="font-bold text-[#3B1C5A]">{quantity} unit{quantity > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Mode:</span>
                    <span className="font-bold text-[#3B1C5A]">
                      {confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : 'Razorpay Online (Test)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#79688A]">Payment Status:</span>
                    {confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery' ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        UNPAID / PENDING (Pending Delivery)
                      </span>
                    ) : (confirmedOrderRecord?.order?.paymentStatus?.toLowerCase() === 'paid' ||
                         confirmedOrderRecord?.payment?.status?.toLowerCase() === 'completed' ||
                         confirmedOrderRecord?.payment?.status?.toLowerCase() === 'paid') ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200">
                        PAID (Verified)
                      </span>
                    ) : (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        PENDING
                      </span>
                    )}
                  </div>
                  {confirmedOrderRecord?.payment?.paymentMethod !== 'cash_on_delivery' && confirmedOrderRecord?.payment?.transactionReference && (
                    <div className="flex justify-between items-center pt-1 border-t border-[#C6B7E2]/30">
                      <span className="text-[#79688A]">Gateway Payment ID:</span>
                      <span className="font-mono text-[11px] text-[#3B1C5A] truncate max-w-[180px]">
                        {confirmedOrderRecord.payment.transactionReference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-[#C6B7E2]/30">
                    <span className="text-[#79688A] font-semibold">
                      {confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery'
                        ? 'Amount Payable on Delivery:'
                        : 'Total Paid:'}
                    </span>
                    <span className="font-extrabold text-[#3B1C5A] text-sm">
                      ₹{Number(confirmedOrderRecord?.order?.totalAmount || (product.price * quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] text-left flex items-start gap-2 ${
                  confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery'
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                }`}>
                  <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
                    confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery' ? 'text-amber-700' : 'text-emerald-700'
                  }`} />
                  <p>
                    <strong>{confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery Placed:' : 'Payment Verified:'}</strong>{' '}
                    {confirmedOrderRecord?.payment?.paymentMethod === 'cash_on_delivery'
                      ? 'Order confirmed and inventory reserved. Please pay the exact amount when the package arrives.'
                      : 'Cryptographic signature verified by server. Order and inventory deduction finalized.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/customer/orders"
                    className="clay-btn-primary w-full py-3 text-xs font-bold text-center block rounded-2xl shadow-md cursor-pointer"
                  >
                    View My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBuyNowOpen(false);
                      setOrderConfirmed(false);
                      setConfirmedOrderRecord(null);
                    }}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#3B1C5A] py-1 text-center cursor-pointer"
                  >
                    Return to Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Merchant Modal */}
      <ContactMerchantModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        businessId={product.businessId || product.business?.id}
        businessName={product.business?.name || 'Merchant'}
        productId={product.id}
        productName={product.name}
        productImage={images[0] || null}
        productPrice={numericPrice}
      />
    </div>
  );
};

export default CustomerProductDetailsPage;

