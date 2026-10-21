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
  Volume2,
  Layers,
  Activity,
  CreditCard,
  Mail,
  Flame,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const ElectronicsAuroraCyberTemplate = ({
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

  const mintAccent = customColors.primary || '#4ECCA3';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `aurora-cyber-${idx}`,
        name: p.name,
        description: p.description || 'Precision audio & cybernetic hardware engineered for acoustics and lifestyle elegance.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : (parseFloat(p.price || 0) * 1.3),
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Audio & Gear'),
        rating: 4.9,
        reviewsCount: 165 + (idx * 30),
        discountBadge: idx % 2 === 0 ? '-15%' : idx % 3 === 0 ? '-20%' : 'NEW',
        specs: idx === 0 ? 'Wireless ANC' : idx === 1 ? '48hr Battery' : idx === 2 ? 'Studio Grade' : 'Ultra Low Latency',
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80']),
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

  // Best Selling (first 6) & New Arrivals (next 6 or slice)
  const bestSellingProducts = useMemo(() => {
    return filteredProducts.slice(0, 6);
  }, [filteredProducts]);

  const newArrivalsProducts = useMemo(() => {
    return filteredProducts.length > 6 ? filteredProducts.slice(6, 12) : filteredProducts.slice(0, 6);
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

  // 5 Category Cards with counts matching reference
  const referenceCategories = [
    { label: 'Headphones', count: '24 Products', icon: Headphones, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80' },
    { label: 'Smartwatches', count: '10 Products', icon: Watch, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80' },
    { label: 'Speakers', count: '15 Products', icon: Volume2, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80' },
    { label: 'Accessories', count: '22 Products', icon: Layers, img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=300&auto=format&fit=crop&q=80' },
    { label: 'Lifestyle', count: '32 Products', icon: Activity, img: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=300&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="w-full bg-[#080C0E] text-[#E2F7EE] font-sans antialiased selection:bg-[#4ECCA3] selection:text-[#080C0E]">
      {/* =====================================================================
          1. HEADER WITH MINIMALIST FUTURISM LOGO
         ===================================================================== */}
      <header className="border-b border-[#1A2622] bg-[#0A1012]/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-[#E2F7EE] uppercase">
              {business.name || 'AURORA'}
            </span>
            <span className="text-[10px] tracking-widest text-[#4ECCA3] font-mono uppercase">
              STORE
            </span>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audio, watches, smart lifestyle..."
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-[#111A17] border border-[#1F2E29] rounded-full focus:outline-none focus:ring-1 focus:ring-[#4ECCA3] focus:border-[#4ECCA3] text-[#E2F7EE] placeholder:text-[#5F8578]"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-[#5F8578] hover:text-[#4ECCA3]"
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
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#88D49E] hover:text-[#4ECCA3] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-[#14201C] text-[#88D49E] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4ECCA3] text-[#080C0E] text-[9px] font-black flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full bg-[#4ECCA3] hover:bg-[#88D49E] text-[#080C0E] shadow-sm transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#080C0E] text-[9px] font-black flex items-center justify-center border border-[#4ECCA3]">
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
            2. HERO SECTION: "Elevate Your Everyday"
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-gradient-to-b from-[#0F1E1A] via-[#0C1513] to-[#080C0E] rounded-[36px] overflow-hidden border border-[#1B382F] shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8 z-10">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C]">
                  <span>New Release 2024</span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#E2F7EE] tracking-tight leading-[1.1]">
                  Elevate Your <br />
                  <span className="font-serif italic font-normal text-[#88D49E] drop-shadow-[0_0_20px_rgba(78,204,163,0.3)]">
                    Everyday
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-[#8BAAA0] leading-relaxed max-w-md">
                  {business.description || 'Premium products. Timeless design. Experience the perfect blend of style and performance.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#4ECCA3] hover:bg-[#88D49E] text-[#080C0E] text-xs sm:text-sm font-extrabold tracking-wide transition-all shadow-lg shadow-[#4ECCA3]/20 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a
                    href="#categories"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent border border-[#2D5A4C] hover:border-[#4ECCA3] text-[#E2F7EE] text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Explore Collection</span>
                  </a>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center gap-2 pt-4">
                <span className="w-8 h-1 rounded-full bg-[#4ECCA3]" />
                <span className="w-2 h-1 rounded-full bg-[#20362F]" />
                <span className="w-2 h-1 rounded-full bg-[#20362F]" />
              </div>
            </div>

            {/* Right Cylinder Pedestal Audio Showcase with Mint Ambient Rim */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-6 lg:p-10 overflow-hidden">
              <div className="relative w-full h-80 sm:h-96 lg:h-full flex items-center justify-center">
                {/* Radiant emerald ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4ECCA3]/25 via-emerald-950/20 to-transparent blur-2xl pointer-events-none" />

                <img
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80"
                  alt="Elevated sage headphones on pedestal"
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_15px_30px_rgba(78,204,163,0.25)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. BEST SELLING CATEGORY PILL CARDS (5 Cards with Mint Action Buttons)
           ===================================================================== */}
        <section id="categories" aria-label="Best Selling Categories" className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#E2F7EE]">Best Selling</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C]">
              Bestsellers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {referenceCategories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.label}
                  onClick={() => setActiveCategory(activeCategory === cat.label ? 'All' : cat.label)}
                  className={`bg-[#101715] border rounded-2xl p-4 flex flex-col justify-between h-44 cursor-pointer transition-all duration-300 group ${
                    activeCategory === cat.label
                      ? 'border-[#4ECCA3] shadow-lg shadow-[#4ECCA3]/15'
                      : 'border-[#1E2E2A] hover:border-[#2D5A4C]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-[#16221E] flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform overflow-hidden">
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="w-full h-full object-cover rounded-lg opacity-85"
                    />
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#E2F7EE] group-hover:text-[#4ECCA3] transition-colors">
                        {cat.label}
                      </h4>
                      <span className="text-[10px] text-[#5F8578] font-mono block mt-0.5">
                        {cat.count}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#16221E] text-[#4ECCA3] group-hover:bg-[#4ECCA3] group-hover:text-[#080C0E] flex items-center justify-center text-xs transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            4. BEST SELLING PRODUCT GRID (6-Columns Matching Reference)
           ===================================================================== */}
        <section id="catalog" aria-label="Best Selling Products" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E2E2A] pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#E2F7EE]">Best Selling</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C]">
                Bestsellers
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-bold text-[#4ECCA3] hover:text-[#88D49E] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Empty State */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-[#101715] rounded-3xl border border-dashed border-[#1E2E2A] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#16221E] text-[#4ECCA3] mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#E2F7EE]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#8BAAA0] mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any electronics to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4ECCA3] text-[#080C0E] text-xs font-bold hover:bg-[#88D49E] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-[#080C0E]" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : bestSellingProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-[#101715] rounded-3xl border border-[#1E2E2A] p-8">
              <Search className="w-8 h-8 text-[#5F8578] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#E2F7EE]">No matching products found</h3>
              <p className="text-xs text-[#8BAAA0] mt-1">Try clearing your search or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-[#4ECCA3] bg-[#16221E] hover:bg-[#20362F] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bestSellingProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-[#111917] border border-[#1E2E2A] hover:border-[#4ECCA3]/60 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer group relative shadow-xs"
                >
                  {/* Top Discount Badge & Wishlist */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C]">
                      {prod.discountBadge}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="p-1 rounded-full hover:bg-[#16221E] text-[#5F8578] hover:text-[#4ECCA3] transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail on pedestal */}
                  <div className="aspect-square bg-[#0C1210] rounded-xl p-2 flex items-center justify-center overflow-hidden mb-2.5 border border-[#16221E]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-[#88D49E]">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{prod.rating}</span>
                      <span className="text-[#5F8578]">({prod.reviewsCount})</span>
                    </div>

                    <h4 className="font-bold text-xs text-[#E2F7EE] group-hover:text-[#4ECCA3] transition-colors line-clamp-1">
                      {prod.name}
                    </h4>

                    <span className="text-[10px] text-[#5F8578] block line-clamp-1">
                      {prod.specs}
                    </span>

                    {/* Price and Cart */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#1E2E2A] mt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#E2F7EE]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-[9px] text-[#5F8578] line-through">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          addedProductId === prod.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#18342B] text-[#4ECCA3] hover:bg-[#4ECCA3] hover:text-[#080C0E]'
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
            5. MID-PAGE SUMMER SALE PROMOTIONAL BANNER (Mint Gradient)
           ===================================================================== */}
        <section aria-label="Summer Sale" className="bg-gradient-to-r from-[#7EE8C2] via-[#A8E6CF] to-[#DCEDC1] rounded-[32px] p-8 sm:p-12 text-[#080C0E] relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 relative z-10">
            <div className="md:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/10 text-[#0F291E] inline-block">
                Special Flash Sale
              </span>

              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-[#080C0E] leading-tight">
                Summer Sale <br />
                <span className="underline decoration-[#080C0E]/30">Up to 40% OFF</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#0F291E]/90 max-w-md">
                Don&apos;t miss out on our biggest sale of the season. Premium acoustics, wearables and smart lifestyle tech.
              </p>

              {/* Countdown timer pill cards */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-xs text-center border border-white/60">
                  <span className="block font-black text-sm text-[#080C0E]">02</span>
                  <span className="text-[9px] font-bold text-[#0F291E]/70 uppercase">Days</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-xs text-center border border-white/60">
                  <span className="block font-black text-sm text-[#080C0E]">14</span>
                  <span className="text-[9px] font-bold text-[#0F291E]/70 uppercase">Hours</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-xs text-center border border-white/60">
                  <span className="block font-black text-sm text-[#080C0E]">36</span>
                  <span className="text-[9px] font-bold text-[#0F291E]/70 uppercase">Mins</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-xs text-center border border-white/60">
                  <span className="block font-black text-sm text-[#080C0E]">45</span>
                  <span className="text-[9px] font-bold text-[#0F291E]/70 uppercase">Secs</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#080C0E] hover:bg-black text-[#E2F7EE] text-xs font-bold shadow-md transition-all group"
                >
                  <span>Shop the Sale</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Mint gift bags / audio visual */}
            <div className="md:col-span-4 flex items-center justify-center">
              <div className="w-48 sm:w-64 h-48 sm:h-64 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
                  alt="Summer sale audio"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. NEW ARRIVALS PRODUCT GRID (6-Columns Matching Reference)
           ===================================================================== */}
        {displayProducts.length > 0 && (
          <section aria-label="New Arrivals" className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2E2A] pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#E2F7EE]">New Arrivals</h2>

              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="text-xs font-bold text-[#4ECCA3] hover:text-[#88D49E] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all new arrivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {newArrivalsProducts.map((prod) => (
                <div
                  key={`new-${prod.id}`}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-[#111917] border border-[#1E2E2A] hover:border-[#4ECCA3]/60 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer group relative shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C]">
                      New
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="p-1 rounded-full hover:bg-[#16221E] text-[#5F8578] hover:text-[#4ECCA3] transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="aspect-square bg-[#0C1210] rounded-xl p-2 flex items-center justify-center overflow-hidden mb-2.5 border border-[#16221E]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-[#88D49E]">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{prod.rating}</span>
                      <span className="text-[#5F8578]">({prod.reviewsCount})</span>
                    </div>

                    <h4 className="font-bold text-xs text-[#E2F7EE] group-hover:text-[#4ECCA3] transition-colors line-clamp-1">
                      {prod.name}
                    </h4>

                    <span className="text-[10px] text-[#5F8578] block line-clamp-1">
                      {prod.specs}
                    </span>

                    <div className="pt-2 flex items-center justify-between border-t border-[#1E2E2A] mt-2">
                      <span className="text-xs font-black text-[#E2F7EE]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          addedProductId === prod.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#18342B] text-[#4ECCA3] hover:bg-[#4ECCA3] hover:text-[#080C0E]'
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
            7. VALUE PROMISES BAR (Dark Row with Mint Line Icons)
           ===================================================================== */}
        <section aria-label="Brand Guarantees" className="bg-[#101715] border border-[#1E2E2A] rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#1E2E2A]">
            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <ShieldCheck className="w-6 h-6 text-[#4ECCA3]" />
              <span className="font-bold text-xs text-[#E2F7EE]">Premium Quality</span>
              <span className="text-[10px] text-[#8BAAA0]">Carefully calibrated precision</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <Truck className="w-6 h-6 text-[#4ECCA3]" />
              <span className="font-bold text-xs text-[#E2F7EE]">Free Shipping</span>
              <span className="text-[10px] text-[#8BAAA0]">Free delivery on all orders</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <RotateCcw className="w-6 h-6 text-[#4ECCA3]" />
              <span className="font-bold text-xs text-[#E2F7EE]">Easy Returns</span>
              <span className="text-[10px] text-[#8BAAA0]">30 days easy returns</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <CreditCard className="w-6 h-6 text-[#4ECCA3]" />
              <span className="font-bold text-xs text-[#E2F7EE]">Secure Payments</span>
              <span className="text-[10px] text-[#8BAAA0]">100% encrypted checkout</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
              <Headphones className="w-6 h-6 text-[#4ECCA3]" />
              <span className="font-bold text-xs text-[#E2F7EE]">24/7 Support</span>
              <span className="text-[10px] text-[#8BAAA0]">Dedicated specialist team</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. CUSTOMER TESTIMONIALS ("What Our Customers Say")
           ===================================================================== */}
        <section aria-label="Customer Reviews" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E2E2A] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#E2F7EE]">What Our Customers Say</h2>
            <span className="text-xs text-[#5F8578]">Verified Reviews</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111917] border border-[#1E2E2A] rounded-2xl p-6 space-y-4">
              <blockquote className="text-xs sm:text-sm text-[#8BAAA0] leading-relaxed italic">
                &ldquo;The quality is outstanding and the design is sleek. Every device I have ordered has exceeded my expectations.&rdquo;
              </blockquote>
              <div className="flex items-center gap-1 text-[#4ECCA3]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <div className="pt-2 border-t border-[#1E2E2A] flex items-center justify-between text-xs">
                <span className="font-bold text-[#E2F7EE]">Sarah Jackson</span>
                <span className="text-[10px] text-[#5F8578]">Verified Buyer</span>
              </div>
            </div>

            <div className="bg-[#111917] border border-[#1E2E2A] rounded-2xl p-6 space-y-4">
              <blockquote className="text-xs sm:text-sm text-[#8BAAA0] leading-relaxed italic">
                &ldquo;Fast shipping, great customer service, and amazing acoustics. Highly recommend to any audiophile or tech enthusiast!&rdquo;
              </blockquote>
              <div className="flex items-center gap-1 text-[#4ECCA3]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <div className="pt-2 border-t border-[#1E2E2A] flex items-center justify-between text-xs">
                <span className="font-bold text-[#E2F7EE]">Michael Chen</span>
                <span className="text-[10px] text-[#5F8578]">Verified Buyer</span>
              </div>
            </div>

            <div className="bg-[#111917] border border-[#1E2E2A] rounded-2xl p-6 space-y-4">
              <blockquote className="text-xs sm:text-sm text-[#8BAAA0] leading-relaxed italic">
                &ldquo;I&apos;ve bought multiple audio and wearable gear here. The battery life and noise cancelation are truly top tier.&rdquo;
              </blockquote>
              <div className="flex items-center gap-1 text-[#4ECCA3]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <div className="pt-2 border-t border-[#1E2E2A] flex items-center justify-between text-xs">
                <span className="font-bold text-[#E2F7EE]">Emily Endis</span>
                <span className="text-[10px] text-[#5F8578]">Verified Buyer</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            9. NEWSLETTER BANNER: "Stay in the Loop"
           ===================================================================== */}
        <section aria-label="Stay in the Loop" className="bg-gradient-to-r from-[#7EE8C2] via-[#A8E6CF] to-[#DCEDC1] rounded-3xl p-8 sm:p-10 text-[#080C0E] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-1 text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Mail className="w-5 h-5 text-[#0F291E]" />
                <h3 className="text-2xl font-black text-[#080C0E] tracking-tight">Stay in the Loop</h3>
              </div>
              <p className="text-xs text-[#0F291E]/80">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-3 w-full lg:w-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full sm:w-80 px-5 py-3 rounded-full bg-white text-[#080C0E] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#080C0E] placeholder:text-[#5F8578]"
                required
              />

              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-[#080C0E] hover:bg-black text-[#E2F7EE] font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-md"
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* =====================================================================
          10. FOOTER
         ===================================================================== */}
      <footer className="border-t border-[#1A2622] bg-[#06090A] mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <span className="text-2xl font-black tracking-[0.2em] text-[#E2F7EE] uppercase block">
                {business.name || 'AURORA'}
              </span>
              <p className="text-xs text-[#8BAAA0] leading-relaxed max-w-sm">
                {business.description || 'Premium products for your evolving lifestyle. Acoustic fidelity, hardware engineering, and performance at your fingertips.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E2F7EE] block">Shop</span>
              <ul className="space-y-2 text-xs text-[#8BAAA0]">
                <li><a href="#catalog" className="hover:text-[#4ECCA3] transition-colors">All Products</a></li>
                <li><a href="#catalog" className="hover:text-[#4ECCA3] transition-colors">Best Sellers</a></li>
                <li><a href="#catalog" className="hover:text-[#4ECCA3] transition-colors">New Arrivals</a></li>
                <li><a href="#catalog" className="hover:text-[#4ECCA3] transition-colors">Deals &amp; Bundles</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E2F7EE] block">Customer Care</span>
              <ul className="space-y-2 text-xs text-[#8BAAA0]">
                <li><span>Order Tracking</span></li>
                <li><span>Shipping Policy</span></li>
                <li><span>Warranty &amp; Exchanges</span></li>
                {business.phone && <li><span>Support: {business.phone}</span></li>}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E2F7EE] block">Contact Info</span>
              <p className="text-xs text-[#8BAAA0] leading-relaxed">
                {business.address || 'Tech District, Innovation Boulevard'}
              </p>
              {business.email && <p className="text-xs text-[#4ECCA3] font-bold">{business.email}</p>}
            </div>
          </div>

          <div className="border-t border-[#1A2622] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F8578] gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'AURORA'}. All rights reserved.</p>

            <div className="flex items-center gap-4 text-xs font-semibold text-[#8BAAA0]">
              <span>VISA</span>
              <span>MasterCard</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElectronicsAuroraCyberTemplate;

