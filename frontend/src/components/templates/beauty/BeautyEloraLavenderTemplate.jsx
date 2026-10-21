import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
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
  Leaf,
  Flower2,
  CheckCircle2,
  Globe2,
  Award,
  Mail,
  Headphones
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const BeautyEloraLavenderTemplate = ({
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

  const royalPlum = customColors.primary || '#4A2373';
  const lilacAccent = '#6B3BA6';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `elora-real-${idx}`,
        name: p.name,
        description: p.description || 'Clean, high-performance formulation designed to empower your natural beauty.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Clean Beauty'),
        rating: 4.9,
        reviewsCount: 140 + (idx * 28),
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 15
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

  // 5 Visual Category Cards (Reference style)
  const categoryTiles = useMemo(() => {
    const defaultTiles = [
      { name: 'Skincare', count: '120+ Products', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80' },
      { name: 'Makeup', count: '55+ Products', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80' },
      { name: 'Haircare', count: '80+ Products', img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80' },
      { name: 'Bodycare', count: '180+ Products', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80' },
      { name: 'Health & Wellness', count: '90+ Products', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80' }
    ];

    if (categoriesList.length > 1) {
      const realCats = categoriesList.filter((c) => c !== 'All');
      return realCats.slice(0, 5).map((c, i) => {
        const prodCount = displayProducts.filter((p) => p.category === c).length;
        const prod = displayProducts.find((p) => p.category === c);
        return {
          name: c,
          count: `${prodCount * 10}+ Products`,
          img: prod?.images[0] || defaultTiles[i % defaultTiles.length].img
        };
      });
    }
    return defaultTiles;
  }, [categoriesList, displayProducts]);

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
      setNewsletterSent(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSent(false), 4000);
    }
  };

  return (
    <div className="w-full bg-[#FBF8FD] text-[#2C1445] font-sans antialiased selection:bg-[#4A2373] selection:text-white">
      {/* =====================================================================
          1. HEADER (Floral Emblem & Minimalist Purple Bar)
         ===================================================================== */}
      <header className="border-b border-[#EEDBFA] bg-white/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A2373] flex items-center justify-center text-white shadow-xs">
              <Flower2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif tracking-widest text-[#2C1445] uppercase font-light">
                {business.name || 'ELORA'}
              </span>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#6B3BA6] font-semibold">
                BEAUTY
              </span>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 text-[#6B3BA6]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clean beauty..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8F2FC] border border-[#EEDBFA] rounded-full focus:outline-none focus:ring-1 focus:ring-[#4A2373] placeholder:text-[#8D65B5]"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A2373] hover:text-[#6B3BA6] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-[#F6F0FA] text-[#4A2373] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4A2373] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full hover:bg-[#F6F0FA] text-[#4A2373] transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4A2373] text-white text-[9px] font-bold flex items-center justify-center">
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
            2. HERO SHOWCASE: "Beauty Naturally. Shine Confidently."
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-gradient-to-r from-[#F6F0FA] via-[#FBF8FD] to-[#EEDBFA] rounded-[36px] overflow-hidden border border-[#EEDBFA] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[480px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-white/80 text-[#6B3BA6] border border-[#EEDBFA] shadow-xs">
                CLEAN BEAUTY. REAL YOU.
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#2C1445] leading-[1.15]">
                Beauty Naturally. <br />
                <span className="font-light italic text-[#6B3BA6]">Shine Confidently.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#5D3D7A] leading-relaxed max-w-md">
                {business.description ||
                  'High-performance health & beauty products for healthy skin, hair & body.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#4A2373] text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#3B1C5A] transition-all shadow-md group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#story"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#4A2373] border border-[#EEDBFA] text-xs sm:text-sm font-semibold hover:bg-[#F6F0FA] transition-colors"
                >
                  <span>Explore Skincare</span>
                </a>
              </div>
            </div>

            {/* Right Still-Life Cosmetic Display with Lavender on Slate */}
            <div className="lg:col-span-5 h-80 sm:h-96 lg:h-full relative overflow-hidden flex items-center justify-center p-6">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&auto=format&fit=crop&q=80"
                alt="Lavender infused clean beauty cosmetics"
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. VALUE PROMISES BAR (Thin Purple Line Icons)
           ===================================================================== */}
        <section aria-label="Brand Promises" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEDBFA] shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#F3EBF7]">
            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <Leaf className="w-5 h-5 text-[#6B3BA6]" />
              <span className="font-bold text-xs text-[#2C1445]">Clean Ingredients</span>
              <span className="text-[10px] text-[#7A5B96]">Authentic &amp; trusted brands</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <Sparkles className="w-5 h-5 text-[#6B3BA6]" />
              <span className="font-bold text-xs text-[#2C1445]">Cruelty Free</span>
              <span className="text-[10px] text-[#7A5B96]">Never animal tested</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <ShieldCheck className="w-5 h-5 text-[#6B3BA6]" />
              <span className="font-bold text-xs text-[#2C1445]">Dermatologically Tested</span>
              <span className="text-[10px] text-[#7A5B96]">Approved by experts</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <Flower2 className="w-5 h-5 text-[#6B3BA6]" />
              <span className="font-bold text-xs text-[#2C1445]">Sustainable Beauty</span>
              <span className="text-[10px] text-[#7A5B96]">Eco-friendly inside &amp; out</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. FIVE ARCHED CATEGORY TILES
           ===================================================================== */}
        <section aria-label="Product Categories" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryTiles.map((tile, idx) => (
              <div
                key={idx}
                onClick={() => setActiveCategory(tile.name)}
                className="bg-white rounded-3xl p-4 border border-[#EEDBFA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F6F0FA] mb-3">
                  <img
                    src={tile.img}
                    alt={tile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-bold text-[#2C1445] group-hover:text-[#6B3BA6] transition-colors">
                    {tile.name}
                  </h3>
                  <span className="text-[10px] text-[#7A5B96] block mt-0.5">
                    {tile.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            5. ABOUT ELORA STORY SPLIT BANNER
           ===================================================================== */}
        <section id="story" aria-label="Brand Story" className="bg-white rounded-[32px] overflow-hidden border border-[#EEDBFA] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Model Photo */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative overflow-hidden bg-[#F6F0FA]">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"
                alt="Clean beauty natural face"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Story & 3 Metric Badges */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B3BA6] block">
                  ABOUT {business.name?.toUpperCase() || 'ELORA'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#2C1445]">
                  Beauty That&apos;s Clean. <br />Confidence That&apos;s Real.
                </h3>
                <p className="text-xs sm:text-sm text-[#5D3D7A] leading-relaxed">
                  We believe high-performance beauty should be clean, honest, and empowering. Our formulas combine modern botanical nature and active cosmetic science to help every body feel good and radiant.
                </p>
              </div>

              {/* 3 Circular Badges */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-2xl bg-[#FBF8FD] border border-[#EEDBFA] space-y-1">
                  <div className="flex items-center justify-center text-[#6B3BA6]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#2C1445] block">98%</span>
                  <span className="text-[9px] text-[#7A5B96] leading-tight block">Natural Ingredients</span>
                </div>

                <div className="text-center p-3 rounded-2xl bg-[#FBF8FD] border border-[#EEDBFA] space-y-1">
                  <div className="flex items-center justify-center text-[#6B3BA6]">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#2C1445] block">50+</span>
                  <span className="text-[9px] text-[#7A5B96] leading-tight block">Expert Formulations</span>
                </div>

                <div className="text-center p-3 rounded-2xl bg-[#FBF8FD] border border-[#EEDBFA] space-y-1">
                  <div className="flex items-center justify-center text-[#6B3BA6]">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#2C1445] block">30+</span>
                  <span className="text-[9px] text-[#7A5B96] leading-tight block">Countries Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. OUR BESTSELLERS ("Loved By Thousands")
           ===================================================================== */}
        <section id="catalog" aria-label="Our Bestsellers" className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#EEDBFA] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B3BA6] block">
                OUR BESTSELLERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#2C1445] mt-0.5">
                Loved By Thousands
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold text-[#6B3BA6] hover:text-[#4A2373] flex items-center gap-1 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Grid: 5 Columns Matching Reference Layout */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-dashed border-[#EEDBFA] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#F6F0FA] text-[#4A2373] mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#2C1445]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#7A5B96] mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any clean beauty products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A2373] text-white text-xs font-bold hover:bg-[#3B1C5A] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-[#EEDBFA] p-8">
              <ShoppingBag className="w-8 h-8 text-[#7A5B96] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#2C1445]">No matching beauty products found</h3>
              <p className="text-xs text-[#7A5B96] mt-1">Try clearing your search or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-[#4A2373] bg-[#F6F0FA] hover:bg-[#EEDBFA] cursor-pointer"
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
                  className="bg-white rounded-3xl overflow-hidden p-4 border border-[#EEDBFA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FBF8FD] p-2 flex items-center justify-center">
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
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#4A2373] hover:text-[#6B3BA6] shadow-xs transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info Body */}
                  <div className="pt-3 space-y-2 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-[#2C1445] line-clamp-1 group-hover:text-[#6B3BA6] transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-[#E6B44C]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[#2C1445] font-semibold text-[10px]">4.9</span>
                        <span className="text-[#7A5B96] text-[10px]">({prod.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price and Cart Action */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#F3EBF7]">
                      <span className="text-sm font-bold text-[#2C1445]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`p-2 rounded-full transition-all cursor-pointer shadow-xs ${
                          addedProductId === prod.id
                            ? 'bg-[#2C1445] text-white'
                            : 'bg-[#F6F0FA] hover:bg-[#4A2373] text-[#4A2373] hover:text-white'
                        }`}
                        title="Add to Bag"
                      >
                        {addedProductId === prod.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
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
            7. CUSTOMER TESTIMONIAL QUOTE BAR (Lavender Sprigs)
           ===================================================================== */}
        <section aria-label="Customer Testimonial" className="bg-[#F6F0FA] rounded-3xl p-8 border border-[#EEDBFA] shadow-xs relative overflow-hidden">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-[#EEDBFA]">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
                alt="Sarah J. verified customer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-[#2C1445] italic font-serif leading-relaxed">
                &ldquo;Elora Beauty has completely transformed my skincare routine. My skin has never felt healthier and radiant!&rdquo;
              </p>
              <div className="text-xs font-bold text-[#6B3BA6]">
                — Sarah J. <span className="font-normal text-[#7A5B96]">&bull; Verified Clean Beauty Enthusiast</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          8. ROYAL PLUM FOOTER (5 Columns Matching Reference)
         ===================================================================== */}
      <footer className="bg-[#4A2373] text-white mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
            {/* Col 1: Stay Glowing */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider block">Stay Glowing</span>
              <p className="text-white/80 leading-relaxed text-[11px]">
                Join our newsletter and receive 10% off your first order.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white text-[#4A2373] hover:bg-white/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              {newsletterSent && (
                <span className="text-[10px] text-[#EEDBFA] block">Subscribed! Check your inbox.</span>
              )}
            </div>

            {/* Col 2: Shop */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider block">Shop</span>
              <ul className="space-y-2 text-white/80">
                <li><a href="#catalog" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Skincare</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Makeup</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Haircare</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Bodycare</a></li>
              </ul>
            </div>

            {/* Col 3: Customer Care */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider block">Customer Care</span>
              <ul className="space-y-2 text-white/80">
                <li><span>Track Order</span></li>
                <li><span>Shipping &amp; Delivery</span></li>
                <li><span>Returns &amp; Refunds</span></li>
                <li><span>FAQs</span></li>
                <li onClick={onOpenContact} className="cursor-pointer hover:text-white"><span>Contact Us</span></li>
              </ul>
            </div>

            {/* Col 4: Company */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider block">Company</span>
              <ul className="space-y-2 text-white/80">
                <li><span>About Us</span></li>
                <li><span>Our Ingredients</span></li>
                <li><span>Community</span></li>
                <li><span>Careers</span></li>
              </ul>
            </div>

            {/* Col 5: Contact Us */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider block">Contact Us</span>
              <p className="text-white/80 leading-relaxed text-[11px]">
                {business.address || 'Los Angeles, CA'}
                {business.city && `, ${business.city}`}
              </p>
              {business.phone && (
                <p className="text-white font-medium">{business.phone}</p>
              )}
              {business.email && (
                <p className="text-[#EEDBFA] font-medium">{business.email}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'Elora Beauty'}. All Rights Reserved. Powered by Bizora.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BeautyEloraLavenderTemplate;

