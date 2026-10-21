/**
 * Centralized Category Image Configuration for Bizora Digital Market
 *
 * Provides authoritative, category-relevant images for every product category in Bizora.
 * Strictly avoids generic storefront images for specific categories.
 */

export const DEFAULT_CATEGORY_IMAGE = '/images/categories/fashion-clothing.webp';

export const categoryImages = {
  // Marketplace & Curated overview
  'all': '/images/categories/fashion-clothing.webp',
  'all-products': '/images/categories/fashion-clothing.webp',

  // Core Categories in Bizora
  'fashion-clothing': '/images/categories/fashion-clothing.webp',
  'fashion-apparel': '/images/categories/fashion-apparel.webp',
  'fashion': '/images/categories/fashion-clothing.webp',
  'clothing': '/images/categories/fashion-clothing.webp',
  'apparel': '/images/categories/fashion-apparel.webp',

  'beauty-personal-care': '/images/categories/beauty-personal-care.webp',
  'beauty': '/images/categories/beauty-personal-care.webp',
  'personal-care': '/images/categories/beauty-personal-care.webp',
  'skincare': '/images/categories/beauty-personal-care.webp',
  'cosmetics': '/images/categories/beauty-personal-care.webp',

  'electronics-gadgets': '/images/categories/electronics-gadgets.webp',
  'electronics': '/images/categories/electronics-gadgets.webp',
  'gadgets': '/images/categories/electronics-gadgets.webp',
  'tech': '/images/categories/electronics-gadgets.webp',

  'home-living': '/images/categories/home-living.webp',
  'home': '/images/categories/home-living.webp',
  'living': '/images/categories/home-living.webp',
  'furniture': '/images/categories/home-living.webp',
  'home-decor': '/images/categories/home-living.webp',

  'food-beverages': '/images/categories/food-beverage.webp',
  'food-beverage': '/images/categories/food-beverage.webp',
  'beverages': '/images/categories/beverages.webp',
  'beverage': '/images/categories/beverages.webp',
  'drinks': '/images/categories/beverages.webp',
  'coffee-beverages': '/images/categories/beverages.webp',
  'food-bakery': '/images/categories/food-bakery.webp',
  'bakery': '/images/categories/food-bakery.webp',
  'grocery': '/images/categories/grocery.webp',
  'grocery-essentials': '/images/categories/grocery.webp',

  'whole-bean-coffee': '/images/categories/whole-bean-coffee.webp',
  'coffee': '/images/categories/whole-bean-coffee.webp',
  'coffee-beans': '/images/categories/whole-bean-coffee.webp',
  'brewing-equipment': '/images/categories/brewing-equipment.webp',
  'equipment': '/images/categories/brewing-equipment.webp',

  'jewelry-accessories': '/images/categories/jewelry-accessories.webp',
  'accessories': '/images/categories/accessories.webp',
  'jewelry': '/images/categories/jewelry-accessories.webp',
  'jewellery': '/images/categories/jewelry-accessories.webp',

  'sports-fitness': '/images/categories/sports-fitness.webp',
  'sports': '/images/categories/sports-fitness.webp',
  'fitness': '/images/categories/sports-fitness.webp',
  'athletic': '/images/categories/sports-fitness.webp',

  'books-stationery': '/images/categories/books-stationery.webp',
  'books-toys-stationery': '/images/categories/books-stationery.webp',
  'books': '/images/categories/books-stationery.webp',
  'stationery': '/images/categories/books-stationery.webp',

  'toys-baby-products': '/images/categories/toys-baby.webp',
  'toys-baby': '/images/categories/toys-baby.webp',
  'toys': '/images/categories/toys-baby.webp',
  'baby-products': '/images/categories/toys-baby.webp',

  'health-wellness': '/images/categories/health-wellness.webp',
  'health': '/images/categories/health-wellness.webp',
  'wellness': '/images/categories/health-wellness.webp',

  'handmade-crafts': '/images/categories/handmade-crafts.webp',
  'artisanal-handmade': '/images/categories/handmade-crafts.webp',
  'crafts': '/images/categories/handmade-crafts.webp',
  'ceramics': '/images/categories/handmade-crafts.webp',
  'pottery': '/images/categories/handmade-crafts.webp'
};

/**
 * Normalizes a category name into a slug format (e.g., "Fashion & Clothing" -> "fashion-clothing")
 */
export const slugifyCategory = (name = '') => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[&,]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Categorical keyword fallbacks guaranteeing visually relevant imagery
 */
const KEYWORD_IMAGE_MAP = [
  { keywords: ['fashion', 'cloth', 'apparel', 'dress', 'shirt', 'pant', 'saree', 'wear', 'textile', 'boutique'], image: '/images/categories/fashion-clothing.webp' },
  { keywords: ['beauty', 'cosmetic', 'skin', 'lotion', 'cream', 'serum', 'glow', 'hair', 'fragrance', 'makeup', 'personal care'], image: '/images/categories/beauty-personal-care.webp' },
  { keywords: ['electronic', 'gadget', 'tech', 'headphone', 'audio', 'phone', 'computer', 'device', 'hardware'], image: '/images/categories/electronics-gadgets.webp' },
  { keywords: ['home', 'living', 'furniture', 'decor', 'stool', 'table', 'interior', 'bed', 'sofa', 'lighting'], image: '/images/categories/home-living.webp' },
  { keywords: ['beverage', 'drink', 'tea', 'latte', 'juice', 'shake'], image: '/images/categories/beverages.webp' },
  { keywords: ['coffee bean', 'whole bean', 'roast', 'espresso bean', 'single origin'], image: '/images/categories/whole-bean-coffee.webp' },
  { keywords: ['brew', 'dripper', 'v60', 'grinder', 'press', 'kettle', 'pot'], image: '/images/categories/brewing-equipment.webp' },
  { keywords: ['bakery', 'bread', 'cake', 'pastry', 'snack', 'food', 'cookie'], image: '/images/categories/food-bakery.webp' },
  { keywords: ['grocery', 'pantry', 'flour', 'sugar', 'grain', 'oil', 'spice'], image: '/images/categories/grocery.webp' },
  { keywords: ['jewelry', 'jewel', 'necklace', 'ring', 'earring', 'bracelet', 'accessory', 'watch'], image: '/images/categories/jewelry-accessories.webp' },
  { keywords: ['sport', 'fitness', 'gym', 'workout', 'dumbell', 'exercise', 'yoga', 'athlete'], image: '/images/categories/sports-fitness.webp' },
  { keywords: ['book', 'stationery', 'notebook', 'paper', 'pen', 'journal', 'reading'], image: '/images/categories/books-stationery.webp' },
  { keywords: ['toy', 'baby', 'toddler', 'game', 'puzzle', 'doll', 'kids'], image: '/images/categories/toys-baby.webp' },
  { keywords: ['health', 'wellness', 'herb', 'supplement', 'vitamin', 'organic', 'remedy'], image: '/images/categories/health-wellness.webp' },
  { keywords: ['craft', 'handmade', 'artisan', 'pottery', 'ceramic', 'woven', 'woodwork'], image: '/images/categories/handmade-crafts.webp' }
];

/**
 * Retrieves the appropriate image URL for a category.
 * Priority:
 * 1. Database-provided `imageUrl` (if valid and not an empty/broken string)
 * 2. Direct match by category `slug`
 * 3. Match by category `id`
 * 4. Match by slugified category `name`
 * 5. Semantic keyword matching (e.g., contains 'fashion', 'beauty', 'beverage')
 * 6. Relevant category-specific fallback image
 *
 * @param {Object} category - The category object ({ id, name, slug, imageUrl })
 * @returns {string} - The path or URL of the image
 */
export const getCategoryImageUrl = (category) => {
  if (!category) return '/images/categories/fashion-clothing.webp';

  // 1. If backend supplies a valid image URL (not an empty string or generic placeholder)
  if (category.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '') {
    return category.imageUrl;
  }

  const rawSlug = (category.slug || '').toLowerCase();
  const rawName = (category.name || '').toLowerCase();
  const slugifiedName = slugifyCategory(category.name || '');

  // 2. Direct match by category slug from backend
  if (rawSlug && categoryImages[rawSlug]) {
    return categoryImages[rawSlug];
  }

  // 3. Match by category ID
  if (category.id && categoryImages[category.id]) {
    return categoryImages[category.id];
  }

  // 4. Match by slugified name
  if (slugifiedName && categoryImages[slugifiedName]) {
    return categoryImages[slugifiedName];
  }

  // 5. Intelligent Semantic Keyword Match
  const searchText = `${rawSlug} ${rawName} ${slugifiedName}`;
  for (const entry of KEYWORD_IMAGE_MAP) {
    if (entry.keywords.some((kw) => searchText.includes(kw))) {
      return entry.image;
    }
  }

  // 6. Partial keyword match in categoryImages map
  for (const [key, path] of Object.entries(categoryImages)) {
    if (key.length > 3 && (slugifiedName.includes(key) || key.includes(slugifiedName))) {
      return path;
    }
  }

  // 7. Safe contextual fallback: Default to Fashion & Clothing (clean, relevant product image, NEVER storefront)
  return '/images/categories/fashion-clothing.webp';
};

export default categoryImages;
