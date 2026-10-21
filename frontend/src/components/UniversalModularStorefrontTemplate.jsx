import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
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
  Mail,
  Globe,
  Tag,
  Check,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Coffee,
  Cpu,
  Layers,
  Award,
  Leaf,
  HeartHandshake,
  BookOpen,
  Dumbbell,
  Wrench,
  Briefcase,
  Package,
  PlusCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from './ProductCard';
import { normalizeCategoryKey } from '../config/categoryRegistry';

// Curated high-resolution fallback photos and products per category
const CATEGORY_SAMPLE_PRODUCTS = {
  'food-beverage': [
    {
      id: 'sample-fb-1',
      name: 'Single-Origin Ethiopian Yirgacheffe',
      description: 'Bright citrus floral tasting notes with jasmine aroma. Light-medium roast.',
      price: 680,
      compareAtPrice: 850,
      category: 'Whole Bean Coffee',
      tag: 'Best Seller',
      stockQuantity: 24,
      images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-fb-2',
      name: 'Artisan Dark Roast Espresso Blend',
      description: 'Notes of dark cacao, toasted hazelnut, and smoky caramel finish.',
      price: 620,
      compareAtPrice: 720,
      category: 'Espresso',
      tag: 'Fresh Roast',
      stockQuantity: 18,
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-fb-3',
      name: 'Slow Ferment Sourdough Boule',
      description: '36-hour wild yeast cold fermented country sourdough loaf with crisp blistered crust.',
      price: 240,
      compareAtPrice: 280,
      category: 'Artisan Bakery',
      tag: 'Daily Bake',
      stockQuantity: 12,
      images: ['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-fb-4',
      name: 'Raw Organic Forest Blossom Honey',
      description: 'Unheated, unfiltered wild hive honey gathered from mountain blossoms.',
      price: 490,
      compareAtPrice: 550,
      category: 'Pantry Delicacies',
      tag: '100% Pure',
      stockQuantity: 30,
      images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80']
    }
  ],
  'electronics-gadgets': [
    {
      id: 'sample-tech-1',
      name: 'Titanium Mechanical Pro Keyboard',
      description: 'Hot-swappable tactile switches, gasket mounted CNC aluminum case, wireless 2.4GHz.',
      price: 7499,
      compareAtPrice: 8999,
      category: 'Peripherals',
      tag: 'OEM Spec',
      stockQuantity: 15,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-tech-2',
      name: 'Audiophile Studio ANC Headphones',
      description: 'Custom 45mm beryllium drivers, active noise cancellation with 40-hour lossless playback.',
      price: 12999,
      compareAtPrice: 15499,
      category: 'Audio Gear',
      tag: 'Hi-Res Audio',
      stockQuantity: 8,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-tech-3',
      name: 'Magnetic 100W GaN Fast Charger Hub',
      description: 'Compact 4-port fast charging block with smart wattage power distribution.',
      price: 2499,
      compareAtPrice: 2999,
      category: 'Power & Hubs',
      tag: 'Fast Charging',
      stockQuantity: 42,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-tech-4',
      name: 'Ultra-thin Precision Glass Trackpad',
      description: 'Haptic feedback surface with customizable multi-touch gestures and Bluetooth 5.3.',
      price: 4199,
      compareAtPrice: 4899,
      category: 'Peripherals',
      tag: 'New',
      stockQuantity: 20,
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80']
    }
  ],
  'beauty-personal-care': [
    {
      id: 'sample-beauty-1',
      name: 'Botanical Hydra Cloud Face Serum',
      description: 'Multi-molecular hyaluronic acid enriched with Centella Asiatica and sea kelp bioferment.',
      price: 1450,
      compareAtPrice: 1750,
      category: 'Skincare',
      tag: 'Clean Beauty',
      stockQuantity: 25,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-beauty-2',
      name: 'Cold-Pressed Rosehip Seed Night Elixir',
      description: 'Pure organic unrefined Rosa Canina oil packed with provitamin A and essential omega lipids.',
      price: 1199,
      compareAtPrice: 1399,
      category: 'Facial Oils',
      tag: 'Organic',
      stockQuantity: 19,
      images: ['https://images.unsplash.com/photo-1608248597359-009594f86d63?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-beauty-3',
      name: 'Gentle Oat Milk Calming Cleanser',
      description: 'pH 5.5 balanced non-foaming emulsion designed for sensitive barrier comfort.',
      price: 850,
      compareAtPrice: 990,
      category: 'Cleansers',
      tag: 'Dermatologist Tested',
      stockQuantity: 34,
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-beauty-4',
      name: 'Sunlit Bergamot & Vetiver Eau De Parfum',
      description: 'Artisanal micro-batch fragrance blending calabrian citrus with warm earthy vetiver.',
      price: 3200,
      compareAtPrice: 3800,
      category: 'Fragrance',
      tag: 'Artisan Batch',
      stockQuantity: 11,
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80']
    }
  ],
  'home-living': [
    {
      id: 'sample-home-1',
      name: 'Solid White Oak Architectural Stool',
      description: 'Sculptural three-legged stool crafted from FSC-certified sustainably harvested oak.',
      price: 4999,
      compareAtPrice: 5800,
      category: 'Furniture',
      tag: 'Solid Wood',
      stockQuantity: 6,
      images: ['https://images.unsplash.com/photo-1503602642458-232111445657?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-home-2',
      name: 'Textured Ribbed Ceramic Table Lamp',
      description: 'Matted stoneware base with unbleached linen drum shade and warm 2700K dimmer.',
      price: 3299,
      compareAtPrice: 3899,
      category: 'Lighting',
      tag: 'Warm Ambience',
      stockQuantity: 14,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-home-3',
      name: 'Washed French Linen Bedding Set',
      description: 'Pre-washed flax linen duvet cover and pillow shams for breathable temperature balance.',
      price: 6499,
      compareAtPrice: 7999,
      category: 'Textiles',
      tag: '100% Flax',
      stockQuantity: 10,
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-home-4',
      name: 'Sculptural Matte Ceramic Planter',
      description: 'Hand-cast ceramic vessel with interior drainage saucer for indoor botanical displays.',
      price: 1450,
      compareAtPrice: 1750,
      category: 'Decor & Planters',
      tag: 'Hand-finished',
      stockQuantity: 22,
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80']
    }
  ],
  'artisanal-handmade': [
    {
      id: 'sample-artisan-1',
      name: 'Wheel-Thrown Stoneware Pour-Over Dripper',
      description: 'Individually thrown speckled clay coffee dripper with hand-carved interior spiral fluting.',
      price: 1650,
      compareAtPrice: 1950,
      category: 'Ceramics',
      tag: 'Studio Made',
      stockQuantity: 9,
      images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-artisan-2',
      name: 'Hand-Hewn Black Walnut Cutting Board',
      description: 'End-grain heirloom serving board finished with organic food-safe beeswax oil.',
      price: 2800,
      compareAtPrice: 3200,
      category: 'Woodwork',
      tag: 'Signed Edition',
      stockQuantity: 7,
      images: ['https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-artisan-3',
      name: 'Handwoven Natural Jute & Cotton Rug',
      description: 'Textured floor runner crafted on traditional handlooms using unbleached plant fibers.',
      price: 3600,
      compareAtPrice: 4200,
      category: 'Weaving',
      tag: 'Heritage Loom',
      stockQuantity: 5,
      images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-artisan-4',
      name: 'Sand-Cast Solid Brass Incense Burner',
      description: 'Minimalist heavyweight brass burner that develops a rich, personal antique patina over time.',
      price: 1850,
      compareAtPrice: 2150,
      category: 'Metalwork',
      tag: 'Solid Brass',
      stockQuantity: 14,
      images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&auto=format&fit=crop&q=80']
    }
  ],
  'universal': [
    {
      id: 'sample-uni-1',
      name: 'Artisan Workshop Signature Piece',
      description: 'Handcrafted with meticulous attention to detail and durable, premium materials.',
      price: 1499,
      compareAtPrice: 1899,
      category: 'Curated Goods',
      tag: 'Popular',
      stockQuantity: 20,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-uni-2',
      name: 'Independent Maker Classic Edition',
      description: 'Ethically crafted directly in our independent workshop. Built to last.',
      price: 999,
      compareAtPrice: 1299,
      category: 'Essentials',
      tag: 'Featured',
      stockQuantity: 15,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-uni-3',
      name: 'Hand-selected Everyday Companion',
      description: 'Designed for effortless function and refined aesthetic balance.',
      price: 2199,
      compareAtPrice: 2599,
      category: 'Crafted Goods',
      tag: 'Best Seller',
      stockQuantity: 12,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80']
    },
    {
      id: 'sample-uni-4',
      name: 'Limited Batch Atelier Release',
      description: 'Small production batch numbered and verified for authenticity.',
      price: 3499,
      compareAtPrice: 3999,
      category: 'Special Edition',
      tag: 'Limited Run',
      stockQuantity: 8,
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80']
    }
  ]
};

// Category curated hero banner defaults
const CATEGORY_DEFAULT_BANNERS = {
  'food-beverage': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80',
  'electronics-gadgets': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop&q=80',
  'home-living': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80',
  'artisanal-handmade': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&auto=format&fit=crop&q=80',
  'books-toys-stationery': 'https://images.unsplash.com/photo-1507842229450-4161b9b1e16c?w=1600&auto=format&fit=crop&q=80',
  'sports-fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80',
  'automotive-hardware': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1600&auto=format&fit=crop&q=80',
  'professional-services': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
  'fashion-apparel': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  'universal': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80'
};

/**
 * Canva-like Editable Section Wrapper
 * Highlights active section when clicked or selected in the studio inspector
 */
const EditableSectionWrapper = ({
  sectionId,
  label,
  children,
  isEditable = false,
  isSelected = false,
  onSelect = null,
  className = ''
}) => {
  if (!isEditable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(sectionId);
      }}
      className={`relative group transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'ring-3 ring-[#E6B44C] ring-offset-2 ring-offset-white shadow-xl rounded-3xl'
          : 'hover:ring-2 hover:ring-[#E6B44C]/60 hover:ring-offset-1 rounded-3xl'
      } ${className}`}
    >
      {/* Floating Canva Selection Badge */}
      <div
        className={`absolute -top-3.5 left-4 z-30 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-md ${
          isSelected
            ? 'bg-[#E6B44C] text-[#3B1C5A]'
            : 'bg-slate-900/90 text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>{label}</span>
        {isSelected ? (
          <span className="text-[9px] font-bold text-[#3B1C5A]/80 uppercase ml-1">(Editing in Inspector)</span>
        ) : (
          <span className="text-[9px] opacity-75 font-normal ml-1">Click to edit</span>
        )}
      </div>
      {children}
    </div>
  );
};

/**
 * Universal Modular Storefront Template
 * Dynamically renders ANY template from the 60 templates in the registry across ALL categories.
 * Translates tokens, layoutType, cardLayout, headerLayout, and merchant customization overrides.
 */
export const UniversalModularStorefrontTemplate = ({
  business,
  products = [],
  template,
  isPreview = false,
  isEditable = false,
  selectedSectionId = null,
  onSelectSection = null,
  contentOverrides = {},
  sectionOrder = null,
  customSections = {},
  customColors = {},
  onOpenContact = null
}) => {
  const navigate = useNavigate();
  let cartCtx = null;
  let wishlistCtx = null;
  try {
    cartCtx = useCart();
  } catch (e) {
    // outside CartProvider
  }
  try {
    wishlistCtx = useWishlist();
  } catch (e) {
    // outside WishlistProvider
  }

  const categoryKey = normalizeCategoryKey(business?.category || template?.categoryId || 'universal');
  const tokens = template?.tokens || {};
  const layoutType = template?.layoutType || 'story-boutique';

  // State for in-store category filtering & search
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  // Merchant Content Overrides with graceful template defaults
  const announcementConfig = contentOverrides?.announcement || {};
  const headerConfig = contentOverrides?.header || {};
  const heroConfig = contentOverrides?.hero || {};
  const badgesConfig = contentOverrides?.badges || {};
  const productsConfig = contentOverrides?.products || {};
  const storyConfig = contentOverrides?.story || {};
  const footerConfig = contentOverrides?.footer || {};

  // Visibility flags (defaults to true if not explicitly false)
  const isAnnouncementVisible = customSections?.announcement !== false && announcementConfig.enabled !== false;
  const isHeaderVisible = customSections?.header !== false;
  const isHeroVisible = customSections?.hero !== false && heroConfig.enabled !== false;
  const isBadgesVisible = customSections?.badges !== false && badgesConfig.enabled !== false;
  const isProductsVisible = customSections?.products !== false;
  const isStoryVisible = customSections?.story !== false && storyConfig.enabled !== false;
  const isFooterVisible = customSections?.footer !== false;

  // Real or empty products handling
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p, idx) => ({
        id: p.id || `real-${idx}`,
        name: p.name,
        description: p.description || 'Crafted with premium materials for lasting quality.',
        price: parseFloat(p.price || 0),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'General'),
        tag: idx === 0 ? 'Featured' : idx === 1 ? 'Best Seller' : null,
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80']),
        stockQuantity: p.stockQuantity ?? 10
      }));
    }
    return [];
  }, [products]);

  // Dynamic In-store Categories
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    displayProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [displayProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchCat = activeCategoryFilter === 'All' || p.category?.toLowerCase() === activeCategoryFilter.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [displayProducts, activeCategoryFilter, searchTerm]);

  // Hero Background Image resolution
  const heroBackgroundImage =
    heroConfig.backgroundImage ||
    business?.banner ||
    CATEGORY_DEFAULT_BANNERS[categoryKey] ||
    CATEGORY_DEFAULT_BANNERS['universal'];

  // Custom Primary / Secondary colors override
  const primaryBg = customColors.primary || tokens.customPrimary || tokens.primary || '#3B1C5A';
  const secondaryBg = customColors.secondary || tokens.customSecondary || tokens.secondary || '#E6B44C';

  // Section Ordering
  const defaultOrder = ['announcement', 'header', 'hero', 'badges', 'products', 'story', 'footer'];
  const activeOrder = Array.isArray(sectionOrder) && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  // Handlers
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
    if (isEditable || isPreview) return;
    navigate(`/customer/stores/${business.id || business.slug}/products/${productId}`);
  };

  // =========================================================================
  // SUB-RENDERERS FOR SECTIONS
  // =========================================================================

  // 1. ANNOUNCEMENT BAR
  const renderAnnouncement = () => {
    if (!isAnnouncementVisible) return null;
    const text =
      announcementConfig.text ||
      template?.tagline ||
      'Welcome to our official store! Complimentary shipping on qualifying orders.';
    const linkText = announcementConfig.linkText || 'Shop Catalog';
    const linkUrl = announcementConfig.linkUrl || '#products-catalog';

    return (
      <EditableSectionWrapper
        sectionId="announcement"
        label="Top Announcement Bar"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'announcement'}
        onSelect={onSelectSection}
        className="mb-3"
      >
        <div
          style={{ backgroundColor: primaryBg }}
          className="text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-4 rounded-xl shadow-xs"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#E6B44C] shrink-0 animate-pulse" />
            <p className="truncate text-white/95">{text}</p>
          </div>
          {linkText && (
            <a
              href={linkUrl}
              onClick={(e) => {
                if (linkUrl.startsWith('#')) {
                  e.preventDefault();
                  const target = document.querySelector(linkUrl);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-[#E6B44C] hover:text-white underline text-[11px] font-bold shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>{linkText}</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </EditableSectionWrapper>
    );
  };

  // 2. STORE HEADER & BRANDING
  const renderHeader = () => {
    if (!isHeaderVisible) return null;
    const storeUrl = `/customer/stores/${business?.id || business?.slug}`;

    return (
      <EditableSectionWrapper
        sectionId="header"
        label="Store Header & Brand"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'header'}
        onSelect={onSelectSection}
        className="mb-6"
      >
        <header
          className={`overflow-hidden border ${tokens.border || 'border-slate-200'} ${tokens.cardBg || 'bg-white'} ${tokens.roundedCard || 'rounded-3xl'} shadow-sm transition-all`}
        >
          {/* Header Banner Canopy */}
          <div
            className={`h-36 sm:h-48 w-full bg-gradient-to-r ${tokens.headerGradient || 'from-slate-900 to-slate-800'} relative overflow-hidden flex items-center justify-between p-6 sm:p-8`}
          >
            {business?.banner && (
              <img
                src={business.banner}
                alt={`${business?.name} Banner`}
                className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

            {/* Template Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/25 hidden sm:inline-block">
                {template?.categoryName || 'Universal Store'}
              </span>
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/60 text-amber-300 backdrop-blur-md border border-amber-300/30">
                {template?.name}
              </span>
            </div>

            {/* Header Slogan */}
            <div className="relative z-10 max-w-xl text-white">
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 block mb-1">
                Verified Independent Merchant
              </span>
              <h2 className={`text-xl sm:text-3xl font-black tracking-tight ${tokens.fontHeading || 'font-sans'}`}>
                {business?.name || 'Your Store Name'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 italic mt-1 line-clamp-1">
                {headerConfig.tagline || business?.description || template?.tagline}
              </p>
            </div>
          </div>

          {/* Store Brand Identity Strip */}
          <div className="p-5 sm:p-7 relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-18 h-18 sm:w-22 sm:h-22 ${tokens.roundedCard || 'rounded-2xl'} bg-white border-2 ${tokens.border || 'border-slate-200'} shadow-lg overflow-hidden flex items-center justify-center shrink-0 -mt-10 relative z-20`}
                >
                  {business?.logo ? (
                    <img
                      src={business.logo}
                      alt={business?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Store className="w-9 h-9 opacity-65 text-slate-700" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-xl sm:text-2xl font-black ${tokens.textPrimary || 'text-slate-900'} ${tokens.fontHeading || 'font-sans'}`}>
                      {business?.name || 'Your Store Name'}
                    </h1>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Independent Brand" />
                  </div>
                  <div className="flex items-center flex-wrap gap-2.5 text-xs mt-1">
                    <span className={`${tokens.badgePrimary || 'bg-amber-100 text-amber-900'} px-2.5 py-0.5 ${tokens.roundedBadge || 'rounded-full'} text-[10px] font-bold uppercase tracking-wider`}>
                      {business?.category || template?.categoryName}
                    </span>
                    <span className={`flex items-center gap-1 ${tokens.textMuted || 'text-slate-500'} text-xs`}>
                      <MapPin className="w-3.5 h-3.5 text-[#E6B44C] shrink-0" />
                      <span>{business?.address || 'India'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {onOpenContact && (
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#3B1C5A] bg-[#FAF5EE] hover:bg-[#3B1C5A] hover:text-white border border-[#C6B7E2]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>Contact Seller</span>
                  </button>
                )}
                <a
                  href="#products-catalog"
                  className={`${tokens.btnPrimary || 'bg-[#3B1C5A] text-white'} px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm rounded-xl`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#E6B44C]" />
                  <span>Browse Products</span>
                </a>
              </div>
            </div>

            {/* Description & Contact Snippets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className={`${tokens.textSecondary || 'text-slate-600'} max-w-2xl leading-relaxed text-xs sm:text-sm`}>
                {business?.description || 'Authentic products crafted directly from our workshop and catalog.'}
              </p>
              <div className="flex items-center gap-4 text-xs shrink-0 font-medium text-slate-600">
                {business?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 opacity-70" />
                    <span>{business.phone}</span>
                  </span>
                )}
                {business?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 opacity-70" />
                    <span>{business.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
      </EditableSectionWrapper>
    );
  };

  // 3. HERO BILLBOARD BANNER
  const renderHero = () => {
    if (!isHeroVisible) return null;
    const heading = heroConfig.heading || business?.name || template?.name;
    const subheading =
      heroConfig.subheading ||
      business?.description ||
      template?.description ||
      'Explore handpicked products crafted with dedication and authentic craftsmanship.';
    const ctaText = heroConfig.ctaText || 'Explore Collection';
    const ctaLink = heroConfig.ctaLink || '#products-catalog';
    const secondaryCtaText = heroConfig.secondaryCtaText || 'Our Story';
    const secondaryCtaLink = heroConfig.secondaryCtaLink || '#story';
    const overlayDarkness = heroConfig.overlayOpacity !== undefined ? heroConfig.overlayOpacity : 50;

    return (
      <EditableSectionWrapper
        sectionId="hero"
        label="Hero Billboard Banner"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'hero'}
        onSelect={onSelectSection}
        className="mb-8"
      >
        <section
          className={`relative min-h-[320px] sm:min-h-[400px] ${tokens.roundedCard || 'rounded-3xl'} overflow-hidden shadow-lg flex items-center justify-start p-8 sm:p-14 text-white`}
        >
          {/* Background image */}
          <img
            src={heroBackgroundImage}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dynamic Dark Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30"
            style={{ opacity: overlayDarkness / 100 + 0.3 }}
          />

          {/* Billboard Content */}
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{template?.tagline || template?.name}</span>
            </div>

            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md ${tokens.fontHeading || 'font-sans'}`}>
              {heading}
            </h2>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light drop-shadow-xs max-w-xl">
              {subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={ctaLink}
                onClick={(e) => {
                  if (ctaLink.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(ctaLink);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ backgroundColor: secondaryBg }}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-[#3B1C5A] hover:opacity-90 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink}
                  onClick={(e) => {
                    if (secondaryCtaLink.startsWith('#')) {
                      e.preventDefault();
                      const target = document.querySelector(secondaryCtaLink);
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{secondaryCtaText}</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </EditableSectionWrapper>
    );
  };

  // 4. TRUST & VALUE BADGES BAR
  const renderBadges = () => {
    if (!isBadgesVisible) return null;

    const b1Title = badgesConfig.badge1Title || '100% Genuine Origin';
    const b1Desc = badgesConfig.badge1Subtitle || 'Directly sourced from verified workshop';
    const b2Title = badgesConfig.badge2Title || 'Fast & Safe Dispatch';
    const b2Desc = badgesConfig.badge2Subtitle || 'Tracked domestic courier delivery';
    const b3Title = badgesConfig.badge3Title || 'Direct Merchant Guarantee';
    const b3Desc = badgesConfig.badge3Subtitle || 'Hassle-free support and transparent returns';

    return (
      <EditableSectionWrapper
        sectionId="badges"
        label="Trust & Value Highlights"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'badges'}
        onSelect={onSelectSection}
        className="mb-8"
      >
        <aside
          aria-label="Merchant Highlights"
          className={`p-5 sm:p-6 ${tokens.roundedCard || 'rounded-3xl'} ${tokens.cardBg || 'bg-white'} border ${tokens.border || 'border-slate-200'} shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100/80 flex items-center justify-center shrink-0 text-amber-800">
              <ShieldCheck className="w-6 h-6 text-[#E6B44C]" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-black ${tokens.textPrimary || 'text-slate-900'}`}>{b1Title}</h3>
              <p className={`text-[11px] ${tokens.textSecondary || 'text-slate-600'} mt-0.5`}>{b1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 flex items-center justify-center shrink-0 text-emerald-800">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-black ${tokens.textPrimary || 'text-slate-900'}`}>{b2Title}</h3>
              <p className={`text-[11px] ${tokens.textSecondary || 'text-slate-600'} mt-0.5`}>{b2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-100/80 flex items-center justify-center shrink-0 text-purple-800">
              <RotateCcw className="w-6 h-6 text-[#3B1C5A]" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-black ${tokens.textPrimary || 'text-slate-900'}`}>{b3Title}</h3>
              <p className={`text-[11px] ${tokens.textSecondary || 'text-slate-600'} mt-0.5`}>{b3Desc}</p>
            </div>
          </div>
        </aside>
      </EditableSectionWrapper>
    );
  };

  // 5. PRODUCT SHOWCASE GRID
  const renderProducts = () => {
    if (!isProductsVisible) return null;

    const heading = productsConfig.heading || 'Featured Catalog';
    const subheading =
      productsConfig.subheading || `Browse ${filteredProducts.length} curated product(s) available in this store`;

    // Dynamic grid classes based on template layoutType
    let gridColsClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    if (layoutType === 'editorial-spacious') {
      gridColsClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';
    } else if (layoutType === 'specs-dense') {
      gridColsClass = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';
    } else if (layoutType === 'compact-quick') {
      gridColsClass = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';
    }

    return (
      <EditableSectionWrapper
        sectionId="products"
        label="Product Catalog & Grid"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'products'}
        onSelect={onSelectSection}
        className="mb-12"
      >
        <section id="products-catalog" aria-label="Store Products" className="space-y-6 scroll-mt-20">
          {/* Section Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${tokens.textPrimary || 'text-slate-900'} ${tokens.fontHeading || 'font-sans'}`}>
                {heading}
              </h2>
              <p className={`text-xs ${tokens.textSecondary || 'text-slate-600'} mt-0.5`}>{subheading}</p>
            </div>

            {/* In-store Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E6B44C]"
              />
            </div>
          </div>

          {/* In-store Category Tabs */}
          {uniqueCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-[#3B1C5A] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {displayProducts.length === 0 ? (
            <div className="p-12 text-center bg-white/90 rounded-3xl border border-dashed border-[#C6B7E2]/60 space-y-3 max-w-md mx-auto my-6 shadow-xs">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-amber-50 text-[#E6B44C] mb-2">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-[#3B1C5A]">No Products in Store Catalog</h3>
              <p className="text-xs text-[#3B1C5A]/70 leading-relaxed">
                This store hasn&apos;t added any products to its catalog yet.
              </p>
              {isPreview && (
                <Link
                  to="/merchant/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B1C5A] text-white text-xs font-bold hover:bg-[#2A1440] transition-all shadow-md mt-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#E6B44C]" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <ShoppingBag className="w-8 h-8 text-[#E6B44C] mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Matching Products</h3>
              <p className="text-xs text-slate-500">
                {searchTerm
                  ? `No products match "${searchTerm}". Try a different keyword.`
                  : 'No products match the selected category filter.'}
              </p>
              <button
                onClick={() => { setActiveCategoryFilter('All'); setSearchTerm(''); }}
                className="px-4 py-1.5 text-xs font-bold text-[#3B1C5A] bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={gridColsClass}>
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="relative group">
                  <ProductCard
                    product={prod}
                    template={template}
                    templateStyle={template?.cardDisplayStyle || 'standard'}
                    isWishlisted={wishlistCtx?.isWishlisted?.(prod.id) || false}
                    onToggleWishlist={wishlistCtx?.toggleWishlist}
                  />
                  {addedProductId === prod.id && (
                    <div className="absolute inset-0 bg-emerald-950/80 rounded-2xl flex items-center justify-center text-white text-xs font-bold animate-in fade-in duration-200 pointer-events-none z-20">
                      <div className="flex items-center gap-1.5 bg-emerald-600 px-3 py-1.5 rounded-full shadow-lg">
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </EditableSectionWrapper>
    );
  };

  // 6. BRAND STORY / MERCHANT PHILOSOPHY
  const renderStory = () => {
    if (!isStoryVisible) return null;

    const title = storyConfig.title || 'Brand Heritage & Craft';
    const quote =
      storyConfig.content ||
      business?.description ||
      'We believe in honest materials, independent dedication, and delivering lasting quality straight from our hands to yours.';
    const signature = storyConfig.signature || `${business?.name || 'Store'} Independent Atelier`;

    return (
      <EditableSectionWrapper
        sectionId="story"
        label="Brand Story & Heritage"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'story'}
        onSelect={onSelectSection}
        className="mb-12"
      >
        <section
          id="story"
          aria-label="Merchant Story"
          className={`p-8 sm:p-12 ${tokens.roundedCard || 'rounded-3xl'} ${tokens.cardBg || 'bg-white'} border ${tokens.border || 'border-amber-200'} shadow-sm space-y-4`}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>{title}</span>
          </div>

          <blockquote className={`text-base sm:text-xl ${tokens.textPrimary || 'text-slate-900'} font-serif italic leading-relaxed`}>
            &ldquo;{quote}&rdquo;
          </blockquote>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-black/5">
            <span className="font-semibold text-slate-700">{signature}</span>
            <span className="text-[11px] text-slate-400">Verified Bizora Independent Store</span>
          </div>
        </section>
      </EditableSectionWrapper>
    );
  };

  // 7. FOOTER & CONTACT
  const renderFooter = () => {
    if (!isFooterVisible) return null;
    const copyright =
      footerConfig.copyrightText ||
      `© ${new Date().getFullYear()} ${business?.name || 'Bizora Store'}. All rights reserved. Powered by Bizora Digital Market.`;

    return (
      <EditableSectionWrapper
        sectionId="footer"
        label="Footer & Contact"
        isEditable={isEditable}
        isSelected={selectedSectionId === 'footer'}
        onSelect={onSelectSection}
        className="mt-12"
      >
        <footer
          className={`p-8 sm:p-10 ${tokens.roundedCard || 'rounded-3xl'} bg-slate-900 text-white shadow-sm space-y-6`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{business?.name || 'Our Store'}</h3>
              <p className="text-xs text-slate-400">
                {business?.category || template?.categoryName} • Official Dedicated Storefront
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs text-slate-300 font-medium">
              {business?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E6B44C]" />
                  <span>{business.phone}</span>
                </span>
              )}
              {business?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#E6B44C]" />
                  <span>{business.email}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>{business?.address || 'India'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <p>{copyright}</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Bizora Merchant ID: {business?.id?.slice(0, 8) || 'N/A'}</span>
            </div>
          </div>
        </footer>
      </EditableSectionWrapper>
    );
  };

  // Section Dispatcher map
  const sectionComponents = {
    announcement: renderAnnouncement,
    header: renderHeader,
    hero: renderHero,
    badges: renderBadges,
    products: renderProducts,
    story: renderStory,
    footer: renderFooter
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-4 antialiased ${tokens.fontBody || 'font-sans'}`}>
      {activeOrder.map((sectionId) => {
        const renderFunc = sectionComponents[sectionId];
        return renderFunc ? <React.Fragment key={sectionId}>{renderFunc()}</React.Fragment> : null;
      })}
    </div>
  );
};

export default UniversalModularStorefrontTemplate;

