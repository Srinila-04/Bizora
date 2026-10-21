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
  Play,
  Crosshair,
  Lock,
  Globe,
  Radio,
  Check
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

// Default products matching the stark high-contrast Noir/Capsule aesthetic
const DEFAULT_NOIR_PRODUCTS = [
  {
    id: 'noir-1',
    name: 'STANDARD EDITION',
    editionType: 'Core Release',
    description: 'Heavyweight 450 GSM French terry hoodie in washed noir with reinforced stitching',
    price: 2999,
    features: ['450 GSM Heavyweight Terry', 'Double-layered hood', 'Concealed security pocket', 'Numbered certificate'],
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'noir-2',
    name: 'DELUXE EDITION',
    editionType: 'Most Popular',
    isPopular: true,
    description: 'Double-breasted trench coat tailored in high-density water-repellent gabardine',
    price: 4999,
    features: ['High-density gabardine', 'Storm flap & belted cuffs', 'Silk-blend inner lining', 'Exclusive campaign pin'],
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'noir-3',
    name: 'ULTIMATE EDITION',
    editionType: 'Limited Capsule',
    description: 'Full monochrome tactical ensemble: technical overshirt + relaxed pleated trousers',
    price: 7499,
    features: ['Complete matching set', 'Modular magnetic hardware', 'Custom garment bag included', 'Priority dispatch status'],
    images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'noir-4',
    name: "COLLECTOR'S EDITION",
    editionType: 'Archive Vault',
    description: 'Hand-distressed Italian calfskin leather jacket with silver oxidised zips',
    price: 12999,
    features: ['100% Full-grain calfskin', 'Individually hand-numbered (1 of 50)', 'Embossed archival hardcase', 'Lifetime atelier repair'],
    images: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80']
  }
];

export const FashionNoirMonochromeTemplate = ({
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

  const [addedId, setAddedId] = useState(null);

  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.slice(0, 4).map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name.toUpperCase(),
        editionType: idx === 1 ? 'Most Popular' : idx === 3 ? 'Collector Edition' : 'Capsule Drop',
        isPopular: idx === 1,
        description: p.description || 'Monochrome statement silhouette engineered for dramatic contrast and longevity.',
        price: parseFloat(p.price || 0),
        features: ['Heavyweight structure', 'Signature monochrome cut', 'Priority dispatch', 'Atelier warranty'],
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'])
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
    <div className="w-full bg-[#FAFAFA] text-[#111111] font-sans antialiased space-y-12">
      {/* 1. TOP ANNOUNCEMENT STRIP */}
      <div className="bg-black text-white text-[10px] sm:text-xs font-mono py-2 px-4 text-center tracking-widest uppercase flex items-center justify-between">
        <span className="hidden sm:inline">JOIN THE CIRCLE. RULE THE STREETS.</span>
        <span className="mx-auto sm:mx-0 font-bold">LIMITED CAPSULE 2026 • WORLDWIDE DISPATCH</span>
        <div className="hidden sm:flex items-center gap-4 text-neutral-400">
          <span>TRACK ORDER</span>
          <span>HELP</span>
        </div>
      </div>

      {/* 2. STARK MONOCHROME HEADER */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link
            to={isPreview ? '#' : `/customer/stores/${business.id || business.slug}`}
            className="flex items-center gap-3"
          >
            <div>
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black font-sans">
                {business.name || 'MAFIA'}
              </span>
              <span className="block text-[8px] font-mono font-black uppercase tracking-[0.3em] text-neutral-500 -mt-1">
                THE COUTURE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-neutral-800">
            <span className="hover:text-black cursor-pointer border-b-2 border-black pb-0.5">Home</span>
            <span className="hover:text-black cursor-pointer">Story</span>
            <span className="hover:text-black cursor-pointer">Drops</span>
            <span className="hover:text-black cursor-pointer">Capsule</span>
            <span className="hover:text-black cursor-pointer">Media</span>
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-black cursor-pointer text-xs font-black uppercase tracking-widest text-neutral-900"
              >
                Inquiries
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 text-black">
            <Link to={isPreview ? '#' : '/customer/cart'} className="relative p-1 hover:opacity-75 transition-opacity" title="Cart">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {cartCtx?.totalItems || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 3. HERO: MONUMENTAL TYPOGRAPHY & CINEMATIC NOIR MODEL */}
        <section aria-label="Cinematic Noir Hero" className="relative bg-[#F4F4F4] border-2 border-black p-6 sm:p-12 lg:p-16 overflow-hidden">
          {/* Huge watermark typography in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[120px] sm:text-[220px] lg:text-[300px] font-black uppercase tracking-tighter text-black/5 font-sans leading-none">
              {business.name ? business.name.slice(0, 5).toUpperCase() : 'NOIR'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-neutral-600 block">
                LOYALTY IS EARNED. POWER IS TAKEN.
              </span>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black leading-[1.0] font-sans">
                LEGENDS <br />
                ARE MADE.
              </h1>

              <p className="text-sm sm:text-base text-neutral-700 max-w-md font-medium leading-relaxed">
                {business.description || 'Structured silhouettes, heavy-gauge natural fibers, and uncompromising noir aesthetics designed for the bold.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 font-mono">
                <a
                  href="#editions"
                  className="px-8 py-4 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <span>PRE-ORDER NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  className="px-6 py-4 border-2 border-black text-black hover:bg-black hover:text-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>WATCH CAMPAIGN</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-neutral-500 font-bold uppercase tracking-wider pt-2">
                NEW CAPSULE 2026 • OFFICIAL LIMITED RUN
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md h-[460px] sm:h-[540px] border-2 border-black overflow-hidden relative shadow-2xl bg-black">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80"
                  alt="Noir Couture model in dark trench"
                  className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. BLACK FEATURE BAR (4 Columns with Outline Icons) */}
        <section aria-label="Feature Highlights" className="bg-black text-white p-6 sm:p-8 border-2 border-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            <div className="space-y-1 border-l-2 border-white pl-4">
              <span className="font-black text-sm block">EXCLUSIVE DROPS</span>
              <p className="text-[11px] text-neutral-400">Strictly limited numbered production runs.</p>
            </div>

            <div className="space-y-1 border-l-2 border-white pl-4">
              <span className="font-black text-sm block">HEAVYWEIGHT CUT</span>
              <p className="text-[11px] text-neutral-400">High-density custom developed fabrics.</p>
            </div>

            <div className="space-y-1 border-l-2 border-white pl-4">
              <span className="font-black text-sm block">GLOBAL DISPATCH</span>
              <p className="text-[11px] text-neutral-400">Tracked worldwide express air cargo.</p>
            </div>

            <div className="space-y-1 border-l-2 border-white pl-4">
              <span className="font-black text-sm block">MEMBER ACCESS</span>
              <p className="text-[11px] text-neutral-400">Secret pre-access to seasonal vaults.</p>
            </div>
          </div>
        </section>

        {/* 5. THE CAMPAIGN / STORY SPOTLIGHT */}
        <section aria-label="The Story" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-2 border-black p-6 sm:p-12 bg-white">
          <div className="lg:col-span-6 h-80 sm:h-96 border-2 border-black overflow-hidden bg-black">
            <img
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80"
              alt="Story spotlight"
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-neutral-500">
              THE STORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
              LOYALTY. <br />
              BETRAYAL. <br />
              POWER.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-md">
              In a city defined by transient trends, we choose permanence. Every silhouette is an armor, every stitch an assertion of control.
            </p>
            <div className="pt-2 font-mono">
              <button
                type="button"
                className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                DISCOVER THE STORY
              </button>
            </div>
          </div>
        </section>

        {/* 6. GUARANTEE STRIP */}
        <section aria-label="Guarantees" className="border-y-2 border-black py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-center flex flex-wrap items-center justify-around gap-4 text-neutral-700">
          <span>DAILY DROPS</span>
          <span>•</span>
          <span>EXCLUSIVE ARCHIVES</span>
          <span>•</span>
          <span>EXPRESS AIR CARGO</span>
          <span>•</span>
          <span>AUTHENTICITY VERIFIED</span>
          <span>•</span>
          <span>SECURE ENCRYPTED CHECKOUT</span>
        </section>

        {/* 7. CHOOSE YOUR EDITION / CAPSULE COLLECTION (4 Framed Cards) */}
        <section id="editions" aria-label="Capsule Editions" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-neutral-500 block">
                CHOOSE YOUR EDITION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
                CAPSULE COLLECTION
              </h2>
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-black hover:underline cursor-pointer">
              VIEW ALL EDITIONS →
            </span>
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto px-4 border-2 border-dashed border-black p-8 bg-neutral-50 font-mono">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-black text-white mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-black text-base uppercase tracking-widest text-black">NO CAPSULE DROPS YET</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                This store has not published any capsule editions or silhouettes yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>ADD FIRST EDITION</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className={`bg-white border-2 border-black p-4 flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 relative shadow-sm ${
                    prod.isPopular ? 'ring-4 ring-black/10' : ''
                  }`}
                >
                  {prod.isPopular && (
                    <div className="absolute -top-3 left-4 bg-black text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 tracking-widest">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="w-full h-64 border border-black overflow-hidden bg-black">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                        {prod.editionType}
                      </span>
                      <h3 className="font-black text-sm text-black tracking-tight mt-0.5">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="space-y-1 pt-2 border-t border-neutral-200 text-[10px] font-mono text-neutral-700">
                      {prod.features?.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-black shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-black mt-4 flex items-center justify-between">
                    <span className="font-black text-base text-black font-mono">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-[10px] font-mono font-black uppercase tracking-widest cursor-pointer"
                    >
                      {addedId === prod.id ? 'ADDED ✓' : 'PRE-ORDER'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 8. JETS-BLACK MONOCHROME FOOTER */}
      <footer className="bg-black text-white py-14 mt-16 font-mono text-xs border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-black text-xl tracking-tighter uppercase font-sans">
              {business.name || 'MAFIA'}
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-xs font-sans">
              {business.description || 'Monochrome urban couture engineered for statement presence and endurance.'}
            </p>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-wider text-[11px] mb-3 text-neutral-300">Capsule</h5>
            <ul className="space-y-2 text-neutral-400">
              <li className="hover:text-white cursor-pointer">Standard Edition</li>
              <li className="hover:text-white cursor-pointer">Deluxe Edition</li>
              <li className="hover:text-white cursor-pointer">Ultimate Edition</li>
              <li className="hover:text-white cursor-pointer">Archive Vault</li>
            </ul>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-wider text-[11px] mb-3 text-neutral-300">Support</h5>
            <ul className="space-y-2 text-neutral-400">
              {onOpenContact && (
                <li onClick={onOpenContact} className="hover:text-white cursor-pointer text-white font-bold underline">
                  Contact Merchant
                </li>
              )}
              <li className="hover:text-white cursor-pointer">Dispatch Tracking</li>
              <li className="hover:text-white cursor-pointer">Terms of Release</li>
              <li className="hover:text-white cursor-pointer">Atelier Privacy</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-black uppercase tracking-wider text-[11px] text-neutral-300">Newsletter</h5>
            <p className="text-neutral-400 text-xs font-sans">Early access to confidential drop coordinates.</p>
            <div className="flex border border-white">
              <input
                type="email"
                placeholder="Enter email address"
                className="px-3 py-2 bg-transparent text-xs w-full focus:outline-none text-white font-mono"
              />
              <button className="px-4 py-2 bg-white text-black font-black uppercase text-xs">
                JOIN
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionNoirMonochromeTemplate;
