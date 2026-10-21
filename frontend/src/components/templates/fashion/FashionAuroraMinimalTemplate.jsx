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
  Check,
  Leaf,
  Clock,
  Headphones,
  Mail,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const FashionAuroraMinimalTemplate = ({
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

  const sageGreen = customColors.primary || '#4E6B50';
  const sageDark = '#3B523D';
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Thoughtfully designed with contemporary silhouettes and premium fabrics.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Contemporary Wear'),
        rating: 4.8 + ((idx % 3) * 0.1),
        reviewsCount: 38 + (idx * 16),
        tag: idx === 0 ? 'BESTSELLER' : idx === 1 ? 'NEW IN' : idx === 2 ? 'SUSTAINABLE' : null,
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 15
      }));
    }
    return [];
  }, [products]);

  // Dynamic Categories derived from merchant's real inventory
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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <div className="w-full bg-[#F3F5EE] text-[#1E251E] font-sans antialiased selection:bg-[#4E6B50] selection:text-white">
      {/* =====================================================================
          1. TOP ANNOUNCEMENT BAR
         ===================================================================== */}
      <div style={{ backgroundColor: sageGreen }} className="text-white py-2.5 px-4 text-center text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
          <span>Get 15% Off Your First Order | Use Code: <strong className="font-bold underline tracking-wider">AURORA15</strong></span>
        </div>
      </div>

      {/* =====================================================================
          2. HEADER / NAVBAR
         ===================================================================== */}
      <header className="border-b border-[#E3E8DC] bg-[#F3F5EE]/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Name / Logo */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-light tracking-[0.2em] uppercase text-[#1E251E] font-serif">
                {business.name || 'AURORA'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#697A6A] font-semibold mt-0.5">
                Everyday Contemporary
              </span>
            </div>
          </div>

          {/* Center: Search Field */}
          <div className="hidden md:flex items-center w-72 lg:w-96 relative">
            <Search className="w-4 h-4 absolute left-3.5 text-[#697A6A]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contemporary styles..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/80 border border-[#D5DDD0] rounded-full focus:outline-none focus:ring-1 focus:ring-[#4E6B50] placeholder:text-[#8D9B8E] transition-all"
            />
          </div>

          {/* Right: Actions (Contact, Wishlist, Cart) */}
          <div className="flex items-center gap-4">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E251E] hover:text-[#4E6B50] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#4E6B50]" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-white/80 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-[#1E251E]" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span style={{ backgroundColor: sageGreen }} className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full hover:bg-white/80 transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#1E251E]" />
              {cartCtx?.totalItems > 0 && (
                <span style={{ backgroundColor: sageGreen }} className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* =====================================================================
            3. HERO SHOWCASE: "Elevate Your Everyday Style"
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#E1E8DC] text-[#3B523D]">
                <Leaf className="w-3 h-3 text-[#4E6B50]" />
                NEW SEASON
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-[#19221A] leading-[1.15] tracking-tight">
                Elevate Your <br />
                <span className="font-normal italic">Everyday Style</span>
              </h1>
              <p className="text-sm sm:text-base text-[#4F5E50] leading-relaxed max-w-lg">
                {business.description ||
                  'Thoughtfully designed pieces that seamlessly blend comfort, elegance, and modern minimalism for your daily wardrobe.'}
              </p>
            </div>

            {/* CTA & Scroll Link */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                style={{ backgroundColor: sageGreen }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide hover:opacity-90 transition-all shadow-md group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#lifestyle"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#3B523D] bg-white border border-[#D5DDD0] hover:bg-[#FAFBF7] transition-all"
              >
                <span>Our Philosophy</span>
              </a>
            </div>

            {/* 3 Pill Feature Highlights */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#DFE5D8]">
              <div className="flex items-center gap-2 text-xs text-[#3B523D]">
                <Truck className="w-4 h-4 text-[#4E6B50] shrink-0" />
                <span className="font-medium">Free Delivery ₹999+</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#3B523D]">
                <Leaf className="w-4 h-4 text-[#4E6B50] shrink-0" />
                <span className="font-medium">Ethically Sourced</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#3B523D]">
                <RotateCcw className="w-4 h-4 text-[#4E6B50] shrink-0" />
                <span className="font-medium">Easy 30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Right Image with Floating Modern Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] rounded-[32px] overflow-hidden bg-[#E2E8DC] shadow-xl p-3">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80"
                alt="Contemporary minimalist fashion"
                className="w-full h-full object-cover rounded-[26px]"
              />

              {/* Floating Modern Pill Badge Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#697A6A] block">
                    Curated Capsule
                  </span>
                  <span className="text-sm font-semibold text-[#19221A]">
                    Autumn & Spring Collection
                  </span>
                </div>
                <a
                  href="#catalog"
                  style={{ backgroundColor: sageGreen }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Explore
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. BESTSELLERS / OUR MOST LOVED STYLES
           ===================================================================== */}
        <section id="catalog" aria-label="Bestsellers Catalog" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#DFE5D8] pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#697A6A] block">
                CURATED SELECTION
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#19221A] mt-0.5">
                Our Most Loved Styles
              </h2>
              <p className="text-xs text-[#5C6E5E] mt-1 max-w-md">
                Handpicked favourites designed to effortlessly elevate every occasion.
              </p>
            </div>

            {/* In-store Dynamic Category Filter */}
            {categoriesList.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#19221A] text-white shadow-xs'
                        : 'bg-white text-[#4F5E50] border border-[#D5DDD0] hover:bg-[#EAEFE6]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid: 4 Columns Clean Minimalist Design */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-dashed border-[#CCD5C6] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#E5EDE0] text-[#4E6B50] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#19221A]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#5C6E5E] mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  style={{ backgroundColor: sageGreen }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold hover:opacity-90 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-[#D5DDD0] p-8">
              <ShoppingBag className="w-8 h-8 text-[#8D9B8E] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#19221A]">No matching styles found</h3>
              <p className="text-xs text-[#5C6E5E] mt-1">Try clearing your search term or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold text-[#19221A] bg-[#DFE5D8] hover:bg-[#D5DDD0] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl overflow-hidden p-3 border border-[#E3E8DC] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F3F5EE]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Tag Badge */}
                    {prod.tag && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#19221A] text-white">
                        {prod.tag}
                      </span>
                    )}

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistCtx?.toggleWishlist && wishlistCtx.toggleWishlist(prod);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#1E251E] hover:text-[#4E6B50] shadow-xs transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info Body */}
                  <div className="pt-3 pb-1 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#697A6A] mb-1">
                        <span>{prod.category}</span>
                        <div className="flex items-center gap-1 text-[#E6B44C]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[#19221A] font-semibold text-[10px]">{prod.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h4 className="font-serif text-sm sm:text-base font-normal text-[#19221A] line-clamp-1 group-hover:text-[#4E6B50] transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F3EC]">
                      <div>
                        <span className="text-sm sm:text-base font-semibold text-[#19221A]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-xs text-[#8D9B8E] line-through ml-1.5">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        style={{ backgroundColor: addedProductId === prod.id ? '#3B523D' : sageGreen }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition-all hover:opacity-95 shadow-xs cursor-pointer"
                      >
                        {addedProductId === prod.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
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
            5. LIFESTYLE SPLIT BANNER: "More Than Fashion, It's a Lifestyle"
           ===================================================================== */}
        <section id="lifestyle" aria-label="Lifestyle Philosophy" className="rounded-3xl bg-white border border-[#DFE5D8] overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Photo */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative overflow-hidden bg-[#E2E8DC]">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80"
                alt="Mindful contemporary fashion"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                <span className="text-white text-xs font-medium tracking-wider uppercase">
                  Mindfully Designed &bull; Modern Aesthetics
                </span>
              </div>
            </div>

            {/* Right Feature Highlights */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#697A6A] block">
                  BRAND CORE VALUES
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#19221A] mt-1">
                  More Than Fashion, <br />It&apos;s a Lifestyle
                </h3>
                <p className="text-xs sm:text-sm text-[#4F5E50] mt-2 leading-relaxed">
                  We believe in clothing that honors conscious simplicity. Everyday pieces designed with intentional craftsmanship that transition effortlessly from day to evening.
                </p>
              </div>

              {/* 4 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#F5F7F1] border border-[#E3E8DC] space-y-1">
                  <div className="flex items-center gap-2 text-[#3B523D] font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#4E6B50]" />
                    <span>Premium Quality</span>
                  </div>
                  <p className="text-[11px] text-[#697A6A] leading-normal">
                    Crafted with sustainable, enduring fabrics designed for everyday wear.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F7F1] border border-[#E3E8DC] space-y-1">
                  <div className="flex items-center gap-2 text-[#3B523D] font-semibold text-xs">
                    <Leaf className="w-4 h-4 text-[#4E6B50]" />
                    <span>Sustainable Choices</span>
                  </div>
                  <p className="text-[11px] text-[#697A6A] leading-normal">
                    Mindful packaging and ethically managed manufacturing partners.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F7F1] border border-[#E3E8DC] space-y-1">
                  <div className="flex items-center gap-2 text-[#3B523D] font-semibold text-xs">
                    <Truck className="w-4 h-4 text-[#4E6B50]" />
                    <span>Fast Delivery</span>
                  </div>
                  <p className="text-[11px] text-[#697A6A] leading-normal">
                    Quick dispatch with door-to-door tracking nationwide.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F7F1] border border-[#E3E8DC] space-y-1">
                  <div className="flex items-center gap-2 text-[#3B523D] font-semibold text-xs">
                    <Headphones className="w-4 h-4 text-[#4E6B50]" />
                    <span>Dedicated Support</span>
                  </div>
                  <p className="text-[11px] text-[#697A6A] leading-normal">
                    Friendly sizing assistance and real-time order support anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. STAT COUNTERS BAR
           ===================================================================== */}
        <section aria-label="Key Metrics" className="rounded-2xl bg-white border border-[#DFE5D8] py-8 px-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#DFE5D8]">
            <div className="pt-2 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-serif font-light text-[#19221A] block">50K+</span>
              <span className="text-xs text-[#697A6A] font-medium tracking-wide mt-1 block">Happy Customers</span>
            </div>
            <div className="pt-2 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-serif font-light text-[#19221A] block">1,000+</span>
              <span className="text-xs text-[#697A6A] font-medium tracking-wide mt-1 block">Curated Styles</span>
            </div>
            <div className="pt-2 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-serif font-light text-[#19221A] block">25+</span>
              <span className="text-xs text-[#697A6A] font-medium tracking-wide mt-1 block">Countries Shipped</span>
            </div>
            <div className="pt-2 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-serif font-light text-[#19221A] block">4.9 / 5</span>
              <span className="text-xs text-[#697A6A] font-medium tracking-wide mt-1 block">Customer Rating</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            7. TESTIMONIALS: "Loved by Modern Women"
           ===================================================================== */}
        <section aria-label="Customer Testimonials" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#697A6A] block">
              REAL EXPERIENCES
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#19221A]">
              Loved by Modern Women
            </h3>
            <p className="text-xs text-[#5C6E5E]">
              What our discerning community of modern dressers have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DFE5D8] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#E6B44C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#334234] leading-relaxed italic">
                  &ldquo;The drape of the fabric and tailored fit exceeded all my expectations. It feels effortlessly chic whether at work or Sunday brunch.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#F0F3EC] pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#19221A] block">Ananya Sharma</span>
                  <span className="text-[10px] text-[#697A6A]">Verified Buyer &bull; Mumbai</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#4E6B50]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DFE5D8] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#E6B44C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#334234] leading-relaxed italic">
                  &ldquo;Such a refreshing brand. Premium minimal aesthetics without the inflated luxury price tag. Fast delivery and lovely packaging too.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#F0F3EC] pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#19221A] block">Pooja Nair</span>
                  <span className="text-[10px] text-[#697A6A]">Verified Buyer &bull; Bengaluru</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#4E6B50]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DFE5D8] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#E6B44C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#334234] leading-relaxed italic">
                  &ldquo;I bought three outfits from their collection and all of them fit true to size. The breathable linen blend is perfect for all day wear.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#F0F3EC] pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#19221A] block">Rhea Malhotra</span>
                  <span className="text-[10px] text-[#697A6A]">Verified Buyer &bull; New Delhi</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#4E6B50]" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. NEWSLETTER BANNER (Sage Green Bar)
           ===================================================================== */}
        <section
          style={{ backgroundColor: sageGreen }}
          aria-label="Newsletter Subscription"
          className="rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-lg"
        >
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/80 block">
              JOIN THE COMMUNITY
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-light">
              Elevate Your Daily Edit
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Subscribe to receive exclusive collection drops, minimalist style guides, and 15% off your first purchase.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-full text-xs text-[#19221A] bg-white focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#19221A] text-white text-xs font-semibold hover:bg-black transition-colors shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>

            {newsletterSubscribed && (
              <p className="text-xs text-white bg-black/20 py-1.5 px-3 rounded-full inline-block">
                Thank you for subscribing! Check your inbox for your 15% discount code.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================================
          9. FOOTER
         ===================================================================== */}
      <footer className="border-t border-[#DFE5D8] bg-white mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <span className="text-xl font-light tracking-[0.2em] uppercase font-serif text-[#19221A]">
                {business.name || 'AURORA'}
              </span>
              <p className="text-xs text-[#697A6A] leading-relaxed">
                {business.description ||
                  'Everyday contemporary clothing crafted with ethical integrity and minimalist aesthetics.'}
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19221A] block">Explore</span>
              <ul className="space-y-2 text-xs text-[#4F5E50]">
                <li><a href="#catalog" className="hover:text-[#4E6B50] transition-colors">All Collections</a></li>
                <li><a href="#catalog" className="hover:text-[#4E6B50] transition-colors">Bestsellers</a></li>
                <li><a href="#lifestyle" className="hover:text-[#4E6B50] transition-colors">Brand Philosophy</a></li>
              </ul>
            </div>

            {/* Col 3: Customer Care */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19221A] block">Customer Care</span>
              <ul className="space-y-2 text-xs text-[#4F5E50]">
                <li><span>Shipping Policy</span></li>
                <li><span>Returns & Exchanges</span></li>
                <li><span>Size Guide</span></li>
                {business.phone && <li><span>Helpline: {business.phone}</span></li>}
              </ul>
            </div>

            {/* Col 4: Store Address & Details */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19221A] block">Store Information</span>
              <p className="text-xs text-[#697A6A] leading-relaxed">
                {business.address || 'Flagship Studio, Fashion District'}
                {business.city && `, ${business.city}`}
                {business.state && `, ${business.state}`}
              </p>
              {business.email && (
                <p className="text-xs text-[#4E6B50] font-medium">{business.email}</p>
              )}
            </div>
          </div>

          <div className="border-t border-[#DFE5D8] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#697A6A] gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'AURORA'}. Powered by Bizora.</p>
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

export default FashionAuroraMinimalTemplate;

