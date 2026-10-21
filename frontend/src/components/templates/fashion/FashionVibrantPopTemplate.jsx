import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Heart,
  ChevronDown,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Store,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

// Default sample products tailored to Vibrant Pop style if merchant has no products yet
const DEFAULT_POP_PRODUCTS = [
  {
    id: 'pop-1',
    name: 'Short Party Dress',
    description: 'Technical tomato jacquard with joey motif and soft-stretch lining',
    price: 1499,
    compareAtPrice: 1899,
    category: 'Dresses',
    tag: 'Hot',
    discount: '20% OFF',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-2',
    name: 'Supima Cotton Cropped Knit',
    description: 'Ultra-soft pastel knit sweater with ribbed cuffs and crew collar',
    price: 999,
    compareAtPrice: 1299,
    category: 'T-shirts',
    tag: 'New',
    discount: '15% OFF',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-3',
    name: 'Fluffy Faux Fur Festival Coat',
    description: 'Statement magenta plush coat with satin lining and oversized fit',
    price: 2999,
    compareAtPrice: 3499,
    category: 'Coats',
    tag: 'Trending',
    discount: 'Sale',
    images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-4',
    name: 'Glamour Sequin Cocktail Blazer',
    description: 'Tailored evening blazer with hand-stitched blush sequins',
    price: 2499,
    compareAtPrice: 2999,
    category: 'Jackets',
    tag: 'Popular',
    discount: '25% OFF',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-5',
    name: 'Vintage Check Oversized Flannel',
    description: 'Classic monochrome plaid overshirt in breathable brushed cotton',
    price: 1199,
    compareAtPrice: 1499,
    category: 'T-shirts',
    tag: 'Best Seller',
    discount: null,
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-6',
    name: 'Retro Tartan High-Waist Shirt',
    description: 'Chic 90s vintage collared button-down with front tie detail',
    price: 899,
    compareAtPrice: 1099,
    category: 'Dresses',
    tag: 'New',
    discount: '10% OFF',
    images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-7',
    name: 'Camel Fedora & Felt Overcoat',
    description: 'Structured wool felt trench tailored for modern street style',
    price: 3299,
    compareAtPrice: 3999,
    category: 'Coats',
    tag: 'Exclusive',
    discount: null,
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'pop-8',
    name: 'Crimson Floral Weekend Tunic',
    description: 'Boho crimson printed peasant top with blouson sleeves',
    price: 1299,
    compareAtPrice: 1599,
    category: 'Dresses',
    tag: 'Sale',
    discount: '20% OFF',
    images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80']
  }
];

export const FashionVibrantPopTemplate = ({
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
  } catch (e) {
    // optional outside CartProvider
  }
  try {
    wishlistCtx = useWishlist();
  } catch (e) {
    // optional outside WishlistProvider
  }

  const primaryColor = customColors.primary || '#FF4D4D';
  const secondaryColor = customColors.secondary || '#F04E38';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  // Normalize products to display
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Exclusive designer piece crafted for quality and modern comfort.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: p.category?.name || p.category || (idx % 2 === 0 ? 'Dresses' : 'T-shirts'),
        tag: idx === 0 ? 'Hot' : idx === 1 ? 'New' : idx === 3 ? 'Trending' : null,
        discount: p.compareAtPrice ? `${Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}% OFF` : null,
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 10
      }));
    }
    return [];
  }, [products]);

  // Categories list dynamically derived from real products
  const categoriesList = useMemo(() => {
    const cats = new Set();
    displayProducts.forEach((p) => {
      const cat = typeof p.category === 'object' ? p.category?.name : p.category;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats)];
  }, [displayProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchCat = activeCategory === 'All' || (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase()));
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
    <div className="w-full bg-[#FFFFFF] text-[#1F2937] font-sans antialiased space-y-12">
      {/* 1. TOP HEADER & NAVBAR (John Clothes style) */}
      <header className="border-b border-rose-100 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link
            to={isPreview ? '#' : `/customer/stores/${business.id || business.slug}`}
            className="flex items-center gap-3 group"
          >
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FF4D4D] shadow-xs"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {business.name ? business.name[0] : 'J'}
              </div>
            )}
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
                {business.name || 'John Clothes'}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 -mt-1">
                Official Fashion Store
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-700">
            <span className="border-b-2 pb-1 font-bold cursor-pointer" style={{ borderColor: primaryColor, color: primaryColor }}>
              Home
            </span>
            <span className="hover:text-slate-900 cursor-pointer">Shop</span>
            <span className="hover:text-slate-900 cursor-pointer">Deals</span>
            <span className="hover:text-slate-900 cursor-pointer">About Us</span>
            <span className="hover:text-slate-900 cursor-pointer">Blog</span>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-slate-900 cursor-pointer font-semibold"
              >
                Contact
              </button>
            )}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 lg:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collection..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF4D4D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={isPreview ? '#' : '/customer/cart'}
                className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-[#FF4D4D] transition-colors relative"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4D4D] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCtx?.totalItems || 0}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. LARGE VIBRANT CORAL HERO BANNER */}
        <section
          aria-label="Featured Collection Banner"
          className="rounded-[36px] p-6 sm:p-12 lg:p-14 text-white relative overflow-hidden shadow-xl"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Subtle geometric circles in background */}
          <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs">
                Exclusive Offer 20% off This Week
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Stylish Female Clothes
              </h1>

              <p className="text-sm sm:text-base text-white/90 max-w-lg font-medium leading-relaxed">
                {business.description || 'Made from Soft, Durable, US-grown Supima Cotton for everyday comfort and striking presence.'}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-3 rounded-full text-xs font-semibold cursor-pointer border border-white/30">
                  <span>Select Category</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>

                <a
                  href="#catalog"
                  className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider bg-white text-[#FF4D4D] hover:bg-rose-50 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Shop Now
                </a>
              </div>

              {/* Customer Reviews & Avatars */}
              <div className="pt-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Customer 1"
                  />
                  <img
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Customer 2"
                  />
                  <img
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Customer 3"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Our Happy Customer</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium">
                    <span className="text-amber-300 font-bold">★ 4.5</span>
                    <span>(453k Reviews)</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-white/80 pt-1">
                Not Yet Member?{' '}
                <span className="underline font-bold text-white cursor-pointer">Sign Up Now</span>
              </div>
            </div>

            {/* Right Visual (Model in Red Jacket & Polka Dot Bandana) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-72 sm:w-80 h-96 sm:h-[420px] rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
                  alt="Stylish Clothes Model"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. PREMIUM SHADES (Spotlight Horizontal Pills with Model Cutouts) */}
        <section aria-label="Premium Shades" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
              Premium Shades
            </h2>
            <div className="w-16 h-1 bg-[#FF4D4D]/30 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Women Gallery',
                btnText: 'Click Now',
                bg: 'bg-[#FF8A8A] text-white',
                img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
              },
              {
                title: 'Children Fashion',
                btnText: 'Explore',
                bg: 'bg-[#F2B949] text-white',
                img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80'
              },
              {
                title: "Men's Fashion",
                btnText: 'Discover',
                bg: 'bg-[#E3D7C8] text-slate-900',
                img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
              },
              {
                title: "Women's Fashion",
                btnText: 'Shop All',
                bg: 'bg-[#8A7968] text-white',
                img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
              }
            ].map((pill, i) => (
              <div
                key={i}
                className={`rounded-full p-3 px-5 flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer ${pill.bg}`}
              >
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm truncate">{pill.title}</h3>
                  <span className="text-[10px] font-bold underline opacity-85">{pill.btnText}</span>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs">
                  <img src={pill.img} alt={pill.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CATEGORY OUTLINE ICONS ROW */}
        <section aria-label="Browse by Category" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
              Category
            </h2>
            <div className="w-16 h-1 bg-[#FF4D4D]/30 mx-auto rounded-full" />
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all cursor-pointer min-w-[70px] ${
                    isSelected
                      ? 'scale-105 font-bold text-[#FF4D4D]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#FF4D4D] bg-rose-50 shadow-md text-[#FF4D4D]'
                        : 'border-slate-200 bg-white hover:border-slate-400 text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{cat}</span>
                  {isSelected && <div className="w-6 h-0.5 bg-[#FF4D4D] rounded-full" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. VIBRANT CORAL PRODUCT GRID (2 Rows of 4 Cards) */}
        <section id="catalog" aria-label="Catalog Products" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Trending Picks
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredProducts.length} style(s) available in this collection
              </p>
            </div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-dashed border-[#FF4D4D]/30 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-rose-50 text-[#FF4D4D] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Products in Store Catalog</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                This store hasn&apos;t added any products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4D4D] text-white text-xs font-bold hover:bg-[#E03A3A] transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto px-4 bg-white/70 rounded-3xl border border-slate-200 p-8">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No matching styles found</h4>
              <p className="text-xs text-slate-500 mt-1">Try selecting another category or clearing your search term.</p>
              <button
                onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-[#FF4D4D] bg-rose-50 hover:bg-rose-100 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="group rounded-[28px] overflow-hidden p-3 relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl cursor-pointer"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  {/* Badges on Top */}
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
                    {prod.discount ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white text-[#FF4D4D] shadow-xs">
                        {prod.discount}
                      </span>
                    ) : (
                      <span />
                    )}
                    {prod.tag && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                        {prod.tag}
                      </span>
                    )}
                  </div>

                  {/* Product Image Area */}
                  <div className="w-full h-72 rounded-[22px] overflow-hidden bg-white/20 relative flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Floating Bottom Card */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md space-y-2">
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="font-black text-sm text-[#FF4D4D]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && (
                          <span className="text-[10px] line-through text-slate-400 ml-1.5 font-medium">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, prod)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {addedProductId === prod.id ? 'Added ✓' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 6. CLEAN FOOTER */}
      <footer className="border-t border-rose-100 bg-[#FFF9F9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-600">
          <div className="space-y-3">
            <h4 className="font-black text-base text-[#FF4D4D]">{business.name || 'John Clothes'}</h4>
            <p className="leading-relaxed text-slate-500 max-w-xs">
              {business.description || 'Premium street fashion and casual elegance crafted with care.'}
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>Powered by Bizora Storefronts</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Shop Links</h5>
            <ul className="space-y-2">
              <li className="hover:text-slate-900 cursor-pointer">Dresses & Gowns</li>
              <li className="hover:text-slate-900 cursor-pointer">T-shirts & Tops</li>
              <li className="hover:text-slate-900 cursor-pointer">Coats & Jackets</li>
              <li className="hover:text-slate-900 cursor-pointer">Denim & Pants</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Customer Support</h5>
            <ul className="space-y-2">
              <li className="hover:text-slate-900 cursor-pointer">Shipping & Returns</li>
              <li className="hover:text-slate-900 cursor-pointer">Size Guide & Fit</li>
              <li className="hover:text-slate-900 cursor-pointer">FAQs</li>
              {onOpenContact && (
                <li onClick={onOpenContact} className="font-bold text-[#FF4D4D] hover:underline cursor-pointer">
                  Contact Merchant
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Newsletter</h5>
            <p className="text-slate-500">Subscribe for secret sales and 20% off your first checkout.</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="px-3 py-2 rounded-full bg-white border border-slate-200 text-xs w-full focus:outline-none"
              />
              <button
                className="px-4 py-2 rounded-full text-white font-bold text-xs shrink-0 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionVibrantPopTemplate;
