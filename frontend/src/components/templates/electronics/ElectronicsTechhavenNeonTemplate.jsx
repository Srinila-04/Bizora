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
  Headphones,
  Cpu,
  Star,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Check,
  Award,
  Zap,
  Tag,
  Clock,
  Send,
  Watch,
  Smartphone,
  Laptop,
  Camera,
  Volume2,
  Gamepad2,
  Radio,
  Flame,
  User,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const ElectronicsTechhavenNeonTemplate = ({
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

  const neonOrange = customColors.primary || '#FF5500';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `techhaven-neon-${idx}`,
        name: p.name,
        description: p.description || 'Next-generation tactical hardware built for maximum performance and durability.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : (parseFloat(p.price || 0) * 1.3),
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Gadgets'),
        rating: 5.0,
        reviewsCount: 210 + (idx * 45),
        badge: idx === 0 ? 'NEW' : idx === 1 ? 'HOT' : idx === 2 ? 'SALE' : idx === 3 ? 'PRO' : 'ELITE',
        specs: idx === 0 ? 'True Wireless ANC' : idx === 1 ? 'Cellular + GPS' : idx === 2 ? '5G Flagship' : '144Hz Display',
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 40
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

  const featuredProducts = useMemo(() => {
    return filteredProducts.slice(0, 6);
  }, [filteredProducts]);

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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterSubscribed(false);
      setNewsletterEmail('');
    }, 4000);
  };

  // 8 Dark Cockpit Category Tiles matching reference
  const referenceCategories = [
    { label: 'HEADPHONES', icon: Headphones },
    { label: 'SMART WATCHES', icon: Watch },
    { label: 'SMARTPHONES', icon: Smartphone },
    { label: 'LAPTOPS', icon: Laptop },
    { label: 'CAMERAS', icon: Camera },
    { label: 'SPEAKERS', icon: Volume2 },
    { label: 'GAMING', icon: Gamepad2 },
    { label: 'DRONES', icon: Radio }
  ];

  return (
    <div className="w-full bg-[#0B0C10] text-slate-100 font-sans antialiased selection:bg-[#FF5500] selection:text-white">
      {/* =====================================================================
          1. BROWSER TOP BAR MOCK & COCKPIT HEADER WITH NEON ORANGE 'TH' LOGO
         ===================================================================== */}
      <div className="bg-[#12131A] border-b border-white/5 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="px-4 py-0.5 rounded-md bg-[#0B0C10] text-[10px] text-slate-400 font-mono tracking-wider border border-white/5">
          🔒 www.{business.slug || 'techhaven'}.com
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        </div>
      </div>

      <header className="border-b border-white/10 bg-[#0F1015]/95 backdrop-blur-md sticky top-0 z-30 shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF6B00] to-[#E64C00] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/30 tracking-tighter">
              TH
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
                {business.name || 'TECHHAVEN'}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#FF5500] font-mono font-bold">
                SMARTER TECH. BETTER LIFE.
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gear, gadgets, components..."
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-[#171822] border border-white/10 rounded-full focus:outline-none focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500] text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-[#FF5500]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#FF5500] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-white/5 text-slate-300 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF5500] text-white text-[9px] font-black flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full bg-[#171822] hover:bg-[#FF5500] hover:text-white text-[#FF5500] border border-[#FF5500]/30 transition-all shadow-xs"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5500] text-white text-[9px] font-black flex items-center justify-center border border-[#0B0C10]">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14 sm:space-y-18">
        {/* =====================================================================
            2. HERO SECTION: "UPGRADE TO NEXT GEN"
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-gradient-to-r from-[#101118] via-[#151622] to-[#0E0F16] rounded-[36px] overflow-hidden border border-white/10 shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8 z-10">
              <div className="space-y-5">
                <div className="space-y-1">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[1.05]">
                    UPGRADE TO <br />
                    <span className="bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FFAA00] bg-clip-text text-transparent">
                      NEXT GEN
                    </span>
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                  {business.description || 'Discover cutting-edge gadgets designed to power your world.'}
                </p>

                {/* 4 Feature Badges in horizontal row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-slate-300 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FF5500]" />
                    <span>Fast &amp; Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-[#FF5500]" />
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-[#FF5500]" />
                    <span>24/7 Support</span>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#E64C00] hover:to-[#FF5500] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 group"
                  >
                    <span>SHOP NOW</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Dots indicator */}
              <div className="flex items-center gap-2 pt-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Right Fiery Neon Pedestal Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-6 lg:p-10 overflow-hidden">
              <div className="relative w-full h-80 sm:h-96 lg:h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/25 via-amber-950/20 to-transparent blur-3xl pointer-events-none" />

                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&auto=format&fit=crop&q=80"
                  alt="High-tech cyberpunk gadget pedestal"
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_20px_40px_rgba(255,85,0,0.3)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. COCKPIT CATEGORY GRID (8 Dark Tiles Matching Reference)
           ===================================================================== */}
        <section aria-label="Gadget Categories" className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {referenceCategories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === cat.label ? 'All' : cat.label)}
                  className={`bg-[#151620] border rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer group ${
                    activeCategory === cat.label
                      ? 'border-[#FF5500] shadow-lg shadow-orange-600/20 bg-[#1C1E2B]'
                      : 'border-white/5 hover:border-[#FF5500]/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0B0C10] flex items-center justify-center text-slate-300 group-hover:text-[#FF5500] group-hover:scale-110 transition-all border border-white/5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            4. FEATURED PRODUCTS (6-Columns Matching Reference)
           ===================================================================== */}
        <section id="catalog" aria-label="Featured Products" className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
                FEATURED PRODUCTS
              </h2>
              <ArrowRight className="w-4 h-4 text-[#FF5500]" />
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-black text-[#FF5500] hover:text-[#FFAA00] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all products &gt;&gt;</span>
            </button>
          </div>

          {/* Empty State */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-[#151620] rounded-3xl border border-dashed border-white/10 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#0B0C10] text-[#FF5500] mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white uppercase">No Products in Store Catalog</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any electronics to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5500] text-white text-xs font-black uppercase hover:bg-[#E64C00] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-[#151620] rounded-3xl border border-white/10 p-8">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white uppercase">No matching products found</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-black text-[#FF5500] bg-[#1E202C] hover:bg-[#282B3A] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-[#151620] border border-white/5 hover:border-[#FF5500]/60 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer group relative shadow-md"
                >
                  {/* Top Badge & Wishlist */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase bg-[#FF5500] text-white shadow-xs">
                      {prod.badge}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="p-1 rounded-full hover:bg-white/5 text-slate-500 hover:text-[#FF5500] transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="aspect-square bg-[#0E0F15] rounded-xl p-2.5 flex items-center justify-center overflow-hidden mb-2.5 border border-white/5">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h4 className="font-black text-xs text-white group-hover:text-[#FF5500] transition-colors line-clamp-1 uppercase">
                      {prod.name}
                    </h4>

                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {prod.specs}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] text-[#FF5500]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current" />
                      ))}
                      <span className="text-slate-500 text-[9px]">({prod.reviewsCount})</span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="pt-2 space-y-2 border-t border-white/5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-[9px] text-slate-500 line-through">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`w-full py-2 px-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          addedProductId === prod.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#E64C00] hover:to-[#FF5500] text-white shadow-orange-600/20'
                        }`}
                      >
                        {addedProductId === prod.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ADDED</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>ADD TO CART</span>
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
            5. LIMITED TIME OFFER PROMO BANNER (Dark Hangar with Tech Gear Showcase)
           ===================================================================== */}
        <section aria-label="Limited Time Offer" className="bg-gradient-to-r from-[#171822] via-[#1C1E2B] to-[#14151E] rounded-3xl p-8 sm:p-12 border border-orange-500/20 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 relative z-10">
            <div className="md:col-span-7 space-y-4">
              <span className="text-[#FF5500] font-black text-xs uppercase tracking-widest block">
                LIMITED TIME OFFER
              </span>

              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                SAVE UP TO 30%
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                Big savings on top tech picks. Professional audio, tactical smartwatches, and next-gen gear.
              </p>

              {/* Countdown timer blocks */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-orange-500/30 text-center">
                  <span className="block font-mono font-black text-sm text-white">02</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-orange-500/30 text-center">
                  <span className="block font-mono font-black text-sm text-white">14</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-orange-500/30 text-center">
                  <span className="block font-mono font-black text-sm text-white">36</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-orange-500/30 text-center">
                  <span className="block font-mono font-black text-sm text-white">48</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Secs</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5500] hover:bg-[#E64C00] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/30 transition-all group"
                >
                  <span>SHOP DEALS</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Tech Gear Showcase */}
            <div className="md:col-span-5 flex items-center justify-center">
              <div className="w-full h-56 sm:h-64 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"
                  alt="High-performance tech gear showcase"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,85,0,0.25)]"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          6. PITCH BLACK CYBER FOOTER
         ===================================================================== */}
      <footer className="border-t border-white/5 bg-[#08090C] mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center text-white font-black text-sm">
                  TH
                </div>
                <span className="text-xl font-black text-white uppercase tracking-wider">
                  {business.name || 'TECHHAVEN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {business.description || 'Your premier destination for verified next-generation electronics and gadgets. Quality tech, tactical service, always.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-white block">SHOP</span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#catalog" className="hover:text-[#FF5500] transition-colors">All Products</a></li>
                <li><a href="#catalog" className="hover:text-[#FF5500] transition-colors">New Arrivals</a></li>
                <li><a href="#catalog" className="hover:text-[#FF5500] transition-colors">Best Sellers</a></li>
                <li><a href="#catalog" className="hover:text-[#FF5500] transition-colors">Tactical Deals</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-white block">CUSTOMER SERVICE</span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span>Help Center</span></li>
                <li><span>Shipping &amp; Delivery</span></li>
                <li><span>Returns &amp; Refunds</span></li>
                {business.phone && <li><span>Support: {business.phone}</span></li>}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-white block">STAY CONNECTED</span>
              <p className="text-xs text-slate-400">
                Subscribe to get the latest updates, exclusive offers, and tech insights.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-xl bg-[#171822] text-xs text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#FF5500] hover:bg-[#E64C00] text-white transition-colors cursor-pointer"
                  title="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'TECHHAVEN'}. All rights reserved.</p>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" /> Secure Checkout</span>
              <span>VISA</span>
              <span>MasterCard</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
              <span>Google Pay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElectronicsTechhavenNeonTemplate;

