/**
 * Authoritative Category Registry for Bizora Digital Market
 *
 * Defines all product categories supported across Bizora, their stable slugs,
 * display names, aliases, visual aspect ratios, and category metadata.
 */

export const CATEGORIES_REGISTRY = {
  'food-beverage': {
    id: 'food-beverage',
    name: 'Food & Beverage',
    slug: 'food-beverage',
    aliases: [
      'food-beverage',
      'food & beverage',
      'food and beverage',
      'food-beverages',
      'food & beverages',
      'food-bakery',
      'food & bakery',
      'coffee & beverages',
      'coffee',
      'whole bean coffee',
      'brewing equipment',
      'bakery',
      'grocery',
      'gourmet',
      'beverages',
      'beverage'
    ],
    description: 'Specialty coffee roasters, artisanal bakeries, farm-fresh produce, and gourmet delicacies.',
    defaultAspect: 'aspect-square',
    defaultTemplateId: 'food-artisan-roaster',
    badgeText: 'Food & Taste',
    themeColor: '#78350F'
  },

  'fashion-apparel': {
    id: 'fashion-apparel',
    name: 'Fashion & Clothing',
    slug: 'fashion-apparel',
    aliases: [
      'fashion-apparel',
      'fashion & apparel',
      'fashion and apparel',
      'fashion & clothing',
      'fashion and clothing',
      'fashion-clothing',
      'fashion',
      'apparel',
      'clothing',
      'accessories',
      'boutique',
      'streetwear',
      'textiles'
    ],
    description: 'Designer apparel, luxury ateliers, streetwear labels, sustainable garments, and accessories.',
    defaultAspect: 'aspect-[3/4]',
    defaultTemplateId: 'fashion-aarohi-ethnic',
    badgeText: 'Runway & Style',
    themeColor: '#18181B'
  },

  'beauty-personal-care': {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    aliases: [
      'beauty-personal-care',
      'beauty & personal care',
      'beauty and personal care',
      'beauty',
      'personal care',
      'skincare',
      'cosmetics',
      'fragrance',
      'apothecary',
      'haircare',
      'bodycare',
      'wellness',
      'makeup',
      'personal hygiene'
    ],
    description: 'Clean botanical skincare, dermatological labs, luxury fragrances, and expressive cosmetics.',
    defaultAspect: 'aspect-[3/4]',
    defaultTemplateId: 'beauty-glowerive-skincare',
    badgeText: 'Clean & Beauty',
    themeColor: '#174A42'
  },

  'electronics-gadgets': {
    id: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    aliases: [
      'electronics-gadgets',
      'electronics & gadgets',
      'electronics and gadgets',
      'electronics',
      'gadgets',
      'tech',
      'hardware',
      'audio',
      'smart home',
      'devices',
      'smartphones',
      'laptops',
      'computers',
      'accessories'
    ],
    description: 'Cutting-edge consumer hardware, pro audio gear, computing devices, and smart tech accessories.',
    defaultAspect: 'aspect-square',
    defaultTemplateId: 'electronics-technova-modern',
    badgeText: 'Specs & Tech',
    themeColor: '#2563EB'
  },

  'home-living': {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    aliases: [
      'home-living',
      'home & living',
      'home and living',
      'home',
      'living',
      'furniture',
      'decor',
      'interior',
      'kitchenware',
      'lighting'
    ],
    description: 'Architectural furniture, Scandinavian furnishings, artisan tableware, and mindful home decor.',
    defaultAspect: 'aspect-[16/10]',
    defaultTemplateId: 'home-architectural-haven',
    badgeText: 'Living & Space',
    themeColor: '#3F3F46'
  },


  'health-wellness': {
    id: 'health-wellness',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    aliases: [
      'health-wellness',
      'health & wellness',
      'health and wellness',
      'health',
      'wellness',
      'nutrition',
      'supplements',
      'fitness nutrition',
      'remedies'
    ],
    description: 'Holistic herbal remedies, targeted sports nutrition, clinical supplements, and mindfulness essentials.',
    defaultAspect: 'aspect-square',
    defaultTemplateId: 'wellness-holistic-sanctuary',
    badgeText: 'Health & Vitality',
    themeColor: '#065F46'
  },

  'artisanal-handmade': {
    id: 'artisanal-handmade',
    name: 'Artisanal & Handmade',
    slug: 'artisanal-handmade',
    aliases: [
      'artisanal-handmade',
      'artisanal & handmade',
      'artisanal and handmade',
      'handmade & crafts',
      'handmade & ceramics',
      'handmade',
      'crafts',
      'ceramics',
      'pottery',
      'studio crafts'
    ],
    description: 'Hand-thrown studio ceramics, heritage woodwork, handwoven textiles, and bespoke craft artifacts.',
    defaultAspect: 'aspect-square',
    defaultTemplateId: 'artisan-ceramic-studio',
    badgeText: 'Craft & Atelier',
    themeColor: '#9A3412'
  },

  'books-toys-stationery': {
    id: 'books-toys-stationery',
    name: 'Books, Toys & Stationery',
    slug: 'books-toys-stationery',
    aliases: [
      'books-toys-stationery',
      'books, toys & stationery',
      'books toys stationery',
      'books',
      'toys',
      'stationery',
      'paper',
      'publishing',
      'games'
    ],
    description: 'Independent bookshops, fine Japanese stationery, heirloom toys, and collectible publications.',
    defaultAspect: 'aspect-[4/5]',
    defaultTemplateId: 'books-classic-library',
    badgeText: 'Press & Paper',
    themeColor: '#431407'
  },

  'sports-fitness': {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    aliases: [
      'sports-fitness',
      'sports & fitness',
      'sports and fitness',
      'sports',
      'fitness',
      'athletic',
      'outdoor',
      'gym',
      'cycling'
    ],
    description: 'High-performance athletic gear, alpine expedition equipment, power training iron, and yoga gear.',
    defaultAspect: 'aspect-[4/5]',
    defaultTemplateId: 'sports-pro-athlete',
    badgeText: 'Active & Motion',
    themeColor: '#1D4ED8'
  },

  'automotive-hardware': {
    id: 'automotive-hardware',
    name: 'Automotive & Hardware',
    slug: 'automotive-hardware',
    aliases: [
      'automotive-hardware',
      'automotive & hardware',
      'automotive and hardware',
      'automotive',
      'hardware',
      'tools',
      'garage',
      'industrial',
      'moto'
    ],
    description: 'Precision workshop tools, overland gear, motorsport performance components, and detailing supplies.',
    defaultAspect: 'aspect-[16/10]',
    defaultTemplateId: 'auto-precision-garage',
    badgeText: 'Gear & Tools',
    themeColor: '#334155'
  },

  'professional-services': {
    id: 'professional-services',
    name: 'Professional Services',
    slug: 'professional-services',
    aliases: [
      'professional-services',
      'professional services',
      'services',
      'consulting',
      'design studio',
      'workshop services',
      'repairs'
    ],
    description: 'Executive advisory, creative agencies, master repair ateliers, and studio consultation services.',
    defaultAspect: 'aspect-[16/10]',
    defaultTemplateId: 'services-executive-advisory',
    badgeText: 'Studio & Services',
    themeColor: '#1E1B4B'
  }
};

export const SUPPORTED_CATEGORIES_LIST = Object.values(CATEGORIES_REGISTRY);

/**
 * Normalizes any category string, identifier, or object into its canonical registry key.
 *
 * @param {string|Object} input - Category name, slug, ID, or object
 * @returns {string} Canonical category key (e.g., 'food-beverage'), or 'unconfigured'
 */
export const normalizeCategoryKey = (input) => {
  if (!input) return 'fashion-apparel';

  let rawString = '';
  if (typeof input === 'string') {
    rawString = input;
  } else if (typeof input === 'object') {
    rawString = input.slug || input.name || input.id || input.category || '';
  }

  const clean = rawString.toLowerCase().trim().replace(/[^\w\s-]/g, '');

  // 1. Direct key match
  if (CATEGORIES_REGISTRY[clean]) {
    return clean;
  }

  // 2. Check aliases across all categories
  for (const [catId, meta] of Object.entries(CATEGORIES_REGISTRY)) {
    if (meta.aliases.some((alias) => alias.toLowerCase() === clean)) {
      return catId;
    }
  }

  // 3. Partial keyword matching
  for (const [catId, meta] of Object.entries(CATEGORIES_REGISTRY)) {
    if (meta.aliases.some((alias) => clean.includes(alias) || alias.includes(clean))) {
      return catId;
    }
  }

  return 'unconfigured';
};

/**
 * Retrieves the full metadata for a category, or a safe fallback definition if unconfigured.
 *
 * @param {string|Object} input - Category name, slug, or business object
 * @returns {Object} Category metadata object with isConfigured flag
 */
export const getCategoryMetadata = (input) => {
  const key = normalizeCategoryKey(input);

  if (CATEGORIES_REGISTRY[key]) {
    return {
      ...CATEGORIES_REGISTRY[key],
      isConfigured: true
    };
  }

  // Safe fallback for unconfigured / dynamically added categories
  const rawName = typeof input === 'string' ? input : (input?.name || input?.category || 'Custom Category');
  return {
    id: 'unconfigured',
    name: rawName,
    slug: 'unconfigured',
    aliases: [],
    description: 'Dynamic custom category. Adaptive universal storefront templates are automatically active.',
    defaultAspect: 'aspect-square',
    defaultTemplateId: 'universal-classic',
    badgeText: 'Custom Category',
    themeColor: '#3B1C5A',
    isConfigured: false
  };
};

/**
 * Checks whether a category has a verified 5-template configuration in the registry.
 *
 * @param {string|Object} input - Category string or object
 * @returns {boolean} True if category is in the registry with 5 dedicated templates
 */
export const isCategoryConfigured = (input) => {
  return normalizeCategoryKey(input) !== 'unconfigured';
};

export default CATEGORIES_REGISTRY;

