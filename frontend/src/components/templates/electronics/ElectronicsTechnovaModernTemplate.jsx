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
  Laptop,
  Smartphone,
  Watch,
  Home,
  Gamepad2,
  Camera,
  Layers,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const ElectronicsTechnovaModernTemplate = ({
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

  const royalBlue = customColors.primary || '#2563EB';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `technova-real-${idx}`,
        name: p.name,
        description: p.description || 'Next-generation tech gadget designed for high performance and reliability.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : (parseFloat(p.price || 0) * 1.25),
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Electronics'),
        rating: 4.8,
        reviewsCount: 142 + (idx * 28),
        tagline: idx === 0 ? 'Power Meets Portability' : idx === 1 ? 'Capture More Possibilities' : idx === 2 ? 'Pure Sound, No Limits' : idx === 3 ? 'Healthier, Happier You' : 'Game Beyond Limits',
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 30
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

  const trendingProducts = useMemo(() => {
    return filteredProducts.slice(0, 5);
  }, [filteredProducts]);

  const recommendedProducts = useMemo(() => {
    return filteredProducts.length > 5 ? filteredProducts.slice(5, 10) : filteredProducts.slice(0, 5);
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

  // Fixed 8 visual category bubbles matching reference design
  const referenceBubbleCategories = [
    { label: 'Laptops', icon: Laptop, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80' },
    { label: 'Smartphones', icon: Smartphone, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
    { label: 'Audio', icon: Headphones, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
    { label: 'Wearables', icon: Watch, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80' },
    { label: 'Smart Home', icon: Home, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=80' },
    { label: 'Gaming', icon: Gamepad2, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=300&auto=format&fit=crop&q=80' },
    { label: 'Cameras', icon: Camera, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80' },
    { label: 'Accessories', icon: Layers, img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=300&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* =====================================================================
          1. HEADER WITH BLUE STYLIZED FOLDED 'N' LOGO
         ===================================================================== */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="font-black text-xl tracking-tighter">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {business.name || 'TechNova'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                Smarter Today, Brighter Tomorrow.
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search devices, accessories..."
              className="w-full pl-4 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600"
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
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-blue-600 text-[9px] font-black flex items-center justify-center border border-blue-600">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12 sm:space-y-16">
        {/* =====================================================================
            2. HERO SECTION: "A Smarter Tomorrow Starts Here"
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-[#0B0F19] rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8 z-10">
              <div className="space-y-5">
                <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-sky-400 block">
                  NEXT GEN TECH
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  A Smarter <br />
                  Tomorrow <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                    Starts Here
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                  {business.description || 'Explore the latest devices. Upgrade your lifestyle.'}
                </p>

                <div className="pt-2">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-500/30 group"
                  >
                    <span>Shop the Future</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Bottom 3 Feature Pillars with Carousel Controls */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-300 text-xs">
                <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-200">Innovative Products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-200">Trusted Brands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-200">Better Everyday</span>
                  </div>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-[10px] cursor-pointer hover:text-white">&lsaquo;</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="text-[10px] cursor-pointer hover:text-white">&rsaquo;</span>
                </div>
              </div>
            </div>

            {/* Right Stone Pedestal Gear Visual & Script Annotation */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-6 lg:p-8 overflow-hidden bg-gradient-to-t from-black via-slate-900/60 to-transparent">
              <div className="relative w-full h-80 sm:h-96 lg:h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=80"
                  alt="High-tech devices showcase"
                  className="w-full h-full object-cover rounded-2xl opacity-90 shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent pointer-events-none" />

                {/* Hand-drawn style script annotation */}
                <div className="absolute top-6 right-6 text-right pointer-events-none select-none">
                  <span className="font-serif italic text-sky-300 text-xs sm:text-sm font-medium drop-shadow-md">
                    Technology <br />
                    for a Brighter You
                  </span>
                  <div className="w-8 h-8 text-sky-400 ml-auto mt-0.5 opacity-80">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7l10 10M17 7v10H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. CIRCULAR CATEGORY BUBBLES (8 Items Matching Reference)
           ===================================================================== */}
        <section aria-label="Product Categories" className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6 text-center">
            {referenceBubbleCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === cat.label ? 'All' : cat.label)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-3 transition-all duration-300 shadow-xs ${
                    activeCategory === cat.label
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-500/20 scale-105'
                      : 'bg-gradient-to-b from-sky-50 via-blue-50/50 to-white border border-blue-100/80 text-blue-600 group-hover:scale-105 group-hover:border-blue-300'
                  }`}>
                    <IconComp className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            4. TRENDING PRODUCTS (5-Column Grid Matching Reference Layout)
           ===================================================================== */}
        <section id="catalog" aria-label="Trending Products" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trending Products
            </h2>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Empty State */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-blue-50 text-blue-600 mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Products in Store Catalog</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any electronics &amp; gadgets to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-slate-200 p-8">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {trendingProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  {/* Top Wishlist Heart */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-xs"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="aspect-square bg-slate-50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {prod.tagline || prod.category}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          addedProductId === prod.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                        }`}
                        title="Add to Cart"
                      >
                        {addedProductId === prod.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================================
            5. DUAL PROMOTIONAL CARDS (Flash Offers + New Arrivals)
           ===================================================================== */}
        <section aria-label="Promotional Specials" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Flash Offers */}
          <div className="bg-gradient-to-r from-[#170E2B] via-[#24133F] to-[#361358] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[220px] border border-purple-900/40">
            <div className="space-y-2 relative z-10 max-w-sm">
              <div className="flex items-center gap-1.5 text-xs font-black tracking-wide text-fuchsia-400">
                <Flame className="w-4 h-4 fill-current text-fuchsia-400" />
                <span>FLASH OFFERS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Top Tech. Lower Prices.
              </h3>
              <p className="text-xs text-purple-200">
                Hurry, Limited Time Only!
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 relative z-10">
              <a
                href="#catalog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-purple-950 text-xs font-bold hover:bg-purple-50 transition-colors shadow-xs"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              {/* Countdown boxes */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="px-2 py-1 rounded-md bg-black/50 border border-purple-500/30 font-bold">12 <span className="text-[9px] text-purple-300">Hrs</span></span>
                <span>:</span>
                <span className="px-2 py-1 rounded-md bg-black/50 border border-purple-500/30 font-bold">36 <span className="text-[9px] text-purple-300">Mins</span></span>
                <span>:</span>
                <span className="px-2 py-1 rounded-md bg-black/50 border border-purple-500/30 font-bold">18 <span className="text-[9px] text-purple-300">Secs</span></span>
              </div>
            </div>

            {/* Glowing violet headphones image */}
            <div className="absolute right-2 bottom-0 top-0 w-44 sm:w-56 opacity-85 flex items-center justify-center pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80"
                alt="Flash deals headphones"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)]"
              />
            </div>
          </div>

          {/* Card 2: New Arrivals */}
          <div className="bg-gradient-to-br from-[#E0E7FF] via-[#EDE9FE] to-[#F5F3FF] rounded-3xl p-6 sm:p-8 text-slate-900 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[220px] border border-indigo-100">
            <div className="space-y-2 relative z-10 max-w-sm">
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider inline-block">
                NEW
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                New Arrivals
              </h3>
              <p className="text-xs text-slate-600">
                Be the First to Experience What&apos;s Next!
              </p>
            </div>

            <div className="pt-4 relative z-10">
              <a
                href="#catalog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Modern devices visual */}
            <div className="absolute right-2 bottom-0 top-0 w-44 sm:w-56 opacity-90 flex items-center justify-center pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80"
                alt="New arrivals smartphones"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. RECOMMENDED FOR YOU (5-Column Grid Matching Reference Layout)
           ===================================================================== */}
        {displayProducts.length > 0 && (
          <section aria-label="Recommended for You" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recommended for You
              </h2>

              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {recommendedProducts.map((prod) => (
                <div
                  key={`rec-${prod.id}`}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-xs"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="aspect-square bg-slate-50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {prod.tagline || prod.category}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          addedProductId === prod.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                        }`}
                        title="Add to Cart"
                      >
                        {addedProductId === prod.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            7. TRUST / VALUE BAR (Light Blue Circle Icons)
           ===================================================================== */}
        <section aria-label="Customer Guarantees" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col items-center space-y-2 pt-2 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-slate-900">Free Shipping</span>
              <span className="text-[10px] text-slate-500">On Orders Over ₹5,000</span>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-2 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs">
                <RotateCcw className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-slate-900">Easy Returns</span>
              <span className="text-[10px] text-slate-500">Hassle-Free Within 7 Days</span>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-2 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-slate-900">24/7 Support</span>
              <span className="text-[10px] text-slate-500">We&apos;re Always Here</span>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-2 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-slate-900">Genuine Products</span>
              <span className="text-[10px] text-slate-500">100% Original &amp; Trusted</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. NEWSLETTER BANNER: "Join TechNova+"
           ===================================================================== */}
        <section aria-label="Join TechNova+" className="bg-[#0B132B] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Join {business.name ? `${business.name}+` : 'TechNova+'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Get exclusive deals, early access to new launches and personalized recommendations.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-5 py-3 rounded-full bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>

              <div className="hidden xl:flex items-center gap-2 text-sky-400 text-xs font-serif italic ml-4">
                <Send className="w-3.5 h-3.5" />
                <span>Smarter Deals Straight to Your Inbox</span>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* =====================================================================
          9. FOOTER
         ===================================================================== */}
      <footer className="border-t border-slate-200 bg-white mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Col 1: Store Brand Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                  N
                </div>
                <span className="text-xl font-black text-slate-900">
                  {business.name || 'TechNova'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                {business.description || 'Smarter Today, Brighter Tomorrow. Your trusted portal for cutting-edge electronics and smart gadgets.'}
              </p>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span>Facebook</span>
                <span>•</span>
                <span>Instagram</span>
                <span>•</span>
                <span>YouTube</span>
                <span>•</span>
                <span>LinkedIn</span>
              </div>
            </div>

            {/* Col 2: Shop */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">Shop</span>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#catalog" className="hover:text-blue-600 transition-colors">All Products</a></li>
                <li><a href="#catalog" className="hover:text-blue-600 transition-colors">New Arrivals</a></li>
                <li><a href="#catalog" className="hover:text-blue-600 transition-colors">Best Sellers</a></li>
                <li><a href="#catalog" className="hover:text-blue-600 transition-colors">Deals</a></li>
                <li><span>Gift Cards</span></li>
              </ul>
            </div>

            {/* Col 3: Support */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">Support</span>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><span>Track Order</span></li>
                <li><span>Returns &amp; Refunds</span></li>
                <li><span>Help Center</span></li>
                {business.phone && <li><span>Support: {business.phone}</span></li>}
                {business.email && <li className="text-blue-600 font-semibold">{business.email}</li>}
              </ul>
            </div>

            {/* Col 4: About */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">About</span>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><span>Our Story</span></li>
                <li><span>Sustainability</span></li>
                <li><span>Careers</span></li>
                <li><span>Blog &amp; Tech Press</span></li>
                <li><span>Store Location</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with payment icons & copyright */}
          <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'TechNova'}. All rights reserved.</p>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Shopping</span>
              <span>VISA</span>
              <span>MasterCard</span>
              <span>PayPal</span>
              <span>Technology Empowers Everyone</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElectronicsTechnovaModernTemplate;

