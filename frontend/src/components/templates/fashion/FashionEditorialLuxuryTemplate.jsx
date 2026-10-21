import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Heart,
  Star,
  Play,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Store,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

// Default curated products matching Lunora Fashion aesthetic
const DEFAULT_LUNORA_PRODUCTS = [
  {
    id: 'lunora-1',
    name: 'Linen Blend Blazer',
    description: 'Relaxed single-breasted blazer in breathable linen-viscose blend',
    price: 3499,
    compareAtPrice: 4299,
    category: 'Women',
    rating: 5,
    reviewsCount: 124,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'lunora-2',
    name: 'Ribbed Knit Scoop Top',
    description: 'Fitted scoop neckline knit top in ultra-soft organic modal',
    price: 1299,
    compareAtPrice: null,
    category: 'Tops',
    rating: 4.9,
    reviewsCount: 98,
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'lunora-3',
    name: 'Wide Leg Tailored Trousers',
    description: 'High-waisted pleated ecru trousers with fluid drape and side pockets',
    price: 2499,
    compareAtPrice: 2999,
    category: 'Dresses',
    rating: 4.8,
    reviewsCount: 76,
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'lunora-4',
    name: 'Leather Saddle Shoulder Bag',
    description: 'Minimalist tan leather shoulder bag with gold-tone custom buckle',
    price: 3199,
    compareAtPrice: null,
    category: 'Bags',
    rating: 5,
    reviewsCount: 112,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'lunora-5',
    name: 'Minimal Strappy Block Heels',
    description: 'Classic black strappy sandals with comfortable 2-inch block heel',
    price: 1999,
    compareAtPrice: 2499,
    category: 'Shoes',
    rating: 4.7,
    reviewsCount: 64,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'lunora-6',
    name: 'Oversized Tortoise Sunglasses',
    description: 'UV400 protective oversized acetate frames in dark tortoiseshell',
    price: 899,
    compareAtPrice: null,
    category: 'Accessories',
    rating: 4.9,
    reviewsCount: 53,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80']
  }
];

export const FashionEditorialLuxuryTemplate = ({
  business,
  products = [],
  isPreview = false,
  customColors = {},
  onOpenContact
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
  const [lookbookModal, setLookbookModal] = useState(false);

  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Timeless pieces crafted for comfort and understated luxury.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: p.category?.name || p.category || (idx % 2 === 0 ? 'Women' : 'Tops'),
        rating: 5,
        reviewsCount: 40 + idx * 12,
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 10
      }));
    }
    return [];
  }, [products]);

  const categoriesList = useMemo(() => {
    const cats = new Set();
    displayProducts.forEach((p) => {
      const cat = typeof p.category === 'object' ? p.category?.name : p.category;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats)];
  }, [displayProducts]);

  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchCat = activeCategory === 'All' || (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase()));
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [displayProducts, activeCategory, searchTerm]);

  const handleProductClick = (productId) => {
    if (isPreview) return;
    navigate(`/customer/stores/${business.id || business.slug}/products/${productId}`);
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1A1A] font-serif antialiased space-y-16">
      {/* 1. TOP EDITORIAL HEADER */}
      <header className="border-b border-[#E8E3DA] bg-[#FAF8F5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link
            to={isPreview ? '#' : `/customer/stores/${business.id || business.slug}`}
            className="flex items-center gap-3"
          >
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-9 h-9 object-contain"
              />
            ) : null}
            <div>
              <span className="text-xl sm:text-2xl font-black uppercase tracking-widest text-[#1A1A1A]">
                {business.name || 'LUNORA FASHION'}
              </span>
              <span className="block text-[9px] font-sans font-medium uppercase tracking-[0.2em] text-[#78716C]">
                Atelier Collection
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-sans font-bold uppercase tracking-widest text-[#44403C]">
            <span className="hover:text-black cursor-pointer border-b border-black pb-0.5">All Products</span>
            <span className="hover:text-black cursor-pointer">New Arrivals</span>
            <span className="hover:text-black cursor-pointer">Women</span>
            <span className="hover:text-black cursor-pointer">Men</span>
            <span className="hover:text-black cursor-pointer text-rose-700">Sale</span>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-black cursor-pointer text-xs font-sans font-bold uppercase tracking-widest"
              >
                Inquire
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 text-[#1A1A1A]">
            <div className="relative hidden sm:block w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#78716C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1 text-xs bg-transparent border-b border-[#D6D0C4] focus:outline-none focus:border-black font-sans"
              />
            </div>

            <Link to={isPreview ? '#' : '/customer/cart'} className="relative p-1 hover:opacity-75 transition-opacity" title="Cart">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-mono flex items-center justify-center">
                {cartCtx?.totalItems || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. SPLIT EDITORIAL HERO */}
        <section
          aria-label="Editorial Lookbook Hero"
          className="bg-[#F4EFE6] rounded-3xl overflow-hidden p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-sans uppercase font-bold tracking-[0.25em] text-[#78716C] block">
              NEW COLLECTION
            </span>

            <h1 className="text-4xl sm:text-6xl font-normal leading-[1.1] text-[#1A1A1A] tracking-tight">
              Elevate Your <br />
              <span className="italic font-normal">Everyday Style</span>
            </h1>

            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans max-w-md">
              {business.description || 'Discover timeless pieces crafted for comfort, designed for elegance, made for you.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-sans">
              <a
                href="#bestsellers"
                className="px-7 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setLookbookModal(true)}
                className="px-6 py-3.5 border border-black/30 hover:border-black text-black text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-black" />
                <span>Watch Lookbook</span>
              </button>
            </div>

            {/* 3 Guarantees Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D6D0C4] font-sans text-xs text-[#57534E]">
              <div>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>Free Shipping</span>
                </div>
                <span className="text-[10px] text-[#78716C]">On orders over ₹999</span>
              </div>

              <div>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>Easy Returns</span>
                </div>
                <span className="text-[10px] text-[#78716C]">30-day exchange</span>
              </div>

              <div>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>Secure Payment</span>
                </div>
                <span className="text-[10px] text-[#78716C]">100% protected</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-[460px] sm:h-[540px] rounded-2xl overflow-hidden shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
                alt="Model in tailored blazer"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* 3. CIRCULAR CATEGORY PILLS ROW */}
        <section aria-label="Quick Category Icons" className="space-y-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 scrollbar-none font-sans">
            {[
              { name: 'Women', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
              { name: 'Men', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
              { name: 'Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&auto=format&fit=crop&q=80' },
              { name: 'Tops', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150&auto=format&fit=crop&q=80' },
              { name: 'Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&auto=format&fit=crop&q=80' },
              { name: 'Bags', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&auto=format&fit=crop&q=80' },
              { name: 'Accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80' },
              { name: 'Sale', isSale: true }
            ].map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#D6D0C4] p-1 group-hover:border-black transition-all">
                  {cat.isSale ? (
                    <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-wider">
                      Sale
                    </div>
                  ) : (
                    <img src={cat.img} alt={cat.name} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-xs font-semibold text-[#44403C] group-hover:text-black">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. SHOP BY CATEGORY / FIND YOUR PERFECT STYLE (4 Portrait Cards) */}
        <section aria-label="Category Editorial Cards" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8E3DA] pb-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#78716C] block">
                SHOP BY CATEGORY
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                Find Your Perfect Style
              </h2>
            </div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline cursor-pointer flex items-center gap-1">
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Women's Collection",
                img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: "Men's Collection",
                img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'Dresses & Gowns',
                img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'Accessories & Bags',
                img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
              }
            ].map((col, idx) => (
              <div
                key={idx}
                className="h-96 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={col.img}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 text-white font-sans">
                  <h3 className="text-lg font-serif font-medium">{col.title}</h3>
                  <span className="text-xs text-white/80 font-semibold tracking-wider mt-1 group-hover:underline flex items-center gap-1">
                    <span>Explore Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. DUAL PROMO BANNERS SPLIT */}
        <section aria-label="Promotional Banners" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#EBE5DA] rounded-3xl p-8 sm:p-10 flex flex-col justify-between h-72 relative overflow-hidden">
            <div className="space-y-2 max-w-xs relative z-10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#78716C] block">
                LIMITED TIME OFFER
              </span>
              <h3 className="text-2xl sm:text-3xl font-normal text-[#1A1A1A] leading-snug">
                Spring Sale <br />
                <span className="italic font-serif">Up to 50% Off</span>
              </h3>
              <a
                href="#bestsellers"
                className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-sans font-bold uppercase tracking-widest inline-flex items-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <span>Shop The Sale</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80"
              alt="Spring Sale Model"
              className="absolute right-0 bottom-0 w-52 h-full object-cover opacity-90 mix-blend-multiply"
            />
          </div>

          <div className="bg-[#E5DFD4] rounded-3xl p-8 sm:p-10 flex flex-col justify-between h-72 relative overflow-hidden">
            <div className="space-y-2 max-w-xs relative z-10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#78716C] block">
                NEW ARRIVALS
              </span>
              <h3 className="text-2xl sm:text-3xl font-normal text-[#1A1A1A] leading-snug">
                Fresh Styles <br />
                <span className="italic font-serif">Just Landed</span>
              </h3>
              <a
                href="#bestsellers"
                className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-sans font-bold uppercase tracking-widest inline-flex items-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <span>Explore New In</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80"
              alt="Coat rack"
              className="absolute right-0 bottom-0 w-56 h-full object-cover opacity-90 mix-blend-multiply"
            />
          </div>
        </section>

        {/* 6. BEST SELLERS / OUR MOST LOVED PICKS (6 Product Cards) */}
        <section id="bestsellers" aria-label="Best Sellers" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8E3DA] pb-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#78716C] block">
                BEST SELLERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                Our Most Loved Picks
              </h2>
            </div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline cursor-pointer flex items-center gap-1">
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto px-4 border border-dashed border-[#18181B]/20 rounded-3xl p-8 bg-[#FAF8F5]">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-stone-100 text-stone-800 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg tracking-wider uppercase text-stone-900">Collection In Preparation</h3>
              <p className="text-xs text-stone-500 mt-2 font-light leading-relaxed">
                This store has not published any curated pieces to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-xl shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-[#E6B44C]" />
                  <span>Add First Piece</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white/70 rounded-2xl border border-stone-200 p-8">
              <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <h4 className="text-sm font-serif font-bold text-stone-900">No matching pieces found</h4>
              <p className="text-xs text-stone-500 mt-1">Try selecting another category or clearing your search term.</p>
              <button
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold text-black bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {filteredProducts.slice(0, 6).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-white rounded-2xl overflow-hidden p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative w-full h-56 rounded-xl overflow-hidden bg-[#FAF8F5]">
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
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 shadow-xs"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 font-sans">
                    <h4 className="font-serif font-bold text-xs text-[#1A1A1A] truncate">
                      {prod.name}
                    </h4>
                    <div className="font-bold text-xs text-black">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <span>★★★★★</span>
                      <span className="text-[#78716C]">({prod.reviewsCount || 100})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. TRUST BADGES STRIP */}
        <section aria-label="Customer Guarantees" className="bg-[#F4EFE6] rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-black">Free Shipping</span>
                <span className="text-[11px] text-[#78716C]">On orders over ₹999</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-black">Easy Returns</span>
                <span className="text-[11px] text-[#78716C]">30-day returns window</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-black">Secure Payment</span>
                <span className="text-[11px] text-[#78716C]">100% protected gateway</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-black">24/7 Support</span>
                <span className="text-[11px] text-[#78716C]">We&apos;re here to help</span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. NEWSLETTER / JOIN OUR STYLE LIST BANNER */}
        <section aria-label="Join Style List" className="bg-[#EBE5DA] rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                alt="Style list ambassador"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716C] block">
              GET 10% OFF YOUR FIRST ORDER
            </span>
            <h3 className="text-3xl font-serif text-[#1A1A1A]">
              Join Our Style List
            </h3>
            <p className="text-xs text-[#57534E] max-w-md">
              Sign up for exclusive previews, new seasonal drops, and private atelier invitations.
            </p>
            <div className="flex items-center gap-2 max-w-md pt-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-white border border-[#D6D0C4] text-xs w-full focus:outline-none focus:border-black font-sans"
              />
              <button className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest shrink-0 hover:bg-neutral-800 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 9. LUNORA LUXURY FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-14 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="text-lg font-serif font-normal tracking-widest uppercase">
              {business.name || 'LUNORA FASHION'}
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-xs font-serif italic">
              {business.description || 'Timeless fashion for every moment. Designed with you in mind.'}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Shop</h5>
            <ul className="space-y-2 text-neutral-400">
              <li className="hover:text-white cursor-pointer">All Products</li>
              <li className="hover:text-white cursor-pointer">New Arrivals</li>
              <li className="hover:text-white cursor-pointer">Women</li>
              <li className="hover:text-white cursor-pointer">Men</li>
              <li className="hover:text-white cursor-pointer">Sale</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Customer Care</h5>
            <ul className="space-y-2 text-neutral-400">
              {onOpenContact && (
                <li onClick={onOpenContact} className="hover:text-white cursor-pointer font-bold text-amber-200">
                  Contact Us
                </li>
              )}
              <li className="hover:text-white cursor-pointer">Shipping & Delivery</li>
              <li className="hover:text-white cursor-pointer">Returns & Exchanges</li>
              <li className="hover:text-white cursor-pointer">Size Guide</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Stay Connected</h5>
            <p className="text-neutral-400 text-xs">Sign up for updates and get 10% off your first order.</p>
            <div className="flex items-center border border-neutral-700">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 bg-transparent text-xs w-full focus:outline-none text-white"
              />
              <button className="px-3 py-2 bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200">
                →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionEditorialLuxuryTemplate;
