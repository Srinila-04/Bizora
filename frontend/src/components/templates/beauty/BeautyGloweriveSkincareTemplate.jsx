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
  Droplet,
  FlaskConical,
  Award,
  PlayCircle,
  Mail,
  Headphones,
  Eye
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const BeautyGloweriveSkincareTemplate = ({
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

  const forestGreen = customColors.primary || '#174A42';
  const softMint = '#EDF5F2';
  const pageBackground = '#F2F7F5';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [glowClubEmail, setGlowClubEmail] = useState('');
  const [glowClubJoined, setGlowClubJoined] = useState(false);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `beauty-real-${idx}`,
        name: p.name,
        description: p.description || 'Infused with clean botanical extracts to restore natural radiance.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Skincare'),
        rating: 4.8 + ((idx % 3) * 0.1),
        reviewsCount: 154 + (idx * 42),
        tag: idx === 0 ? 'BEST SELLER' : idx === 1 ? 'NEW' : idx === 2 ? 'LIMITED' : idx === 3 ? 'SALE' : null,
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 18
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

  // Default circular category highlights
  const categoryHighlights = useMemo(() => {
    const defaultCircles = [
      { name: 'SERUMS', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80' },
      { name: 'MOISTURIZERS', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80' },
      { name: 'CLEANSERS', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80' },
      { name: 'TONERS', img: 'https://images.unsplash.com/photo-1608248597359-0a6d091905ea?w=400&auto=format&fit=crop&q=80' },
      { name: 'EYE CARE', img: 'https://images.unsplash.com/photo-1567928815104-b6360c7f1a30?w=400&auto=format&fit=crop&q=80' },
      { name: 'SUN CARE', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80' }
    ];

    if (categoriesList.length > 1) {
      const realCats = categoriesList.filter((c) => c !== 'All');
      return realCats.slice(0, 6).map((c, i) => ({
        name: c.toUpperCase(),
        img: displayProducts.find((p) => p.category === c)?.images[0] || defaultCircles[i % defaultCircles.length].img
      }));
    }
    return defaultCircles;
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

  const handleJoinClub = (e) => {
    e.preventDefault();
    if (glowClubEmail) {
      setGlowClubJoined(true);
      setGlowClubEmail('');
      setTimeout(() => setGlowClubJoined(false), 4000);
    }
  };

  return (
    <div className="w-full bg-[#F2F7F5] text-[#174A42] font-sans antialiased selection:bg-[#174A42] selection:text-white">
      {/* =====================================================================
          1. TOP ANNOUNCEMENT BAR (Dark Forest Green)
         ===================================================================== */}
      <div className="bg-[#134B42] text-white py-2 px-4 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E4D7]" />
            <span>Free Shipping on Orders Over ₹999</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white/80">
            <span className="hover:text-white cursor-pointer transition-colors">Track Order</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Store Locator</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={onOpenContact}>Contact Us</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. MAIN HEADER (Logo, Nav Links, Search, Cart)
         ===================================================================== */}
      <header className="border-b border-[#D5E5DE] bg-white/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#174A42] flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif font-semibold tracking-wide text-[#174A42]">
                {business.name || 'Glowérive'}
              </span>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#2D7A6E] font-bold">
                Natural Skincare
              </span>
            </div>
          </div>

          {/* Center: Search Field */}
          <div className="hidden lg:flex items-center w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 text-[#2D7A6E]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search botanical skincare..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#EDF5F2] border border-[#D5E5DE] rounded-full focus:outline-none focus:ring-1 focus:ring-[#174A42] text-[#174A42] placeholder:text-[#52897F] transition-all"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#174A42] hover:text-[#2D7A6E] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#174A42]" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-[#EDF5F2] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-[#174A42]" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#174A42] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full hover:bg-[#EDF5F2] transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#174A42]" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#174A42] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* =====================================================================
            3. HERO SHOWCASE: "Skincare that cares, beauty that shines."
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="bg-[#E4EFEA] rounded-[36px] overflow-hidden border border-[#D5E5DE] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[480px]">
            {/* Left Copy */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2D7A6E] block">
                NATURALLY RADIANT
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#134B42] leading-[1.15]">
                Skincare that cares, <br />
                <span className="font-light italic text-[#2D7A6E]">beauty that shines.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#386B61] leading-relaxed max-w-md">
                {business.description ||
                  'Discover the perfect blend of nature and science for healthy, glowing skin every day.'}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#174A42] text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#134B42] transition-all shadow-md group"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#174A42] hover:text-[#2D7A6E] transition-colors"
                >
                  <PlayCircle className="w-5 h-5 text-[#2D7A6E]" />
                  <span>DISCOVER MORE</span>
                </button>
              </div>
            </div>

            {/* Right Radiant Model Visual with Water Droplets */}
            <div className="lg:col-span-6 h-80 sm:h-96 lg:h-full relative overflow-hidden bg-[#D3E5DC]">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&auto=format&fit=crop&q=80"
                alt="Radiant dewy beauty model"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E4EFEA]/80 via-transparent to-transparent hidden lg:block" />
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. FLOATING VALUE PROMISES BAR (White Pill Card)
           ===================================================================== */}
        <section aria-label="Clean Beauty Certification" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E5DE] shadow-sm -mt-6 sm:-mt-10 relative z-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E2ECE7]">
            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF5F2] flex items-center justify-center text-[#174A42]">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-[#174A42]">Natural Ingredients</span>
              <span className="text-[10px] text-[#52897F]">Safe & Effective</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF5F2] flex items-center justify-center text-[#174A42]">
                <Droplet className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-[#174A42]">Dermatologist Tested</span>
              <span className="text-[10px] text-[#52897F]">For All Skin Types</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF5F2] flex items-center justify-center text-[#174A42]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-[#174A42]">Paraben & Sulfate Free</span>
              <span className="text-[10px] text-[#52897F]">Clean & Gentle</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF5F2] flex items-center justify-center text-[#174A42]">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-[#174A42]">Cruelty Free</span>
              <span className="text-[10px] text-[#52897F]">Never Tested on Animals</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            5. CATEGORY CIRCULAR CAROUSEL (6 Circles)
           ===================================================================== */}
        <section aria-label="Category Navigation" className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2D7A6E] block">
              TARGETED FORMULATIONS
            </span>
            <h2 className="text-2xl font-serif text-[#134B42]">
              Shop By Category
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 pt-4">
            {categoryHighlights.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setActiveCategory(cat.name === 'ALL' ? 'All' : cat.name)}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white p-2 border-2 border-[#D5E5DE] group-hover:border-[#174A42] transition-all shadow-xs group-hover:scale-105">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#174A42] tracking-wider uppercase">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-[#52897F] group-hover:underline">
                    Explore
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            6. FEATURED PRODUCTS (4 Cards in a Row Matching Reference)
           ===================================================================== */}
        <section id="catalog" aria-label="Featured Skincare Products" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#D5E5DE] pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#134B42]">
                FEATURED PRODUCTS
              </h2>
              <div className="hidden sm:block w-16 h-px bg-[#D5E5DE]" />
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full border border-[#D5E5DE] bg-white hover:bg-[#EDF5F2] text-[#174A42] transition-colors"
            >
              VIEW ALL
            </button>
          </div>

          {/* In-store Dynamic Category Pills */}
          {categoriesList.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#174A42] text-white shadow-xs'
                      : 'bg-white text-[#386B61] border border-[#D5E5DE] hover:bg-[#EDF5F2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid: 4 Columns Clean Design */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-dashed border-[#CCDED6] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#EDF5F2] text-[#174A42] mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#134B42]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#52897F] mt-1 mb-6 leading-relaxed">
                This beauty store hasn&apos;t added any skincare products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174A42] text-white text-xs font-bold hover:bg-[#134B42] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-[#A3E4D7]" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white rounded-3xl border border-[#D5E5DE] p-8">
              <ShoppingBag className="w-8 h-8 text-[#52897F] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#134B42]">No matching skincare products found</h3>
              <p className="text-xs text-[#52897F] mt-1">Try clearing your search term or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold text-[#174A42] bg-[#EDF5F2] hover:bg-[#D5E5DE] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl overflow-hidden p-4 border border-[#D5E5DE] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Image Container with Tag Badge */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EDF5F2] p-2 flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Tag Badge */}
                    {prod.tag && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#174A42] text-white">
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
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#174A42] hover:text-[#2D7A6E] shadow-xs transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info Body */}
                  <div className="pt-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#134B42] line-clamp-1 group-hover:text-[#2D7A6E] transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <div className="flex items-center text-[#E6B44C]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#52897F]">({prod.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="pt-2 space-y-3 border-t border-[#EDF5F2]">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#174A42]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-xs text-[#52897F] line-through">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`w-full py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          addedProductId === prod.id
                            ? 'bg-[#134B42] text-white'
                            : 'bg-[#174A42] hover:bg-[#134B42] text-white'
                        }`}
                      >
                        {addedProductId === prod.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#A3E4D7]" />
                            <span>ADDED TO CART</span>
                          </>
                        ) : (
                          <>
                            <span>ADD TO CART</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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
            7. SPECIAL PROMOTIONAL BANNER (Deep Forest Green)
           ===================================================================== */}
        <section aria-label="Special Offer" className="bg-[#174A42] text-white rounded-[32px] overflow-hidden p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
            {/* Left Products Image on Slate */}
            <div className="lg:col-span-4 h-56 rounded-2xl overflow-hidden bg-[#134B42]">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
                alt="Organic skincare on slate"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center Offer Text */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#A3E4D7] block">
                SPECIAL OFFER
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif">
                Get 20% Off Your First Order
              </h3>
              <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                Join our glow club & unlock exclusive offers and skincare tips.
              </p>
            </div>

            {/* Right Join Club Form */}
            <div className="lg:col-span-3">
              <div className="bg-[#134B42] p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A3E4D7]">
                  <Mail className="w-4 h-4" />
                  <span>JOIN NOW</span>
                </div>
                <p className="text-[10px] text-white/70 leading-normal">
                  Be the first to know about new arrivals & exclusive deals.
                </p>
                <form onSubmit={handleJoinClub} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={glowClubEmail}
                    onChange={(e) => setGlowClubEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white text-[#174A42] focus:outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl text-xs font-bold bg-[#A3E4D7] text-[#134B42] hover:bg-[#89d6c7] transition-colors cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
                {glowClubJoined && (
                  <p className="text-[10px] text-[#A3E4D7] text-center">
                    Thank you for joining our glow club!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. BOTTOM TRUST STRIP
           ===================================================================== */}
        <section aria-label="Customer Guarantees" className="py-4 border-t border-[#D5E5DE]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[#386B61] text-xs">
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#174A42] shrink-0" />
              <div>
                <span className="font-bold block text-[#174A42]">Free Shipping</span>
                <span className="text-[10px]">On orders over ₹999</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#174A42] shrink-0" />
              <div>
                <span className="font-bold block text-[#174A42]">Secure Payment</span>
                <span className="text-[10px]">100% safe & secure</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#174A42] shrink-0" />
              <div>
                <span className="font-bold block text-[#174A42]">Easy Returns</span>
                <span className="text-[10px]">30 days return policy</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-[#174A42] shrink-0" />
              <div>
                <span className="font-bold block text-[#174A42]">Customer Support</span>
                <span className="text-[10px]">We&apos;re here to help</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          9. FOOTER
         ===================================================================== */}
      <footer className="border-t border-[#D5E5DE] bg-white mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#174A42]" />
                <span className="font-serif text-lg font-bold text-[#174A42]">{business.name || 'Glowérive'}</span>
              </div>
              <p className="text-xs text-[#52897F] leading-relaxed">
                {business.description ||
                  'Clean botanical skincare formulated with clinically validated active ingredients.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#174A42] block">Collections</span>
              <ul className="space-y-2 text-xs text-[#386B61]">
                <li><a href="#catalog" className="hover:text-[#174A42] transition-colors">Serums & Treatments</a></li>
                <li><a href="#catalog" className="hover:text-[#174A42] transition-colors">Moisturizers & Creams</a></li>
                <li><a href="#catalog" className="hover:text-[#174A42] transition-colors">Cleansers & Toners</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#174A42] block">Customer Care</span>
              <ul className="space-y-2 text-xs text-[#386B61]">
                <li><span>Shipping & Delivery</span></li>
                <li><span>Ingredient Transparency</span></li>
                <li><span>Sustainability Pledge</span></li>
                {business.phone && <li><span>Helpline: {business.phone}</span></li>}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#174A42] block">Store Information</span>
              <p className="text-xs text-[#52897F] leading-relaxed">
                {business.address || 'Flagship Clean Beauty Atelier'}
                {business.city && `, ${business.city}`}
                {business.state && `, ${business.state}`}
              </p>
              {business.email && (
                <p className="text-xs text-[#174A42] font-semibold">{business.email}</p>
              )}
            </div>
          </div>

          <div className="border-t border-[#D5E5DE] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#52897F] gap-4">
            <p>&copy; {new Date().getFullYear()} {business.name || 'Glowérive'}. Powered by Bizora.</p>
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

export default BeautyGloweriveSkincareTemplate;

