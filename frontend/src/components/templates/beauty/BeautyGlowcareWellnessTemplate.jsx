import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Heart,
  ChevronRight,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Check,
  Award,
  UserCheck,
  Tag,
  Clock,
  Gift,
  Headphones,
  CreditCard
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const BeautyGlowcareWellnessTemplate = ({
  business = {},
  products = [],
  isPreview = false,
  customColors = {},
  onOpenContact = null
}) => {
  const navigate = useNavigate();
  let cartCtx = null;
  let wishlistCtx = null;
  try {
    cartCtx = useCart();
  } catch (e) {}
  try {
    wishlistCtx = useWishlist();
  } catch (e) {}

  const berryPink = customColors.primary || '#E63973';
  const deepRose = '#D81B60';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `glowcare-real-${idx}`,
        name: p.name,
        description: p.description || 'Premium wellness and beauty formulated for radiant skin and hair.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : (parseFloat(p.price || 0) * 1.3),
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Beauty & Wellness'),
        rating: 4.9,
        reviewsCount: 188 + (idx * 35),
        specs: idx === 0 ? '30ml' : idx === 1 ? '50g' : idx === 2 ? '200ml' : idx === 3 ? '150ml' : '4.2g',
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1608248597359-0a6d091905ea?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 25
      }));
    }
    return [];
  }, [products]);

  // Derived Dynamic Categories from merchant's real inventory
  const categoriesList = useMemo(() => {
    const cats = new Set();
    displayProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [displayProducts]);

  // Filtered store products
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchCat = activeCategory === 'All' || p.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [displayProducts, activeCategory, searchTerm]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartCtx?.addToCart) {
      cartCtx.addToCart(product, 1);
    }
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const handleProductClick = (productId) => {
    if (isPreview) return;
    navigate(`/customer/stores/${business.id || business.slug}/products/${productId}`);
  };

  return (
    <div className="w-full bg-[#FFF5F7] text-[#4A0E2E] font-sans antialiased selection:bg-[#E63973] selection:text-white">
      {/* =====================================================================
          1. HEADER WITH PINK LOTUS EMBLEM & INTEGRATED SEARCH
         ===================================================================== */}
      <header className="border-b border-[#FDDCE5] bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E63973] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#D81B60]">
                {business.name || 'GlowCare'}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#A03564] font-semibold">
                Health & Beauty
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-[#FFF5F7] border border-[#FDDCE5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#E63973] placeholder:text-[#A03564]/60 text-[#4A0E2E]"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-[#E63973] hover:opacity-80"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#D81B60] hover:text-[#E63973] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-[#FFF0F5] text-[#D81B60] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E63973] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full bg-[#E63973] hover:bg-[#D81B60] text-white shadow-xs transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#E63973] text-[9px] font-black flex items-center justify-center border border-[#E63973]">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* =====================================================================
            2. HERO SECTION: "Beauty & Wellness for a Better You"
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-gradient-to-r from-[#FDE8EF] via-[#FFF0F5] to-[#FCE4EC] rounded-[36px] overflow-hidden border border-[#FDDCE5] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[460px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[#E63973] border border-[#FDDCE5] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E63973]" />
                <span>Radiate Confidence Every Day</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3B1C5A] tracking-tight leading-[1.15]">
                Beauty &amp; Wellness <br />
                for a <span className="text-[#E63973]">Better You</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#7D3859] leading-relaxed max-w-md">
                {business.description ||
                  'Discover premium health & beauty products for healthy skin, hair & body.'}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#E63973] text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-[#D81B60] transition-all shadow-md group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Radiant Model & 100% Original Products Badge */}
            <div className="lg:col-span-5 h-80 sm:h-96 lg:h-full relative overflow-hidden flex items-center justify-center p-6">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"
                alt="Radiant skincare model"
                className="w-full h-full object-cover rounded-3xl"
              />

              {/* Circular Badge: 100% Original Products */}
              <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/95 backdrop-blur-xs p-2 flex flex-col items-center justify-center text-center shadow-lg border border-[#FDDCE5]">
                <ShieldCheck className="w-5 h-5 text-[#E63973]" />
                <span className="font-extrabold text-[11px] text-[#3B1C5A] leading-tight mt-0.5">100%</span>
                <span className="text-[8px] uppercase font-bold text-[#E63973] tracking-tighter">Original Products</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. VALUE PROMISES BAR (White Rounded Card with Pink Line Icons)
           ===================================================================== */}
        <section aria-label="Store Guarantees" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FDDCE5] shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#FEE9F0]">
            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <ShieldCheck className="w-6 h-6 text-[#E63973]" />
              <span className="font-bold text-xs text-[#3B1C5A]">100% Original</span>
              <span className="text-[10px] text-[#7D3859]">Authentic &amp; trusted brands</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <UserCheck className="w-6 h-6 text-[#E63973]" />
              <span className="font-bold text-xs text-[#3B1C5A]">Expert Approved</span>
              <span className="text-[10px] text-[#7D3859]">Dermatologically tested</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <Truck className="w-6 h-6 text-[#E63973]" />
              <span className="font-bold text-xs text-[#3B1C5A]">Fast Delivery</span>
              <span className="text-[10px] text-[#7D3859]">At your doorstep</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <RotateCcw className="w-6 h-6 text-[#E63973]" />
              <span className="font-bold text-xs text-[#3B1C5A]">Easy Returns</span>
              <span className="text-[10px] text-[#7D3859]">Hassle-free returns</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. DUAL PROMOTIONAL BANNERS: "Up to 30% OFF"
           ===================================================================== */}
        <section aria-label="Promotions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-[#FF4D88] to-[#E63973] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md flex flex-col justify-between h-56">
            <div className="space-y-1 relative z-10">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90">
                <Clock className="w-3.5 h-3.5" />
                <span>Limited Time Offer</span>
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                Up to 30% OFF
              </h3>
              <p className="text-xs text-white/90">
                On Top Beauty &amp; Wellness Brands
              </p>
            </div>

            <div className="relative z-10">
              <a
                href="#catalog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-[#E63973] text-xs font-bold hover:bg-[#FFF0F5] transition-colors shadow-xs"
              >
                <span>Shop the Sale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-pink-200 to-transparent pointer-events-none" />
          </div>

          <div className="bg-gradient-to-r from-[#D81B60] to-[#FF4D88] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md flex flex-col justify-between h-56">
            <div className="space-y-1 relative z-10">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90">
                <Tag className="w-3.5 h-3.5" />
                <span>Seasonal Special</span>
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                Clean Skin Edit
              </h3>
              <p className="text-xs text-white/90">
                Essential Hydration &amp; Sun Defense Bundles
              </p>
            </div>

            <div className="relative z-10">
              <a
                href="#catalog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-[#D81B60] text-xs font-bold hover:bg-[#FFF0F5] transition-colors shadow-xs"
              >
                <span>Explore Bundles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-pink-200 to-transparent pointer-events-none" />
          </div>
        </section>

        {/* =====================================================================
            5. BEST SELLERS SECTION (5 Product Cards in Row Matching Reference)
           ===================================================================== */}
        <section id="catalog" aria-label="Best Sellers" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#FDDCE5] pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A]">
                Best Sellers
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-bold text-[#E63973] hover:text-[#D81B60] flex items-center gap-1 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* In-store Dynamic Category Filter */}
          {categoriesList.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#E63973] text-white shadow-xs'
                      : 'bg-white text-[#7D3859] border border-[#FDDCE5] hover:bg-[#FFF0F5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid: 5 Columns Matching Reference Layout */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-dashed border-[#FDDCE5] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#FFF0F5] text-[#E63973] mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#3B1C5A]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#7D3859] mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any beauty &amp; wellness products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E63973] text-white text-xs font-bold hover:bg-[#D81B60] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-[#FDDCE5] p-8">
              <ShoppingCart className="w-8 h-8 text-[#A03564]/60 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#3B1C5A]">No matching products found</h3>
              <p className="text-xs text-[#7D3859] mt-1">Try clearing your search or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-[#E63973] bg-[#FFF0F5] hover:bg-[#FDDCE5] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {filteredProducts.slice(0, 10).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-3xl overflow-hidden p-4 border border-[#FDDCE5] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Image Container with Wishlist */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FFF5F7] p-3 flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#E63973] hover:text-[#D81B60] shadow-xs transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info Body */}
                  <div className="pt-3 space-y-2 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="font-bold text-sm text-[#3B1C5A] line-clamp-1 group-hover:text-[#E63973] transition-colors">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-[#A03564] block mt-0.5">
                        {prod.specs || prod.category}
                      </span>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E6B44C]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                        <span className="text-[10px] text-[#7D3859] font-semibold">({prod.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price and Add to Cart Button */}
                    <div className="pt-2 space-y-2.5 border-t border-[#FEE9F0]">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-[#3B1C5A]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-xs text-[#A03564] line-through">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`w-full py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          addedProductId === prod.id
                            ? 'bg-[#3B1C5A] text-white'
                            : 'bg-[#E63973] hover:bg-[#D81B60] text-white'
                        }`}
                      >
                        {addedProductId === prod.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#A3E4D7]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================================
            6. BOTTOM GUARANTEES STRIP (Pink Icons)
           ===================================================================== */}
        <section aria-label="Customer Benefits" className="bg-white rounded-3xl p-6 border border-[#FDDCE5] shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[#7D3859] text-xs">
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E63973] shrink-0" />
              <div>
                <span className="font-bold block text-[#3B1C5A]">Secure Payments</span>
                <span className="text-[10px]">100% safe &amp; secure</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Tag className="w-5 h-5 text-[#E63973] shrink-0" />
              <div>
                <span className="font-bold block text-[#3B1C5A]">Exclusive Offers</span>
                <span className="text-[10px]">Save more on top brands</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Headphones className="w-5 h-5 text-[#E63973] shrink-0" />
              <div>
                <span className="font-bold block text-[#3B1C5A]">24/7 Support</span>
                <span className="text-[10px]">We&apos;re here to help</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-[#E63973] shrink-0" />
              <div>
                <span className="font-bold block text-[#3B1C5A]">Loyalty Rewards</span>
                <span className="text-[10px]">Earn points &amp; get rewards</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          7. FOOTER
         ===================================================================== */}
      <footer className="border-t border-[#FDDCE5] bg-white mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="text-xl font-bold tracking-tight text-[#D81B60]">
                {business.name || 'GlowCare'}
              </span>
              <p className="text-xs text-[#7D3859] leading-relaxed">
                {business.description ||
                  'Your trusted destination for authenticated beauty, wellness, and self-care essentials.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A] block">Categories</span>
              <ul className="space-y-2 text-xs text-[#7D3859]">
                <li><a href="#catalog" className="hover:text-[#E63973] transition-colors">Skincare &amp; Serums</a></li>
                <li><a href="#catalog" className="hover:text-[#E63973] transition-colors">Haircare Solutions</a></li>
                <li><a href="#catalog" className="hover:text-[#E63973] transition-colors">Wellness &amp; Health</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A] block">Help &amp; Support</span>
              <ul className="space-y-2 text-xs text-[#7D3859]">
                <li><span>Order Tracking</span></li>
                <li><span>Return Policy</span></li>
                <li><span>Dermatological Advisory</span></li>
                {business.phone && <li><span>Support: {business.phone}</span></li>}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A] block">Store Location</span>
              <p className="text-xs text-[#7D3859] leading-relaxed">
                {business.address || 'Wellness Center, Beauty Boulevard'}
                {business.city && `, ${business.city}`}
                {business.state && `, ${business.state}`}
              </p>
              {business.email && (
                <p className="text-xs text-[#E63973] font-bold">{business.email}</p>
              )}
            </div>
          </div>

          <div className="border-t border-[#FDDCE5] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7D3859] gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'GlowCare'}. Powered by Bizora.</p>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BeautyGlowcareWellnessTemplate;

