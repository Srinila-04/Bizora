import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CreditCard,
  Check,
  Award,
  Leaf,
  HeartHandshake
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const FashionKynaChikankariTemplate = ({
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

  const terracotta = customColors.primary || '#A36B63';
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Intricately handcrafted Chikankari embroidery on breathable cotton-mulmul.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || (idx % 2 === 0 ? 'Kurtas' : 'Sets')),
        rating: 5,
        reviewsCount: 54 + (idx * 18),
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 15
      }));
    }
    return [];
  }, [products]);

  // Dynamic Categories derived from real products
  const categoriesList = useMemo(() => {
    const cats = new Set();
    displayProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [displayProducts]);

  // Filtered products
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
    <div className="w-full bg-[#FAF8F5] text-[#29221F] font-serif antialiased selection:bg-[#A36B63] selection:text-white">
      {/* =====================================================================
          1. TOP ANNOUNCEMENT BAR (Terracotta)
         ===================================================================== */}
      <div className="bg-[#A36B63] text-white text-[10px] sm:text-xs font-sans tracking-wider py-2 px-4 flex flex-wrap items-center justify-between">
        <span className="hidden sm:inline">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span className="mx-auto sm:mx-0 font-medium">COD AVAILABLE | EASY RETURNS</span>
        <div className="hidden sm:flex items-center gap-2">
          <span>AUTHENTIC ARTISANAL CHIKANKARI</span>
        </div>
      </div>

      {/* =====================================================================
          2. MAIN NAVIGATION BAR
         ===================================================================== */}
      <header className="border-b border-[#EAE3DA] bg-[#FAF8F5]/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo with Diamond Motif */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#A36B63] text-white flex items-center justify-center text-xs font-serif shadow-xs">
              ✦
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif tracking-[0.15em] uppercase text-[#29221F]">
                {business.name || 'KYNA STUDIO'}
              </h1>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 font-sans text-xs uppercase tracking-widest text-[#574C45]">
            <a href="#hero" className="hover:text-[#A36B63] transition-colors">HOME</a>
            <a href="#trending" className="hover:text-[#A36B63] transition-colors">SHOP</a>
            <a href="#editorial" className="hover:text-[#A36B63] transition-colors">COLLECTION</a>
            <a href="#bestsellers" className="hover:text-[#A36B63] transition-colors">NEW ARRIVALS</a>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-[#A36B63] transition-colors uppercase tracking-widest"
              >
                CONTACT US
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 font-sans text-xs">
            <div className="relative hidden md:block w-44">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#574C45]/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E0D7CC] rounded-full focus:outline-none focus:ring-1 focus:ring-[#A36B63]"
              />
            </div>

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-white transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-[#29221F]" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#A36B63] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full hover:bg-white transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#29221F]" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#A36B63] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          3. HERO BANNER: ARCHITECTURAL CHIKANKARI SHOWCASE
         ===================================================================== */}
      <section id="hero" aria-label="Hero Showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="bg-[#F2ECE4] rounded-[36px] overflow-hidden border border-[#EAE2D8] grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left: Typography */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#1F1713] leading-[1.15]">
                TIMELESS ELEGANCE, <br />
                <span className="italic font-serif font-light text-[#A36B63]">CRAFTED FOR YOU</span>
              </h2>
              <p className="text-sm sm:text-base font-sans text-[#6B5E53] leading-relaxed max-w-md pt-2">
                {business.description || 'Premium Chikankari & Ethnic Wear for the Modern Woman.'}
              </p>
            </div>

            <div className="pt-2">
              <a
                href="#trending"
                className="inline-block px-8 py-3.5 bg-[#A36B63] hover:bg-[#8F5B53] text-white text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                SHOP NOW
              </a>
            </div>
          </div>

          {/* Right: Chikankari Model Image */}
          <div className="lg:col-span-6 h-80 sm:h-96 lg:h-[500px] overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80"
              alt="Chikankari Kurta"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* 4 Trust Badges Strip Below Hero */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] flex items-center gap-3">
            <Award className="w-5 h-5 text-[#A36B63] shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px] text-[#29221F]">PREMIUM QUALITY</span>
              <span className="text-[10px] text-[#7A6E65]">Fabrics & Craftsmanship</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#A36B63] shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px] text-[#29221F]">SECURE PAYMENT</span>
              <span className="text-[10px] text-[#7A6E65]">100% Secure Checkout</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-[#A36B63] shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px] text-[#29221F]">EASY RETURNS</span>
              <span className="text-[10px] text-[#7A6E65]">Hassle Free Returns</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#A36B63] shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px] text-[#29221F]">COD AVAILABLE</span>
              <span className="text-[10px] text-[#7A6E65]">Across India</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. TRENDING NOW SECTION (5 Column Product Cards)
         ===================================================================== */}
      <section id="trending" aria-label="Trending Catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE3DA] pb-4">
          <h3 className="text-2xl sm:text-3xl font-serif text-[#29221F]">
            Trending Now
          </h3>
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#A36B63] hover:underline cursor-pointer flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Dynamic Category Filter Pills */}
        {categoriesList.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-sans text-xs">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#A36B63] text-white shadow-xs'
                    : 'bg-white text-[#574C45] border border-[#E0D7CC] hover:bg-[#F2ECE4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid: 5 Columns matching Reference */}
        {displayProducts.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-dashed border-[#E0D7CC] p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#F2ECE4] text-[#A36B63] mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-serif font-bold text-[#29221F]">Collection In Preparation</h4>
            <p className="text-xs font-sans text-[#7A6E65] mt-1 mb-6 leading-relaxed">
              This store has not published any Chikankari pieces to its catalog yet.
            </p>
            {isPreview && (
              <Link
                to="/merchant/products/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A36B63] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#8F5B53] transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Add First Piece</span>
              </Link>
            )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-[#EAE3DA] p-8 font-sans">
            <ShoppingBag className="w-8 h-8 text-[#A89C8F] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#29221F]">No matching pieces found</h4>
            <p className="text-xs text-[#7A6E65] mt-1">Try selecting another category or clearing your search term.</p>
            <button
              type="button"
              onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
              className="mt-3 px-4 py-1.5 bg-[#F2ECE4] text-[#29221F] text-xs font-bold hover:bg-[#EAE2D8] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {filteredProducts.slice(0, 10).map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleProductClick(prod.id)}
                className="bg-white rounded-2xl overflow-hidden p-3 border border-[#EAE3DA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF8F5]">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (wishlistCtx?.toggleWishlist) wishlistCtx.toggleWishlist(prod.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#29221F] shadow-xs"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 font-sans">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#29221F] truncate">
                    {prod.name}
                  </h4>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1F1713]">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    {prod.compareAtPrice && (
                      <span className="text-[10px] line-through text-[#9E9185]">
                        ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <span>★★★★★</span>
                    <span className="text-[#8C7A6B]">({prod.reviewsCount || 87})</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, prod)}
                    className="w-full mt-2 py-1.5 border border-[#D9CEBF] text-[#29221F] hover:border-[#A36B63] hover:text-[#A36B63] rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    {addedProductId === prod.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <span>Add to Bag</span>
                        <ShoppingBag className="w-3 h-3 text-[#A36B63]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          5. EDITORIAL CATEGORY SHOWCASE (3 Split Cards)
         ===================================================================== */}
      <section id="editorial" aria-label="Editorial Showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: New Arrivals Just For You */}
          <div className="bg-[#F4ECE4] rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-72 relative overflow-hidden border border-[#EAE0D6]">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#7A6E65] block">
                NEW ARRIVALS
              </span>
              <h4 className="text-2xl font-serif text-[#1F1713] italic">
                Just For You
              </h4>
            </div>
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
              alt="Pink Kurta"
              className="absolute right-0 bottom-0 w-44 h-full object-cover mix-blend-multiply opacity-95"
            />
          </div>

          {/* Card 2: Handcrafted With Love */}
          <div className="bg-[#EAE4DC] rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-72 relative overflow-hidden border border-[#DDD6CE]">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#7A6E65] block">
                OUR COLLECTION
              </span>
              <h4 className="text-xl font-serif uppercase tracking-wider text-[#1F1713]">
                HANDCRAFTED <br />
                <span className="italic font-light text-[#A36B63]">With Love</span>
              </h4>
            </div>
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
              alt="Fabrics"
              className="absolute right-0 bottom-0 w-48 h-full object-cover mix-blend-multiply opacity-90"
            />
          </div>

          {/* Card 3: Exclusive Chikankari Elegance Redefined */}
          <div className="bg-[#E7E0D6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-72 relative overflow-hidden border border-[#DBD3C8]">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#7A6E65] block">
                EXCLUSIVE
              </span>
              <h4 className="text-xl font-serif uppercase tracking-wider text-[#1F1713]">
                CHIKANKARI <br />
                <span className="italic font-light text-[#A36B63]">Elegance Redefined</span>
              </h4>
            </div>
            <img
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80"
              alt="Embroidery"
              className="absolute right-0 bottom-0 w-48 h-full object-cover mix-blend-multiply opacity-90"
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. BEST SELLERS SECTION (6 Cards)
         ===================================================================== */}
      <section id="bestsellers" aria-label="Best Sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-serif text-[#29221F] tracking-widest uppercase">
            BEST SELLERS
          </h3>
          <div className="w-10 h-0.5 bg-[#A36B63] mx-auto" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayProducts.slice(0, 6).map((prod) => (
            <div
              key={`bs-${prod.id}`}
              onClick={() => handleProductClick(prod.id)}
              className="bg-white rounded-2xl overflow-hidden p-2.5 border border-[#EAE3DA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF8F5]">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-2.5 space-y-1 font-sans text-center">
                <h4 className="font-serif font-medium text-xs text-[#29221F] truncate">
                  {prod.name}
                </h4>
                <div className="font-bold text-xs text-[#1F1713]">
                  ₹{prod.price.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-center gap-1 text-[9px] text-amber-600">
                  <span>★★★★★</span>
                  <span className="text-[#8C7A6B]">({prod.reviewsCount || 100})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          7. CRAFTSMANSHIP & VALUE STRIP (Blush Pink)
         ===================================================================== */}
      <section aria-label="Craftsmanship Promises" className="bg-[#FBECEE] py-8 border-y border-[#F3D7DC] font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center text-[#594943]">
          <div className="flex flex-col items-center space-y-1">
            <Award className="w-5 h-5 text-[#A36B63]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#29221F]">Authentic Chikankari</span>
            <span className="text-[10px] text-[#7A6B65]">Heritage Craft</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <Sparkles className="w-5 h-5 text-[#A36B63]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#29221F]">Premium Fabrics</span>
            <span className="text-[10px] text-[#7A6B65]">Quality Cotton & Mulmul</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <HeartHandshake className="w-5 h-5 text-[#A36B63]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#29221F]">Designed in India</span>
            <span className="text-[10px] text-[#7A6B65]">Made with Love</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#A36B63]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#29221F]">Comfort First</span>
            <span className="text-[10px] text-[#7A6B65]">All Day Easy Wear</span>
          </div>

          <div className="flex flex-col items-center space-y-1 col-span-2 sm:col-span-1">
            <Leaf className="w-5 h-5 text-[#A36B63]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#29221F]">Sustainable</span>
            <span className="text-[10px] text-[#7A6B65]">Conscious Choice</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. FOOTER WITH NEWSLETTER & SOCIAL
         ===================================================================== */}
      <footer className="bg-[#FAF8F5] py-14 border-t border-[#EAE3DA] font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-[#574C45]">
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-lg text-[#29221F] tracking-widest uppercase">
              {business.name || 'KYNA STUDIO'}
            </h4>
            <p className="text-xs text-[#7A6E65] leading-relaxed max-w-xs font-serif">
              A women&apos;s clothing atelier that celebrates the timeless art of Chikankari with modern elegance.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[#29221F] mb-3 uppercase tracking-wider text-[11px]">SHOP</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#29221F] cursor-pointer">All Collections</li>
              <li className="hover:text-[#29221F] cursor-pointer">Kurtas</li>
              <li className="hover:text-[#29221F] cursor-pointer">Sets & Anarkalis</li>
              <li className="hover:text-[#29221F] cursor-pointer">Dupattas</li>
              <li className="hover:text-[#29221F] cursor-pointer">Fabrics</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#29221F] mb-3 uppercase tracking-wider text-[11px]">CUSTOMER CARE</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#29221F] cursor-pointer">Shipping Policy</li>
              <li className="hover:text-[#29221F] cursor-pointer">Return & Exchange</li>
              <li className="hover:text-[#29221F] cursor-pointer">FAQs</li>
              <li className="hover:text-[#29221F] cursor-pointer">Size Guide</li>
              <li className="hover:text-[#29221F] cursor-pointer">Terms & Conditions</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-[#29221F] uppercase tracking-wider text-[11px]">STAY IN THE LOOP</h5>
            <p className="text-xs text-[#7A6E65]">Sign up for exclusive updates, new arrivals, and special offers.</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-white border border-[#D9CEBF] text-xs focus:outline-none focus:ring-1 focus:ring-[#A36B63]"
              />
              <button
                type="button"
                className="px-4 py-2 bg-[#A36B63] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8F5B53] transition-colors"
              >
                SUBSCRIBE
              </button>
            </div>
            <div className="pt-2 text-[11px] text-[#7A6E65]">
              Contact: {business.phone || '+91 82345 67890'} • {business.address || 'India'}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#EAE3DA] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7A6B] gap-2">
          <span>© 2026 {business.name || 'Kyna Studio'}. All Rights Reserved.</span>
          <div className="flex items-center gap-3">
            <span>VISA</span>
            <span>MasterCard</span>
            <span>UPI</span>
            <span>Paytm</span>
            <span>RuPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionKynaChikankariTemplate;

