import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const STORAGE_KEY_CART = 'bizora_cart_items';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // Initialize cart from localStorage immediately to avoid layout shift
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_CART}_${userId}`) || localStorage.getItem(STORAGE_KEY_CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Helper to persist state to localStorage
  const persistCart = useCallback((items, targetUserId) => {
    try {
      localStorage.setItem(`${STORAGE_KEY_CART}_${targetUserId}`, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage:', e);
    }
  }, []);

  // Sync on userId change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_CART}_${userId}`) || localStorage.getItem(STORAGE_KEY_CART);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading stored cart:', e);
    }
  }, [userId]);

  /**
   * Add a real product to the cart with verified properties
   * @param {Object} product - Verified product model from database
   * @param {number} quantity - Desired purchase quantity
   */
  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    if (!product || !product.id) {
      console.warn('Cannot add invalid product to cart');
      return { success: false, message: 'Invalid product record' };
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const availableStock = variant && variant.stockQuantity !== undefined && variant.stockQuantity !== null
      ? Number(variant.stockQuantity)
      : (product.stockQuantity !== undefined && product.stockQuantity !== null
        ? Number(product.stockQuantity)
        : 999);

    const displayName = variant?.name ? `${product.name} (${variant.name})` : product.name;

    if (availableStock <= 0) {
      showToast(`"${displayName}" is currently out of stock.`);
      return { success: false, message: 'Product is out of stock' };
    }

    // Extract first image
    let imageUrl = null;
    if (variant?.image) {
      imageUrl = variant.image;
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
      } catch {
        if (product.images.trim()) imageUrl = product.images;
      }
    }

    const numericPrice = variant && variant.price != null
      ? parseFloat(variant.price)
      : (parseFloat(product.price) || 0);
    const numericCompare = variant && variant.compareAtPrice != null
      ? parseFloat(variant.compareAtPrice)
      : (product.compareAtPrice ? parseFloat(product.compareAtPrice) : null);
    const sellerId = product.businessId || product.business?.id || null;
    const sellerName = product.business?.name || 'Verified Merchant';

    const cartKey = variant?.id ? `${product.id}_${variant.id}` : product.id;

    let updatedList;
    const existingIndex = cartItems.findIndex(
      (item) => (variant ? item.variantId === variant.id : item.productId === product.id && !item.variantId)
    );

    if (existingIndex > -1) {
      const existingItem = cartItems[existingIndex];
      const newQty = Math.min(availableStock, existingItem.quantity + qty);
      
      updatedList = [...cartItems];
      updatedList[existingIndex] = {
        ...existingItem,
        quantity: newQty,
        price: numericPrice,
        compareAtPrice: numericCompare,
        stockQuantity: availableStock
      };
    } else {
      const initialQty = Math.min(availableStock, qty);
      const newItem = {
        cartItemId: cartKey,
        productId: product.id,
        variantId: variant?.id || null,
        variantName: variant?.name || null,
        sku: variant?.sku || product.sku || null,
        businessId: sellerId,
        businessName: sellerName,
        businessSlug: product.business?.slug || null,
        name: displayName,
        baseName: product.name,
        slug: product.slug,
        categoryName: product.category?.name || null,
        price: numericPrice,
        compareAtPrice: numericCompare,
        quantity: initialQty,
        stockQuantity: availableStock,
        image: imageUrl,
        addedAt: new Date().toISOString()
      };
      updatedList = [newItem, ...cartItems];
    }

    setCartItems(updatedList);
    persistCart(updatedList, userId);
    showToast(`Added ${qty} × "${displayName}" to your cart.`);
    return { success: true, message: `Added to cart` };
  }, [cartItems, userId, persistCart, showToast]);

  /**
   * Update quantity of a cart item
   */
  const updateQuantity = useCallback((targetId, quantity) => {
    if (!targetId) return;
    const targetQty = parseInt(quantity, 10);

    let updatedList;
    if (isNaN(targetQty) || targetQty <= 0) {
      updatedList = cartItems.filter(
        (item) => item.cartItemId !== targetId && item.variantId !== targetId && item.productId !== targetId
      );
    } else {
      updatedList = cartItems.map((item) => {
        if (item.cartItemId === targetId || item.variantId === targetId || item.productId === targetId) {
          const maxStock = item.stockQuantity || 999;
          return {
            ...item,
            quantity: Math.min(maxStock, targetQty)
          };
        }
        return item;
      });
    }

    setCartItems(updatedList);
    persistCart(updatedList, userId);
  }, [cartItems, userId, persistCart]);

  /**
   * Remove an item from the cart
   */
  const removeFromCart = useCallback((targetId) => {
    if (!targetId) return;
    const target = cartItems.find(
      (item) => item.cartItemId === targetId || item.variantId === targetId || item.productId === targetId
    );
    const updatedList = cartItems.filter(
      (item) => item.cartItemId !== targetId && item.variantId !== targetId && item.productId !== targetId
    );
    setCartItems(updatedList);
    persistCart(updatedList, userId);
    if (target) {
      showToast(`Removed "${target.name}" from your cart.`);
    }
  }, [cartItems, userId, persistCart, showToast]);

  /**
   * Clear all items in cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    persistCart([], userId);
  }, [userId, persistCart]);

  // Aggregate cart counts and values
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Group items by seller for multi-vendor checkout preparation
  const itemsByBusiness = useMemo(() => {
    const map = {};
    cartItems.forEach((item) => {
      const bId = item.businessId || 'independent_seller';
      if (!map[bId]) {
        map[bId] = {
          businessId: bId,
          businessName: item.businessName || 'Verified Merchant',
          businessSlug: item.businessSlug,
          items: [],
          subtotal: 0
        };
      }
      map[bId].items.push(item);
      map[bId].subtotal += item.price * item.quantity;
    });
    return Object.values(map);
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    itemsByBusiness,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toastMessage,
    showToast
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

