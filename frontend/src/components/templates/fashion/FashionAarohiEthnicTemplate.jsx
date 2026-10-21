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
  Flower2,
  Scissors,
  Check
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export const FashionAarohiEthnicTemplate = ({
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

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Normalize real products from merchant database
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Crafted with premium heritage fabrics for timeless comfort and celebrations.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Ethnic Wear'),
        rating: 4.7 + ((idx % 3) * 0.1),
        reviewsCount: 45 + (idx * 14),
        tag: idx === 0 ? 'NEW' : idx === 1 ? 'BEST SELLER' : idx === 2 ? 'SALE' : null,
        swatches: ['#E5B894', '#8FA27C', '#C15C5C'],
        images: p.images && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 12
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

  return (
    <div className="w-full bg-[#FAF7F2] text-[#2C231F] font-serif antialiased selection:bg-[#9B111E] selection:text-white">
      {/* =====================================================================
          1. HEADER WITH CENTERED BRAND LOGO
         ===================================================================== */}
      <header className="border-b border-[#EAE3D6] bg-[#FAF7F2]/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Contact & Store Search */}
          <div className="flex items-center gap-3 w-1/3">
            <div className="relative hidden md:block w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#2C231F]/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collection..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/70 border border-[#E0D7C8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#9B111E] font-sans"
              />
            </div>
          </div>

          {/* Center: Brand Logo with Flower Motif */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#9B111E]/10 flex items-center justify-center text-[#9B111E]">
                <Flower2 className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal tracking-wide text-[#2C231F] font-serif">
                {business.name || 'Aarohi'}
              </h1>
            </div>
            <span className="text-[9px] font-sans tracking-[0.2em] text-[#7A6E65] uppercase mt-0.5">
              Traditional Meets Trendy
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 w-1/3 font-sans text-xs">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#2C231F] hover:text-[#9B111E] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#9B111E]" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => wishlistCtx?.wishlist && navigate('/customer/wishlist')}
              className="relative p-2 rounded-full hover:bg-white/60 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-[#2C231F]" />
              {wishlistCtx?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#9B111E] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCtx.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cartCtx?.cart && navigate('/customer/cart')}
              className="relative p-2 rounded-full hover:bg-white/60 transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#2C231F]" />
              {cartCtx?.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#9B111E] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCtx.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* =====================================================================
            2. HERO BILLBOARD: ETHNIC WEAR FOR EVERY YOU
           ===================================================================== */}
        <section aria-label="Hero Showcase" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Typography & Value Promises */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#8C7A6B] uppercase block">
                TRADITIONAL MEETS TRENDY
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#1F1713] leading-[1.1] tracking-tight">
                ETHNIC WEAR <br />
                FOR EVERY YOU
              </h2>
              <p className="text-sm sm:text-base font-sans text-[#6B5E53] leading-relaxed max-w-lg">
                {business.description ||
                  'Kurtis sets, lehengas and more — crafted for comfort, confidence and celebrations.'}
              </p>
            </div>

            {/* Shop Now Action */}
            <div className="pt-1">
              <a
                href="#catalog"
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#1F1713] text-white text-xs font-sans font-bold uppercase tracking-widest rounded-full hover:bg-[#382C25] transition-all shadow-md active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3 Core Value Guarantees */}
            <div className="pt-4 border-t border-[#EAE3D6] grid grid-cols-3 gap-3 font-sans text-[11px] text-[#594E44]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#9B111E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#1F1713]">Free Shipping</span>
                  <span className="text-[10px] text-[#7A6E65]">Above ₹1,999</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#9B111E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#1F1713]">Easy Returns</span>
                  <span className="text-[10px] text-[#7A6E65]">Within 7 Days</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#9B111E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#1F1713]">100% Original</span>
                  <span className="text-[10px] text-[#7A6E65]">Products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Rounded Portrait Card with Purple Saree Indian Model & Red Backdrop */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] rounded-[36px] overflow-hidden bg-[#8B1E28] shadow-2xl p-3 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80"
                alt="Ethnic saree fashion"
                className="w-full h-full object-cover rounded-[30px]"
              />
              {/* Cursive Signature Watermark Overlay */}
              <div className="absolute top-6 right-8 text-white/90 font-serif italic text-sm sm:text-base drop-shadow-md pointer-events-none tracking-wide">
                Ethnic Style Redefined ♡
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. TRENDING NOW (6 Portrait Cards with Swatches & "Add to Bag")
           ===================================================================== */}
        <section id="catalog" aria-label="Trending Catalog" className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#EAE3D6] pb-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block">
                TRENDING NOW
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#1F1713] mt-0.5">
                Trending Now
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-full border border-[#D9D0C1] bg-white flex items-center justify-center text-[#2C231F] hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                aria-label="Previous styles"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => prev + 1)}
                className="w-8 h-8 rounded-full border border-[#D9D0C1] bg-white flex items-center justify-center text-[#2C231F] hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                aria-label="Next styles"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-store Dynamic Category Pills */}
          {categoriesList.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-sans text-xs">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#1F1713] text-white shadow-xs'
                      : 'bg-white text-[#594E44] border border-[#E0D7C8] hover:bg-[#F5EFE6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid: 6 Columns matching Reference */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-dashed border-[#D9D0C1] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#FAF4EA] text-[#9B111E] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-serif font-bold text-[#1F1713]">No Products in Store Catalog</h4>
              <p className="text-xs font-sans text-[#7A6E65] mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F1713] text-white text-xs font-sans font-bold hover:bg-[#382C25] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-[#E6B44C]" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-[#E0D7C8] p-8 font-sans">
              <ShoppingBag className="w-8 h-8 text-[#A89C8F] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#1F1713]">No matching styles found</h4>
              <p className="text-xs text-[#7A6E65] mt-1">Try clearing your search term or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-[#1F1713] bg-[#EAE3D6] hover:bg-[#DFD7C8] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {filteredProducts.slice(0, 12).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl overflow-hidden p-2.5 border border-[#EAE3D6] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                      {prod.tag ? (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[8px] font-sans font-black uppercase tracking-wider ${
                            prod.tag === 'NEW'
                              ? 'bg-black text-white'
                              : prod.tag === 'BEST SELLER'
                              ? 'bg-[#5C6B47] text-white'
                              : 'bg-[#D96B6B] text-white'
                          }`}
                        >
                          {prod.tag}
                        </span>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (wishlistCtx?.toggleWishlist) wishlistCtx.toggleWishlist(prod.id);
                        }}
                        className="pointer-events-auto w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#2C231F] shadow-xs"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="mt-2.5 space-y-1.5 font-sans">
                    <h4 className="font-serif font-bold text-xs text-[#1F1713] truncate">
                      {prod.name}
                    </h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <span>★ {prod.rating?.toFixed(1) || '4.7'}</span>
                      <span className="text-[#8C7A6B]">({prod.reviewsCount || 79})</span>
                    </div>

                    {/* Price and Compare At */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="font-bold text-xs text-[#1F1713]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.compareAtPrice && (
                        <span className="text-[10px] line-through text-[#9E9185]">
                          ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {prod.swatches?.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-2 h-2 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Add to Bag Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="w-full mt-2 py-1.5 rounded-full text-[10px] font-bold text-[#1F1713] border border-[#2C231F] hover:bg-[#1F1713] hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      {addedProductId === prod.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
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
            4. LIMITED TIME PROMOTIONAL BANNER (Flat 20% Off + 2x2 Value Grid)
           ===================================================================== */}
        <section aria-label="Limited Time Promotion" className="bg-[#FCEEEF] rounded-[32px] p-6 sm:p-10 border border-[#F5D5D8] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Limited Time Discount Copy */}
            <div className="lg:col-span-4 space-y-3 text-left">
              <span className="font-serif italic text-xl text-[#9B111E] block">
                Limited Time
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#1F1713] leading-tight">
                Flat 20% Off
              </h3>
              <p className="text-xs font-sans text-[#7A6E65]">
                On Selected Ethnic Wear Collections
              </p>
              <div className="pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F1713] text-white text-xs font-sans font-bold uppercase tracking-widest rounded-full hover:bg-[#382C25] transition-all shadow-xs"
                >
                  <span>Shop Sale</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Center: Model Portrait Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="Ethnic model portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: 4 White Pill Guarantee Cards in 2x2 Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 font-sans text-xs">
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-white space-y-1">
                <Flower2 className="w-4 h-4 text-[#9B111E]" />
                <h5 className="font-bold text-[11px] text-[#1F1713]">Premium Fabrics</h5>
                <p className="text-[10px] text-[#7A6E65]">For Lasting Comfort</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-white space-y-1">
                <Sparkles className="w-4 h-4 text-[#9B111E]" />
                <h5 className="font-bold text-[11px] text-[#1F1713]">Trendy Designs</h5>
                <p className="text-[10px] text-[#7A6E65]">For Every Occasion</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-white space-y-1">
                <Scissors className="w-4 h-4 text-[#9B111E]" />
                <h5 className="font-bold text-[11px] text-[#1F1713]">Perfect Fit</h5>
                <p className="text-[10px] text-[#7A6E65]">For All Body Types</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-white space-y-1">
                <Truck className="w-4 h-4 text-[#9B111E]" />
                <h5 className="font-bold text-[11px] text-[#1F1713]">Fast & Secure</h5>
                <p className="text-[10px] text-[#7A6E65]">Delivery Across India</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          5. FOOTER
         ===================================================================== */}
      <footer className="border-t border-[#EAE3D6] bg-[#FAF7F2] py-14 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-[#594E44]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-[#9B111E]" />
              <h4 className="font-serif font-bold text-lg text-[#1F1713]">{business.name || 'Aarohi'}</h4>
            </div>
            <p className="text-xs text-[#7A6E65] leading-relaxed max-w-xs font-serif italic">
              Grace in Every Thread
            </p>
            <p className="text-[11px] text-[#8C7A6B]">
              {business.address || 'Bengaluru, India'} • {business.phone || '+91 98765 43210'}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[#1F1713] mb-3 uppercase tracking-wider text-[11px]">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#1F1713] cursor-pointer">Home</li>
              <li className="hover:text-[#1F1713] cursor-pointer">Shop All Collections</li>
              <li className="hover:text-[#1F1713] cursor-pointer">About Us</li>
              <li className="hover:text-[#1F1713] cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#1F1713] mb-3 uppercase tracking-wider text-[11px]">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#1F1713] cursor-pointer">Shipping Policy</li>
              <li className="hover:text-[#1F1713] cursor-pointer">Returns & Exchange</li>
              <li className="hover:text-[#1F1713] cursor-pointer">FAQs</li>
              <li className="hover:text-[#1F1713] cursor-pointer">Track Order</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-[#1F1713] uppercase tracking-wider text-[11px]">Join Our Newsletter</h5>
            <p className="text-xs text-[#7A6E65]">Get exclusive offers and style inspiration.</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-3 py-2 bg-white border border-[#D9D0C1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#9B111E]"
              />
              <button
                type="button"
                className="px-4 py-2 bg-[#1F1713] text-white rounded-lg text-xs font-bold hover:bg-[#382C25] transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#EAE3D6] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7A6B] gap-2">
          <span>© 2026 {business.name || 'Aarohi'}. All rights reserved.</span>
          <span>Made with ❤️ for your style.</span>
        </div>
      </footer>
    </div>
  );
};

export default FashionAarohiEthnicTemplate;

