// Category Fallback Imagery and Icon Mapping for Bizora Digital Market
// Provides dependable, high-quality, circular imagery when backend records do not specify an imageUrl

export const CATEGORY_FALLBACK_IMAGES = {
  'whole bean coffee': '/uploads/demo/coffee-beans.jpg',
  'brewing equipment': '/uploads/demo/v60-dripper.jpg',
  'coffee': '/uploads/demo/coffee-beans.jpg',
  'food & bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
  'food & beverage': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
  'fashion & apparel': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
  'fashion': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
  'apparel': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
  'electronics & gadgets': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
  'electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
  'home & living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80',
  'home': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80',
  'beauty & personal care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
  'beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
  'artisanal & handmade': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
  'handmade & crafts': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
  'crafts': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
  'health & wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
  'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
  'accessories': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&auto=format&fit=crop&q=80',
  'all products': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80'
};

/**
 * Returns an image URL for a category, falling back gracefully to known keyword mappings or a neutral placeholder.
 */
export const getCategoryImageUrl = (category) => {
  if (!category) return CATEGORY_FALLBACK_IMAGES['all products'];
  if (category.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '') {
    return category.imageUrl;
  }
  const nameKey = (category.name || '').toLowerCase().trim();
  if (CATEGORY_FALLBACK_IMAGES[nameKey]) {
    return CATEGORY_FALLBACK_IMAGES[nameKey];
  }
  // Keyword partial match
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (nameKey.includes(key) || key.includes(nameKey)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80';
};

