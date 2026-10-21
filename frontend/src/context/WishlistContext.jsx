import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const STORAGE_KEY_ITEMS = 'bizora_wishlist_items';
const STORAGE_KEY_IDS = 'bizora_wishlist_ids';

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || 'guest';

  // 1. Initialize immediately from localStorage so liked state is instant on page load/refresh
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_ITEMS}_${userId}`) || localStorage.getItem(STORAGE_KEY_ITEMS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlistProductIds, setWishlistProductIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_IDS}_${userId}`) || localStorage.getItem(STORAGE_KEY_IDS);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Save current state to localStorage helper
  const persistToLocalStorage = useCallback((items, idsSet, targetUserId) => {
    try {
      const idsArray = Array.from(idsSet);
      localStorage.setItem(`${STORAGE_KEY_ITEMS}_${targetUserId}`, JSON.stringify(items));
      localStorage.setItem(`${STORAGE_KEY_IDS}_${targetUserId}`, JSON.stringify(idsArray));
      // General fallback keys
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(idsArray));
    } catch (e) {
      console.warn('Failed to persist wishlist to localStorage:', e);
    }
  }, []);

  // 2. Fetch from backend API and synchronize with server
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      // Backend returns ApiResponse.success(res, 'Wishlist retrieved', { items })
      // res.data.data = { items: [...] }
      const rawList = res.data?.data?.items || (Array.isArray(res.data?.data) ? res.data.data : []);
      
      const newItems = rawList.map((entry) => {
        // Each entry from backend has entry.product
        if (entry.product) {
          return { ...entry.product, wishlistEntryId: entry.id };
        }
        return entry;
      });

      const newIds = new Set(rawList.map((entry) => entry.productId || entry.id));

      setWishlistItems(newItems);
      setWishlistProductIds(newIds);
      persistToLocalStorage(newItems, newIds, userId);
    } catch (err) {
      console.warn('Backend wishlist sync notice (using persistent local storage fallback):', err.message);
      // Persistent local storage remains active
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, persistToLocalStorage]);

  // Sync on mount or when user changes
  useEffect(() => {
    // Reload local storage for current user ID
    try {
      const storedItems = localStorage.getItem(`${STORAGE_KEY_ITEMS}_${userId}`) || localStorage.getItem(STORAGE_KEY_ITEMS);
      const storedIds = localStorage.getItem(`${STORAGE_KEY_IDS}_${userId}`) || localStorage.getItem(STORAGE_KEY_IDS);
      if (storedItems) setWishlistItems(JSON.parse(storedItems));
      if (storedIds) setWishlistProductIds(new Set(JSON.parse(storedIds)));
    } catch (e) {
      console.warn('Error reading stored wishlist:', e);
    }

    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, userId, fetchWishlist]);

  // Check if a product is wishlisted
  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return wishlistProductIds.has(productId);
  }, [wishlistProductIds]);

  // Toggle wishlist (Add or Remove)
  const toggleWishlist = useCallback(async (product) => {
    if (!product || !product.id) return { isSaved: false };

    const productId = product.id;
    const isCurrentlySaved = wishlistProductIds.has(productId);

    if (isCurrentlySaved) {
      // Remove from wishlist
      const nextIds = new Set(wishlistProductIds);
      nextIds.delete(productId);
      const nextItems = wishlistItems.filter((item) => (item.id || item.productId) !== productId);

      setWishlistProductIds(nextIds);
      setWishlistItems(nextItems);
      persistToLocalStorage(nextItems, nextIds, userId);
      showToast(`Removed "${product.name}" from your wishlist.`);

      if (isAuthenticated) {
        try {
          await api.delete(`/wishlist/${productId}`);
        } catch (err) {
          console.warn('Failed to delete from backend wishlist API:', err.message);
        }
      }

      return { isSaved: false, message: `Removed "${product.name}" from your wishlist.` };
    } else {
      // Add to wishlist
      const nextIds = new Set(wishlistProductIds);
      nextIds.add(productId);
      const nextItems = [product, ...wishlistItems.filter((item) => (item.id || item.productId) !== productId)];

      setWishlistProductIds(nextIds);
      setWishlistItems(nextItems);
      persistToLocalStorage(nextItems, nextIds, userId);
      showToast(`Added "${product.name}" to your wishlist!`);

      if (isAuthenticated) {
        try {
          await api.post('/wishlist', { productId });
        } catch (err) {
          console.warn('Failed to post to backend wishlist API:', err.message);
        }
      }

      return { isSaved: true, message: `Added "${product.name}" to your wishlist!` };
    }
  }, [wishlistProductIds, wishlistItems, userId, isAuthenticated, persistToLocalStorage, showToast]);

  // Remove directly by product ID
  const removeFromWishlist = useCallback(async (productId, productName = 'Product') => {
    if (!productId) return;

    const nextIds = new Set(wishlistProductIds);
    nextIds.delete(productId);
    const nextItems = wishlistItems.filter((item) => (item.id || item.productId) !== productId);

    setWishlistProductIds(nextIds);
    setWishlistItems(nextItems);
    persistToLocalStorage(nextItems, nextIds, userId);
    showToast(`Removed "${productName}" from your wishlist.`);

    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        console.warn('Failed to delete from backend wishlist API:', err.message);
      }
    }
  }, [wishlistProductIds, wishlistItems, userId, isAuthenticated, persistToLocalStorage, showToast]);

  const value = {
    wishlistItems,
    wishlistProductIds,
    wishlistCount: wishlistProductIds.size,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlist,
    loading,
    toastMessage,
    showToast
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;

