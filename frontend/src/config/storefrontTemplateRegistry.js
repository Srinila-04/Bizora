/**
 * Bizora Storefront Template Registry
 *
 * Provides a scalable, data-driven registry of category-specific storefront templates.
 * Every product category supported by Bizora has EXACTLY FIVE distinct templates
 * specifically tailored to that category's imagery, information hierarchy, and shopping flow.
 */

import { CATEGORIES_REGISTRY, normalizeCategoryKey } from './categoryRegistry.js';

export const STOREFRONT_TEMPLATE_REGISTRY = {
  // ==========================================
  // 1. FOOD & BEVERAGE TEMPLATES (5)
  // ==========================================
  'food-artisan-roaster': {
    id: 'food-artisan-roaster',
    name: 'Artisan Roaster & Cafe',
    categoryId: 'food-beverage',
    categoryName: 'Food & Beverage',
    tagline: 'Warm terracotta, rich serif typography, and roast tasting notes',
    description: 'Boutique single-origin presentation with flavor profile badges, roast level meters, and warm amber storytelling.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Tasting Notes Available'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#78350F',
      secondary: '#B45309',
      accent: '#FEF3C7',
      cardBg: 'bg-white/95',
      pageBg: 'bg-[#FDFBF7]',
      border: 'border-amber-200/70',
      textPrimary: 'text-[#451A03]',
      textSecondary: 'text-[#78350F]/80',
      textMuted: 'text-[#78350F]/55',
      fontHeading: 'font-serif tracking-normal',
      fontBody: 'font-serif',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#78350F] hover:bg-[#92400E] text-[#FEF3C7] shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-[#78350F] border border-amber-200 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      badgeSecondary: 'bg-orange-50 text-orange-800 border border-orange-200',
      headerGradient: 'from-[#451A03] via-[#78350F] to-[#9A3412]',
      priceColor: 'text-[#78350F] font-serif font-black',
      tagBg: 'bg-[#FAF5EE]'
    }
  },

  'food-fresh-harvest': {
    id: 'food-fresh-harvest',
    name: 'Fresh Harvest Market',
    categoryId: 'food-beverage',
    categoryName: 'Food & Beverage',
    tagline: 'Farm-to-table emerald green with organic verification seals',
    description: 'Vibrant local produce market design with freshness date stamps, organic certification pills, and rapid add-to-cart.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: '100% Farm Fresh'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#166534',
      secondary: '#22C55E',
      accent: '#DCFCE7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F0FDF4]',
      border: 'border-emerald-200/80',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-800/85',
      textMuted: 'text-emerald-700/60',
      fontHeading: 'font-sans font-bold tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-[#166534] hover:bg-[#14532D] text-white shadow-sm transition-all',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      badgeSecondary: 'bg-lime-50 text-lime-900 border border-lime-200',
      headerGradient: 'from-emerald-950 via-green-800 to-emerald-900',
      priceColor: 'text-emerald-950 font-black',
      tagBg: 'bg-emerald-50/60'
    }
  },

  'food-gourmet-bistro': {
    id: 'food-gourmet-bistro',
    name: 'Gourmet Delicatessen & Bistro',
    categoryId: 'food-beverage',
    categoryName: 'Food & Beverage',
    tagline: 'Deep burgundy and brass accents with pairing suggestions',
    description: 'High-end delicatessen experience featuring gourmet provenance storytelling, sommelier pairing tags, and refined serifs.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Curated Delicacy'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#881337',
      secondary: '#D97706',
      accent: '#FFFBEB',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFDFD]',
      border: 'border-rose-200/70',
      textPrimary: 'text-[#4C0519]',
      textSecondary: 'text-[#881337]/80',
      textMuted: 'text-[#881337]/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#881337] hover:bg-[#700F2B] text-amber-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-rose-50 hover:bg-rose-100 text-[#881337] border border-rose-200 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      badgeSecondary: 'bg-rose-50 text-rose-800 border border-rose-200',
      headerGradient: 'from-[#4C0519] via-[#881337] to-amber-900',
      priceColor: 'text-[#881337] font-serif font-black',
      tagBg: 'bg-rose-50/50'
    }
  },

  'food-craft-bakery': {
    id: 'food-craft-bakery',
    name: 'Craft Bakery & Patisserie',
    categoryId: 'food-beverage',
    categoryName: 'Food & Beverage',
    tagline: 'Warm cinnamon and honey tones with fresh batch timing',
    description: 'Artisan patisserie layout with fresh daily bake counters, gluten/flour type pills, and soft organic claymorphic cards.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Baked Daily'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-48',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#92400E',
      secondary: '#F59E0B',
      accent: '#FEF3C7',
      cardBg: 'bg-white/95',
      pageBg: 'bg-[#FFFBEB]/40',
      border: 'border-amber-200/80',
      textPrimary: 'text-amber-950',
      textSecondary: 'text-amber-900/80',
      textMuted: 'text-amber-800/50',
      fontHeading: 'font-serif font-bold tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#92400E] hover:bg-[#78350F] text-white shadow-sm transition-all',
      btnSecondary: 'bg-amber-100/60 hover:bg-amber-100 text-amber-950 border border-amber-300/60 transition-all',
      badgePrimary: 'bg-amber-200 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-orange-50 text-orange-900 border border-orange-200',
      headerGradient: 'from-amber-950 via-amber-800 to-orange-900',
      priceColor: 'text-amber-950 font-black',
      tagBg: 'bg-amber-50/80'
    }
  },

  'food-quick-pantry': {
    id: 'food-quick-pantry',
    name: 'Quick Pantry Essentials',
    categoryId: 'food-beverage',
    categoryName: 'Food & Beverage',
    tagline: 'High-efficiency pantry grid with multi-pack quantity controls',
    description: 'Designed for fast replenishment shopping with clear unit pricing, shelf-life indicators, and prominent stock availability.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Pantry Staple'
    },
    headerLayout: {
      bannerHeight: 'h-28 sm:h-38',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0F766E',
      secondary: '#14B8A6',
      accent: '#CCFBF1',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F0FDFA]',
      border: 'border-teal-200/80',
      textPrimary: 'text-teal-950',
      textSecondary: 'text-teal-800/80',
      textMuted: 'text-teal-700/50',
      fontHeading: 'font-sans font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs transition-all',
      btnSecondary: 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 transition-all',
      badgePrimary: 'bg-teal-100 text-teal-900 border border-teal-300 font-bold',
      badgeSecondary: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      headerGradient: 'from-teal-950 via-teal-900 to-cyan-950',
      priceColor: 'text-teal-950 font-black',
      tagBg: 'bg-teal-50/50'
    }
  },

  // ==========================================
  // 2. FASHION & CLOTHING TEMPLATES (5) - PHASE 1
  // ==========================================
  'fashion-aarohi-ethnic': {
    id: 'fashion-aarohi-ethnic',
    name: 'Aarohi Ethnic Wear',
    categoryId: 'fashion-apparel',
    categoryName: 'Fashion & Clothing',
    tagline: 'Warm cream & crimson red, Traditional Meets Trendy hero, 6-card trending grid, and 20% off showcase',
    description: 'Faithful recreation of Aarohi reference: crimson motif branding, Traditional Meets Trendy ethnic wear hero billboard, 6-column trending grid with color swatches & Add to Bag, festive Flat 20% off banner, and verified trust pillars.',
    layoutType: 'fashion-aarohi-ethnic',
    previewImage: '/images/templates/fashion-aarohi-ethnic.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'ethnic-card',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Ethnic Wear'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-60',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#9B111E',
      secondary: '#8C7A6B',
      accent: '#FAF7F2',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF7F2]',
      border: 'border-[#EAE3D6]',
      textPrimary: 'text-[#2C231F]',
      textSecondary: 'text-[#6B5E53]',
      textMuted: 'text-[#8C7A6B]',
      fontHeading: 'font-serif',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-[#1F1713] hover:bg-[#382C25] text-white shadow-xs transition-all font-sans font-bold text-xs rounded-full',
      btnSecondary: 'bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#2C231F] border border-[#D9D0C1] transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#9B111E] text-white font-sans font-bold text-[8px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#FAF4EA] text-[#9B111E] border border-[#EAE3D6]',
      headerGradient: 'from-[#2C231F] via-[#382C25] to-[#9B111E]',
      priceColor: 'text-[#1F1713] font-serif font-bold',
      tagBg: 'bg-[#FAF4EA]'
    }
  },

  'fashion-kyna-chikankari': {
    id: 'fashion-kyna-chikankari',
    name: 'KYNA Studio Chikankari Atelier',
    categoryId: 'fashion-apparel',
    categoryName: 'Fashion & Clothing',
    tagline: 'Terracotta announcement, Timeless Elegance hero, 5-col trending grid, editorial cards & botanicals',
    description: 'Faithful recreation of KYNA Studio reference: signature terracotta header announcement, Timeless Elegance crafted hero, 5-column trending showcase, 3-card editorial lookbook, bestsellers with diamond ornament, and botanical guarantee strip.',
    layoutType: 'fashion-kyna-chikankari',
    previewImage: '/images/templates/fashion-kyna-chikankari.jpg',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'artisan-chikankari',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Chikankari Atelier'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#A36B63',
      secondary: '#4A352F',
      accent: '#FBF8F5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FBF8F5]',
      border: 'border-[#EDE4DC]',
      textPrimary: 'text-[#2D1F1D]',
      textSecondary: 'text-[#6E5A54]',
      textMuted: 'text-[#96827C]',
      fontHeading: 'font-serif tracking-normal',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#A36B63] hover:bg-[#8F5B54] text-white shadow-xs transition-all font-sans font-medium text-xs tracking-wider uppercase',
      btnSecondary: 'bg-transparent hover:bg-[#A36B63]/10 text-[#A36B63] border border-[#A36B63]/40 transition-all font-sans font-medium text-xs uppercase',
      badgePrimary: 'bg-[#A36B63] text-white font-sans text-[8px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#F2EAE4] text-[#A36B63] border border-[#E0D2CA]',
      headerGradient: 'from-[#4A352F] via-[#704F47] to-[#A36B63]',
      priceColor: 'text-[#A36B63] font-serif font-bold',
      tagBg: 'bg-[#F9F3EF]'
    }
  },

  'fashion-aurora-minimal': {
    id: 'fashion-aurora-minimal',
    name: 'AURORA Contemporary Sage',
    categoryId: 'fashion-apparel',
    categoryName: 'Fashion & Clothing',
    tagline: 'Sage green palette, Elevate Your Everyday Style hero, 4-col bestsellers, lifestyle split banner & 50K+ stats',
    description: 'Faithful recreation of AURORA reference: sage green discount strip, Elevate Your Everyday Style hero with capsule badge, 4-column modern bestsellers, More Than Fashion lifestyle split banner, 50K+ trust counters, and customer testimonials.',
    layoutType: 'fashion-aurora-minimal',
    previewImage: '/images/templates/fashion-aurora-minimal.png',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'minimal-sage',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Everyday Contemporary'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#4E6B50',
      secondary: '#3B523D',
      accent: '#F3F5EE',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F3F5EE]',
      border: 'border-[#DFE5D8]',
      textPrimary: 'text-[#19221A]',
      textSecondary: 'text-[#4F5E50]',
      textMuted: 'text-[#697A6A]',
      fontHeading: 'font-serif font-light',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#4E6B50] hover:bg-[#3B523D] text-white shadow-xs transition-all font-sans font-semibold text-xs rounded-full',
      btnSecondary: 'bg-white hover:bg-[#EAEFE6] text-[#3B523D] border border-[#D5DDD0] transition-all font-sans font-semibold text-xs rounded-full',
      badgePrimary: 'bg-[#19221A] text-white font-sans font-bold text-[9px] uppercase tracking-wider rounded-md',
      badgeSecondary: 'bg-[#E1E8DC] text-[#3B523D] border border-[#DFE5D8]',
      headerGradient: 'from-[#19221A] via-[#3B523D] to-[#4E6B50]',
      priceColor: 'text-[#19221A] font-sans font-semibold',
      tagBg: 'bg-[#E1E8DC]'
    }
  },

  'fashion-vibrant-pop': {
    id: 'fashion-vibrant-pop',
    name: 'Vibrant Pop & Streetwear',
    categoryId: 'fashion-apparel',
    categoryName: 'Fashion & Clothing',
    tagline: 'Coral red hero promo, category outline icons, model cutouts, and discount badges',
    description: 'Playful high-energy streetwear design with Supima cotton hero banner, spotlight model cutouts, circular outline category icons, and coral-tinted product grid (John Clothes style).',
    layoutType: 'fashion-vibrant-pop',
    previewImage: '/images/templates/fashion-vibrant-pop.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-[28px]',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'pop-overlay',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Hot Pick'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#FF4D4D',
      secondary: '#F04E38',
      accent: '#FFF0F0',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFFFF]',
      border: 'border-rose-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-black',
      fontBody: 'font-sans',
      roundedCard: 'rounded-[28px]',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#FF4D4D] hover:bg-[#E03638] text-white shadow-md transition-all font-bold rounded-full',
      btnSecondary: 'bg-rose-50 hover:bg-rose-100 text-[#FF4D4D] border border-rose-200 transition-all font-bold rounded-full',
      badgePrimary: 'bg-[#FF4D4D] text-white font-bold',
      badgeSecondary: 'bg-rose-100 text-[#FF4D4D] border border-rose-200',
      headerGradient: 'from-[#FF4D4D] via-[#FF6B6B] to-[#F04E38]',
      priceColor: 'text-[#FF4D4D] font-black',
      tagBg: 'bg-rose-50'
    }
  },

  'fashion-dark-heritage': {
    id: 'fashion-dark-heritage',
    name: 'Timeless Dark Atelier',
    categoryId: 'fashion-apparel',
    categoryName: 'Fashion & Clothing',
    tagline: 'Obsidian dark mode, warm golden tan highlights, tailored essentials, and color swatches',
    description: 'High-end menswear atelier aesthetic with rich dark obsidian background, gold typography, three-column luxury highlights bar, color swatch circles, and journal editorial stories (Vlore style).',
    layoutType: 'fashion-dark-heritage',
    previewImage: '/images/templates/fashion-dark-heritage.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'dark-swatch',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Atelier Heritage'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-60',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#0D0D0D',
      secondary: '#C8A97E',
      accent: '#1F1F1F',
      cardBg: 'bg-[#141414] text-white',
      pageBg: 'bg-[#0D0D0D]',
      border: 'border-[#262626]',
      textPrimary: 'text-white',
      textSecondary: 'text-[#A3A3A3]',
      textMuted: 'text-[#737373]',
      fontHeading: 'font-serif tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#C8A97E] hover:bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-[11px]',
      btnSecondary: 'bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#333333] font-bold uppercase tracking-widest text-[11px]',
      badgePrimary: 'bg-[#C8A97E] text-black font-bold text-[9px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#1A1A1A] text-[#C8A97E] border border-[#C8A97E]/30',
      headerGradient: 'from-[#0D0D0D] via-[#1A1A1A] to-[#141414]',
      priceColor: 'text-[#C8A97E] font-serif font-black',
      tagBg: 'bg-[#141414]'
    }
  },

  'fashion-editorial-luxury': {
    id: 'fashion-editorial-luxury',
    name: 'Modern Editorial Luxury',
    categoryId: 'fashion-apparel-archived',
    categoryName: 'Fashion & Clothing',
    tagline: 'Warm ecru lookbook, split serif hero, circular category pills, and dual promo banners',
    description: 'Sophisticated atelier aesthetic with relaxed tailoring hero, circular category avatars, four portrait category cards, dual split banners, and 6-card loved picks (Lunora Fashion style).',
    layoutType: 'fashion-editorial-luxury',
    previewImage: '/images/templates/fashion-editorial-luxury.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Atelier Collection'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#1A1A1A',
      secondary: '#78716C',
      accent: '#F4EFE6',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF8F5]',
      border: 'border-[#E8E3DA]',
      textPrimary: 'text-[#1A1A1A]',
      textSecondary: 'text-[#57534E]',
      textMuted: 'text-[#78716C]',
      fontHeading: 'font-serif tracking-normal',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-black hover:bg-neutral-800 text-white uppercase tracking-widest text-[11px] font-bold',
      btnSecondary: 'bg-transparent hover:bg-black/5 text-black border border-black/40 uppercase tracking-widest text-[11px]',
      badgePrimary: 'bg-black text-white font-sans text-[9px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#EBE5DA] text-[#1A1A1A] border border-[#D6D0C4]',
      headerGradient: 'from-[#1A1A1A] via-[#292524] to-[#44403C]',
      priceColor: 'text-black font-serif font-black',
      tagBg: 'bg-[#F4EFE6]'
    }
  },

  'fashion-noir-monochrome': {
    id: 'fashion-noir-monochrome',
    name: 'Noir Couture & Streetwear',
    categoryId: 'fashion-apparel-archived',
    categoryName: 'Fashion & Clothing',
    tagline: 'Stark monochrome high-contrast, monumental typography, and capsule edition cards',
    description: 'Cinematic high-contrast noir streetwear with monumental watermark lettering, 4-column feature boxes, cinematic campaign story, and framed capsule edition cards (Mafia Noir style).',
    layoutType: 'fashion-noir-monochrome',
    previewImage: '/images/templates/fashion-noir-monochrome.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-none',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'noir-capsule',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Capsule Edition'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#000000',
      secondary: '#525252',
      accent: '#F4F4F5',
      cardBg: 'bg-white text-black',
      pageBg: 'bg-[#FAFAFA]',
      border: 'border-black',
      textPrimary: 'text-black',
      textSecondary: 'text-neutral-700',
      textMuted: 'text-neutral-500',
      fontHeading: 'font-sans font-black tracking-tighter uppercase',
      fontBody: 'font-sans',
      roundedCard: 'rounded-none',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-none',
      btnPrimary: 'bg-black hover:bg-neutral-800 text-white font-mono font-black uppercase tracking-widest text-[11px]',
      btnSecondary: 'bg-white hover:bg-neutral-100 text-black border-2 border-black font-mono font-bold uppercase tracking-widest text-[11px]',
      badgePrimary: 'bg-black text-white font-mono font-black tracking-widest text-[9px]',
      badgeSecondary: 'bg-neutral-100 text-neutral-800 border border-neutral-300 font-mono text-[9px]',
      headerGradient: 'from-black via-neutral-900 to-black',
      priceColor: 'text-black font-mono font-black',
      tagBg: 'bg-neutral-100'
    }
  },

  'fashion-artisanal-earth': {
    id: 'fashion-artisanal-earth',
    name: 'Artisanal Earth & Organic Chic',
    categoryId: 'fashion-apparel-archived',
    categoryName: 'Fashion & Clothing',
    tagline: 'Terracotta & clay palette, arch collection cards, loomed indigo textiles, and maker tribute',
    description: 'Mindful organic craft aesthetic with "Artful Living" serif hero, four arch-framed collections in indigo, terracotta, navy, and mustard, terracotta pill buttons, and artisan weaving tribute (Aura Studios style).',
    layoutType: 'fashion-artisanal-earth',
    previewImage: '/images/templates/fashion-artisanal-earth.png',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'earth-craft',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Artisanal Loom'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#C1613A',
      secondary: '#354259',
      accent: '#CCA142',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FBF7F0]',
      border: 'border-[#E8DFC8]',
      textPrimary: 'text-[#2C2724]',
      textSecondary: 'text-[#6B6157]',
      textMuted: 'text-[#A69B91]',
      fontHeading: 'font-serif font-normal',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#C1613A] hover:bg-[#A84F2A] text-white shadow-sm transition-all font-sans font-bold text-xs uppercase tracking-widest rounded-full',
      btnSecondary: 'bg-[#FBF7F0] hover:bg-[#EFE8DA] text-[#C1613A] border border-[#C1613A]/40 transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#C1613A] text-white font-sans font-bold',
      badgeSecondary: 'bg-[#EFE8DA] text-[#6B6157] border border-[#E8DFC8]',
      headerGradient: 'from-[#C1613A] via-[#964228] to-[#354259]',
      priceColor: 'text-[#C1613A] font-serif font-bold',
      tagBg: 'bg-[#FBF7F0]'
    }
  },

  // ==========================================
  // 3. ELECTRONICS & GADGETS TEMPLATES (3)
  // ==========================================
  'electronics-technova-modern': {
    id: 'electronics-technova-modern',
    name: 'TechNova Modern Electronics',
    categoryId: 'electronics-gadgets',
    categoryName: 'Electronics & Gadgets',
    tagline: 'Clean high-tech blue, Smarter Tomorrow hero, 8 category bubbles, Trending & Recommended grids, dual flash offers',
    description: 'Faithful recreation of TechNova reference: clean white header with blue folded N emblem, dark stone pedestal hero with handwritten script annotation, 8 circular category bubbles, 5-column trending products grid, dual Flash Offers and New Arrivals promotional cards, 5-column recommended grid, 4-item trust bar, TechNova+ newsletter, and clean white footer.',
    layoutType: 'electronics-technova-modern',
    previewImage: '/images/templates/electronics-technova-modern.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'modern-tech',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Next-Gen Tech'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#EFF6FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200/90',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-black',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all font-sans font-bold text-xs rounded-full',
      btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#2563EB] text-white font-sans font-bold text-[9px] uppercase tracking-wider',
      badgeSecondary: 'bg-blue-50 text-[#2563EB] border border-blue-200',
      headerGradient: 'from-[#0B0F19] via-[#111827] to-[#1E3A8A]',
      priceColor: 'text-slate-900 font-extrabold',
      tagBg: 'bg-blue-50'
    }
  },

  'electronics-aurora-cyber': {
    id: 'electronics-aurora-cyber',
    name: 'AURORA Cybernetic Sage & Audio',
    categoryId: 'electronics-gadgets',
    categoryName: 'Electronics & Gadgets',
    tagline: 'Deep space obsidian with radiant mint sage accents, cylindrical pedestal hero, 5 category pills, 6-col bestsellers & summer sale',
    description: 'Faithful recreation of AURORA STORE reference: deep obsidian dark mode, wide-spaced minimalist branding, elevated audio headphones pedestal hero with ambient rim lighting, 5 dark pill category cards with counts, 6-column best selling grid with mint badges, mint Summer Sale Up to 40% OFF countdown banner, 6-column new arrivals, customer reviews, and newsletter banner.',
    layoutType: 'electronics-aurora-cyber',
    previewImage: '/images/templates/electronics-aurora-cyber.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'cyber-audio',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Cyber Acoustic'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#4ECCA3',
      secondary: '#88D49E',
      accent: '#18342B',
      cardBg: 'bg-[#111917] text-[#E2F7EE]',
      pageBg: 'bg-[#080C0E]',
      border: 'border-[#1E2E2A]',
      textPrimary: 'text-[#E2F7EE]',
      textSecondary: 'text-[#8BAAA0]',
      textMuted: 'text-[#5F8578]',
      fontHeading: 'font-sans font-light',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#4ECCA3] hover:bg-[#88D49E] text-[#080C0E] shadow-md transition-all font-sans font-extrabold text-xs rounded-full',
      btnSecondary: 'bg-[#16221E] hover:bg-[#20362F] text-[#4ECCA3] border border-[#2D5A4C] transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#18342B] text-[#4ECCA3] border border-[#2D5A4C] font-mono text-[9px] font-bold',
      badgeSecondary: 'bg-[#16221E] text-[#88D49E] border border-[#1E2E2A]',
      headerGradient: 'from-[#0F1E1A] via-[#0C1513] to-[#080C0E]',
      priceColor: 'text-[#E2F7EE] font-black',
      tagBg: 'bg-[#16221E]'
    }
  },

  'electronics-techhaven-neon': {
    id: 'electronics-techhaven-neon',
    name: 'TechHaven Next-Gen Cyberpunk',
    categoryId: 'electronics-gadgets',
    categoryName: 'Electronics & Gadgets',
    tagline: 'Pitch dark cockpit with fiery neon orange, UPGRADE TO NEXT GEN hero, 8 cockpit category tiles, 6-col featured & 30% OFF banner',
    description: 'Faithful recreation of TechHaven reference: browser frame cockpit header with TH neon orange emblem, massive uppercase UPGRADE TO NEXT GEN hero with futuristic pedestal and 4 feature badges, 8 dark cockpit category tiles, 6-column featured products grid with vibrant orange ADD TO CART buttons, Save Up To 30% Limited Time Offer promo banner, and pitch black cyber footer.',
    layoutType: 'electronics-techhaven-neon',
    previewImage: '/images/templates/electronics-techhaven-neon.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'stacked-large',
      displayStyle: 'cockpit-neon',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Next-Gen Gear'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#FF5500',
      secondary: '#FF7700',
      accent: '#26140B',
      cardBg: 'bg-[#151620] text-white',
      pageBg: 'bg-[#0B0C10]',
      border: 'border-white/10',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-400',
      textMuted: 'text-slate-500',
      fontHeading: 'font-sans font-black uppercase',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#E64C00] hover:to-[#FF5500] text-white shadow-lg shadow-orange-600/30 transition-all font-sans font-black text-xs uppercase',
      btnSecondary: 'bg-[#1C1E2B] hover:bg-[#282B3A] text-[#FF5500] border border-[#FF5500]/40 transition-all font-sans font-bold text-xs uppercase',
      badgePrimary: 'bg-[#FF5500] text-white font-mono text-[9px] font-black uppercase',
      badgeSecondary: 'bg-[#1C1E2B] text-orange-400 border border-orange-500/30',
      headerGradient: 'from-[#101118] via-[#151622] to-[#0E0F16]',
      priceColor: 'text-white font-black',
      tagBg: 'bg-[#151620]'
    }
  },

  'electronics-spec-matrix': {
    id: 'electronics-spec-matrix',
    name: 'Precision Spec Matrix & Lab',
    categoryId: 'electronics-gadgets',
    categoryName: 'Electronics & Gadgets',
    tagline: 'Technical spec matrix with component benchmarks & high-density layout',
    description: 'Engineered for high-performance hardware, audio gears, and tech gadgets featuring a detailed technical spec matrix, component benchmarks, and lab test ratings.',
    layoutType: 'specs-dense',
    previewImage: '/images/templates/electronics-technova-modern.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Lab Verified'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#2563EB',
      accent: '#F1F5F9',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-mono font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white font-mono',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono',
      badgePrimary: 'bg-blue-100 text-blue-800 border border-blue-200 font-mono text-[9px] uppercase font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-700 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-blue-950',
      priceColor: 'text-slate-900 font-mono font-bold',
      tagBg: 'bg-slate-100'
    }
  },

  'electronics-minimal-studio': {
    id: 'electronics-minimal-studio',
    name: 'Minimal Tech Studio',
    categoryId: 'electronics-gadgets',
    categoryName: 'Electronics & Gadgets',
    tagline: 'Understated matte industrial aesthetic with expansive negative space & macro photography',
    description: 'Designed for sleek industrial electronics and minimalist audio hardware with spacious macro photography focus, anodized aluminum palettes, and quiet luxury typography.',
    layoutType: 'editorial-spacious',
    previewImage: '/images/templates/electronics-aurora-cyber.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Studio Edition'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-60',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#0F172A',
      secondary: '#64748B',
      accent: '#F8FAFC',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAFAFA]',
      border: 'border-slate-100',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-light tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white font-sans',
      btnSecondary: 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-sans',
      badgePrimary: 'bg-slate-100 text-slate-800 border border-slate-200 text-[9px]',
      badgeSecondary: 'bg-slate-50 text-slate-600',
      headerGradient: 'from-slate-950 via-slate-900 to-slate-800',
      priceColor: 'text-slate-900 font-light',
      tagBg: 'bg-slate-50'
    }
  },

  // ==========================================
  // 4. HOME & LIVING TEMPLATES (5)
  // ==========================================
  'home-architectural-haven': {
    id: 'home-architectural-haven',
    name: 'Architectural Haven',
    categoryId: 'home-living',
    categoryName: 'Home & Living',
    tagline: 'Wide 16:10 room frames, stone & linen palette, and dimension tags',
    description: 'Designed for furniture and architectural decor with wide room-setting aspect ratios, dimension callouts, and natural linen textures.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Architectural Living'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-64',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#44403C',
      secondary: '#A8A29E',
      accent: '#F5F5F4',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FBF9F5]',
      border: 'border-stone-200',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-600',
      textMuted: 'text-stone-400',
      fontHeading: 'font-serif font-light tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all',
      btnSecondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-all',
      badgePrimary: 'bg-stone-200 text-stone-900 border border-stone-300 font-medium',
      badgeSecondary: 'bg-amber-50 text-amber-900 border border-amber-200',
      headerGradient: 'from-stone-950 via-stone-900 to-stone-800',
      priceColor: 'text-stone-900 font-serif font-bold',
      tagBg: 'bg-stone-100/50'
    }
  },

  'home-scandinavian-minimal': {
    id: 'home-scandinavian-minimal',
    name: 'Scandinavian Simplicity',
    categoryId: 'home-living',
    categoryName: 'Home & Living',
    tagline: 'Pale birch and sage tones, uncluttered cards, and sustainable wood certs',
    description: 'Calm Nordic home aesthetic featuring pale wood tones, soft sage borders, sustainable forestry certifications, and hygge warmth.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Nordic Craft'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#3F4E4F',
      secondary: '#A27B5C',
      accent: '#EBF1ED',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F7F9F6]',
      border: 'border-emerald-100',
      textPrimary: 'text-[#2C3639]',
      textSecondary: 'text-[#3F4E4F]/80',
      textMuted: 'text-[#3F4E4F]/50',
      fontHeading: 'font-sans font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#2C3639] hover:bg-[#3F4E4F] text-white shadow-xs transition-all',
      btnSecondary: 'bg-[#EBF1ED] hover:bg-emerald-100 text-[#2C3639] border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium',
      badgeSecondary: 'bg-stone-100 text-stone-800 border border-stone-200',
      headerGradient: 'from-[#2C3639] via-[#3F4E4F] to-[#A27B5C]/50',
      priceColor: 'text-[#2C3639] font-bold',
      tagBg: 'bg-emerald-50/40'
    }
  },

  'home-furniture-guild': {
    id: 'home-furniture-guild',
    name: 'Furniture & Craft Guild',
    categoryId: 'home-living',
    categoryName: 'Home & Living',
    tagline: 'Rich walnut and brass accents with joinery & upholstery badges',
    description: 'Artisan furniture presentation celebrating joinery details, solid timber provenance, and bespoke upholstery options.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Solid Hardwood'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#5B3A29',
      secondary: '#C2843A',
      accent: '#FDF8F0',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FDFBF7]',
      border: 'border-amber-200',
      textPrimary: 'text-[#3E2723]',
      textSecondary: 'text-[#5B3A29]/80',
      textMuted: 'text-[#5B3A29]/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#5B3A29] hover:bg-[#4E342E] text-amber-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-[#5B3A29] border border-amber-300 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-stone-100 text-stone-800 border border-stone-200',
      headerGradient: 'from-[#3E2723] via-[#5B3A29] to-[#8D6E63]',
      priceColor: 'text-[#5B3A29] font-serif font-black',
      tagBg: 'bg-amber-50/60'
    }
  },

  'home-decor-boutique': {
    id: 'home-decor-boutique',
    name: 'Eclectic Decor Boutique',
    categoryId: 'home-living',
    categoryName: 'Home & Living',
    tagline: 'Terracotta & olive tones, masonry card stagger, and styling vignette tips',
    description: 'Boutique interior accents layout with styling tips, maker signature stamps, and textured pottery presentation.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Stylist Choice'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#9A3412',
      secondary: '#65A30D',
      accent: '#FFEDD5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFBF5]',
      border: 'border-orange-200',
      textPrimary: 'text-orange-950',
      textSecondary: 'text-orange-900/80',
      textMuted: 'text-orange-800/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#9A3412] hover:bg-[#7C2D12] text-white shadow-sm transition-all',
      btnSecondary: 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 transition-all',
      badgePrimary: 'bg-orange-100 text-orange-900 border border-orange-300 font-bold',
      badgeSecondary: 'bg-lime-50 text-lime-900 border border-lime-200',
      headerGradient: 'from-orange-950 via-orange-900 to-amber-950',
      priceColor: 'text-orange-950 font-black',
      tagBg: 'bg-orange-50/50'
    }
  },

  'home-functional-essentials': {
    id: 'home-functional-essentials',
    name: 'Functional Home Essentials',
    categoryId: 'home-living',
    categoryName: 'Home & Living',
    tagline: 'Clean compact cards with room filter pills and assembly difficulty tags',
    description: 'High-utility home organizer layout with room category tabs, assembly difficulty ratings, and durable hardware specifications.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Easy Setup'
    },
    headerLayout: {
      bannerHeight: 'h-28 sm:h-40',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#3B82F6',
      accent: '#F1F5F9',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#1E293B] hover:bg-slate-800 text-white shadow-xs transition-all',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all',
      badgePrimary: 'bg-blue-100 text-blue-900 border border-blue-200 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-700 border border-slate-200',
      headerGradient: 'from-slate-900 via-slate-800 to-blue-950',
      priceColor: 'text-slate-950 font-black',
      tagBg: 'bg-slate-50'
    }
  },

  // ==========================================
  // 5. BEAUTY & PERSONAL CARE TEMPLATES (3)
  // ==========================================
  'beauty-glowerive-skincare': {
    id: 'beauty-glowerive-skincare',
    name: 'Glowérive Natural Skincare',
    categoryId: 'beauty-personal-care',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Deep forest green, Naturally Radiant hero, circular category pills & 4-card clean skincare grid',
    description: 'Faithful recreation of Glowérive reference: dark emerald header with free shipping over ₹999, naturally radiant dewy model hero with Shop Now and Watch Video actions, 4-pillar clean certification bar (Natural, Derma Tested, Sulfate Free, Cruelty Free), 6 circular product bubbles, 4-card featured products with ratings, and 20% off special offer banner.',
    layoutType: 'beauty-glowerive-skincare',
    previewImage: '/images/templates/beauty-glowerive-skincare.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'botanical-clean',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Clean Botanical'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#174A42',
      secondary: '#2D7A6E',
      accent: '#EDF5F2',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F2F7F5]',
      border: 'border-[#D5E5DE]',
      textPrimary: 'text-[#174A42]',
      textSecondary: 'text-[#386B61]',
      textMuted: 'text-[#52897F]',
      fontHeading: 'font-serif',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-[#174A42] hover:bg-[#134B42] text-white shadow-xs transition-all font-sans font-bold text-xs rounded-full',
      btnSecondary: 'bg-[#EDF5F2] hover:bg-[#D5E5DE] text-[#174A42] border border-[#D5E5DE] transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#174A42] text-white font-sans font-bold text-[8px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#EDF5F2] text-[#174A42] border border-[#D5E5DE]',
      headerGradient: 'from-[#134B42] via-[#174A42] to-[#2D7A6E]',
      priceColor: 'text-[#174A42] font-serif font-bold',
      tagBg: 'bg-[#EDF5F2]'
    }
  },

  'beauty-glowcare-wellness': {
    id: 'beauty-glowcare-wellness',
    name: 'GlowCare Health & Beauty',
    categoryId: 'beauty-personal-care',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Vibrant petal pink, Radiate Confidence hero, dual 30% OFF promo banners & 5-card bestsellers',
    description: 'Faithful recreation of GlowCare reference: lotus emblem header with integrated search, soft pink petal hero with 100% Original Products badge, 4-badge expert approved trust bar, dual Up to 30% OFF promotional banner cards, 5-column bestsellers with strike-through discounts, and pink bottom value strip.',
    layoutType: 'beauty-glowcare-wellness',
    previewImage: '/images/templates/beauty-glowcare-wellness.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'wellness-pink',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Health & Beauty'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#E63973',
      secondary: '#D81B60',
      accent: '#FFF0F5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFF5F7]',
      border: 'border-[#FDDCE5]',
      textPrimary: 'text-[#3B1C5A]',
      textSecondary: 'text-[#7D3859]',
      textMuted: 'text-[#A03564]',
      fontHeading: 'font-sans font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#E63973] hover:bg-[#D81B60] text-white shadow-xs transition-all font-sans font-bold text-xs rounded-full',
      btnSecondary: 'bg-[#FFF0F5] hover:bg-[#FDDCE5] text-[#E63973] border border-[#FDDCE5] transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#E63973] text-white font-sans font-bold text-[8px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#FFF0F5] text-[#E63973] border border-[#FDDCE5]',
      headerGradient: 'from-[#D81B60] via-[#E63973] to-[#FF4D88]',
      priceColor: 'text-[#3B1C5A] font-extrabold',
      tagBg: 'bg-[#FFF0F5]'
    }
  },

  'beauty-elora-lavender': {
    id: 'beauty-elora-lavender',
    name: 'ELORA Clean Beauty',
    categoryId: 'beauty-personal-care',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Soft lilac & royal plum, Beauty Naturally hero, 5 visual category tiles, story split & 5-card loved picks',
    description: 'Faithful recreation of ELORA BEAUTY reference: purple floral emblem header, clean lavender product hero with fresh botanicals, 4-badge sustainable beauty bar, 5 arched visual category cards with product counts, About ELORA brand story with 98% Natural Ingredients badges, 5-card Loved By Thousands bestsellers, and customer quote spotlight.',
    layoutType: 'beauty-elora-lavender',
    previewImage: '/images/templates/beauty-elora-lavender.png',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'clean-lavender',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Clean Beauty'
    },
    headerLayout: {
      bannerHeight: 'h-48 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#4A2373',
      secondary: '#6B3BA6',
      accent: '#F6F0FA',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FBF8FD]',
      border: 'border-[#EEDBFA]',
      textPrimary: 'text-[#2C1445]',
      textSecondary: 'text-[#5D3D7A]',
      textMuted: 'text-[#7A5B96]',
      fontHeading: 'font-serif',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-full',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#4A2373] hover:bg-[#3B1C5A] text-white shadow-xs transition-all font-sans font-bold text-xs rounded-full',
      btnSecondary: 'bg-[#F6F0FA] hover:bg-[#EEDBFA] text-[#4A2373] border border-[#EEDBFA] transition-all font-sans font-bold text-xs rounded-full',
      badgePrimary: 'bg-[#4A2373] text-white font-sans font-bold text-[8px] uppercase tracking-wider',
      badgeSecondary: 'bg-[#F6F0FA] text-[#4A2373] border border-[#EEDBFA]',
      headerGradient: 'from-[#2C1445] via-[#4A2373] to-[#6B3BA6]',
      priceColor: 'text-[#2C1445] font-serif font-bold',
      tagBg: 'bg-[#F6F0FA]'
    }
  },

  'beauty-pure-botanical': {
    id: 'beauty-pure-botanical',
    name: 'Pure Botanical Formulation',
    categoryId: 'beauty-personal-care',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Sage & eucalyptus palette, organic cold-pressed indicators & ingredient transparency',
    description: 'Clean beauty formulation design highlighting certified non-toxic ingredients, cold-pressed botanicals, vegan credentials, and active percentages.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'botanical-clean',
      showSku: false,
      showStockBadge: true,
      categoryTag: '100% Clean Botanical'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#047857',
      secondary: '#10B981',
      accent: '#ECFDF5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F6FAF7]',
      border: 'border-emerald-200/70',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-800/80',
      textMuted: 'text-emerald-700/50',
      fontHeading: 'font-sans font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#047857] hover:bg-[#065F46] text-white shadow-sm transition-all',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      badgeSecondary: 'bg-teal-50 text-teal-800 border border-teal-200',
      headerGradient: 'from-emerald-950 via-emerald-900 to-teal-950',
      priceColor: 'text-emerald-950 font-bold',
      tagBg: 'bg-emerald-50/50'
    }
  },

  'beauty-clinical-lab': {
    id: 'beauty-clinical-lab',
    name: 'Clinical Dermatology Lab',
    categoryId: 'beauty-personal-care',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Clinical white & medical cyan, pH balance and skin type indicators',
    description: 'Dermatologist-formulated skincare layout with pH metrics, barrier repair ratings, and active ingredient percentage badges.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'clinical-pure',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Dermatologist Tested'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0369A1',
      secondary: '#0EA5E9',
      accent: '#F0F9FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-sky-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-mono font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#0369A1] hover:bg-[#0284C7] text-white shadow-xs transition-all font-mono',
      btnSecondary: 'bg-sky-50 hover:bg-sky-100 text-[#0369A1] border border-sky-200 transition-all font-mono',
      badgePrimary: 'bg-sky-100 text-sky-900 border border-sky-300 font-bold font-mono',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-sky-950',
      priceColor: 'text-slate-950 font-mono font-bold',
      tagBg: 'bg-sky-50/50'
    }
  },

  'beauty-clean-botanical': {
    id: 'beauty-clean-botanical',
    name: 'Clean Botanical Lab',
    categoryId: 'beauty-personal-care-archived',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Sage & eucalyptus palette, cruelty-free checkmarks, and ingredient lists',
    description: 'Clean beauty formulation design highlighting certified non-toxic ingredients, vegan credentials, and botanical active percentages.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: '100% Clean Botanical'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#047857',
      secondary: '#10B981',
      accent: '#ECFDF5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F6FAF7]',
      border: 'border-emerald-200/70',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-800/80',
      textMuted: 'text-emerald-700/50',
      fontHeading: 'font-sans font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#047857] hover:bg-[#065F46] text-white shadow-sm transition-all',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      badgeSecondary: 'bg-teal-50 text-teal-800 border border-teal-200',
      headerGradient: 'from-emerald-950 via-emerald-900 to-teal-950',
      priceColor: 'text-emerald-950 font-bold',
      tagBg: 'bg-emerald-50/50'
    }
  },

  'beauty-glamour-studio': {
    id: 'beauty-glamour-studio',
    name: 'Glamour Cosmetics Studio',
    categoryId: 'beauty-personal-care-archived',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Glossy black and rose gold with circular shade swatches and finish badges',
    description: 'High-impact makeup and cosmetics layout with interactive circular shade selectors, matte/dewy finish tags, and runway glow.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Luxe Pigment'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#1C1917',
      secondary: '#FB7185',
      accent: '#FFF1F2',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFBFB]',
      border: 'border-rose-200',
      textPrimary: 'text-stone-950',
      textSecondary: 'text-stone-600',
      textMuted: 'text-stone-400',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-black hover:bg-zinc-800 text-rose-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-rose-50 hover:bg-rose-100 text-stone-950 border border-rose-200 transition-all font-serif',
      badgePrimary: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
      badgeSecondary: 'bg-stone-100 text-stone-800 border border-stone-200',
      headerGradient: 'from-black via-stone-900 to-rose-950/60',
      priceColor: 'text-stone-950 font-serif font-black',
      tagBg: 'bg-rose-50/40'
    }
  },

  'beauty-clinical-derma': {
    id: 'beauty-clinical-derma',
    name: 'Dermatological Clinic',
    categoryId: 'beauty-personal-care-archived',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Clinical white & medical cyan, pH balance and skin type indicators',
    description: 'Dermatologist-formulated skincare layout with pH metrics, barrier repair ratings, and active ingredient percentage badges.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Dermatologist Tested'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0369A1',
      secondary: '#0284C7',
      accent: '#F0F9FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FCFF]',
      border: 'border-sky-200',
      textPrimary: 'text-sky-950',
      textSecondary: 'text-sky-800/80',
      textMuted: 'text-sky-700/50',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#0369A1] hover:bg-[#0284C7] text-white shadow-xs transition-all',
      btnSecondary: 'bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 transition-all',
      badgePrimary: 'bg-sky-100 text-sky-900 border border-sky-300 font-bold',
      badgeSecondary: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
      headerGradient: 'from-sky-950 via-sky-900 to-cyan-950',
      priceColor: 'text-sky-950 font-black',
      tagBg: 'bg-sky-50/50'
    }
  },

  'beauty-luxury-apothecary': {
    id: 'beauty-luxury-apothecary',
    name: 'Luxury French Apothecary',
    categoryId: 'beauty-personal-care-archived',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Amber glass aesthetic, fragrance pyramid notes, and antique serif',
    description: 'Heritage perfume and apothecary design with top/heart/base fragrance pyramids, gold foil accents, and artisanal glass flacons.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Eau de Parfum'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-60',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#78350F',
      secondary: '#D97706',
      accent: '#FFFBEB',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFDF7]',
      border: 'border-amber-200/80',
      textPrimary: 'text-amber-950',
      textSecondary: 'text-amber-900/80',
      textMuted: 'text-amber-800/50',
      fontHeading: 'font-serif font-bold tracking-widest uppercase',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#78350F] hover:bg-[#92400E] text-amber-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-stone-100 text-stone-800 border border-stone-200',
      headerGradient: 'from-amber-950 via-amber-900 to-stone-950',
      priceColor: 'text-amber-950 font-serif font-black',
      tagBg: 'bg-amber-50/50'
    }
  },

  'beauty-vibrant-glow': {
    id: 'beauty-vibrant-glow',
    name: 'Vibrant Glow Youth',
    categoryId: 'beauty-personal-care-archived',
    categoryName: 'Beauty & Personal Care',
    tagline: 'Peach & coral gradients, aura cards, and viral glow tags',
    description: 'Youthful and luminous beauty layout featuring iridescent aura cards, social proof star tags, and instant skin radiance indicators.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Viral Glow'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#EA580C',
      secondary: '#F43F5E',
      accent: '#FFF7ED',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFBF5]',
      border: 'border-orange-200/80',
      textPrimary: 'text-orange-950',
      textSecondary: 'text-orange-900/80',
      textMuted: 'text-orange-800/50',
      fontHeading: 'font-sans font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 text-white shadow-md transition-all',
      btnSecondary: 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 transition-all',
      badgePrimary: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
      badgeSecondary: 'bg-orange-100 text-orange-800 border border-orange-200',
      headerGradient: 'from-orange-950 via-rose-950 to-amber-950',
      priceColor: 'text-orange-950 font-black',
      tagBg: 'bg-orange-50/50'
    }
  },

  // ==========================================
  // 6. HEALTH & WELLNESS TEMPLATES (5)
  // ==========================================
  'wellness-holistic-sanctuary': {
    id: 'wellness-holistic-sanctuary',
    name: 'Holistic Sanctuary',
    categoryId: 'health-wellness',
    categoryName: 'Health & Wellness',
    tagline: 'Moss green & bamboo tones, mindfulness breathing badge, and organic certs',
    description: 'Serene wellness sanctuary layout featuring calming earthy palettes, breathwork suggestions, and organic harvest verification.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Holistic Certified'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#14532D',
      secondary: '#84CC16',
      accent: '#F7FEE7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9FCF7]',
      border: 'border-lime-200/80',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-900/80',
      textMuted: 'text-emerald-800/50',
      fontHeading: 'font-serif font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#14532D] hover:bg-[#166534] text-white shadow-xs transition-all',
      btnSecondary: 'bg-lime-50 hover:bg-lime-100 text-emerald-950 border border-lime-200 transition-all',
      badgePrimary: 'bg-lime-100 text-lime-900 border border-lime-300 font-bold',
      badgeSecondary: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      headerGradient: 'from-emerald-950 via-green-950 to-lime-950',
      priceColor: 'text-emerald-950 font-bold',
      tagBg: 'bg-lime-50/50'
    }
  },

  'wellness-athletic-vitality': {
    id: 'wellness-athletic-vitality',
    name: 'High-Performance Vitality',
    categoryId: 'health-wellness',
    categoryName: 'Health & Wellness',
    tagline: 'Cobalt & electric lime, electrolyte badges, and endurance target tags',
    description: 'High-performance athletic nutrition with electrolyte breakdown badges, endurance targets, and energetic typographic hierarchy.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Peak Endurance'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1D4ED8',
      secondary: '#84CC16',
      accent: '#EFF6FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F6F9FF]',
      border: 'border-blue-200',
      textPrimary: 'text-blue-950',
      textSecondary: 'text-blue-800/80',
      textMuted: 'text-blue-700/50',
      fontHeading: 'font-sans font-black italic uppercase',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-md transition-all font-bold',
      btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 transition-all',
      badgePrimary: 'bg-lime-200 text-lime-950 border border-lime-400 font-bold',
      badgeSecondary: 'bg-blue-100 text-blue-900 border border-blue-200',
      headerGradient: 'from-blue-950 via-indigo-950 to-blue-900',
      priceColor: 'text-blue-950 font-black',
      tagBg: 'bg-blue-50/50'
    }
  },

  'wellness-pure-nutrition': {
    id: 'wellness-pure-nutrition',
    name: 'Pure Nutrition Lab',
    categoryId: 'health-wellness',
    categoryName: 'Health & Wellness',
    tagline: 'Clean lab white with clinical navy and 3rd party lab seals',
    description: 'Clinical supplement layout highlighting dosage transparency, batch laboratory certificates, and ingredient bio-availability.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Lab Verified'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0F172A',
      secondary: '#059669',
      accent: '#F8FAFC',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAFCFA]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs transition-all',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-emerald-950',
      priceColor: 'text-slate-950 font-black',
      tagBg: 'bg-slate-50'
    }
  },

  'wellness-zen-herbalist': {
    id: 'wellness-zen-herbalist',
    name: 'Zen Herbal Apothecary',
    categoryId: 'health-wellness',
    categoryName: 'Health & Wellness',
    tagline: 'Deep forest green and golden ginger with Ayurveda & TCM indicators',
    description: 'Traditional herbal apothecary presentation with Ayurvedic dosha tags, preparation instructions, and artisan parchment textures.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Ancient Herbal Wisdom'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#064E3B',
      secondary: '#D97706',
      accent: '#FEF3C7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAFBF7]',
      border: 'border-emerald-200',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-900/80',
      textMuted: 'text-emerald-800/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#064E3B] hover:bg-[#065F46] text-amber-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-[#064E3B] border border-amber-300 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
      headerGradient: 'from-emerald-950 via-teal-950 to-amber-950',
      priceColor: 'text-emerald-950 font-serif font-black',
      tagBg: 'bg-emerald-50/50'
    }
  },

  'wellness-modern-loft': {
    id: 'wellness-modern-loft',
    name: 'Modern Wellness Loft',
    categoryId: 'health-wellness',
    categoryName: 'Health & Wellness',
    tagline: 'Warm oat and terracotta with daily routine sequence cards',
    description: 'Lifestyle wellness design organizing products by routine sequence (Morning Glow, Midday Focus, Evening Sleep), with soft claymorphic pills.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Daily Ritual'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-46',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#78350F',
      secondary: '#EA580C',
      accent: '#FDF4E3',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FDF9F3]',
      border: 'border-orange-200/70',
      textPrimary: 'text-amber-950',
      textSecondary: 'text-amber-900/80',
      textMuted: 'text-amber-800/50',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#78350F] hover:bg-[#92400E] text-white shadow-xs transition-all',
      btnSecondary: 'bg-orange-50 hover:bg-orange-100 text-amber-950 border border-orange-200 transition-all',
      badgePrimary: 'bg-orange-100 text-orange-950 border border-orange-300 font-bold',
      badgeSecondary: 'bg-amber-100 text-amber-900 border border-amber-200',
      headerGradient: 'from-amber-950 via-stone-900 to-orange-950',
      priceColor: 'text-amber-950 font-black',
      tagBg: 'bg-orange-50/40'
    }
  },

  // ==========================================
  // 7. ARTISANAL & HANDMADE TEMPLATES (5)
  // ==========================================
  'artisan-ceramic-studio': {
    id: 'artisan-ceramic-studio',
    name: 'Ceramicist Studio Guild',
    categoryId: 'artisanal-handmade',
    categoryName: 'Artisanal & Handmade',
    tagline: 'Warm speckled clay and glazed terracotta with wheel-thrown texture badges',
    description: 'Pottery and ceramics showcase with clay origin badges, glaze finish details, and tactile earthy warmth.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Wheel Thrown'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#9A3412',
      secondary: '#B45309',
      accent: '#FFEDD5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FDF9F5]',
      border: 'border-orange-200',
      textPrimary: 'text-orange-950',
      textSecondary: 'text-orange-900/80',
      textMuted: 'text-orange-800/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#9A3412] hover:bg-[#7C2D12] text-amber-100 shadow-md transition-all font-serif',
      btnSecondary: 'bg-orange-50 hover:bg-orange-100 text-[#9A3412] border border-orange-300 transition-all font-serif',
      badgePrimary: 'bg-orange-100 text-orange-950 border border-orange-300 font-bold',
      badgeSecondary: 'bg-amber-100 text-amber-900 border border-amber-200',
      headerGradient: 'from-orange-950 via-[#7C2D12] to-amber-950',
      priceColor: 'text-orange-950 font-serif font-black',
      tagBg: 'bg-orange-50/50'
    }
  },

  'artisan-heritage-loom': {
    id: 'artisan-heritage-loom',
    name: 'Heritage Wood & Loom',
    categoryId: 'artisanal-handmade',
    categoryName: 'Artisanal & Handmade',
    tagline: 'Raw timber and indigo dye with artisan work-hours badge and provenance',
    description: 'Honoring heritage craft traditions with time-to-make hours badges, natural dye callouts, and cultural provenance notes.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Handwoven'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#1E1B4B',
      secondary: '#78350F',
      accent: '#EEF2FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9F9FC]',
      border: 'border-indigo-200/80',
      textPrimary: 'text-indigo-950',
      textSecondary: 'text-indigo-900/80',
      textMuted: 'text-indigo-800/50',
      fontHeading: 'font-serif font-bold tracking-tight',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#1E1B4B] hover:bg-[#312E81] text-amber-200 shadow-md transition-all font-serif',
      btnSecondary: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
      headerGradient: 'from-indigo-950 via-slate-900 to-amber-950',
      priceColor: 'text-indigo-950 font-serif font-black',
      tagBg: 'bg-indigo-50/50'
    }
  },

  'artisan-makers-workshop': {
    id: 'artisan-makers-workshop',
    name: "Maker's Bespoke Workshop",
    categoryId: 'artisanal-handmade',
    categoryName: 'Artisanal & Handmade',
    tagline: 'Kraft paper and blueprint accents with one-of-a-kind uniqueness badges',
    description: 'Makerspace and custom craft aesthetic with blueprint annotations, custom engraving badges, and tool mark authenticity stamps.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: '1-of-1 Handmade'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-46',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#431407',
      secondary: '#0284C7',
      accent: '#FEF3C7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FBF8F3]',
      border: 'border-amber-200',
      textPrimary: 'text-amber-950',
      textSecondary: 'text-amber-900/80',
      textMuted: 'text-amber-800/50',
      fontHeading: 'font-mono font-bold tracking-tight',
      fontBody: 'font-mono',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#431407] hover:bg-[#78350F] text-amber-100 shadow-xs transition-all',
      btnSecondary: 'bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-300 transition-all',
      badgePrimary: 'bg-sky-100 text-sky-950 border border-sky-300 font-bold',
      badgeSecondary: 'bg-amber-100 text-amber-950 border border-amber-300',
      headerGradient: 'from-amber-950 via-stone-900 to-sky-950',
      priceColor: 'text-amber-950 font-mono font-black',
      tagBg: 'bg-amber-50/50'
    }
  },

  'artisan-bohemian-bazaar': {
    id: 'artisan-bohemian-bazaar',
    name: 'Bohemian Craft Bazaar',
    categoryId: 'artisanal-handmade',
    categoryName: 'Artisanal & Handmade',
    tagline: 'Saffron & turquoise accents, festive patterned borders, and fair-trade certs',
    description: 'Eclectic global artisan market celebrating fair-trade cooperatives, vibrant folk motifs, and handmade jewelry creations.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Fair Trade Certified'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#B45309',
      secondary: '#0D9488',
      accent: '#CCFBF1',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FFFDF9]',
      border: 'border-teal-200/80',
      textPrimary: 'text-amber-950',
      textSecondary: 'text-amber-900/80',
      textMuted: 'text-amber-800/50',
      fontHeading: 'font-serif font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#B45309] hover:bg-[#92400E] text-white shadow-md transition-all',
      btnSecondary: 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 transition-all',
      badgePrimary: 'bg-teal-100 text-teal-950 border border-teal-300 font-bold',
      badgeSecondary: 'bg-amber-100 text-amber-950 border border-amber-300',
      headerGradient: 'from-amber-950 via-yellow-950 to-teal-950',
      priceColor: 'text-amber-950 font-black',
      tagBg: 'bg-teal-50/40'
    }
  },

  'artisan-gallery-minimal': {
    id: 'artisan-gallery-minimal',
    name: 'Gallery Fine Craft',
    categoryId: 'artisanal-handmade',
    categoryName: 'Artisanal & Handmade',
    tagline: 'Museum white and matte black with numbered edition (#1/20) and artist bio',
    description: 'Fine art gallery layout for sculptural masterworks with numbered edition tracking, exhibition history, and artist statements.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-none',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Edition Piece'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-64',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#18181B',
      secondary: '#71717A',
      accent: '#FAFAFA',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FCFCFC]',
      border: 'border-zinc-200',
      textPrimary: 'text-zinc-950',
      textSecondary: 'text-zinc-600',
      textMuted: 'text-zinc-400',
      fontHeading: 'font-serif font-light tracking-widest uppercase',
      fontBody: 'font-serif',
      roundedCard: 'rounded-none',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-none',
      btnPrimary: 'bg-black hover:bg-zinc-800 text-white font-serif uppercase tracking-widest text-[11px] transition-all',
      btnSecondary: 'bg-white hover:bg-zinc-100 text-black border border-black font-serif uppercase tracking-widest text-[11px] transition-all',
      badgePrimary: 'bg-black text-white font-mono text-[9px] uppercase',
      badgeSecondary: 'bg-zinc-100 text-zinc-800 border border-zinc-300 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-900 to-zinc-950',
      priceColor: 'text-black font-serif font-black',
      tagBg: 'bg-zinc-50'
    }
  },

  // ==========================================
  // 8. BOOKS, TOYS & STATIONERY TEMPLATES (5)
  // ==========================================
  'books-classic-library': {
    id: 'books-classic-library',
    name: 'Classic Library Bookshop',
    categoryId: 'books-toys-stationery',
    categoryName: 'Books, Toys & Stationery',
    tagline: 'Mahogany and parchment tones with excerpt quotes and literary serif',
    description: 'Independent bookstore presentation featuring excerpt quote blocks, author biography callouts, and hardcover/paperback edition tags.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Literary Pick'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#431407',
      secondary: '#B45309',
      accent: '#FEF3C7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF6EE]',
      border: 'border-amber-200',
      textPrimary: 'text-[#290C04]',
      textSecondary: 'text-[#431407]/80',
      textMuted: 'text-[#431407]/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#431407] hover:bg-[#290C04] text-[#FEF3C7] shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-[#431407] border border-amber-300 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-stone-100 text-stone-800 border border-stone-200',
      headerGradient: 'from-[#290C04] via-[#431407] to-amber-950',
      priceColor: 'text-[#431407] font-serif font-black',
      tagBg: 'bg-amber-50/50'
    }
  },

  'books-paper-atelier': {
    id: 'books-paper-atelier',
    name: 'Paper & Atelier Stationery',
    categoryId: 'books-toys-stationery',
    categoryName: 'Books, Toys & Stationery',
    tagline: 'Fountain-pen navy and cream with paper GSM weight and ruling badges',
    description: 'Fine stationery and writing instruments boutique with paper grammage (GSM) tags, binding types, and ink bleed resistance notes.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Archival Paper'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#0EA5E9',
      accent: '#F8FAFC',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9FAFB]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-serif font-normal tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all',
      badgePrimary: 'bg-sky-100 text-sky-900 border border-sky-200 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-sky-950',
      priceColor: 'text-slate-950 font-serif font-bold',
      tagBg: 'bg-slate-50'
    }
  },

  'books-wonderbox-toys': {
    id: 'books-wonderbox-toys',
    name: 'Wonderbox Play & Games',
    categoryId: 'books-toys-stationery',
    categoryName: 'Books, Toys & Stationery',
    tagline: 'Playful sky blue & sunshine yellow with age recommendations (3+, 8+)',
    description: 'Joyful family game and educational toy layout with age recommendation badges, player count pills, and playtime duration tags.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Family Play'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-48',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0284C7',
      secondary: '#EAB308',
      accent: '#FEF08A',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F0F9FF]',
      border: 'border-sky-200',
      textPrimary: 'text-sky-950',
      textSecondary: 'text-sky-900/80',
      textMuted: 'text-sky-800/50',
      fontHeading: 'font-sans font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md transition-all',
      btnSecondary: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-950 border border-yellow-300 transition-all font-bold',
      badgePrimary: 'bg-yellow-200 text-yellow-950 border border-yellow-400 font-extrabold',
      badgeSecondary: 'bg-sky-100 text-sky-900 border border-sky-200 font-bold',
      headerGradient: 'from-sky-950 via-sky-900 to-indigo-950',
      priceColor: 'text-sky-950 font-black',
      tagBg: 'bg-sky-50'
    }
  },

  'books-scholar-academic': {
    id: 'books-scholar-academic',
    name: 'Scholar & Academic Press',
    categoryId: 'books-toys-stationery',
    categoryName: 'Books, Toys & Stationery',
    tagline: 'Oxford navy & crimson with ISBN and citation information hierarchy',
    description: 'Academic texts, journals, and non-fiction publishing layout featuring ISBN lookup, syllabus references, and formal footnotes.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Peer Reviewed'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E1B4B',
      secondary: '#BE123C',
      accent: '#FFF1F2',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9F9FC]',
      border: 'border-indigo-200',
      textPrimary: 'text-indigo-950',
      textSecondary: 'text-indigo-900/80',
      textMuted: 'text-indigo-800/50',
      fontHeading: 'font-serif font-bold',
      fontBody: 'font-serif',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#1E1B4B] hover:bg-[#312E81] text-rose-100 shadow-xs transition-all font-serif',
      btnSecondary: 'bg-rose-50 hover:bg-rose-100 text-[#1E1B4B] border border-rose-200 transition-all font-serif',
      badgePrimary: 'bg-rose-100 text-rose-950 border border-rose-300 font-bold',
      badgeSecondary: 'bg-indigo-100 text-indigo-950 border border-indigo-200',
      headerGradient: 'from-indigo-950 via-slate-900 to-rose-950',
      priceColor: 'text-indigo-950 font-serif font-black',
      tagBg: 'bg-indigo-50/50'
    }
  },

  'books-indie-press': {
    id: 'books-indie-press',
    name: 'Indie Graphic & Press',
    categoryId: 'books-toys-stationery',
    categoryName: 'Books, Toys & Stationery',
    tagline: 'Newsprint duotone & risograph pink with print run counters',
    description: 'Underground graphic novels, zines, and risograph art books with limited run edition counters and bold posterized cards.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Risograph Print'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#18181B',
      secondary: '#EC4899',
      accent: '#FDF2F8',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF5F8]',
      border: 'border-pink-200',
      textPrimary: 'text-zinc-950',
      textSecondary: 'text-zinc-700',
      textMuted: 'text-zinc-500',
      fontHeading: 'font-mono font-black uppercase tracking-tight',
      fontBody: 'font-mono',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-black hover:bg-zinc-800 text-pink-300 font-mono font-bold uppercase transition-all',
      btnSecondary: 'bg-pink-100 hover:bg-pink-200 text-black border border-pink-300 transition-all font-mono',
      badgePrimary: 'bg-pink-200 text-pink-950 border border-pink-400 font-mono text-[9px] font-bold',
      badgeSecondary: 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-900 to-pink-950',
      priceColor: 'text-black font-mono font-black',
      tagBg: 'bg-pink-50/50'
    }
  },

  // ==========================================
  // 9. SPORTS & FITNESS TEMPLATES (5)
  // ==========================================
  'sports-pro-athlete': {
    id: 'sports-pro-athlete',
    name: 'Pro Athlete Performance',
    categoryId: 'sports-fitness',
    categoryName: 'Sports & Fitness',
    tagline: 'Carbon fiber and racing red with weather-resistance rating gauges',
    description: 'High-performance athletic gear layout with moisture-wicking indices, thermal protection ratings, and aerodynamic typography.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Competition Grade'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#09090B',
      secondary: '#DC2626',
      accent: '#18181B',
      cardBg: 'bg-[#18181B] text-white',
      pageBg: 'bg-[#09090B]',
      border: 'border-red-600/30',
      textPrimary: 'text-white',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-600',
      fontHeading: 'font-sans font-black italic uppercase tracking-wider',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#DC2626] hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-all',
      btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-600/30 transition-all font-bold',
      badgePrimary: 'bg-red-950 text-red-400 border border-red-600/50 font-bold uppercase text-[9px]',
      badgeSecondary: 'bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-950 to-red-950/60',
      priceColor: 'text-[#DC2626] font-black',
      tagBg: 'bg-zinc-900'
    }
  },

  'sports-alpine-outdoor': {
    id: 'sports-alpine-outdoor',
    name: 'Outdoor Alpine Expedition',
    categoryId: 'sports-fitness',
    categoryName: 'Sports & Fitness',
    tagline: 'Forest spruce & summit orange with topo contour lines and altitude ratings',
    description: 'Rugged mountain expedition layout with altitude ratings, waterproof hydrostatic head indicators, and trail-tested durability stamps.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Trail Tested'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#064E3B',
      secondary: '#EA580C',
      accent: '#FFEDD5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F4F8F5]',
      border: 'border-emerald-200',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-900/80',
      textMuted: 'text-emerald-800/50',
      fontHeading: 'font-sans font-extrabold uppercase tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#064E3B] hover:bg-[#065F46] text-orange-200 shadow-md transition-all font-bold',
      btnSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 transition-all font-bold',
      badgePrimary: 'bg-orange-200 text-orange-950 border border-orange-400 font-bold',
      badgeSecondary: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold',
      headerGradient: 'from-emerald-950 via-teal-950 to-orange-950',
      priceColor: 'text-emerald-950 font-black',
      tagBg: 'bg-emerald-50/50'
    }
  },

  'sports-urban-sneaker': {
    id: 'sports-urban-sneaker',
    name: 'Urban Athletics & Sneaker',
    categoryId: 'sports-fitness',
    categoryName: 'Sports & Fitness',
    tagline: 'Concrete slate and volt yellow with release drop tags and sole tech callouts',
    description: 'Sneakerhead and street athletics layout highlighting outsole cushioning tech, drop release schedules, and streetwear aesthetics.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Drop Release'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#84CC16',
      accent: '#F7FEE7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-black tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-lime-400 shadow-md transition-all font-black',
      btnSecondary: 'bg-lime-100 hover:bg-lime-200 text-lime-950 border border-lime-300 transition-all font-bold',
      badgePrimary: 'bg-lime-200 text-lime-950 border border-lime-400 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-lime-950/40',
      priceColor: 'text-slate-950 font-black',
      tagBg: 'bg-slate-50'
    }
  },

  'sports-power-iron': {
    id: 'sports-power-iron',
    name: 'Iron Strength & Power',
    categoryId: 'sports-fitness',
    categoryName: 'Sports & Fitness',
    tagline: 'Heavy steel and safety orange with load-capacity ratings and steel seals',
    description: 'Strength gym and powerlifting equipment layout with weight capacity specifications, commercial steel gauges, and heavy-duty badges.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Commercial Steel'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-46',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#111827',
      secondary: '#F97316',
      accent: '#FFEDD5',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9FAFB]',
      border: 'border-slate-300',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
      fontHeading: 'font-sans font-black uppercase tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#111827] hover:bg-black text-orange-400 shadow-sm transition-all font-black uppercase',
      btnSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 transition-all font-bold',
      badgePrimary: 'bg-orange-200 text-orange-950 border border-orange-400 font-bold',
      badgeSecondary: 'bg-gray-100 text-gray-800 border border-gray-300',
      headerGradient: 'from-black via-gray-900 to-orange-950',
      priceColor: 'text-gray-900 font-black',
      tagBg: 'bg-gray-50'
    }
  },

  'sports-yoga-flow': {
    id: 'sports-yoga-flow',
    name: 'Motion Flow & Yoga',
    categoryId: 'sports-fitness',
    categoryName: 'Sports & Fitness',
    tagline: 'Calming lilac and desert sand with flexibility ratings and eco-mat tags',
    description: 'Mindful movement and yoga apparel layout highlighting mat grip indices, eco-friendly cork/rubber materials, and flow aesthetics.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[4/5]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Eco Friendly'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#581C87',
      secondary: '#D97706',
      accent: '#F3E8FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF7FC]',
      border: 'border-purple-200/70',
      textPrimary: 'text-purple-950',
      textSecondary: 'text-purple-900/80',
      textMuted: 'text-purple-800/50',
      fontHeading: 'font-serif font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#581C87] hover:bg-[#6B21A8] text-white shadow-xs transition-all',
      btnSecondary: 'bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 transition-all',
      badgePrimary: 'bg-purple-100 text-purple-950 border border-purple-300 font-bold',
      badgeSecondary: 'bg-amber-100 text-amber-900 border border-amber-200',
      headerGradient: 'from-purple-950 via-purple-900 to-amber-950/40',
      priceColor: 'text-purple-950 font-bold',
      tagBg: 'bg-purple-50/40'
    }
  },

  // ==========================================
  // 10. AUTOMOTIVE & HARDWARE TEMPLATES (5)
  // ==========================================
  'auto-precision-garage': {
    id: 'auto-precision-garage',
    name: 'Precision Workshop Garage',
    categoryId: 'automotive-hardware',
    categoryName: 'Automotive & Hardware',
    tagline: 'Steel gray & electric cobalt with tool torque selectors and lifetime warranty',
    description: 'Pro mechanics workshop layout with torque specs, metric/imperial size selectors, and lifetime hand tool warranty stamps.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Lifetime Warranty'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#2563EB',
      accent: '#EFF6FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-300',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-mono font-bold tracking-tight',
      fontBody: 'font-mono',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#1E293B] hover:bg-slate-800 text-blue-400 font-mono font-bold transition-all',
      btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 transition-all font-mono',
      badgePrimary: 'bg-blue-100 text-blue-950 border border-blue-300 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-300',
      headerGradient: 'from-slate-950 via-slate-900 to-blue-950',
      priceColor: 'text-slate-950 font-mono font-black',
      tagBg: 'bg-slate-50'
    }
  },

  'auto-velocity-moto': {
    id: 'auto-velocity-moto',
    name: 'Speed & Velocity Moto',
    categoryId: 'automotive-hardware',
    categoryName: 'Automotive & Hardware',
    tagline: 'Midnight black with fire engine red and horsepower/throttle spec callouts',
    description: 'High-revving motorcycle and motorsport parts design featuring dyno performance charts, fitment vehicle pickers, and tachometer styling.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Race Pedigree'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#09090B',
      secondary: '#EF4444',
      accent: '#18181B',
      cardBg: 'bg-[#18181B] text-white',
      pageBg: 'bg-[#09090B]',
      border: 'border-red-600/40',
      textPrimary: 'text-white',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-600',
      fontHeading: 'font-sans font-black italic uppercase',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#EF4444] hover:bg-red-600 text-white font-black uppercase tracking-wider transition-all',
      btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-600/40 transition-all font-bold',
      badgePrimary: 'bg-red-950 text-red-400 border border-red-600/50 font-bold uppercase text-[9px]',
      badgeSecondary: 'bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-950 to-red-950/70',
      priceColor: 'text-[#EF4444] font-black',
      tagBg: 'bg-zinc-900'
    }
  },

  'auto-overland-trail': {
    id: 'auto-overland-trail',
    name: 'Overland 4x4 Heavy Duty',
    categoryId: 'automotive-hardware',
    categoryName: 'Automotive & Hardware',
    tagline: 'Desert tan & olive drab with rugged all-weather payload rating tags',
    description: 'Overland and off-road expedition equipment presentation highlighting payload limits, waterproof IP ratings, and trail-tested armor.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'All-Terrain Armor'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#3F4E4F',
      secondary: '#A27B5C',
      accent: '#EFEFEF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8F7F4]',
      border: 'border-stone-300',
      textPrimary: 'text-[#2C3639]',
      textSecondary: 'text-[#3F4E4F]/80',
      textMuted: 'text-[#3F4E4F]/50',
      fontHeading: 'font-sans font-bold uppercase tracking-wide',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#2C3639] hover:bg-[#3F4E4F] text-amber-200 shadow-xs transition-all font-bold',
      btnSecondary: 'bg-stone-100 hover:bg-stone-200 text-[#2C3639] border border-stone-300 transition-all font-bold',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-stone-200 text-stone-900 border border-stone-300 font-bold',
      headerGradient: 'from-[#2C3639] via-stone-900 to-[#A27B5C]',
      priceColor: 'text-[#2C3639] font-black',
      tagBg: 'bg-stone-100/60'
    }
  },

  'auto-industrial-trade': {
    id: 'auto-industrial-trade',
    name: 'Industrial Supply Trade',
    categoryId: 'automotive-hardware',
    categoryName: 'Automotive & Hardware',
    tagline: 'Safety yellow & gunmetal with bulk cartons and ANSI/ISO compliance tags',
    description: 'Contractor and industrial trade supply layout with bulk case discounts, ANSI compliance stamps, and rapid quantity selectors.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'ANSI Certified'
    },
    headerLayout: {
      bannerHeight: 'h-28 sm:h-40',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#18181B',
      secondary: '#EAB308',
      accent: '#FEF08A',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F9FAFB]',
      border: 'border-yellow-400/60',
      textPrimary: 'text-zinc-900',
      textSecondary: 'text-zinc-600',
      textMuted: 'text-zinc-400',
      fontHeading: 'font-mono font-black uppercase',
      fontBody: 'font-mono',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-black hover:bg-zinc-800 text-yellow-400 font-mono font-bold uppercase transition-all',
      btnSecondary: 'bg-yellow-100 hover:bg-yellow-200 text-black border border-yellow-400 transition-all font-mono',
      badgePrimary: 'bg-yellow-300 text-black font-mono font-bold text-[9px]',
      badgeSecondary: 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-900 to-yellow-950',
      priceColor: 'text-black font-mono font-black',
      tagBg: 'bg-yellow-50/50'
    }
  },

  'auto-master-detailer': {
    id: 'auto-master-detailer',
    name: 'Master Detailer Studio',
    categoryId: 'automotive-hardware',
    categoryName: 'Automotive & Hardware',
    tagline: 'Obsidian black and sapphire gloss with ceramic coating longevity meters',
    description: 'Showroom car detailing and paint protection aesthetic featuring ceramic durability ratings, microfiber safety certs, and mirror gloss.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Showroom Gloss'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#09090B',
      secondary: '#2563EB',
      accent: '#18181B',
      cardBg: 'bg-[#111116] text-white',
      pageBg: 'bg-[#08080C]',
      border: 'border-blue-500/30',
      textPrimary: 'text-white',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-600',
      fontHeading: 'font-sans font-bold tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all',
      btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-blue-400 border border-blue-500/30 transition-all',
      badgePrimary: 'bg-blue-950 text-blue-300 border border-blue-500/50 font-bold',
      badgeSecondary: 'bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-950 to-blue-950/60',
      priceColor: 'text-blue-400 font-black',
      tagBg: 'bg-zinc-900'
    }
  },

  // ==========================================
  // 11. PROFESSIONAL SERVICES TEMPLATES (5)
  // ==========================================
  'services-executive-advisory': {
    id: 'services-executive-advisory',
    name: 'Executive Advisory',
    categoryId: 'professional-services',
    categoryName: 'Professional Services',
    tagline: 'Wall-street navy & platinum with credential certifications & retainer cards',
    description: 'Corporate consulting and executive advisory layout with partner credentials, retainer engagement tiers, and board-level typography.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Licensed Advisor'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#0F172A',
      secondary: '#475569',
      accent: '#F8FAFC',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-serif font-bold tracking-tight',
      fontBody: 'font-serif',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all font-serif',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all font-serif',
      badgePrimary: 'bg-slate-200 text-slate-900 border border-slate-300 font-bold',
      badgeSecondary: 'bg-blue-50 text-blue-900 border border-blue-200',
      headerGradient: 'from-slate-950 via-slate-900 to-slate-800',
      priceColor: 'text-slate-950 font-serif font-black',
      tagBg: 'bg-slate-50'
    }
  },

  'services-creative-agency': {
    id: 'services-creative-agency',
    name: 'Creative Agency Studio',
    categoryId: 'professional-services',
    categoryName: 'Professional Services',
    tagline: 'Brutalist monochrome with electric acid accent and deliverable checklists',
    description: 'Design atelier and creative agency portfolio layout featuring case study highlights, deliverable milestones, and high-contrast impact.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-none',
      badgeStyle: 'square',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Full-Service Sprint'
    },
    headerLayout: {
      bannerHeight: 'h-44 sm:h-60',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#09090B',
      secondary: '#A3E635',
      accent: '#FAFAFA',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FCFCFC]',
      border: 'border-black',
      textPrimary: 'text-black',
      textSecondary: 'text-zinc-600',
      textMuted: 'text-zinc-400',
      fontHeading: 'font-mono font-black uppercase tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-none',
      roundedBtn: 'rounded-none',
      roundedBadge: 'rounded-none',
      btnPrimary: 'bg-black hover:bg-zinc-800 text-[#A3E635] font-mono font-bold uppercase transition-all',
      btnSecondary: 'bg-[#A3E635] hover:bg-lime-400 text-black border border-black font-mono font-bold transition-all',
      badgePrimary: 'bg-black text-[#A3E635] font-mono text-[9px] font-bold uppercase',
      badgeSecondary: 'bg-zinc-100 text-black border border-zinc-300 font-mono text-[9px]',
      headerGradient: 'from-black via-zinc-950 to-lime-950/40',
      priceColor: 'text-black font-mono font-black',
      tagBg: 'bg-zinc-100'
    }
  },

  'services-craft-repair': {
    id: 'services-craft-repair',
    name: 'Master Craft & Repair',
    categoryId: 'professional-services',
    categoryName: 'Professional Services',
    tagline: 'Denim and antique brass with turnaround time estimate and diagnostic seals',
    description: 'Restoration atelier and technical repair service layout with turnaround estimates, diagnostic warranty seals, and bench fee transparency.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Diagnostic Guaranteed'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-46',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E3A8A',
      secondary: '#B45309',
      accent: '#EFF6FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-blue-200',
      textPrimary: 'text-blue-950',
      textSecondary: 'text-blue-800/80',
      textMuted: 'text-blue-700/50',
      fontHeading: 'font-mono font-bold',
      fontBody: 'font-mono',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-amber-200 font-mono font-bold transition-all',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-blue-950 border border-amber-300 transition-all font-mono',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-blue-100 text-blue-900 border border-blue-200',
      headerGradient: 'from-blue-950 via-slate-900 to-amber-950',
      priceColor: 'text-blue-950 font-mono font-black',
      tagBg: 'bg-blue-50/50'
    }
  },

  'services-concierge-booking': {
    id: 'services-concierge-booking',
    name: 'Concierge Booking Salon',
    categoryId: 'professional-services',
    categoryName: 'Professional Services',
    tagline: 'Champagne gold and charcoal with session duration pills (30m, 60m)',
    description: 'Wellness salon, styling studio, and private consultation layout with session duration chips, specialist profiles, and easy reservation.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'By Appointment'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#334155',
      secondary: '#D97706',
      accent: '#FEF3C7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#FAF9F6]',
      border: 'border-amber-200/70',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-serif font-medium',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#334155] hover:bg-slate-800 text-amber-100 shadow-sm transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-slate-900 border border-amber-300 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-slate-950 via-slate-900 to-amber-950/40',
      priceColor: 'text-slate-950 font-serif font-bold',
      tagBg: 'bg-amber-50/40'
    }
  },

  'services-b2b-modern': {
    id: 'services-b2b-modern',
    name: 'Modern B2B Solution',
    categoryId: 'professional-services',
    categoryName: 'Professional Services',
    tagline: 'Indigo & cool slate with SLA uptime badges and onboarding timeline pills',
    description: 'SaaS, digital agency, and enterprise services presentation with SLA tier badges, onboarding timelines, and clear deliverable scopes.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-[16/10]',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: '99.9% SLA'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-44',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#3730A3',
      secondary: '#4F46E5',
      accent: '#EEF2FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFF]',
      border: 'border-indigo-200',
      textPrimary: 'text-indigo-950',
      textSecondary: 'text-indigo-800/80',
      textMuted: 'text-indigo-700/50',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-[#3730A3] hover:bg-[#312E81] text-white shadow-xs transition-all',
      btnSecondary: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition-all',
      badgePrimary: 'bg-indigo-100 text-indigo-950 border border-indigo-300 font-bold',
      badgeSecondary: 'bg-slate-100 text-slate-800 border border-slate-200',
      headerGradient: 'from-indigo-950 via-indigo-900 to-slate-900',
      priceColor: 'text-indigo-950 font-black',
      tagBg: 'bg-indigo-50/50'
    }
  },

  // ==========================================
  // UNIVERSAL FALLBACK TEMPLATES (5)
  // For custom or unconfigured categories
  // ==========================================
  'universal-classic': {
    id: 'universal-classic',
    name: 'Classic Bizora Clay',
    categoryId: 'universal',
    categoryName: 'Universal / Adaptive',
    tagline: 'Signature royal purple and warm gold with claymorphic elevation',
    description: 'Bizora signature claymorphic aesthetic with warm gold accents, lavender card surfaces, and graceful typography.',
    layoutType: 'story-boutique',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Bizora Verified'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-52',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'clay-tabs'
    },
    tokens: {
      primary: '#3B1C5A',
      secondary: '#E6B44C',
      accent: '#F0EAFB',
      cardBg: 'bg-white/95',
      pageBg: 'bg-[#FAF7F2]',
      border: 'border-[#C6B7E2]/50',
      textPrimary: 'text-[#3B1C5A]',
      textSecondary: 'text-[#3B1C5A]/70',
      textMuted: 'text-[#3B1C5A]/50',
      fontHeading: 'font-serif',
      fontBody: 'font-sans',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'clay-btn-primary',
      btnSecondary: 'clay-btn-secondary',
      badgePrimary: 'clay-badge-gold',
      badgeSecondary: 'bg-[#F0EAFB] text-[#3B1C5A] border border-[#C6B7E2]/50',
      headerGradient: 'from-[#40205E] via-[#5B3182] to-[#40205E]',
      priceColor: 'text-[#3B1C5A]',
      tagBg: 'bg-[#FAF7F2]'
    }
  },

  'universal-modern': {
    id: 'universal-modern',
    name: 'Universal Modern Studio',
    categoryId: 'universal',
    categoryName: 'Universal / Adaptive',
    tagline: 'High-contrast slate with electric indigo and crisp clean cards',
    description: 'Versatile contemporary design with high-contrast lines, crisp modern typography, and structured product grids.',
    layoutType: 'specs-dense',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'detailed',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Direct Catalog'
    },
    headerLayout: {
      bannerHeight: 'h-32 sm:h-46',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#0F172A',
      secondary: '#4F46E5',
      accent: '#EEF2FF',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-bold tracking-tight',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-md',
      btnPrimary: 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm transition-all',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all',
      badgePrimary: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
      badgeSecondary: 'bg-slate-100 text-slate-700 border border-slate-200',
      headerGradient: 'from-slate-900 via-slate-800 to-indigo-950',
      priceColor: 'text-slate-950 font-black',
      tagBg: 'bg-slate-50'
    }
  },

  'universal-editorial': {
    id: 'universal-editorial',
    name: 'Universal Editorial Story',
    categoryId: 'universal',
    categoryName: 'Universal / Adaptive',
    tagline: 'Warm terracotta and amber with generous editorial margins',
    description: 'Story-first presentation with warm amber tones, serif titles, and boutique storytelling space.',
    layoutType: 'editorial-spacious',
    cardLayout: {
      imageAspect: 'aspect-[3/4]',
      roundedCard: 'rounded-3xl',
      badgeStyle: 'pill',
      pricePlacement: 'stacked-large',
      displayStyle: 'editorial',
      showSku: false,
      showStockBadge: false,
      categoryTag: 'Curated Goods'
    },
    headerLayout: {
      bannerHeight: 'h-40 sm:h-56',
      logoPlacement: 'centered-elevated',
      navStyle: 'underline-minimal'
    },
    tokens: {
      primary: '#78350F',
      secondary: '#B45309',
      accent: '#FEF3C7',
      cardBg: 'bg-white/95',
      pageBg: 'bg-[#FDFBF7]',
      border: 'border-amber-200/70',
      textPrimary: 'text-[#451A03]',
      textSecondary: 'text-[#78350F]/80',
      textMuted: 'text-[#78350F]/55',
      fontHeading: 'font-serif tracking-normal',
      fontBody: 'font-serif',
      roundedCard: 'rounded-3xl',
      roundedBtn: 'rounded-2xl',
      roundedBadge: 'rounded-full',
      btnPrimary: 'bg-[#78350F] hover:bg-[#92400E] text-[#FEF3C7] shadow-md transition-all font-serif',
      btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-[#78350F] border border-amber-200 transition-all font-serif',
      badgePrimary: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      badgeSecondary: 'bg-orange-50 text-orange-800 border border-orange-200',
      headerGradient: 'from-[#451A03] via-[#78350F] to-[#9A3412]',
      priceColor: 'text-[#78350F] font-serif font-black',
      tagBg: 'bg-[#FAF5EE]'
    }
  },

  'universal-vibrant': {
    id: 'universal-vibrant',
    name: 'Universal Vibrant Showcase',
    categoryId: 'universal',
    categoryName: 'Universal / Adaptive',
    tagline: 'Emerald & gold with vivid badges and energetic card surfaces',
    description: 'Energetic forest emerald and sunny gold palette with vivid badges, organic card surfaces, and dynamic specification tags.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-2xl',
      badgeStyle: 'pill',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: false,
      showStockBadge: true,
      categoryTag: 'Featured Selection'
    },
    headerLayout: {
      bannerHeight: 'h-36 sm:h-50',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#065F46',
      secondary: '#10B981',
      accent: '#DCFCE7',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F0FDF4]',
      border: 'border-emerald-200/70',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-800/80',
      textMuted: 'text-emerald-700/50',
      fontHeading: 'font-sans font-extrabold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-2xl',
      roundedBtn: 'rounded-xl',
      roundedBadge: 'rounded-lg',
      btnPrimary: 'bg-[#065F46] hover:bg-[#047857] text-white shadow-md transition-all',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all',
      badgePrimary: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      badgeSecondary: 'bg-teal-50 text-teal-800 border border-teal-200',
      headerGradient: 'from-emerald-950 via-emerald-800 to-teal-900',
      priceColor: 'text-emerald-900 font-extrabold',
      tagBg: 'bg-emerald-50/50'
    }
  },

  'universal-compact': {
    id: 'universal-compact',
    name: 'Universal Compact Retail',
    categoryId: 'universal',
    categoryName: 'Universal / Adaptive',
    tagline: 'High-density catalog grid optimized for quick multi-item browsing',
    description: 'Streamlined retail presentation designed for large inventories, quick browsing, and clear price and stock visibility.',
    layoutType: 'compact-quick',
    cardLayout: {
      imageAspect: 'aspect-square',
      roundedCard: 'rounded-xl',
      badgeStyle: 'square',
      pricePlacement: 'inline',
      displayStyle: 'standard',
      showSku: true,
      showStockBadge: true,
      categoryTag: 'Everyday Value'
    },
    headerLayout: {
      bannerHeight: 'h-28 sm:h-38',
      logoPlacement: 'bottom-left-overlap',
      navStyle: 'pill-capsule'
    },
    tokens: {
      primary: '#1E293B',
      secondary: '#64748B',
      accent: '#F1F5F9',
      cardBg: 'bg-white',
      pageBg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      fontHeading: 'font-sans font-bold',
      fontBody: 'font-sans',
      roundedCard: 'rounded-xl',
      roundedBtn: 'rounded-lg',
      roundedBadge: 'rounded-sm',
      btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all',
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all',
      badgePrimary: 'bg-slate-200 text-slate-900 border border-slate-300 font-bold',
      badgeSecondary: 'bg-blue-50 text-blue-900 border border-blue-200',
      headerGradient: 'from-slate-900 via-slate-800 to-slate-950',
      priceColor: 'text-slate-950 font-black',
      tagBg: 'bg-slate-50'
    }
  }
};

/**
 * Backward compatibility alias map
 * Maps legacy template IDs to corresponding templates in the new registry
 */
export const LEGACY_TEMPLATE_ALIASES = {
  standard: 'universal-classic',
  modern: 'electronics-technova-modern',
  editorial: 'food-artisan-roaster',
  artisan: 'artisan-ceramic-studio',
  vibrant: 'food-fresh-harvest',
  bold: 'fashion-dark-heritage',
  compact: 'universal-compact',
  minimal: 'fashion-aurora-minimal',
  'tech-spec-precision': 'electronics-technova-modern',
  'tech-gadget-showcase': 'electronics-technova-modern',
  'tech-gaming-cyber': 'electronics-techhaven-neon',
  'tech-minimal-clean': 'electronics-technova-modern',
  'tech-audio-studio': 'electronics-aurora-cyber',
  'fashion-trend-pop': 'fashion-vibrant-pop',
  'fashion-minimal-luxe': 'fashion-aurora-minimal',
  'fashion-editorial-studio': 'fashion-dark-heritage',
  'fashion-urban-street': 'fashion-dark-heritage',
  'fashion-modern-boutique': 'fashion-kyna-chikankari',
  'fashion-editorial-luxury': 'fashion-aarohi-ethnic',
  'fashion-noir-monochrome': 'fashion-dark-heritage',
  'fashion-artisanal-earth': 'fashion-kyna-chikankari',
  'beauty-clean-botanical': 'beauty-glowerive-skincare',
  'beauty-glamour-studio': 'beauty-glowcare-wellness',
  'beauty-clinical-derma': 'beauty-glowerive-skincare',
  'beauty-luxury-apothecary': 'beauty-elora-lavender',
  'beauty-vibrant-glow': 'beauty-glowcare-wellness'
};

export const UNIVERSAL_FALLBACK_TEMPLATES = [
  STOREFRONT_TEMPLATE_REGISTRY['universal-classic'],
  STOREFRONT_TEMPLATE_REGISTRY['universal-modern'],
  STOREFRONT_TEMPLATE_REGISTRY['universal-editorial'],
  STOREFRONT_TEMPLATE_REGISTRY['universal-vibrant'],
  STOREFRONT_TEMPLATE_REGISTRY['universal-compact']
];

/**
 * Retrieves template options for any category.
 * If the category is recognized, returns its category-specific templates.
 * If unconfigured, safely returns the universal adaptive templates with an isFallback flag.
 *
 * @param {string|Object} categoryKey - Category name, slug, or object
 * @returns {Array} Array of template objects
 */
export const getTemplatesForCategory = (categoryKey) => {
  const normKey = normalizeCategoryKey(categoryKey);

  if (normKey === 'unconfigured') {
    return UNIVERSAL_FALLBACK_TEMPLATES.map((tpl) => ({
      ...tpl,
      isFallback: true
    }));
  }

  const matches = Object.values(STOREFRONT_TEMPLATE_REGISTRY).filter(
    (t) => t.categoryId === normKey
  );

  if (matches.length > 0) {
    return matches;
  }

  // If none exist, backfill from universal templates
  return UNIVERSAL_FALLBACK_TEMPLATES.slice(0, 5);
};

/**
 * Resolves a template by its ID, supporting aliases and safe fallback.
 *
 * @param {string} templateId - Template ID or legacy alias
 * @returns {Object} Template definition object
 */
export const getTemplateById = (templateId) => {
  if (!templateId) {
    return STOREFRONT_TEMPLATE_REGISTRY['universal-classic'];
  }

  // 1. Legacy alias check (resolves legacy/archived aliases to their current active replacement)
  const resolvedAlias = LEGACY_TEMPLATE_ALIASES[templateId];
  if (resolvedAlias && STOREFRONT_TEMPLATE_REGISTRY[resolvedAlias]) {
    return STOREFRONT_TEMPLATE_REGISTRY[resolvedAlias];
  }

  // 2. Direct registry hit
  if (STOREFRONT_TEMPLATE_REGISTRY[templateId]) {
    return STOREFRONT_TEMPLATE_REGISTRY[templateId];
  }

  // 3. Fallback to universal classic
  return STOREFRONT_TEMPLATE_REGISTRY['universal-classic'];
};

/**
 * Resolves the storefront template for a business using trusted backend data.
 * Safely handles drafts during merchant preview, category defaults, custom colors, and typography.
 *
 * @param {Object} business - Business object from backend product or store response
 * @param {boolean} isPreview - True when previewing in merchant management portal
 * @param {string} activeCategory - Optional active category override
 * @returns {Object} Complete template configuration with token helpers
 */
export const resolveStorefrontTemplate = (business, isPreview = false, activeCategory = null) => {
  if (!business) {
    return STOREFRONT_TEMPLATE_REGISTRY['universal-classic'];
  }

  // Determine category for business
  const categoryKey = normalizeCategoryKey(activeCategory || business.category || '');
  const categoryMeta = CATEGORIES_REGISTRY[categoryKey];

  const themeSettings = business.themeSettings || {};
  const draftSettings = themeSettings.draft || {};

  // In preview mode with a draft present, preview draft values
  const effectiveSettings = isPreview && (draftSettings.template || draftSettings.contentOverrides || draftSettings.primaryColor)
    ? { ...themeSettings, ...draftSettings }
    : themeSettings;

  let templateId = effectiveSettings.template;

  // If no template is saved, use the category's default template or universal classic
  if (!templateId) {
    templateId = categoryMeta ? categoryMeta.defaultTemplateId : 'universal-classic';
  }

  const baseTemplate = getTemplateById(templateId);

  // Clone tokens so merchant custom overrides can be applied non-destructively
  const tokens = { ...baseTemplate.tokens };

  if (effectiveSettings.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(effectiveSettings.primaryColor)) {
    tokens.customPrimary = effectiveSettings.primaryColor;
  }
  if (effectiveSettings.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(effectiveSettings.secondaryColor)) {
    tokens.customSecondary = effectiveSettings.secondaryColor;
  }

  if (effectiveSettings.font) {
    const f = effectiveSettings.font.toLowerCase();
    if (f.includes('serif')) {
      tokens.fontHeading = 'font-serif';
    } else if (f.includes('mono')) {
      tokens.fontHeading = 'font-mono font-bold';
    } else if (f.includes('sans') || f.includes('inter') || f.includes('poppins')) {
      tokens.fontHeading = 'font-sans font-bold';
    }
  }

  const contentOverrides = effectiveSettings.contentOverrides || {};
  const sectionOrder = effectiveSettings.sectionOrder || null;
  const customSections = effectiveSettings.customSections || {};

  return {
    ...baseTemplate,
    tokens,
    contentOverrides,
    sectionOrder,
    customSections,
    isDraftPreview: isPreview && Boolean(draftSettings.template || draftSettings.contentOverrides || draftSettings.primaryColor),
    isCustomized: Boolean(
      effectiveSettings.primaryColor ||
      effectiveSettings.secondaryColor ||
      effectiveSettings.font ||
      (effectiveSettings.contentOverrides && Object.keys(effectiveSettings.contentOverrides).length > 0)
    ),
    categoryMeta: categoryMeta || { id: 'unconfigured', name: business.category || 'General', isConfigured: false }
  };
};

export default STOREFRONT_TEMPLATE_REGISTRY;
