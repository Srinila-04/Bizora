import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import {
  Bell,
  MessageSquare,
  Package,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight
} from 'lucide-react';

const NotificationContext = createContext(null);

// Gentle harmonic chime using standard Web Audio API (0 dependencies)
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Ignore audio autoplay restrictions gracefully
  }
};

export const NotificationProvider = ({ children }) => {
  const { user, selectedBusiness, isMerchant, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeToasts, setActiveToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const recentKeysRef = useRef(new Map());

  // Dismiss toast by id
  const dismissToast = useCallback((id) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast and auto-dismiss after 6 seconds with robust deduplication
  const addToast = useCallback((notification) => {
    if (!notification) return;

    // Never notify the user of their own messages or actions
    if (notification.senderId && user?.id && String(notification.senderId) === String(user.id)) {
      return;
    }

    // Generate deduplication signature
    const dedupKey =
      notification.id ||
      `${notification.type || 'msg'}_${notification.conversationId || notification.orderId || ''}_${notification.message || notification.content || ''}`;

    const now = Date.now();
    const lastSeen = recentKeysRef.current.get(dedupKey);
    // Ignore if identical notification arrived within the last 5 seconds
    if (lastSeen && now - lastSeen < 5000) {
      return;
    }
    recentKeysRef.current.set(dedupKey, now);

    // Clean up cache periodically
    if (recentKeysRef.current.size > 100) {
      for (const [k, time] of recentKeysRef.current.entries()) {
        if (now - time > 15000) {
          recentKeysRef.current.delete(k);
        }
      }
    }

    const id = notification.id || `toast-${now}-${Math.random().toString(36).substr(2, 6)}`;
    const toastItem = { ...notification, id };

    playNotificationSound();

    setActiveToasts((prev) => {
      // Prevent duplicate in active toasts
      if (
        prev.some(
          (t) =>
            t.id === id ||
            (t.conversationId &&
              t.conversationId === notification.conversationId &&
              t.message === notification.message)
        )
      ) {
        return prev;
      }
      return [toastItem, ...prev.slice(0, 4)];
    });
    setNotifications((prev) => [toastItem, ...prev.slice(0, 49)]);
    setUnreadCount((prev) => prev + 1);

    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  }, [dismissToast, user?.id]);

  // Handle clicking a notification toast to navigate to relevant section
  const handleToastClick = useCallback((toast) => {
    dismissToast(toast.id);

    if (toast.type === 'chat_message' || toast.type === 'new_inquiry') {
      if (isMerchant) {
        navigate(`/merchant/dashboard?tab=communication${toast.conversationId ? `&conversationId=${toast.conversationId}` : ''}`);
      } else {
        navigate(`/customer/account?tab=messages${toast.conversationId ? `&conversationId=${toast.conversationId}` : ''}`);
      }
    } else if (toast.type === 'new_order' || toast.type === 'order_cancelled') {
      if (isMerchant) {
        navigate('/merchant/dashboard?tab=orders');
      } else {
        navigate('/customer/orders');
      }
    } else if (toast.type === 'order_status' || toast.type === 'order_confirmed') {
      navigate('/customer/orders');
    }
  }, [dismissToast, isMerchant, navigate]);

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setNotifications([]);
      setActiveToasts([]);
      setUnreadCount(0);
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    // Listen for real-time notification
    const handleNotification = (data) => {
      if (!data) return;
      addToast(data);
    };

    // Listen for new orders (for merchant)
    const handleOrderNew = (data) => {
      if (!data?.order) return;
      const order = data.order;
      addToast({
        id: `order-${order.id}-${Date.now()}`,
        type: 'new_order',
        title: 'New Order Received! 🛍️',
        message: `Order #${order.orderNumber} for ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`,
        orderId: order.id,
        timestamp: new Date().toISOString()
      });
    };

    // Listen for order status updates (for customer)
    const handleOrderUpdated = (data) => {
      if (!data?.order) return;
      const order = data.order;
      addToast({
        id: `order-update-${order.id}-${Date.now()}`,
        type: 'order_status',
        title: 'Order Status Updated 📦',
        message: `Order #${order.orderNumber} is now ${String(order.status).replace(/_/g, ' ').toUpperCase()}`,
        orderId: order.id,
        status: order.status,
        timestamp: new Date().toISOString()
      });
    };

    socket.on('notification:new', handleNotification);
    socket.on('order:new', handleOrderNew);
    socket.on('order:updated', handleOrderUpdated);

    // If merchant has a selected business, ensure they are joined to that business room
    if (selectedBusiness?.id) {
      socket.emit('business:join', { businessId: selectedBusiness.id });
    }

    return () => {
      socket.off('notification:new', handleNotification);
      socket.off('order:new', handleOrderNew);
      socket.off('order:updated', handleOrderUpdated);
    };
  }, [user, selectedBusiness?.id, addToast]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        clearAllNotifications,
        addToast
      }}
    >
      {children}

      {/* Floating Real-Time Notifications Overlay */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 sm:right-6 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {activeToasts.map((toast) => {
          const isChat = toast.type === 'chat_message' || toast.type === 'new_inquiry';
          const isOrder = toast.type === 'new_order' || toast.type === 'order_confirmed';

          return (
            <div
              key={toast.id}
              role="alert"
              onClick={() => handleToastClick(toast)}
              className="pointer-events-auto bg-[#3B1C5A] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#E6B44C]/60 flex items-start gap-3.5 cursor-pointer transform hover:scale-102 transition-all duration-200 animate-in fade-in slide-in-from-top-4"
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isChat
                    ? 'bg-[#FAF7F2] text-[#3B1C5A]'
                    : isOrder
                    ? 'bg-amber-400 text-[#3B1C5A]'
                    : 'bg-emerald-400 text-[#3B1C5A]'
                }`}
              >
                {isChat ? (
                  <MessageSquare className="w-5 h-5" />
                ) : isOrder ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-black text-[#F5BD42] tracking-wide uppercase truncate">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] text-white/50 shrink-0">Just now</span>
                </div>
                <p className="text-xs text-white/90 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                  {toast.message}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#F5BD42] hover:underline">
                  <span>Open & Reply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(toast.id);
                }}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};

export default NotificationContext;

