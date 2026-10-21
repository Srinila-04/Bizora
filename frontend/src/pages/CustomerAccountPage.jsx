import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PasswordRequirements } from '../components/PasswordRequirements';
import CustomDropdown from '../components/CustomDropdown';
import SignOutConfirmModal from '../components/SignOutConfirmModal';
import { INDIAN_STATES, getDistrictsForState } from '../utils/indiaLocations';
import {
  User,
  Package,
  MapPin,
  KeyRound,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Camera,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  AlertCircle,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Check,
  MessageSquare
} from 'lucide-react';
import CustomerMessagesSection from '../components/CustomerMessagesSection';
import { useChatUnread } from '../hooks/useChatUnread';

const CROP_VIEWPORT_SIZE = 280; // Size of the interactive crop box in pixels
const OUTPUT_IMAGE_SIZE = 400;  // High-resolution export canvas size

// Reusable smooth oval CustomDropdown component following Bizora palette
const PaletteDropdown = CustomDropdown;

export const CustomerAccountPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { unreadCount, refreshUnread } = useChatUnread();

  // Active modal/section: 'profile' | 'addresses' | 'security' | 'messages' | null
  const activeTabParam = searchParams.get('tab');
  const [activeModal, setActiveModal] = useState(
    ['profile', 'addresses', 'security', 'messages'].includes(activeTabParam) ? activeTabParam : null
  );

  // Synchronize modal state with URL query param
  useEffect(() => {
    if (activeModal) {
      setSearchParams({ tab: activeModal }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeModal, setSearchParams]);

  // Global toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // =========================================================================
  // 1. AVATAR ADJUSTMENT & UPLOAD STATE
  // =========================================================================
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustImageSrc, setAdjustImageSrc] = useState(null);
  const [adjustImageObj, setAdjustImageObj] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const cropCanvasRef = useRef(null);
  const avatarFileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Trigger file picker for setting/adjusting profile picture
  const handleSelectAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile image size must not exceed 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Allowed formats: JPEG, PNG, WEBP, or GIF.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      const img = new Image();
      img.onload = () => {
        setAdjustImageSrc(src);
        setAdjustImageObj(img);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setAdjustModalOpen(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);

    if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
  };

  // Draw the image on the interactive crop canvas whenever parameters change
  useEffect(() => {
    if (!adjustModalOpen || !cropCanvasRef.current || !adjustImageObj) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = CROP_VIEWPORT_SIZE;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Center point of canvas
    ctx.translate(size / 2, size / 2);
    // Apply user panning
    ctx.translate(pan.x, pan.y);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale so the shortest dimension covers the crop viewport, multiplied by zoom
    const baseScale = Math.max(
      size / adjustImageObj.naturalWidth,
      size / adjustImageObj.naturalHeight
    );
    const totalScale = baseScale * zoom;
    ctx.scale(totalScale, totalScale);

    // Draw centered
    ctx.drawImage(
      adjustImageObj,
      -adjustImageObj.naturalWidth / 2,
      -adjustImageObj.naturalHeight / 2,
      adjustImageObj.naturalWidth,
      adjustImageObj.naturalHeight
    );

    ctx.restore();
  }, [adjustModalOpen, adjustImageObj, zoom, rotation, pan]);

  // Mouse drag handlers for repositioning / panning
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile & tablet repositioning
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartRef.current = { ...pan };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Save the adjusted profile image: render to offscreen canvas and upload
  const handleSaveAdjustedAvatar = async () => {
    if (!adjustImageObj) return;

    setAvatarUploading(true);
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = OUTPUT_IMAGE_SIZE;
      exportCanvas.height = OUTPUT_IMAGE_SIZE;
      const ctx = exportCanvas.getContext('2d');

      const ratio = OUTPUT_IMAGE_SIZE / CROP_VIEWPORT_SIZE;

      ctx.save();
      ctx.translate(
        OUTPUT_IMAGE_SIZE / 2 + pan.x * ratio,
        OUTPUT_IMAGE_SIZE / 2 + pan.y * ratio
      );
      ctx.rotate((rotation * Math.PI) / 180);

      const baseScale = Math.max(
        OUTPUT_IMAGE_SIZE / adjustImageObj.naturalWidth,
        OUTPUT_IMAGE_SIZE / adjustImageObj.naturalHeight
      );
      const totalScale = baseScale * zoom;
      ctx.scale(totalScale, totalScale);

      ctx.drawImage(
        adjustImageObj,
        -adjustImageObj.naturalWidth / 2,
        -adjustImageObj.naturalHeight / 2,
        adjustImageObj.naturalWidth,
        adjustImageObj.naturalHeight
      );

      ctx.restore();

      exportCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            showToast('Unable to process image.', 'error');
            setAvatarUploading(false);
            return;
          }

          const formData = new FormData();
          formData.append('avatar', blob, 'avatar.jpg');

          try {
            const res = await api.post('/uploads/avatar', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newAvatarUrl = res.data?.data?.avatarUrl;
            if (newAvatarUrl && user) {
              const updated = { ...user, avatar: newAvatarUrl };
              updateUser(updated);
              showToast('Profile picture adjusted and saved successfully!');
              setAdjustModalOpen(false);
              setAdjustImageSrc(null);
              setAdjustImageObj(null);
            }
          } catch (err) {
            const msg = err.response?.data?.error?.message || 'Failed to upload adjusted photo.';
            showToast(msg, 'error');
          } finally {
            setAvatarUploading(false);
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (e) {
      console.error('Error generating cropped image:', e);
      showToast('Failed to save adjusted image.', 'error');
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      const res = await api.patch('/auth/me', { avatar: null });
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
        showToast('Profile photo removed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to remove avatar.';
      showToast(msg, 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  // =========================================================================
  // 2. EDIT PROFILE FORM STATE & HANDLERS
  // =========================================================================
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (profileForm.phone && profileForm.phone.length > 50) {
      errors.phone = 'Phone number cannot exceed 50 characters';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);
    try {
      const res = await api.patch('/auth/me', {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim() || null
      });

      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
        showToast('Profile updated successfully!');
        setActiveModal(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update profile. Please try again.';
      setProfileErrors({ form: msg });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
    setProfileErrors({});
    setActiveModal(null);
  };

  // =========================================================================
  // 3. MY ADDRESSES STATE & HANDLERS
  // =========================================================================
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState(null);

  const [addressSubView, setAddressSubView] = useState('list');
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await api.get('/addresses');
      const list = res.data?.data?.addresses || [];
      setAddresses(list);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setAddressesError('Unable to load addresses. Please check your connection and retry.');
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      recipientName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: 'Karnataka',
      postalCode: '',
      country: 'India',
      isDefault: addresses.length === 0
    });
    setAddressErrors({});
    setAddressSubView('add');
  };

  const openEditAddressForm = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || 'Karnataka',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      isDefault: Boolean(addr.isDefault)
    });
    setAddressErrors({});
    setAddressSubView('edit');
  };

  const handleAddressFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'state') {
        const districts = getDistrictsForState(value);
        if (districts.length > 0 && !districts.includes(prev.city)) {
          next.city = districts[0];
        }
      }
      return next;
    });
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!addressForm.recipientName.trim()) errs.recipientName = 'Recipient name is required';
    if (!addressForm.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (addressForm.phone.trim().length < 7) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!addressForm.addressLine1.trim()) errs.addressLine1 = 'Street address is required';
    if (!addressForm.city.trim()) errs.city = 'City / District is required';
    if (!addressForm.state.trim()) errs.state = 'State / Region is required';
    if (!addressForm.postalCode.trim()) {
      errs.postalCode = 'Postal / PIN code is required';
    } else if (addressForm.postalCode.trim().length < 3) {
      errs.postalCode = 'Please enter a valid postal code';
    }

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }

    setAddressSubmitting(true);
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, addressForm);
        showToast('Address updated successfully!');
      } else {
        await api.post('/addresses', addressForm);
        showToast('New address added successfully!');
      }
      await fetchAddresses();
      setAddressSubView('list');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save address. Please check all fields.';
      setAddressErrors({ form: msg });
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    setSettingDefaultId(addrId);
    try {
      await api.patch(`/addresses/${addrId}/default`);
      showToast('Default delivery address updated.');
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to set default address.';
      showToast(msg, 'error');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    setIsDeletingAddress(true);
    try {
      await api.delete(`/addresses/${addressToDelete.id}`);
      showToast('Address deleted successfully.');
      setAddressToDelete(null);
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete address.';
      showToast(msg, 'error');
    } finally {
      setIsDeletingAddress(false);
    }
  };

  // =========================================================================
  // 4. LOGIN & SECURITY STATE & HANDLERS
  // =========================================================================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState(null);
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [singleSignOutModalOpen, setSingleSignOutModalOpen] = useState(false);
  const [isSigningOutSingle, setIsSigningOutSingle] = useState(false);

  const handleConfirmSingleLogout = async () => {
    setIsSigningOutSingle(true);
    try {
      await logout();
      setSingleSignOutModalOpen(false);
      navigate('/');
    } finally {
      setIsSigningOutSingle(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errs.newPassword = 'New password is required';
    } else {
      if (passwordForm.newPassword.length < 8) {
        errs.newPassword = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
        errs.newPassword = 'Must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(passwordForm.newPassword)) {
        errs.newPassword = 'Must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(passwordForm.newPassword)) {
        errs.newPassword = 'Must contain at least one number';
      } else if (!/[@$!%*?&#]/.test(passwordForm.newPassword)) {
        errs.newPassword = 'Must contain at least one special character (@$!%*?&#)';
      }
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccessMessage(
        res.data?.message || 'Password changed successfully. For your security, all active sessions have been revoked.'
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!');

      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update password. Please check your current password.';
      setPasswordErrors({ form: msg });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      await api.post('/auth/logout-all');
      showToast('Logged out from all devices.');
      await logout();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to revoke device sessions.';
      showToast(msg, 'error');
    } finally {
      setIsLoggingOutAll(false);
      setLogoutAllModalOpen(false);
    }
  };

  // Formatted date helper
  const formattedMemberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : '2026';

  // Customer initials
  const initials = `${user?.firstName?.charAt(0) || 'C'}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  // Settings Cards configuration: My Orders, My Addresses & Login & Security
  const SETTINGS_CARDS = [
    {
      id: 'orders',
      title: 'My Orders',
      description: 'Track ongoing deliveries, review order details, and inspect purchase receipts.',
      icon: Package,
      badge: 'Purchases',
      actionText: 'View All Orders',
      isLink: true,
      linkTo: '/customer/orders'
    },
    {
      id: 'addresses',
      title: 'My Addresses',
      description: 'Manage delivery addresses, add new destinations, and set your default shipping location.',
      icon: MapPin,
      badge: addresses.length > 0 ? `${addresses.length} Saved` : null,
      actionText: 'Manage Addresses'
    },
    {
      id: 'messages',
      title: 'Merchant Inquiries',
      description: 'Review communications with sellers, ask product questions, and manage open inquiries.',
      icon: MessageSquare,
      badge: unreadCount > 0 ? `${unreadCount} Unread` : null,
      actionText: 'View Inquiries'
    },
    {
      id: 'security',
      title: 'Login & Security',
      description: 'Change your password, review credential requirements, and manage active device sessions.',
      icon: KeyRound,
      badge: 'Protected',
      actionText: 'Security Settings'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto selection:bg-[#E6B44C] selection:text-[#3B1C5A]">
      {/* Hidden file input for avatar selection */}
      <input
        type="file"
        ref={avatarFileInputRef}
        onChange={handleSelectAvatarFile}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        id="global-avatar-file-input"
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-400/50'
              : 'bg-[#3B1C5A] text-white border-[#E6B44C]/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#E6B44C] shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* =====================================================================
          SECTION A: PAGE HEADER
          ===================================================================== */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C6B7E2]/30">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#3B1C5A] tracking-tight font-serif">
            My Account
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#79688A]">
            Manage your profile, delivery addresses, and account security
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-[#C6B7E2]/50 shadow-xs text-xs font-bold text-[#3B1C5A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Account Active</span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          SECTION B: CUSTOMER PROFILE SUMMARY CARD
          ===================================================================== */}
      <section
        aria-label="Customer Profile Summary"
        className="clay-card-lavender p-6 sm:p-8 relative overflow-hidden border border-[#C6B7E2]/50 transition-all shadow-lg rounded-3xl bg-linear-to-br from-[#F8F5FD] to-[#EFE8FA]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar container */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-[#3B1C5A]/15 border-2 border-white">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Adjust / Change Photo Button */}
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                title="Adjust & change profile picture"
                aria-label="Adjust & change profile picture"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#3B1C5A] text-[#E6B44C] hover:bg-[#2A1342] transition-transform hover:scale-105 shadow-md border border-white cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 max-w-lg min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B1C5A] font-serif truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Valued Customer'}
                </h2>
                <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
                  Customer
                </span>
                {user?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>

              {/* Metadata rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#79688A] pt-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#3B1C5A]/60 shrink-0" />
                  <span className="truncate">{user?.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#3B1C5A]/60 shrink-0" />
                  <span>{user?.phone ? user.phone : 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-[#3B1C5A]/60 shrink-0" />
                  <span>Member since {formattedMemberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Primary Edit Action */}
          <div className="shrink-0 flex items-center justify-center md:justify-end gap-3">
            <button
              onClick={() => setActiveModal('profile')}
              className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4 text-[#E6B44C]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-20 pointer-events-none blur-2xl"
          style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
        />
      </section>

      {/* =====================================================================
          SECTION C: ACCOUNT SETTINGS CARD DASHBOARD (2 CARDS)
          - My Addresses
          - Login & Security
          ===================================================================== */}
      <section aria-label="Account Settings Dashboard" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#3B1C5A] font-serif">
            Account Management & Purchases
          </h2>
          <span className="text-xs text-[#79688A]">3 core categories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {SETTINGS_CARDS.map((card) => {
            const Icon = card.icon;
            const handleCardClick = () => {
              if (card.isLink && card.linkTo) {
                navigate(card.linkTo);
              } else {
                setActiveModal(card.id);
              }
            };

            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                className="clay-card p-6 bg-white flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-[#C6B7E2]/40 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#3B1C5A] min-h-[180px]"
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0EAFB] border border-[#C6B7E2]/50 flex items-center justify-center text-[#3B1C5A] shadow-xs group-hover:scale-105 group-hover:bg-[#3B1C5A] group-hover:text-[#E6B44C] transition-all">
                      <Icon className="w-6 h-6 transition-colors" />
                    </div>
                    {card.badge && (
                      <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#3B1C5A] group-hover:text-[#40205E] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#79688A] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Visible Navigation Affordance */}
                <div className="mt-6 pt-4 border-t border-[#C6B7E2]/25 flex items-center justify-between text-xs font-bold text-[#3B1C5A] group-hover:text-[#E6B44C] transition-colors">
                  <span>{card.actionText}</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F0EAFB] flex items-center justify-center text-[#3B1C5A] group-hover:bg-[#3B1C5A] group-hover:text-[#E6B44C] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          MODAL: ADJUST PROFILE PICTURE (INTERACTIVE CROP & REPOSITION)
          ===================================================================== */}
      {adjustModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-adjust-avatar-title"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#3B1C5A]/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="clay-card w-full max-w-md bg-white p-6 shadow-2xl border border-[#C6B7E2]/60 animate-in zoom-in-95 duration-200 flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C6B7E2]/30">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F0EAFB] flex items-center justify-center text-[#3B1C5A]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="modal-adjust-avatar-title" className="text-base font-bold text-[#3B1C5A]">
                    Adjust Profile Picture
                  </h3>
                  <p className="text-[11px] text-[#79688A]">Drag to reposition, slider to zoom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdjustModalOpen(false);
                  setAdjustImageSrc(null);
                  setAdjustImageObj(null);
                }}
                className="p-1.5 rounded-lg text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Viewport Canvas */}
            <div className="flex flex-col items-center">
              <div
                className="relative overflow-hidden rounded-2xl bg-[#3B1C5A]/10 border border-[#C6B7E2]/50 shadow-inner select-none touch-none"
                style={{ width: CROP_VIEWPORT_SIZE, height: CROP_VIEWPORT_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Render Canvas */}
                <canvas
                  ref={cropCanvasRef}
                  width={CROP_VIEWPORT_SIZE}
                  height={CROP_VIEWPORT_SIZE}
                  className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />

                {/* Circular Mask & Border Overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden flex items-center justify-center">
                  <div
                    className="w-full h-full rounded-full border-2 border-[#E6B44C]"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(59, 28, 90, 0.55)'
                    }}
                  />
                </div>
              </div>

              <span className="text-[11px] text-[#79688A] mt-2 font-medium">
                Click and drag to pan the photo inside the circle
              </span>
            </div>

            {/* Adjustment Controls: Zoom & Rotate */}
            <div className="space-y-3 pt-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#C6B7E2]/30">
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#3B1C5A] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#3B1C5A]/70" />
                    <span>Zoom</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#79688A]">{zoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
                    title="Zoom Out"
                    className="p-1 text-[#3B1C5A]/70 hover:text-[#3B1C5A] cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#3B1C5A] cursor-pointer h-1.5 bg-[#C6B7E2]/40 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                    title="Zoom In"
                    className="p-1 text-[#3B1C5A]/70 hover:text-[#3B1C5A] cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Rotate & Reset */}
              <div className="flex items-center justify-between pt-1 border-t border-[#C6B7E2]/20">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-2.5 py-1 text-xs font-semibold text-[#3B1C5A] hover:bg-[#F0EAFB] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#3B1C5A]" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="px-2.5 py-1 text-xs font-semibold text-[#79688A] hover:text-[#3B1C5A] transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#C6B7E2]/30 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAdjustModalOpen(false);
                  setAdjustImageSrc(null);
                  setAdjustImageObj(null);
                }}
                disabled={avatarUploading}
                className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustedAvatar}
                disabled={avatarUploading}
                className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {avatarUploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
                )}
                <span>{avatarUploading ? 'Saving Photo...' : 'Set Profile Picture'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: EDIT PROFILE
          ===================================================================== */}
      {activeModal === 'profile' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-profile-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="clay-card w-full max-w-xl max-h-[90vh] flex flex-col bg-white p-6 sm:p-7 shadow-2xl border border-[#C6B7E2]/60 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/40 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0EAFB] flex items-center justify-center text-[#3B1C5A]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-profile-title" className="text-lg font-bold text-[#3B1C5A]">
                    Edit Profile Information
                  </h3>
                  <p className="text-xs text-[#79688A]">Update your profile name, contact details, and photo</p>
                </div>
              </div>
              <button
                onClick={handleCancelProfile}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProfileSubmit} className="overflow-y-auto pr-1 my-4 space-y-4">
              {profileErrors.form && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileErrors.form}</span>
                </div>
              )}

              {/* Avatar section with Adjust / Change Photo */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-[#3B1C5A]/70 rounded-2xl flex items-center justify-center text-white">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#E6B44C]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-bold text-[#3B1C5A]">Profile Photo</h4>
                  <p className="text-[11px] text-[#79688A]">
                    Upload and adjust your photo with live pan & zoom tools (PNG, JPG, WEBP, &lt;5MB).
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="clay-btn-secondary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#3B1C5A]" />
                      <span>{user?.avatar ? 'Change & Adjust Photo' : 'Upload Photo'}</span>
                    </button>

                    {user?.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={avatarUploading}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Fields (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-first-name" className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className={`w-full px-3.5 py-2.5 text-xs clay-input ${
                      profileErrors.firstName ? 'border-rose-400 ring-1 ring-rose-300' : ''
                    }`}
                    placeholder="Enter first name"
                    required
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-[11px] text-rose-600">{profileErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-last-name" className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className={`w-full px-3.5 py-2.5 text-xs clay-input ${
                      profileErrors.lastName ? 'border-rose-400 ring-1 ring-rose-300' : ''
                    }`}
                    placeholder="Enter last name"
                    required
                  />
                  {profileErrors.lastName && (
                    <p className="mt-1 text-[11px] text-rose-600">{profileErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Address (Read-only protected field) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="profile-email" className="block text-xs font-bold text-[#3B1C5A]">
                    Email Address
                  </label>
                  <span className="text-[10px] text-[#79688A]">Account login identifier (locked)</span>
                </div>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed select-none"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="profile-phone" className="block text-xs font-bold text-[#3B1C5A] mb-1">
                  Mobile Number <span className="text-[10px] text-[#79688A] font-normal">(Optional)</span>
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className={`w-full px-3.5 py-2.5 text-xs clay-input ${
                    profileErrors.phone ? 'border-rose-400 ring-1 ring-rose-300' : ''
                  }`}
                  placeholder="+91 98765 43210"
                />
                {profileErrors.phone && (
                  <p className="mt-1 text-[11px] text-rose-600">{profileErrors.phone}</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#C6B7E2]/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  disabled={profileSaving}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {profileSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{profileSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: MY ADDRESSES MANAGEMENT
          ===================================================================== */}
      {activeModal === 'addresses' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-addresses-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="clay-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-white p-6 sm:p-7 shadow-2xl border border-[#C6B7E2]/60 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/40 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0EAFB] flex items-center justify-center text-[#3B1C5A]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-addresses-title" className="text-lg font-bold text-[#3B1C5A]">
                    My Delivery Addresses
                  </h3>
                  <p className="text-xs text-[#79688A]">Manage shipping destinations and default address</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAddressSubView('list');
                  setActiveModal(null);
                }}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-view: LIST OF ADDRESSES */}
            {addressSubView === 'list' && (
              <div className="overflow-y-auto pr-1 my-4 space-y-4">
                {/* Top action bar */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-[#3B1C5A]">
                    Saved Locations ({addresses.length})
                  </span>
                  <button
                    onClick={openAddAddressForm}
                    className="clay-btn-accent px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Loading State */}
                {addressesLoading && (
                  <div className="py-12 flex flex-col items-center justify-center text-[#3B1C5A]/70 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#3B1C5A]" />
                    <p className="text-xs font-semibold">Loading saved addresses...</p>
                  </div>
                )}

                {/* Error State */}
                {addressesError && !addressesLoading && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                      <span>{addressesError}</span>
                    </div>
                    <button
                      onClick={fetchAddresses}
                      className="clay-btn-secondary px-3 py-1.5 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!addressesLoading && !addressesError && addresses.length === 0 && (
                  <div className="py-12 px-4 rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/30 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0EAFB] flex items-center justify-center mx-auto text-[#3B1C5A]">
                      <MapPin className="w-7 h-7 text-[#3B1C5A]/70" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3B1C5A]">No saved addresses yet</h4>
                      <p className="text-xs text-[#79688A] max-w-sm mx-auto mt-1">
                        Add a delivery address to enable streamlined 1-click checkout for your marketplace orders.
                      </p>
                    </div>
                    <button
                      onClick={openAddAddressForm}
                      className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E6B44C]" />
                      <span>Add Primary Address</span>
                    </button>
                  </div>
                )}

                {/* Addresses Grid */}
                {!addressesLoading && !addressesError && addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl bg-[#FAF7F2] border transition-all flex flex-col justify-between ${
                          addr.isDefault
                            ? 'border-[#E6B44C] ring-1 ring-[#E6B44C]/50 shadow-xs'
                            : 'border-[#C6B7E2]/40 hover:border-[#3B1C5A]/40'
                        }`}
                      >
                        <div className="space-y-1.5">
                          {/* Recipient name & default tag */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-extrabold text-[#3B1C5A] truncate">
                              {addr.recipientName}
                            </span>
                            {addr.isDefault && (
                              <span className="clay-badge-gold px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shrink-0">
                                Default
                              </span>
                            )}
                          </div>

                          {/* Address lines */}
                          <p className="text-xs text-[#3B1C5A]/90 leading-snug">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-xs text-[#79688A]">
                            {addr.city}, {addr.state} — {addr.postalCode}
                          </p>
                          <p className="text-[11px] font-semibold text-[#79688A]">
                            {addr.country}
                          </p>

                          {/* Contact phone */}
                          <div className="pt-1 flex items-center gap-1.5 text-xs text-[#3B1C5A]/80 font-medium">
                            <Phone className="w-3 h-3 text-[#3B1C5A]/60" />
                            <span>{addr.phone}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 pt-3 border-t border-[#C6B7E2]/30 flex items-center justify-between gap-2 text-xs">
                          <div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                disabled={settingDefaultId === addr.id}
                                className="text-[11px] font-bold text-[#3B1C5A] hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {settingDefaultId === addr.id ? 'Setting...' : 'Set as Default'}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditAddressForm(addr)}
                              title="Edit Address"
                              aria-label="Edit Address"
                              className="p-1.5 rounded-lg text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAddressToDelete(addr)}
                              title="Delete Address"
                              aria-label="Delete Address"
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-view: ADD OR EDIT ADDRESS FORM */}
            {(addressSubView === 'add' || addressSubView === 'edit') && (
              <form onSubmit={handleAddressSubmit} className="overflow-y-auto pr-1 my-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#C6B7E2]/30">
                  <h4 className="text-xs font-bold text-[#3B1C5A] uppercase tracking-wider">
                    {addressSubView === 'edit' ? 'Edit Address' : 'New Address Details'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAddressSubView('list')}
                    className="text-xs font-semibold text-[#79688A] hover:text-[#3B1C5A] cursor-pointer"
                  >
                    Back to list
                  </button>
                </div>

                {addressErrors.form && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addressErrors.form}</span>
                  </div>
                )}

                {/* Recipient & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={addressForm.recipientName}
                      onChange={handleAddressFieldChange}
                      className={`w-full px-3 py-2 text-xs clay-input ${
                        addressErrors.recipientName ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    {addressErrors.recipientName && (
                      <p className="mt-1 text-[11px] text-rose-600">{addressErrors.recipientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressFieldChange}
                      className={`w-full px-3 py-2 text-xs clay-input ${
                        addressErrors.phone ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="+91 98765 43210"
                      required
                    />
                    {addressErrors.phone && (
                      <p className="mt-1 text-[11px] text-rose-600">{addressErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Street Address (Line 1) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={addressForm.addressLine1}
                    onChange={handleAddressFieldChange}
                    className={`w-full px-3 py-2 text-xs clay-input ${
                      addressErrors.addressLine1 ? 'border-rose-400 ring-1 ring-rose-300' : ''
                    }`}
                    placeholder="House/Flat number, Building name, Street"
                    required
                  />
                  {addressErrors.addressLine1 && (
                    <p className="mt-1 text-[11px] text-rose-600">{addressErrors.addressLine1}</p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Apartment / Suite / Landmark <span className="text-[10px] text-[#79688A] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={addressForm.addressLine2}
                    onChange={handleAddressFieldChange}
                    className="w-full px-3 py-2 text-xs clay-input"
                    placeholder="Area, Locality, Landmark"
                  />
                </div>

                {/* State, City, Postal Code with Palette Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Custom Palette-Styled State Dropdown */}
                  <div>
                    <PaletteDropdown
                      label="State / Region"
                      name="state"
                      value={addressForm.state}
                      onChange={(val) => handleAddressFieldChange({ target: { name: 'state', value: val } })}
                      options={INDIAN_STATES}
                      placeholder="Select State"
                      required
                      error={addressErrors.state}
                      searchable={true}
                    />
                  </div>

                  {/* Custom Palette-Styled City / District Dropdown */}
                  <div>
                    {getDistrictsForState(addressForm.state).length > 0 ? (
                      <PaletteDropdown
                        label="City / District"
                        name="city"
                        value={addressForm.city}
                        onChange={(val) => handleAddressFieldChange({ target: { name: 'city', value: val } })}
                        options={getDistrictsForState(addressForm.state)}
                        placeholder="Select City / District"
                        required
                        error={addressErrors.city}
                        searchable={true}
                      />
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                          City / District <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressFieldChange}
                          className="w-full px-3 py-2 text-xs clay-input"
                          placeholder="e.g. Bengaluru"
                          required
                        />
                        {addressErrors.city && (
                          <p className="mt-1 text-[11px] text-rose-600">{addressErrors.city}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={handleAddressFieldChange}
                      className={`w-full px-3 py-2 text-xs clay-input ${
                        addressErrors.postalCode ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="e.g. 560001"
                      required
                    />
                    {addressErrors.postalCode && (
                      <p className="mt-1 text-[11px] text-rose-600">{addressErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressFieldChange}
                    className="w-full px-3 py-2 text-xs clay-input"
                    placeholder="India"
                  />
                </div>

                {/* Set as Default Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFieldChange}
                      disabled={addresses.length === 0}
                      className="w-4 h-4 rounded text-[#3B1C5A] focus:ring-[#3B1C5A] accent-[#3B1C5A]"
                    />
                    <span className="text-xs font-bold text-[#3B1C5A]">
                      Set as default delivery address
                    </span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-[#C6B7E2]/30 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddressSubView('list')}
                    disabled={addressSubmitting}
                    className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {addressSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{addressSubmitting ? 'Saving Address...' : 'Save Address'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-address-title"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#3B1C5A]/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="clay-card w-full max-w-md bg-white p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 id="delete-address-title" className="text-base font-bold text-[#3B1C5A]">
                  Delete Delivery Address?
                </h4>
                <p className="text-xs text-[#79688A]">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 text-xs text-[#3B1C5A]/80 leading-relaxed">
              <p className="font-bold text-[#3B1C5A]">{addressToDelete.recipientName}</p>
              <p>{addressToDelete.addressLine1}, {addressToDelete.city}</p>
            </div>

            <p className="text-xs text-[#79688A]">
              Are you sure you want to remove this delivery address from your account?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={isDeletingAddress}
                className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={isDeletingAddress}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDeletingAddress && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeletingAddress ? 'Deleting...' : 'Delete Address'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: LOGIN & SECURITY
          ===================================================================== */}
      {activeModal === 'security' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-security-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="clay-card w-full max-w-xl max-h-[90vh] flex flex-col bg-white p-6 sm:p-7 shadow-2xl border border-[#C6B7E2]/60 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/40 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0EAFB] flex items-center justify-center text-[#3B1C5A]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-security-title" className="text-lg font-bold text-[#3B1C5A]">
                    Login & Security
                  </h3>
                  <p className="text-xs text-[#79688A]">Manage account credentials and session access</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 my-4 space-y-6">
              {/* Section 1: Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#3B1C5A] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#E6B44C]" />
                    <span>Change Password</span>
                  </h4>
                </div>

                {passwordSuccessMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccessMessage}</span>
                  </div>
                )}

                {passwordErrors.form && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordErrors.form}</span>
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3.5 py-2.5 text-xs clay-input pr-10 ${
                        passwordErrors.currentPassword ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/60 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-[11px] text-rose-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3.5 py-2.5 text-xs clay-input pr-10 ${
                        passwordErrors.newPassword ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="At least 8 characters with mix of cases"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/60 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-[11px] text-rose-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Password Criteria Feedback Component */}
                <PasswordRequirements password={passwordForm.newPassword} />

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#3B1C5A] mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3.5 py-2.5 text-xs clay-input pr-10 ${
                        passwordErrors.confirmPassword ? 'border-rose-400 ring-1 ring-rose-300' : ''
                      }`}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/60 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] text-rose-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/30 text-[11px] text-[#79688A]">
                  <p>
                    <strong>Notice:</strong> For your security, changing your password will automatically log you out across all devices and active sessions.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {passwordSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{passwordSubmitting ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>

              {/* Section 2: Session Security */}
              <div className="pt-6 border-t border-[#C6B7E2]/30 space-y-3">
                <h4 className="text-xs font-bold text-[#3B1C5A] uppercase tracking-wider flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-[#3B1C5A]" />
                  <span>Active Sessions & Device Management</span>
                </h4>
                <p className="text-xs text-[#79688A]">
                  If you suspect unauthorized access or signed in from a shared computer, you can terminate all other active sessions immediately.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setLogoutAllModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Log Out From All Devices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSingleSignOutModalOpen(true)}
                    className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Current Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CUSTOMER MESSAGES / INQUIRIES WORKSPACE
          ===================================================================== */}
      {activeModal === 'messages' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Merchant Inquiries"
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#3B1C5A]/50 backdrop-blur-xs flex justify-center items-start animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C6B7E2]/60 my-6 relative">
            <button
              onClick={() => {
                setActiveModal(null);
                refreshUnread();
              }}
              aria-label="Close inquiries dialog"
              className="absolute top-5 right-5 p-2 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <CustomerMessagesSection />
          </div>
        </div>
      )}

      {/* Logout All Sessions Confirmation Modal */}
      {logoutAllModalOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-all-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#3B1C5A]/60 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
        >
          <div className="clay-card w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-rose-200 animate-in zoom-in-95 duration-200 space-y-5 mx-auto my-auto text-left relative">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 id="logout-all-title" className="text-base sm:text-lg font-bold text-[#3B1C5A]">
                  Sign Out Everywhere?
                </h4>
                <p className="text-xs text-[#79688A]">Revoke all active device sessions</p>
              </div>
            </div>

            <p className="text-xs text-[#79688A] leading-relaxed">
              This will revoke all active refresh tokens and sign you out of all browsers, tablets, and mobile devices, including this one. You will need to log in again.
            </p>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#C6B7E2]/20">
              <button
                type="button"
                onClick={() => setLogoutAllModalOpen(false)}
                disabled={isLoggingOutAll}
                className="clay-btn-secondary px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutAllDevices}
                disabled={isLoggingOutAll}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoggingOutAll && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLoggingOutAll ? 'Revoking...' : 'Sign Out Everywhere'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Single Session Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={singleSignOutModalOpen}
        onClose={() => setSingleSignOutModalOpen(false)}
        onConfirm={handleConfirmSingleLogout}
        isSigningOut={isSigningOutSingle}
      />
    </div>
  );
};

export default CustomerAccountPage;
