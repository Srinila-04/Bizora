import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCounts } from '../services/chat.service';
import { getSocket, connectSocket } from '../services/socket';

/**
 * Custom hook to monitor scoped in-app unread message counts for customers or merchants
 */
export const useChatUnread = (pollIntervalMs = 15000) => {
  const { user, isMerchant, isCustomer, selectedBusiness } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const bizId = isMerchant && selectedBusiness?.id ? selectedBusiness.id : null;
      const count = await getUnreadCounts(bizId);
      setUnreadCount(count || 0);
    } catch (err) {
      console.debug('Failed to poll unread message count:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isMerchant, selectedBusiness?.id]);

  useEffect(() => {
    fetchUnread();

    const socket = getSocket() || connectSocket();
    const handleRealtimeUpdate = () => {
      fetchUnread();
    };

    if (socket) {
      socket.on('conversation:updated', handleRealtimeUpdate);
      socket.on('notification:new', handleRealtimeUpdate);
      socket.on('message:new', handleRealtimeUpdate);
    }

    let interval = null;
    if (user && pollIntervalMs > 0) {
      interval = setInterval(() => {
        fetchUnread();
      }, pollIntervalMs);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (socket) {
        socket.off('conversation:updated', handleRealtimeUpdate);
        socket.off('notification:new', handleRealtimeUpdate);
        socket.off('message:new', handleRealtimeUpdate);
      }
    };
  }, [fetchUnread, user, pollIntervalMs]);

  return {
    unreadCount,
    refreshUnread: fetchUnread,
    loading
  };
};

export default useChatUnread;

