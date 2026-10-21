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
  Feather,
  Sun,
  Compass
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

// Default curated products matching Aura Studios aesthetic
const DEFAULT_AURA_PRODUCTS = [
  {
    id: 'aura-1',
    name: 'Indigo Loomed Throw',
    description: 'Hand-dyed botanical indigo throw blanket woven on traditional wooden pit-looms',
    price: 1899,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'aura-2',
    name: 'Mira Terracotta Amphora',
    description: 'Slow-turned raw terracotta vase with earthen mineral slip glaze',
    price: 1499,
    category: 'Objects',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'aura-3',
    name: 'Lena Raw Linen Blouse',
    description: 'Relaxed button-down in unbleached organic flax with coconut shell buttons',
    price: 2499,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'aura-4',
    name: 'Contemporary Indigo Trouser',
    description: 'High-waisted cropped trouser tailored in botanical indigo dyed khadi',
    price: 2199,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'aura-5',
    name: 'Ceramic Chivet Decanter',
    description: 'Hand-sculpted matte ceramic decanter with pinched pouring lip',
    price: 1799,
    category: 'Objects',
    images: ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'aura-6',
    name: 'Artisan Clay Desk Lamp',
    description: 'Wheel-thrown earthen base lamp with textured natural linen lampshade',
    price: 3299,
    category: 'Decor',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80']
  }
];

export const FashionArtisanalEarthTemplate = ({
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

  const terracotta = customColors.primary || '#C1613A';
  const [searchTerm, setSearchTerm] = useState('');
  const [addedId, setAddedId] = useState(null);

  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Thoughtfully crafted mindful pieces honoring artisanal provenance.',
        price: parseFloat(p.price || 0),
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'])
      }));
    }
    return [];
  }, [products]);

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    if (cartCtx?.addToCart) cartCtx.addToCart(prod, 1);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleProductClick = (productId) => {
    if (isPreview) return;
    navigate(`/customer/stores/${business.id || business.slug}/products/${productId}`);
  };

  return (
    <div className="w-full bg-[#FBF7F0] text-[#2C2724] font-serif antialiased space-y-16">
      {/* 1. MINIMALIST EARTHY HEADER */}
      <header className="border-b border-[#E8DFC8] bg-[#FBF7F0]/95 sticky top-0 z-30 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link
            to={isPreview ? '#' : `/customer/stores/${business.id || business.slug}`}
            className="flex items-center gap-3"
          >
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-9 h-9 object-contain" />
            ) : null}
            <div>
              <span className="text-xl sm:text-2xl font-serif font-medium tracking-[0.15em] uppercase text-[#2C2724]">
                {business.name || 'AURA STUDIOS'}
              </span>
              <span className="block text-[8px] font-sans font-bold uppercase tracking-[0.25em] text-[#C1613A] -mt-0.5">
                Artful Living & Apparel
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-sans font-semibold tracking-wider text-[#5C554E]">
            <span className="hover:text-black cursor-pointer text-[#C1613A] border-b border-[#C1613A] pb-0.5">SHOP ALL</span>
            <span className="hover:text-black cursor-pointer">NEW ARRIVALS</span>
            <span className="hover:text-black cursor-pointer">JOURNAL</span>
            <span className="hover:text-black cursor-pointer">ABOUT</span>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-black cursor-pointer text-xs font-sans font-semibold tracking-wider text-[#C1613A]"
              >
                MAKER INQUIRY
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 text-[#2C2724]">
            <Link to={isPreview ? '#' : '/customer/cart'} className="relative p-1 hover:text-[#C1613A] transition-colors" title="Cart">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C1613A] text-white text-[9px] font-sans font-bold flex items-center justify-center">
                {cartCtx?.totalItems || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. ARTFUL LIVING HERO (Organic Arch & Shapes) */}
        <section aria-label="Artful Living Hero" className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-5xl sm:text-7xl font-serif font-normal text-[#2C2724] leading-[1.0] tracking-tight">
              ARTFUL <br />
              <span className="italic font-serif font-light text-[#C1613A]">LIVING</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B6157] font-sans max-w-md leading-relaxed">
              {business.description || 'Thoughtfully crafted garments and mindful essentials made in harmony with natural fibers and generational craft.'}
            </p>

            <div className="pt-2 font-sans">
              <a
                href="#collections"
                className="px-8 py-3.5 bg-[#C1613A] hover:bg-[#A84F2A] text-white text-xs font-bold uppercase tracking-widest rounded-full inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>EXPLORE CURATED GOODS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            {/* Organic Background Blob Shapes */}
            <div className="absolute -left-12 -top-10 w-72 h-72 rounded-full bg-[#E5D7C2]/40 filter blur-xl pointer-events-none" />
            <div className="absolute right-0 -bottom-10 w-64 h-64 rounded-full bg-[#C1613A]/10 filter blur-lg pointer-events-none" />

            {/* Arch-Framed Artisan Photo */}
            <div className="w-full max-w-md h-[460px] sm:h-[520px] rounded-t-full rounded-b-3xl overflow-hidden shadow-xl border-4 border-white/80 relative z-10">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=80"
                alt="Artisan holding ceramic pot"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* 3. THE COLLECTIONS (4 Arch-Topped Cards with Rich Color Containers) */}
        <section id="collections" aria-label="Collections" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#2C2724] font-normal tracking-wide">
              THE COLLECTIONS
            </h2>
            <div className="w-12 h-0.5 bg-[#C1613A]/40 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Handcrafted Textiles',
                desc: 'Slow-loomed throws, khadi scarves and handwoven linens.',
                color: 'bg-[#354259] text-white',
                img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'Ceramic Objects',
                desc: 'Hand-turned terracotta planters, vases and slip vessels.',
                color: 'bg-[#C1613A] text-white',
                img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'Contemporary Apparel',
                desc: 'Relaxed artisan silhouettes tailored in unbleached cotton.',
                color: 'bg-[#1C304A] text-white',
                img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80'
              },
              {
                title: 'Modern Decor',
                desc: 'Mindful wooden accents, sculptural trays and clay lamps.',
                color: 'bg-[#CCA142] text-white',
                img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
              }
            ].map((col, idx) => (
              <div
                key={idx}
                className="rounded-t-full rounded-b-2xl overflow-hidden shadow-md group cursor-pointer flex flex-col justify-between"
              >
                {/* Arch Top Image */}
                <div className="h-64 overflow-hidden bg-[#FAF7F0]">
                  <img
                    src={col.img}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Bottom Solid Color Container */}
                <div className={`${col.color} p-6 space-y-2 flex flex-col justify-between flex-1`}>
                  <div>
                    <h3 className="font-serif text-base font-medium">{col.title}</h3>
                    <p className="text-[11px] font-sans text-white/80 line-clamp-2 mt-1 leading-relaxed">
                      {col.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest pt-2 underline inline-block">
                    SHOP NOW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. LATEST ARRIVALS (Earthy Product Cards with Pill Buttons) */}
        <section aria-label="Latest Arrivals" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#2C2724] font-normal tracking-wide">
              LATEST ARRIVALS
            </h2>
            <div className="w-12 h-0.5 bg-[#C1613A]/40 mx-auto" />
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto px-4 border border-dashed border-[#C1613A]/30 rounded-3xl p-8 bg-[#FBF7F0]">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-white text-[#C1613A] mb-4 shadow-xs">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg tracking-wide uppercase text-[#2C2724]">Atelier Craft in Progress</h3>
              <p className="text-xs text-[#736B63] mt-2 font-sans font-light leading-relaxed">
                This store has not published any hand-crafted pieces in its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#C1613A] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#A84F2A] transition-all rounded-full shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
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
                  className="bg-white rounded-2xl overflow-hidden p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group border border-[#EFE8DA]"
                >
                  <div className="relative w-full h-56 rounded-xl overflow-hidden bg-[#FBF7F0]">
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

                  <div className="mt-3 space-y-2 font-sans">
                    <div>
                      <h4 className="font-serif text-xs text-[#2C2724] truncate font-medium">
                        {prod.name}
                      </h4>
                      <div className="font-bold text-xs text-[#C1613A] mt-0.5">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="w-full py-2 bg-[#C1613A] hover:bg-[#A84F2A] text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                    >
                      {addedId === prod.id ? 'ADDED ✓' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. JOURNAL STORIES / HONORING THE MAKERS (Wide Curved Split Card) */}
        <section aria-label="Journal Stories" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#2C2724] font-normal tracking-wide">
              JOURNAL STORIES
            </h2>
            <div className="w-12 h-0.5 bg-[#C1613A]/40 mx-auto" />
          </div>

          <div className="bg-[#C1613A] text-white rounded-3xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left: Traditional Loom Weaving Photo */}
            <div className="lg:col-span-7 h-80 sm:h-96 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=900&auto=format&fit=crop&q=80"
                alt="Artisan weaving textiles"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Terracotta Story Box */}
            <div className="lg:col-span-5 p-8 sm:p-12 space-y-4 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#E8DFC8]">
                DESIGN & COMMUNITY
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white leading-snug">
                Honoring the Makers
              </h3>
              <p className="text-xs text-white/85 leading-relaxed font-sans">
                Generations of artisanal knowledge woven into every strand. We partner directly with master craft families across regional clusters to preserve slow living traditions.
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider underline cursor-pointer hover:text-amber-100">
                  + READ MORE
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 6. EARTHY MINIMALIST FOOTER */}
      <footer className="bg-[#24201D] text-[#A69B91] py-14 font-sans text-xs border-t border-[#3B3530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-serif text-lg text-white font-normal uppercase tracking-widest">
              {business.name || 'AURA STUDIOS'}
            </h4>
            <p className="text-xs leading-relaxed max-w-xs font-serif italic text-[#D1C7BD]">
              {business.description || 'Thoughtful goods for intentional living, grounded in natural materials and timeless craft.'}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Help</h5>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Shipping & Dispatch</li>
              <li className="hover:text-white cursor-pointer">Artisan Returns</li>
              <li className="hover:text-white cursor-pointer">Material Care</li>
              <li className="hover:text-white cursor-pointer">Terms & Traceability</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Connect</h5>
            <ul className="space-y-2">
              {onOpenContact && (
                <li onClick={onOpenContact} className="hover:text-white cursor-pointer text-amber-200 font-bold">
                  Contact Studio
                </li>
              )}
              <li className="hover:text-white cursor-pointer">Instagram</li>
              <li className="hover:text-white cursor-pointer">Pinterest</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Stay Connected</h5>
            <p className="text-xs">Subscribe to our journal letters and seasonal drop notices.</p>
            <div className="flex border border-[#4A423C]">
              <input
                type="email"
                placeholder="Enter email"
                className="px-3 py-2 bg-transparent text-xs w-full focus:outline-none text-white"
              />
              <button className="px-4 py-2 bg-[#C1613A] text-white text-xs font-bold uppercase tracking-wider">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionArtisanalEarthTemplate;
