import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Paperclip,
  X,
  Store,
  User,
  Package,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  updateConversationStatus
} from '../services/chat.service';
import { Pagination } from './Pagination';
import { connectSocket, getSocket } from '../services/socket';

export const MerchantCommunicationSection = () => {
  const { user, selectedBusiness, businesses } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected conversation ID
  const urlConvId = searchParams.get('conversationId');
  const [selectedConvId, setSelectedConvId] = useState(urlConvId);

  // Inbox list state
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'awaiting_reply' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Active workspace state
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPagination, setMessagesPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Composer state
  const [composerText, setComposerText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);
  const [sendError, setSendError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync selectedConvId with URL
  useEffect(() => {
    if (urlConvId && urlConvId !== selectedConvId) {
      setSelectedConvId(urlConvId);
    }
  }, [urlConvId]);

  const updateSelectedConv = (convId) => {
    setSelectedConvId(convId);
    const newParams = new URLSearchParams(searchParams);
    if (convId) {
      newParams.set('conversationId', convId);
    } else {
      newParams.delete('conversationId');
    }
    setSearchParams(newParams, { replace: true });
  };

  // 1. Fetch Merchant Conversations List (Scoped to selectedBusiness)
  const fetchMerchantConversations = useCallback(async () => {
    if (!selectedBusiness?.id) {
      setConversations([]);
      setListLoading(false);
      return;
    }

    setListLoading(true);
    setListError(null);
    try {
      const data = await getConversations({
        businessId: selectedBusiness.id,
        filter,
        search: searchQuery,
        page,
        limit: 10
      });

      setConversations(data.conversations || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load merchant conversations:', err);
      setListError(
        err.response?.data?.message || 'Unable to load conversations for this business.'
      );
    } finally {
      setListLoading(false);
    }
  }, [selectedBusiness?.id, filter, searchQuery, page]);

  // When business changes, reset conversation selection and reload inbox
  useEffect(() => {
    updateSelectedConv(null);
    setPage(1);
    fetchMerchantConversations();
  }, [selectedBusiness?.id]);

  useEffect(() => {
    fetchMerchantConversations();
  }, [fetchMerchantConversations]);

  // 2. Fetch Active Conversation Details & Thread
  const fetchActiveThread = useCallback(
    async (convId) => {
      if (!convId || !selectedBusiness?.id) {
        setActiveConversation(null);
        setMessages([]);
        return;
      }

      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const [convData, msgData] = await Promise.all([
          getConversation(convId),
          getMessages(convId, { page: 1, limit: 50 })
        ]);

        setActiveConversation(convData);
        setMessages(msgData.messages || []);
        setMessagesPagination(msgData.pagination || { total: 0, page: 1, totalPages: 1 });

        // Mark unread messages as read
        if (convData.unreadCount > 0) {
          await markConversationAsRead(convId).catch(() => {});
          // Update conversation unread count locally
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Failed to load active thread:', err);
        setMessagesError(err.response?.data?.message || 'Failed to load thread.');
      } finally {
        setMessagesLoading(false);
      }
    },
    [selectedBusiness?.id]
  );

  useEffect(() => {
    if (selectedConvId) {
      fetchActiveThread(selectedConvId);
    }
  }, [selectedConvId, fetchActiveThread]);

  // 1. Real-time inbox ordering & updates (always active whether viewing inbox or workspace)
  useEffect(() => {
    const socket = getSocket() || connectSocket();
    if (!socket) return;

    const handleInboxUpdate = (data) => {
      if (!data?.conversationId) return;
      const convId = data.conversationId;
      const lastMsg = data.lastMessage || data.message;

      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === convId);
        if (existingIdx === -1) {
          fetchMerchantConversations();
          return prev;
        }

        const existing = prev[existingIdx];
        const updated = {
          ...existing,
          lastMessage: lastMsg || existing.lastMessage,
          lastMessageAt: lastMsg?.createdAt || new Date().toISOString(),
          unreadCount:
            selectedConvId === convId || lastMsg?.senderId === user?.id
              ? existing.unreadCount
              : (existing.unreadCount || 0) + 1,
          status:
            lastMsg && lastMsg.senderType === 'customer' && existing.status === 'resolved'
              ? 'reopened'
              : existing.status
        };

        const rest = prev.filter((c) => c.id !== convId);
        return [updated, ...rest];
      });

      fetchMerchantConversations();
    };

    const handleStatusChange = (data) => {
      if (!data?.conversationId) return;
      setConversations((prev) =>
        prev.map((c) => (c.id === data.conversationId ? { ...c, status: data.status } : c))
      );
      if (selectedConvId === data.conversationId && data?.status) {
        setActiveConversation((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
      fetchMerchantConversations();
    };

    socket.on('conversation:updated', handleInboxUpdate);
    socket.on('message:new', handleInboxUpdate);
    socket.on('conversation:status', handleStatusChange);

    return () => {
      socket.off('conversation:updated', handleInboxUpdate);
      socket.off('message:new', handleInboxUpdate);
      socket.off('conversation:status', handleStatusChange);
    };
  }, [fetchMerchantConversations, selectedConvId, user?.id]);

  // 2. Active conversation workspace thread subscription & auto-sync
  useEffect(() => {
    if (!selectedConvId) return;

    const socket = getSocket() || connectSocket();
    if (socket) {
      socket.emit('conversation:join', { conversationId: selectedConvId });
    }

    const handleNewMessage = (data) => {
      if (data?.conversationId === selectedConvId && data?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });

        // Mark as read if from customer
        if (data.message.senderType === 'customer') {
          markConversationAsRead(selectedConvId).catch(() => {});
        }

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    };

    if (socket) {
      socket.on('message:new', handleNewMessage);
    }

    // 3-second backup sync interval so no message is ever missed even during brief reconnects
    const syncInterval = setInterval(async () => {
      try {
        const msgData = await getMessages(selectedConvId, { page: 1, limit: 50 });
        const freshList = msgData.messages || [];
        setMessages((prev) => {
          const prevIds = prev.map((m) => m.id).join(',');
          const freshIds = freshList.map((m) => m.id).join(',');
          if (prevIds !== freshIds) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
            return freshList;
          }
          return prev;
        });
      } catch (e) {
        // Silent background sync
      }
    }, 3000);

    return () => {
      clearInterval(syncInterval);
      if (socket) {
        socket.emit('conversation:leave', { conversationId: selectedConvId });
        socket.off('message:new', handleNewMessage);
      }
    };
  }, [selectedConvId]);

  // Attachment handling
  const handleSelectAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setSendError('Only JPEG, PNG, WEBP, and GIF images are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSendError('Attachment image size must not exceed 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSendError(null);
    setAttachmentFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!selectedConvId || sendingRef.current) return;

    const trimmed = composerText.trim();
    if (!trimmed && !attachmentFile) {
      setSendError('Please type a reply or attach a product image.');
      return;
    }

    sendingRef.current = true;
    setIsSending(true);
    setSendError(null);

    try {
      const newMsg = await sendMessage(selectedConvId, {
        content: trimmed || null,
        attachment: attachmentFile || null
      });

      setComposerText('');
      handleRemoveAttachment();

      // Append to active message thread with strict deduplication
      if (newMsg?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Move this conversation to the top (index 0) immediately in the local conversations list
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === selectedConvId);
        if (existingIdx === -1) {
          fetchMerchantConversations();
          return prev;
        }
        const updatedItem = {
          ...prev[existingIdx],
          lastMessage: newMsg,
          lastMessageAt: newMsg.createdAt || new Date().toISOString()
        };
        const rest = prev.filter((c) => c.id !== selectedConvId);
        return [updatedItem, ...rest];
      });

      // If conversation was resolved, sending a reply keeps or reopens it
      fetchMerchantConversations();
    } catch (err) {
      console.error('Failed to send reply:', err);
      // Preserves unsent text!
      setSendError(
        err.response?.data?.message || 'Failed to deliver message. Your unsent text has been preserved.'
      );
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  // 4. Update Conversation Status: Resolve or Reopen
  const handleToggleStatus = async (targetStatus) => {
    if (!selectedConvId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const updated = await updateConversationStatus(selectedConvId, targetStatus);
      setActiveConversation((prev) => ({ ...prev, status: targetStatus }));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConvId ? { ...c, status: targetStatus } : c))
      );
      setStatusMessage(
        targetStatus === 'resolved'
          ? 'Inquiry marked as resolved.'
          : 'Inquiry reopened.'
      );
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setSendError(err.response?.data?.message || 'Failed to update conversation status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper: Format message timestamp
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Helper: Get product thumbnail
  const getProductImage = (product) => {
    if (!product) return null;
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        return product.images;
      }
    }
    return null;
  };

  // Token for secure image loading
  const accessToken = localStorage.getItem('bizora_access_token');

  // If no store selected
  if (!selectedBusiness) {
    return (
      <div className="clay-card p-12 text-center bg-white/95 border border-[#C6B7E2]/50 space-y-4">
        <Store className="w-12 h-12 text-[#E6B44C] mx-auto" />
        <h3 className="text-lg font-extrabold text-[#3B1C5A] font-serif">
          No Business Store Selected
        </h3>
        <p className="text-xs text-[#3B1C5A]/70 max-w-md mx-auto">
          Please select a business from the top navigation dropdown to manage customer inquiries and communications.
        </p>
        <div className="pt-2">
          <Link
            to="/merchant/business/new"
            className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Register New Business</span>
          </Link>
        </div>
      </div>
    );
  }

  // Strict sorting: conversation with the latest message is always first (at top)
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
    const timeB = new Date(b.lastMessageAt || b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  // Strict message deduplication: ensure no message id is rendered more than once
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter((m) => {
      if (!m?.id) return true;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          PAGE HEADER
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C6B7E2]/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider shadow-xs border border-[#C6B7E2]/40 mb-1.5">
            <Store className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Store: {selectedBusiness.name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] font-serif tracking-tight">
            Customer Communication
          </h2>
          <p className="text-xs sm:text-sm text-[#3B1C5A]/70">
            Manage inquiries, product questions, and customer support directly for {selectedBusiness.name}.
          </p>
        </div>

        {selectedConvId && (
          <button
            type="button"
            onClick={() => updateSelectedConv(null)}
            className="self-start sm:self-auto clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#3B1C5A]" />
            <span>Back to Inbox</span>
          </button>
        )}
      </div>

      {/* =====================================================================
          VIEW: INBOX LIST OR WORKSPACE
          ===================================================================== */}
      {!selectedConvId ? (
        // -------------------------------------------------------------------
        // INBOX LIST VIEW
        // -------------------------------------------------------------------
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#3B1C5A]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search inquiries by customer name, email, or keywords..."
                className="clay-input w-full pl-10 pr-4 py-2 text-xs bg-white rounded-full border-2 border-[#C6B7E2]/60 focus:border-[#3B1C5A]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 border border-[#C6B7E2]/40 shadow-xs overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'awaiting_reply', label: 'Awaiting Reply' },
                { id: 'resolved', label: 'Resolved' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setFilter(t.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filter === t.id
                      ? 'bg-[#3B1C5A] text-white shadow-xs'
                      : 'text-[#3B1C5A]/70 hover:bg-[#F0EAFB] hover:text-[#3B1C5A]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          {listLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C] mx-auto" />
              <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading inquiries for {selectedBusiness.name}...</p>
            </div>
          ) : listError ? (
            <div className="clay-card p-8 bg-white/95 border border-rose-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-[#3B1C5A]">Unable to Load Inquiries</h3>
              <p className="text-xs text-[#3B1C5A]/70 max-w-md mx-auto">{listError}</p>
              <button
                type="button"
                onClick={fetchMerchantConversations}
                className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : sortedConversations.length === 0 ? (
            /* Empty State */
            <div className="clay-card p-12 text-center bg-white/95 border border-[#C6B7E2]/40 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#F0EAFB] border border-[#C6B7E2]/60 flex items-center justify-center mx-auto text-[#3B1C5A] shadow-xs">
                <MessageSquare className="w-8 h-8 text-[#E6B44C]" />
              </div>
              <h3 className="text-base font-extrabold text-[#3B1C5A] font-serif">
                {searchQuery || filter !== 'all'
                  ? 'No Matching Customer Messages'
                  : 'No Inquiries for This Store Yet'}
              </h3>
              <p className="text-xs text-[#3B1C5A]/70 max-w-md mx-auto leading-relaxed">
                {searchQuery || filter !== 'all'
                  ? 'Try changing your search terms or filter selection.'
                  : `Customer questions and pre-purchase inquiries for ${selectedBusiness.name} will appear here.`}
              </p>
            </div>
          ) : (
            /* Conversation Rows */
            <div className="space-y-3">
              {sortedConversations.map((conv) => {
                const hasUnread = conv.unreadCount > 0;
                const custName = conv.customer
                  ? `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim()
                  : 'Customer';

                return (
                  <div
                    key={conv.id}
                    onClick={() => updateSelectedConv(conv.id)}
                    className={`clay-card p-4 sm:p-5 bg-white/95 border transition-all cursor-pointer hover:shadow-md hover:border-[#3B1C5A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      hasUnread
                        ? 'border-[#E6B44C] bg-gradient-to-r from-amber-50/40 to-white'
                        : 'border-[#C6B7E2]/40'
                    }`}
                  >
                    {/* Left: Customer Info & Snippet */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Customer Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#3B1C5A] text-[#E6B44C] font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden border border-white">
                          {conv.customer?.avatar ? (
                            <img
                              src={conv.customer.avatar}
                              alt={custName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{custName.charAt(0) || 'C'}</span>
                          )}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content column */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[#3B1C5A] truncate">
                            {custName}
                          </h4>

                          {/* Status Pill */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                              conv.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : conv.status === 'reopened'
                                ? 'bg-purple-50 text-[#3B1C5A] border-[#3B1C5A]/30'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {conv.status === 'resolved'
                              ? 'Resolved'
                              : conv.status === 'reopened'
                              ? 'Reopened'
                              : 'Open'}
                          </span>

                          {/* Product Context */}
                          {conv.product && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#C6B7E2]/50 text-[10px] font-semibold text-[#3B1C5A] max-w-[200px] truncate">
                              <ShoppingBag className="w-3 h-3 text-[#E6B44C] shrink-0" />
                              <span className="truncate">{conv.product.name}</span>
                            </span>
                          )}

                          {/* Order Context */}
                          {conv.order && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-800">
                              <Package className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>Order #{conv.order.orderNumber}</span>
                            </span>
                          )}
                        </div>

                        {/* Last message preview */}
                        <p className="text-xs text-[#3B1C5A]/70 line-clamp-1">
                          <span className="font-semibold text-[#3B1C5A]/80">
                            {conv.lastMessage?.senderType === 'business_owner' ? 'You: ' : 'Customer: '}
                          </span>
                          {conv.lastMessage?.content
                            ? conv.lastMessage.content
                            : conv.lastMessage?.attachments?.length > 0
                            ? '📷 Image attachment'
                            : 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C6B7E2]/20">
                      <span className="text-[11px] font-medium text-[#3B1C5A]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3B1C5A]/40" />
                        <span>{formatTime(conv.lastMessageAt || conv.lastMessage?.createdAt || conv.updatedAt)}</span>
                      </span>

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#3B1C5A]">
                        <span>Open Conversation</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#E6B44C]" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Shared Pagination Component */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(newPage) => setPage(newPage)}
                itemName="inquiries"
                className="pt-4"
              />
            </div>
          )}
        </div>
      ) : (
        // -------------------------------------------------------------------
        // CONVERSATION WORKSPACE VIEW
        // -------------------------------------------------------------------
        <div className="clay-card bg-white/95 border border-[#C6B7E2]/40 rounded-3xl overflow-hidden shadow-sm space-y-0">
          {/* 1. Workspace Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FAF7F2] to-[#F5EDDF] border-b border-[#C6B7E2]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Customer Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center shrink-0 shadow-xs overflow-hidden border-2 border-white">
                {activeConversation?.customer?.avatar ? (
                  <img
                    src={activeConversation.customer.avatar}
                    alt="Customer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#E6B44C]" />
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif truncate">
                    {activeConversation?.customer
                      ? `${activeConversation.customer.firstName || ''} ${activeConversation.customer.lastName || ''}`.trim()
                      : 'Customer'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                      activeConversation?.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : activeConversation?.status === 'reopened'
                        ? 'bg-purple-50 text-[#3B1C5A] border-[#3B1C5A]/30'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {activeConversation?.status}
                  </span>
                </div>

                <p className="text-xs text-[#3B1C5A]/65 truncate">
                  {activeConversation?.customer?.email || 'Registered Customer'}
                </p>
              </div>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {statusMessage && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in duration-150">
                  {statusMessage}
                </span>
              )}

              {activeConversation?.status !== 'resolved' ? (
                <button
                  type="button"
                  onClick={() => handleToggleStatus('resolved')}
                  disabled={isUpdatingStatus}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer text-emerald-800 hover:border-emerald-400"
                  title="Mark inquiry as resolved once handled"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Mark as Resolved</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleStatus('reopened')}
                  disabled={isUpdatingStatus}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer text-[#3B1C5A]"
                  title="Reopen inquiry for further discussion"
                >
                  <RotateCcw className="w-4 h-4 text-[#3B1C5A]" />
                  <span>Reopen Inquiry</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Context Banners (Product / Order) */}
          {activeConversation?.product && (
            <div className="px-4 py-3 sm:px-6 bg-white border-b border-[#C6B7E2]/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#C6B7E2]/40 shrink-0 flex items-center justify-center">
                  {getProductImage(activeConversation.product) ? (
                    <img
                      src={getProductImage(activeConversation.product)}
                      alt={activeConversation.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-[#E6B44C]" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 block">
                    Product Inquired About
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#3B1C5A] truncate">
                    {activeConversation.product.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#3B1C5A]">
                  ₹{parseFloat(activeConversation.product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <Link
                  to={`/merchant/products/${activeConversation.productId}/edit`}
                  className="clay-pill px-3 py-1 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all inline-flex items-center gap-1 shadow-xs"
                >
                  <span>Edit in Catalog</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activeConversation?.order && (
            <div className="px-4 py-3 sm:px-6 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-blue-900">
                  Regarding Order #{activeConversation.order.orderNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {activeConversation.order.status}
                </span>
                <span className="text-xs font-bold text-blue-900 ml-1">
                  ₹{parseFloat(activeConversation.order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* 3. Messages History - Natural Document Scrolling (no trap boxes!) */}
          <div className="p-4 sm:p-6 space-y-4 min-h-[300px]">
            {messagesLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#E6B44C] mx-auto" />
                <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading conversation history...</p>
              </div>
            ) : messagesError ? (
              <div className="p-6 text-center text-xs text-rose-700 bg-rose-50 rounded-2xl border border-rose-200">
                {messagesError}
              </div>
            ) : uniqueMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#3B1C5A]/60 italic space-y-1">
                <p>No messages in this inquiry thread.</p>
              </div>
            ) : (
              uniqueMessages.map((msg) => {
                const isMerchant = msg.senderType === 'business_owner';
                const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Identity & Timestamp */}
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#3B1C5A]/60 px-1">
                      <span>{isMerchant ? 'You (Merchant)' : activeConversation?.customer?.firstName || 'Customer'}</span>
                      <span>•</span>
                      <span>{formatTime(msg.createdAt)}</span>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-3xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                        isMerchant
                          ? 'bg-[#3B1C5A] text-white rounded-tr-xs'
                          : 'bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/50 rounded-tl-xs'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}

                      {hasAttachments && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((att) => {
                            const secureSrc = `${att.url}${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''}`;

                            return (
                              <div
                                key={att.id || att.filename}
                                className="rounded-2xl overflow-hidden border border-white/30 bg-black/10 max-w-sm"
                              >
                                <a
                                  href={secureSrc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Click to view full image"
                                  className="block group"
                                >
                                  <img
                                    src={secureSrc}
                                    alt={att.originalName || 'Attachment'}
                                    className="max-h-60 w-full object-cover transition-transform group-hover:scale-102"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden p-4 text-center text-xs bg-rose-50 text-rose-700">
                                    Attachment preview unavailable
                                  </div>
                                </a>
                                {att.originalName && (
                                  <div className="p-1.5 px-3 bg-black/30 backdrop-blur-xs text-[10px] truncate text-white/90">
                                    {att.originalName}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 4. Send Error Banner */}
          {sendError && (
            <div className="mx-4 sm:mx-6 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{sendError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="p-1 text-rose-600 hover:text-rose-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 5. Message Composer */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-[#FAF7F2] to-[#F5EDDF] border-t border-[#C6B7E2]/40 space-y-3">
            {attachmentPreview && (
              <div className="relative inline-flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#C6B7E2]/60 shadow-xs">
                <img
                  src={attachmentPreview}
                  alt="Attachment Preview"
                  className="w-14 h-14 object-cover rounded-xl border border-[#C6B7E2]/30"
                />
                <div className="text-xs pr-6">
                  <p className="font-bold text-[#3B1C5A] max-w-[160px] truncate">
                    {attachmentFile?.name}
                  </p>
                  <p className="text-[10px] text-[#3B1C5A]/60">
                    {(attachmentFile?.size / 1024).toFixed(0)} KB • Ready to send
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="relative">
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={`Reply to ${activeConversation?.customer?.firstName || 'customer'}...`}
                  maxLength={2000}
                  rows={3}
                  className="clay-input w-full p-3.5 text-xs sm:text-sm bg-white rounded-2xl border-2 border-[#C6B7E2]/60 focus:border-[#3B1C5A] resize-y"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <div className="absolute right-3 bottom-2.5 text-[10px] font-medium text-[#3B1C5A]/40">
                  {composerText.length} / 2000
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSelectAttachment}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="clay-btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Attach an image (JPEG, PNG, WEBP, GIF, max 5MB)"
                >
                  <Paperclip className="w-4 h-4 text-[#3B1C5A]" />
                  <span className="hidden sm:inline">Attach Image</span>
                </button>

                <button
                  type="submit"
                  disabled={isSending || (!composerText.trim() && !attachmentFile)}
                  className="clay-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reply</span>
                      <Send className="w-3.5 h-3.5 text-[#E6B44C]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantCommunicationSection;

