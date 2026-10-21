import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Store,
  MessageSquare,
  Gem,
  Award,
  Globe
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

// Default curated products matching Vlore aesthetic
const DEFAULT_VLORE_PRODUCTS = [
  {
    id: 'vlore-1',
    name: 'Relaxed Fit Polo',
    description: '100% long-staple combed cotton in obsidian wash with mother-of-pearl buttons',
    price: 2499,
    category: 'Tops',
    swatches: ['#0D0D0D', '#C8A97E', '#4A5568'],
    images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'vlore-2',
    name: 'Linen Blend Overshirt',
    description: 'Tailored casual overshirt in sand linen with patch chest pockets',
    price: 2999,
    category: 'Men',
    swatches: ['#C8A97E', '#D4AF37', '#1F1F1F'],
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'vlore-3',
    name: 'Premium Pima Cotton Tee',
    description: 'Heavyweight 240 GSM organic pima cotton in pitch black',
    price: 1499,
    category: 'Tops',
    swatches: ['#0D0D0D', '#FFFFFF', '#A3875F'],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'vlore-4',
    name: 'Tailored Minimal Trousers',
    description: 'Structured wool-blend trousers with discreet concealed waistband',
    price: 3499,
    category: 'Men',
    swatches: ['#A3875F', '#2D3748', '#0D0D0D'],
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'vlore-5',
    name: 'Utility Field Overshirt',
    description: 'Military-inspired relaxed overshirt in midnight charcoal',
    price: 3299,
    category: 'Men',
    swatches: ['#1A202C', '#C8A97E', '#4A5568'],
    images: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'vlore-6',
    name: 'Ribbed Knit Zip Polo',
    description: 'Fine-gauge merino wool knit with brushed brass zipper',
    price: 2699,
    category: 'Tops',
    swatches: ['#D6D3D1', '#0D0D0D', '#C8A97E'],
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80']
  }
];

export const FashionDarkHeritageTemplate = ({
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

  const goldAccent = customColors.secondary || '#C8A97E';
  const [searchTerm, setSearchTerm] = useState('');

  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Premium essentials crafted for the modern wardrobe.',
        price: parseFloat(p.price || 0),
        swatches: ['#0D0D0D', '#C8A97E', '#52525B'],
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80'])
      }));
    }
    return [];
  }, [products]);

  const handleProductClick = (productId) => {
    if (isPreview) return;
    navigate(`/customer/stores/${business.id || business.slug}/products/${productId}`);
  };

  return (
    <div className="w-full bg-[#0D0D0D] text-[#E5E5E5] font-serif antialiased space-y-16 selection:bg-[#C8A97E] selection:text-black">
      {/* 1. DARK SLEEK HEADER */}
      <header className="border-b border-[#262626] bg-[#0D0D0D]/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link
            to={isPreview ? '#' : `/customer/stores/${business.id || business.slug}`}
            className="flex items-center gap-3"
          >
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-9 h-9 object-contain invert brightness-90" />
            ) : null}
            <div>
              <span className="text-xl sm:text-2xl font-serif font-black tracking-[0.15em] uppercase text-white">
                {business.name || 'VLORE'}
              </span>
              <span className="block text-[8px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8A97E] -mt-1">
                Atelier Heritage
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-sans font-bold uppercase tracking-widest text-[#A3A3A3]">
            <span className="hover:text-white cursor-pointer text-[#C8A97E] border-b border-[#C8A97E] pb-0.5">Collection</span>
            <span className="hover:text-white cursor-pointer">Shop By Category</span>
            <span className="hover:text-white cursor-pointer">New Arrivals</span>
            <span className="hover:text-white cursor-pointer">Best Sellers</span>
            <span className="hover:text-white cursor-pointer">Journal</span>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-white cursor-pointer text-xs font-sans font-bold uppercase tracking-widest text-[#C8A97E]"
              >
                Atelier Inquiries
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 text-white">
            <Link to={isPreview ? '#' : '/customer/cart'} className="relative p-1 hover:text-[#C8A97E] transition-colors" title="Cart">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A97E] text-black text-[9px] font-mono font-bold flex items-center justify-center">
                {cartCtx?.totalItems || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. DRAMATIC MOODY HERO (Timeless by Nature) */}
        <section
          aria-label="New Collection Hero"
          className="bg-[#141414] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-[#262626] p-6 sm:p-12 lg:p-16"
        >
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-sans uppercase font-bold tracking-[0.3em] text-[#C8A97E] block">
              NEW COLLECTION
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white uppercase tracking-tight leading-[1.05]">
              TIMELESS <br />
              <span className="italic font-serif font-light text-[#C8A97E]">BY NATURE</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A3A3A3] font-sans max-w-md leading-relaxed">
              {business.description || 'Premium essentials crafted for the modern wardrobe with uncompromised attention to material and cut.'}
            </p>

            <div className="pt-2 font-sans">
              <a
                href="#new-arrivals"
                className="px-8 py-4 bg-[#C8A97E] hover:bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-[0.2em] inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-[480px] sm:h-[560px] rounded-2xl overflow-hidden relative border border-[#262626] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80"
                alt="Model in tailored overshirt"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* 3. LUXURY HIGHLIGHTS BAR */}
        <section aria-label="Heritage Commitments" className="border-y border-[#262626] py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C8A97E] border border-[#333333]">
                <Gem className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white uppercase tracking-wider block text-xs">PREMIUM FABRICS</span>
                <span className="text-[11px] text-[#737373]">Carefully selected natural materials</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C8A97E] border border-[#333333]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white uppercase tracking-wider block text-xs">TIMELESS DESIGN</span>
                <span className="text-[11px] text-[#737373]">Built to last beyond transient trends</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C8A97E] border border-[#333333]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white uppercase tracking-wider block text-xs">WORLDWIDE SHIPPING</span>
                <span className="text-[11px] text-[#737373]">Delivering luxury anywhere</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SHOP BY CATEGORY / ELEVATED ESSENTIALS (4 Dark Portrait Cards) */}
        <section aria-label="Elevated Essentials" className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8A97E]">
              SHOP BY CATEGORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white">
              Elevated Essentials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'MEN', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80' },
              { title: 'WOMEN', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80' },
              { title: 'TOPS', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80' },
              { title: 'ACCESSORIES', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80' }
            ].map((cat, i) => (
              <div
                key={i}
                className="h-96 rounded-2xl overflow-hidden relative group cursor-pointer border border-[#262626] shadow-md"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 text-center font-sans">
                  <h3 className="font-serif text-xl tracking-[0.2em] font-normal text-white uppercase">{cat.title}</h3>
                  <span className="text-[10px] text-[#C8A97E] uppercase font-bold tracking-[0.2em] mt-1 group-hover:underline">
                    SHOP NOW →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. NEW ARRIVALS (6 Dark Cards with Color Swatches) */}
        <section id="new-arrivals" aria-label="New Arrivals" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C8A97E] block">
                CURATED ATELIER
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-white font-normal uppercase tracking-wider">
                NEW ARRIVALS
              </h2>
            </div>
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#C8A97E] hover:underline cursor-pointer">
              VIEW ALL →
            </span>
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto px-4 border border-dashed border-[#C8A97E]/30 rounded-3xl p-8 bg-[#141414]">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[#1F1F1F] text-[#C8A97E] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg tracking-widest uppercase text-white font-normal">Atelier In Preparation</h3>
              <p className="text-xs text-[#737373] mt-2 font-sans font-light leading-relaxed">
                This store has not listed any bespoke pieces in its inventory yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#C8A97E] text-black text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#d8b98e] transition-all rounded-xl shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Add First Piece</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {displayProducts.slice(0, 6).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="bg-[#141414] rounded-2xl overflow-hidden p-3 border border-[#262626] hover:border-[#C8A97E]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="relative w-full h-60 rounded-xl overflow-hidden bg-[#1F1F1F]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wishlistCtx?.toggleWishlist) wishlistCtx.toggleWishlist(prod.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black flex items-center justify-center text-white"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 font-sans">
                    <div>
                      <h4 className="font-serif text-xs text-white truncate font-medium">
                        {prod.name}
                      </h4>
                      <div className="font-bold text-xs text-[#C8A97E] mt-0.5">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Color Swatch Circles */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {prod.swatches?.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. SUMMER '24 COLLECTION SPLIT FEATURE BANNER */}
        <section aria-label="Seasonal Spotlight" className="bg-[#141414] rounded-3xl overflow-hidden border border-[#262626] grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-14 space-y-4">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C8A97E]">
              SUMMER '24 COLLECTION
            </span>
            <h3 className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight">
              Light. Refined. <br />
              <span className="italic font-serif text-[#C8A97E]">Effortless.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] font-sans leading-relaxed max-w-sm">
              Breathable fabrics. Relaxed fits. Designed for sunlit days and cool evenings.
            </p>
            <div className="pt-2 font-sans">
              <a
                href="#new-arrivals"
                className="px-7 py-3.5 bg-[#C8A97E] hover:bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 h-80 sm:h-96 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80"
              alt="Hanging linen shirts"
              className="w-full h-full object-cover brightness-90"
            />
          </div>
        </section>

        {/* 7. FROM THE JOURNAL */}
        <section aria-label="Journal Stories" className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C8A97E]">
              FROM THE JOURNAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
              Style. Culture. Timeless.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {[
              {
                title: '5 Ways to Elevate Your Everyday Look',
                category: 'STYLE GUIDE',
                img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'The Art of Timeless Living',
                category: 'CULTURE',
                img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'How to Care for Your Clothes the Right Way',
                category: 'CARE TIPS',
                img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80'
              }
            ].map((story, i) => (
              <div key={i} className="bg-[#141414] rounded-2xl overflow-hidden border border-[#262626] group cursor-pointer">
                <div className="h-56 overflow-hidden">
                  <img src={story.img} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90" />
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#C8A97E]">{story.category}</span>
                  <h4 className="font-serif text-sm text-white group-hover:text-[#C8A97E] transition-colors">{story.title}</h4>
                  <span className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                    <span>READ MORE</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 8. TAN NEWSLETTER & OBSIDIAN FOOTER */}
      <div className="bg-[#C8A97E] text-black py-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-serif font-bold uppercase tracking-wider">Be the first to know</h4>
            <p className="text-xs text-neutral-800">Get early access to new arrivals, exclusive offers & style updates.</p>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 bg-[#E5D7C2] text-black placeholder:text-neutral-600 text-xs w-full focus:outline-none border border-black/20"
            />
            <button className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest shrink-0">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-[#080808] text-[#737373] py-12 text-xs font-sans border-t border-[#1C1C1C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-white tracking-widest text-sm uppercase">
            {business.name || 'VLORE'}
          </span>
          <span>© 2026 {business.name || 'Vlore Atelier'}. All rights reserved. Powered by Bizora.</span>
          {onOpenContact && (
            <button onClick={onOpenContact} className="text-[#C8A97E] hover:underline cursor-pointer">
              Atelier Support
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default FashionDarkHeritageTemplate;
