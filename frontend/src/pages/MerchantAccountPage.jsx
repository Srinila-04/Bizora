import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PasswordRequirements } from '../components/PasswordRequirements';
import SignOutConfirmModal from '../components/SignOutConfirmModal';
import {
  User,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Save,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Camera,
  Trash2,
  Check,
  Store,
  AlertTriangle,
  Shield,
  Send,
  BellRing
} from 'lucide-react';

export const MerchantAccountPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // =========================================================================
  // 1. PERSONAL INFORMATION (INLINE EDITING)
  // =========================================================================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);

  // Sync profile form when auth user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
    }
    setProfileSuccessMsg(null);
  };

  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setProfileErrors({});
    setIsEditingProfile(false);
    setProfileSuccessMsg(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccessMsg(null);

    const errs = {};
    if (!profileForm.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (profileForm.firstName.trim().length > 100) {
      errs.firstName = 'First name cannot exceed 100 characters';
    }

    if (!profileForm.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (profileForm.lastName.trim().length > 100) {
      errs.lastName = 'Last name cannot exceed 100 characters';
    }

    if (!profileForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (profileForm.phone && profileForm.phone.trim().length > 50) {
      errs.phone = 'Mobile number cannot exceed 50 characters';
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.patch('/auth/me', {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null
      });

      const updatedUser = res.data?.data?.user;
      const emailChanged = res.data?.data?.emailChanged;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setIsEditingProfile(false);
      if (emailChanged) {
        showToast(
          'Profile updated! A verification link was sent to your new email address.',
          'success'
        );
        setProfileSuccessMsg('Profile updated! A verification email was sent to your new address.');
      } else {
        showToast('Personal information updated successfully!', 'success');
        setProfileSuccessMsg('Personal information updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update profile.';
      setProfileErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // =========================================================================
  // AVATAR / PROFILE PHOTO UPLOAD
  // =========================================================================
  const avatarFileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must not exceed 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Allowed formats: JPEG, PNG, WEBP, or GIF.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await api.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatarUrl = res.data?.data?.avatarUrl;
      if (newAvatarUrl && user) {
        updateUser({ ...user, avatar: newAvatarUrl });
        showToast('Profile photo uploaded successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to upload photo.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const res = await api.patch('/auth/me', { avatar: null });
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
        showToast('Profile photo removed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to remove photo.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // =========================================================================
  // 2. LOGIN & SECURITY — CHANGE PASSWORD
  // =========================================================================
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
    setPasswordSuccessMsg(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccessMsg(null);

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

    if (passwordForm.newPassword && passwordForm.confirmPassword !== passwordForm.newPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccessMsg(
        res.data?.message || 'Password changed successfully. All active sessions have been revoked. Signing out...'
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully! Redirecting to login...', 'success');

      // Refresh security notifications list
      fetchNotifications();

      // Gracefully log user out after 3 seconds for security compliance
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update password.';
      setPasswordErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // =========================================================================
  // 3. CONTACT VERIFICATION (EMAIL & PHONE)
  // =========================================================================
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showManualTokenBox, setShowManualTokenBox] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  // Automatic token verification if query param ?verifyToken=xyz is present
  useEffect(() => {
    const tokenParam = searchParams.get('verifyToken');
    if (tokenParam && !user?.isEmailVerified) {
      const verifyTokenFromUrl = async () => {
        setIsVerifyingToken(true);
        try {
          const res = await api.post('/auth/verify-email', { token: tokenParam });
          showToast(res.data?.message || 'Email verified successfully!', 'success');
          // Refresh user data from server
          const meRes = await api.get('/auth/me');
          if (meRes.data?.data?.user) {
            updateUser(meRes.data.data.user);
          }
          fetchNotifications();
        } catch (err) {
          const msg = err.response?.data?.error?.message || 'Email verification link is invalid or has expired.';
          showToast(msg, 'error');
        } finally {
          setIsVerifyingToken(false);
          // Remove token from URL
          searchParams.delete('verifyToken');
          setSearchParams(searchParams, { replace: true });
        }
      };
      verifyTokenFromUrl();
    }
  }, [searchParams, setSearchParams, user?.isEmailVerified, updateUser]);

  const handleResendEmailVerification = async () => {
    if (!user?.email || isSendingVerification) return;
    setIsSendingVerification(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: user.email });
      showToast(res.data?.message || 'Verification link sent! Please check your email.', 'success');
      fetchNotifications();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to send verification email.';
      showToast(msg, 'error');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyManualToken = async (e) => {
    e.preventDefault();
    if (!manualTokenInput.trim() || isVerifyingToken) return;

    setIsVerifyingToken(true);
    try {
      const res = await api.post('/auth/verify-email', { token: manualTokenInput.trim() });
      showToast(res.data?.message || 'Email verified successfully!', 'success');
      const meRes = await api.get('/auth/me');
      if (meRes.data?.data?.user) {
        updateUser(meRes.data.data.user);
      }
      setManualTokenInput('');
      setShowManualTokenBox(false);
      fetchNotifications();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Verification token is invalid or expired.';
      showToast(msg, 'error');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // =========================================================================
  // 4. ESSENTIAL ACCOUNT & SECURITY NOTIFICATIONS
  // =========================================================================
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await api.get('/notifications?unreadOnly=false&limit=10');
      const list = res.data?.data?.notifications || [];
      // Filter for essential account and security related notifications
      const securityList = list.filter(
        (n) => n.type === 'system' || n.title?.toLowerCase().includes('password') || n.title?.toLowerCase().includes('email') || n.title?.toLowerCase().includes('verification')
      );
      setNotifications(securityList.length > 0 ? securityList : list.slice(0, 5));
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      console.warn('Could not fetch security notifications:', err.message);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('Notifications marked as read.');
    } catch (err) {
      console.warn('Failed to mark notifications as read:', err.message);
    }
  };

  // =========================================================================
  // 5. SIGN OUT MODAL & ACTION
  // =========================================================================
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      setShowSignOutConfirm(false);
      navigate('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Formatted date helper
  const formattedCreationDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Account';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-900/20'
              : 'bg-[#3B1C5A] text-[#FAF7F2] border border-[#E6B44C]/40 shadow-[#3B1C5A]/30'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#E6B44C] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C6B7E2]/30 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] font-serif tracking-tight">
            Merchant Account
          </h1>
          <p className="text-sm text-[#3B1C5A]/70 mt-1">
            Manage your personal merchant profile, security credentials, contact verification, and account alerts.
          </p>
        </div>

        {/* Informational badge cleanly clarifying boundary with Business Settings */}
        <div className="flex items-center space-x-2 text-xs bg-[#FAF7F2] border border-[#C6B7E2]/60 px-3.5 py-2 rounded-2xl text-[#3B1C5A]/80 shadow-xs shrink-0">
          <Store className="w-4 h-4 text-[#E6B44C] shrink-0" />
          <span>
            Looking for store settings? Visit{' '}
            <Link
              to="/merchant/dashboard?tab=all-businesses"
              className="font-bold text-[#3B1C5A] underline hover:text-[#E6B44C] transition-colors"
            >
              My Businesses
            </Link>
          </span>
        </div>
      </div>

      {/* =====================================================================
          SECTION 1: PERSONAL INFORMATION CARD
          ===================================================================== */}
      <section
        aria-labelledby="personal-info-heading"
        className="bg-white clay-card rounded-3xl border border-[#C6B7E2]/50 shadow-xl shadow-[#3B1C5A]/5 p-6 sm:p-8 relative"
      >
        <div className="flex items-start justify-between pb-6 border-b border-[#C6B7E2]/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/15 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 id="personal-info-heading" className="text-lg font-bold text-[#3B1C5A]">
                Personal Information
              </h2>
              <p className="text-xs text-[#3B1C5A]/65">
                Your authenticated merchant identity details and contact profile.
              </p>
            </div>
          </div>

          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => {
                setProfileErrors({});
                setProfileSuccessMsg(null);
                setIsEditingProfile(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#FAF7F2] text-[#3B1C5A] border border-[#C6B7E2]/60 text-xs font-bold hover:bg-[#3B1C5A] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#E6B44C]" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Success Message Banner */}
        {profileSuccessMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{profileSuccessMsg}</span>
          </div>
        )}

        {/* Profile Card Body */}
        <div className="mt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-[#C6B7E2]/30">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-[#3B1C5A] border-2 border-[#E6B44C] flex items-center justify-center text-[#E6B44C] text-2xl font-extrabold shadow-md overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName || 'Merchant'} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'M'}
                    {user?.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                  </span>
                )}
              </div>

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-[#3B1C5A]/70 rounded-2xl flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E6B44C]" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#3B1C5A] truncate">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-[#3B1C5A]/70">
                Merchant Profile Photo &bull; JPG, PNG, WEBP, or GIF (max 5MB)
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/60 text-xs font-semibold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5 text-[#E6B44C]" />
                  <span>{user?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* VIEW MODE: Read-Only Organized Information */}
          {!isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <User className="w-3 h-3 text-[#E6B44C]" />
                  <span>Full Name</span>
                </span>
                <p className="text-sm font-bold text-[#3B1C5A]">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-[#E6B44C]" />
                  <span>Login Email</span>
                </span>
                <p className="text-sm font-bold text-[#3B1C5A] truncate">{user?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-[#E6B44C]" />
                  <span>Mobile Number</span>
                </span>
                <p className="text-sm font-bold text-[#3B1C5A]">
                  {user?.phone ? user.phone : <span className="text-[#3B1C5A]/50 font-normal italic">Not provided</span>}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-[#E6B44C]" />
                  <span>Account Role</span>
                </span>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#3B1C5A] text-[#E6B44C] border border-[#E6B44C]/30">
                    Merchant Owner
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-[#E6B44C]" />
                  <span>Member Since</span>
                </span>
                <p className="text-sm font-bold text-[#3B1C5A]">{formattedCreationDate}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-[#E6B44C]" />
                  <span>Account Status</span>
                </span>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700">
                    {user?.isActive !== false ? 'Active & Healthy' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDITING MODE: Inline Form Inside the Personal Information Card */
            <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-200">
              {profileErrors.form && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileErrors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label htmlFor="firstName" className="block text-xs font-bold text-[#3B1C5A]">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={profileForm.firstName}
                    onChange={handleProfileFieldChange}
                    className={`w-full rounded-2xl px-3.5 py-2.5 bg-[#FAF7F2] border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                      profileErrors.firstName ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                    }`}
                    placeholder="e.g. Elena"
                  />
                  {profileErrors.firstName && (
                    <p className="text-[11px] text-rose-600 font-semibold">{profileErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label htmlFor="lastName" className="block text-xs font-bold text-[#3B1C5A]">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={profileForm.lastName}
                    onChange={handleProfileFieldChange}
                    className={`w-full rounded-2xl px-3.5 py-2.5 bg-[#FAF7F2] border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                      profileErrors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                    }`}
                    placeholder="e.g. Rostova"
                  />
                  {profileErrors.lastName && (
                    <p className="text-[11px] text-rose-600 font-semibold">{profileErrors.lastName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-[#3B1C5A]">
                    Login Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={handleProfileFieldChange}
                    className={`w-full rounded-2xl px-3.5 py-2.5 bg-[#FAF7F2] border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                      profileErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                    }`}
                    placeholder="merchant@example.com"
                  />
                  {profileErrors.email ? (
                    <p className="text-[11px] text-rose-600 font-semibold">{profileErrors.email}</p>
                  ) : (
                    <p className="text-[11px] text-[#3B1C5A]/60">
                      Changing your email resets verification and triggers a verification email.
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-xs font-bold text-[#3B1C5A]">
                    Mobile Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileFieldChange}
                    className={`w-full rounded-2xl px-3.5 py-2.5 bg-[#FAF7F2] border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                      profileErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                    }`}
                    placeholder="+91 9876543210"
                  />
                  {profileErrors.phone && (
                    <p className="text-[11px] text-rose-600 font-semibold">{profileErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Protected Read-Only Notice */}
              {/* <div className="p-3 rounded-2xl bg-[#F0EAFB]/60 border border-[#C6B7E2]/50 text-xs text-[#3B1C5A]/75 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#3B1C5A] shrink-0" />
                <span>
                  Account Role (<strong>Merchant Owner</strong>) and Account ID are system-protected credentials and cannot be edited.
                </span>
              </div> */}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelProfileEdit}
                  disabled={isSavingProfile}
                  className="px-4 py-2.5 rounded-2xl border border-[#C6B7E2]/70 text-[#3B1C5A] text-xs font-bold hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#3B1C5A] text-white text-xs font-bold shadow-md shadow-[#3B1C5A]/20 hover:bg-[#3B1C5A]/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#E6B44C]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: LOGIN & SECURITY CARD (PASSWORD & CONTACT VERIFICATION)
          ===================================================================== */}
      <section
        aria-labelledby="security-heading"
        className="bg-white clay-card rounded-3xl border border-[#C6B7E2]/50 shadow-xl shadow-[#3B1C5A]/5 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-start justify-between pb-6 border-b border-[#C6B7E2]/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/15 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 id="security-heading" className="text-lg font-bold text-[#3B1C5A]">
                Login & Security
              </h2>
              <p className="text-xs text-[#3B1C5A]/65">
                Manage your login password and verify your email and mobile contacts.
              </p>
            </div>
          </div>
        </div>

        {/* 2A: CHANGE PASSWORD SUBSECTION */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2]/70 border border-[#C6B7E2]/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3B1C5A] flex items-center space-x-2">
                <span>Account Password</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6B44C]/30 text-[#3B1C5A] font-semibold">
                  Secured
                </span>
              </h3>
              <p className="text-xs text-[#3B1C5A]/65 mt-0.5">
                Change your password to maintain account security.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsChangePasswordOpen((prev) => !prev);
                setPasswordErrors({});
                setPasswordSuccessMsg(null);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#3B1C5A] text-white text-xs font-bold hover:bg-[#3B1C5A]/90 transition-all cursor-pointer shadow-xs"
            >
              <span>{isChangePasswordOpen ? 'Hide Form' : 'Change Password'}</span>
            </button>
          </div>

          {/* Change Password Form (Collapsible/Inline) */}
          {isChangePasswordOpen && (
            <form onSubmit={handlePasswordSubmit} className="pt-4 border-t border-[#C6B7E2]/30 space-y-4 animate-in fade-in duration-200">
              {passwordSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrors.form && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordErrors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Password */}
                <div className="space-y-1">
                  <label htmlFor="currentPassword" className="block text-xs font-bold text-[#3B1C5A]">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChangeInput}
                      className={`w-full rounded-2xl pl-3.5 pr-10 py-2.5 bg-white border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                        passwordErrors.currentPassword ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/50 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-[11px] text-rose-600 font-semibold">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label htmlFor="newPassword" className="block text-xs font-bold text-[#3B1C5A]">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChangeInput}
                      className={`w-full rounded-2xl pl-3.5 pr-10 py-2.5 bg-white border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                        passwordErrors.newPassword ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/50 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-[11px] text-rose-600 font-semibold">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#3B1C5A]">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChangeInput}
                      className={`w-full rounded-2xl pl-3.5 pr-10 py-2.5 bg-white border text-sm text-[#3B1C5A] focus:outline-hidden focus:ring-2 focus:ring-[#3B1C5A]/20 transition-all ${
                        passwordErrors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-[#C6B7E2]/60'
                      }`}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B1C5A]/50 hover:text-[#3B1C5A] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 font-semibold">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <PasswordRequirements password={passwordForm.newPassword} />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  disabled={isChangingPassword}
                  className="px-4 py-2 rounded-2xl border border-[#C6B7E2]/70 text-[#3B1C5A] text-xs font-bold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl bg-[#3B1C5A] text-white text-xs font-bold shadow-md shadow-[#3B1C5A]/20 hover:bg-[#3B1C5A]/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2B: CONTACT VERIFICATION SUBSECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#3B1C5A]">
            Contact Verification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Verification Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B1C5A] flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-[#E6B44C]" />
                    <span>Email Address</span>
                  </span>
                  {user?.isEmailVerified ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-[#3B1C5A] truncate">{user?.email}</p>
                <p className="text-[11.5px] text-[#3B1C5A]/70 leading-relaxed">
                  {user?.isEmailVerified
                    ? 'Your email address is verified for account security, password recovery, and business alerts.'
                    : 'Verify your email to ensure password recovery and receive critical store notifications.'}
                </p>
              </div>

              {!user?.isEmailVerified && (
                <div className="pt-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendEmailVerification}
                      disabled={isSendingVerification}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#3B1C5A] text-white text-xs font-bold hover:bg-[#3B1C5A]/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSendingVerification ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#E6B44C]" />
                          <span>Send Verification Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowManualTokenBox((prev) => !prev)}
                      className="text-xs font-semibold text-[#3B1C5A] underline hover:text-[#E6B44C] transition-colors cursor-pointer"
                    >
                      {showManualTokenBox ? 'Hide Code Input' : 'Enter Verification Code'}
                    </button>
                  </div>

                  {showManualTokenBox && (
                    <form onSubmit={handleVerifyManualToken} className="pt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        value={manualTokenInput}
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Paste verification token"
                        className="flex-1 rounded-xl px-3 py-1.5 bg-white border border-[#C6B7E2]/60 text-xs text-[#3B1C5A] focus:outline-hidden focus:ring-1 focus:ring-[#3B1C5A]"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingToken || !manualTokenInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-[#3B1C5A] text-white text-xs font-bold hover:bg-[#3B1C5A]/90 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isVerifyingToken ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Mobile / Phone Verification Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B1C5A] flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-[#E6B44C]" />
                    <span>Mobile Number</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-bold">
                    <span>SMS Unavailable</span>
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#3B1C5A]">
                  {user?.phone ? user.phone : <span className="text-[#3B1C5A]/50 font-normal italic">No mobile number added</span>}
                </p>
                <p className="text-[11.5px] text-[#3B1C5A]/70 leading-relaxed">
                  SMS telephony provider (e.g. Twilio or SMS Gateway) is not configured in this environment. Your mobile number is securely stored for merchant reference.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-medium text-[#3B1C5A]/60 italic">
                  To update your phone number, use the Personal Information edit form above.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: ESSENTIAL ACCOUNT & SECURITY NOTIFICATIONS CARD
          ===================================================================== */}
      <section
        aria-labelledby="notifications-heading"
        className="bg-white clay-card rounded-3xl border border-[#C6B7E2]/50 shadow-xl shadow-[#3B1C5A]/5 p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-start justify-between pb-6 border-b border-[#C6B7E2]/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/15 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="notifications-heading" className="text-lg font-bold text-[#3B1C5A]">
                Essential Account & Security Notifications
              </h2>
              <p className="text-xs text-[#3B1C5A]/65">
                Mandatory account security alerts and verification events.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllNotificationsRead}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#C6B7E2]/60 text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Informational Policy Banner */}
        <div className="p-4 rounded-2xl bg-[#F0EAFB]/70 border border-[#C6B7E2]/50 text-xs text-[#3B1C5A]/85 space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-[#3B1C5A]">
            <BellRing className="w-4 h-4 text-[#3B1C5A]" />
            <span>Mandatory Security Notification Policy</span>
          </div>
          <p className="leading-relaxed text-[11.5px] text-[#3B1C5A]/75">
            Essential security notifications (password updates, email changes, verification links, and authentication anomalies) are mandatory for account safety and store protection. To preserve merchant security, these essential alerts are always enabled.
          </p>
        </div>

        {/* Channels Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 flex items-center justify-between">
            <span className="text-xs font-bold text-[#3B1C5A]">In-App Alerts</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
              Always Active
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 flex items-center justify-between">
            <span className="text-xs font-bold text-[#3B1C5A]">Email Security Alerts</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
              Enabled (SMTP)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C6B7E2]/40 flex items-center justify-between">
            <span className="text-xs font-bold text-[#3B1C5A]">SMS Security Alerts</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10.5px] font-bold">
              Disabled (No Provider)
            </span>
          </div>
        </div>

        {/* Recent Security Activity Log */}
        <div className="pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">
              Recent Security & Account Events
            </h3>
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={isLoadingNotifications}
              aria-label="Refresh events"
              className="text-[#3B1C5A]/60 hover:text-[#3B1C5A] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoadingNotifications ? (
            <div className="py-6 flex items-center justify-center space-y-2 text-[#3B1C5A]/60">
              <Loader2 className="w-5 h-5 animate-spin text-[#E6B44C]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/50 border border-dashed border-[#C6B7E2]/60 text-center space-y-1">
              <p className="text-xs font-bold text-[#3B1C5A]">No Security Incidents</p>
              <p className="text-[11px] text-[#3B1C5A]/60">
                Your merchant account has no recent security warnings or failed attempts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between space-x-3 ${
                    notif.isRead
                      ? 'bg-[#FAF7F2]/50 border-[#C6B7E2]/30'
                      : 'bg-white border-[#E6B44C]/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-[#3B1C5A]/10 text-[#3B1C5A] flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-[#3B1C5A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#3B1C5A] truncate">{notif.title}</p>
                      <p className="text-[11px] text-[#3B1C5A]/70 leading-relaxed mt-0.5">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-[#3B1C5A]/50 mt-1 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#E6B44C] shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: SIGN OUT CARD
          ===================================================================== */}
      <section
        aria-labelledby="signout-heading"
        className="bg-white clay-card rounded-3xl border border-[#C6B7E2]/50 shadow-xl shadow-[#3B1C5A]/5 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 id="signout-heading" className="text-base font-bold text-[#3B1C5A]">
                Sign Out
              </h2>
              <p className="text-xs text-[#3B1C5A]/65">
                Safely end your current session on this device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Reusable Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isSigningOut={isSigningOut}
        title="Sign out of Bizora Merchant Portal?"
        description="You will be securely signed out of your merchant dashboard on this device. You can sign back in at any time with your merchant email and password."
        confirmText="Yes, Sign Out"
      />
    </div>
  );
};

export default MerchantAccountPage;

