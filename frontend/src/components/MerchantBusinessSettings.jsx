import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Store,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MerchantBusinessSettings = () => {
  const { businesses, selectedBusiness, switchBusiness, fetchUserBusinesses } = useAuth();

  // Active business being configured
  const currentBusiness = selectedBusiness || (businesses.length > 0 ? businesses[0] : null);

  // Form state for core business details
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    taxId: ''
  });

  // Local state for Logo management
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [logoSuccess, setLogoSuccess] = useState('');
  const logoInputRef = useRef(null);

  // Local state for Banner management
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');
  const bannerInputRef = useRef(null);

  // Form submission state
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [savingAll, setSavingAll] = useState(false);

  // Initialize form data when currentBusiness changes
  useEffect(() => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || '',
        category: currentBusiness.category || '',
        description: currentBusiness.description || '',
        phone: currentBusiness.phone || '',
        email: currentBusiness.email || '',
        address: currentBusiness.address || '',
        website: currentBusiness.website || '',
        taxId: currentBusiness.taxId || ''
      });
      // Clear pending file previews when switching businesses
      setLogoFile(null);
      setLogoPreview(null);
      setBannerFile(null);
      setBannerPreview(null);
      setLogoError('');
      setBannerError('');
      setDetailsError('');
      setLogoSuccess('');
      setBannerSuccess('');
      setDetailsSuccess('');
    }
  }, [currentBusiness?.id]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [logoPreview, bannerPreview]);

  // --------------------------------------------------------------------------
  // Logo Handlers
  // --------------------------------------------------------------------------
  const handleLogoSelect = (e) => {
    setLogoError('');
    setLogoSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setLogoError('Invalid image format. Please select a JPG, PNG, or WebP image.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLogoError('File size exceeds the 5MB limit. Please choose a smaller image.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCancelLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveLogoOnly = async () => {
    if (!logoFile || !currentBusiness) return;
    setSavingLogo(true);
    setLogoError('');
    setLogoSuccess('');

    try {
      const data = new FormData();
      data.append('file', logoFile);
      data.append('businessId', currentBusiness.id);
      data.append('assetType', 'logo');

      await api.post('/uploads/business-asset', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchUserBusinesses();
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      setLogoSuccess('Business logo updated successfully!');
      setTimeout(() => setLogoSuccess(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to upload business logo.';
      setLogoError(msg);
    } finally {
      setSavingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentBusiness) return;
    if (!window.confirm('Are you sure you want to remove your business logo?')) return;

    setSavingLogo(true);
    setLogoError('');
    setLogoSuccess('');

    try {
      await api.patch(`/businesses/${currentBusiness.id}`, { logo: null });
      await fetchUserBusinesses();
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      setLogoSuccess('Business logo removed.');
      setTimeout(() => setLogoSuccess(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to remove logo.';
      setLogoError(msg);
    } finally {
      setSavingLogo(false);
    }
  };

  // --------------------------------------------------------------------------
  // Banner Handlers
  // --------------------------------------------------------------------------
  const handleBannerSelect = (e) => {
    setBannerError('');
    setBannerSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setBannerError('Invalid image format. Please select a JPG, PNG, or WebP image.');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setBannerError('File size exceeds the 5MB limit. Please choose a smaller image.');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      return;
    }

    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleCancelBanner = () => {
    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
    setBannerError('');
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleSaveBannerOnly = async () => {
    if (!bannerFile || !currentBusiness) return;
    setSavingBanner(true);
    setBannerError('');
    setBannerSuccess('');

    try {
      const data = new FormData();
      data.append('file', bannerFile);
      data.append('businessId', currentBusiness.id);
      data.append('assetType', 'banner');

      await api.post('/uploads/business-asset', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchUserBusinesses();
      setBannerFile(null);
      setBannerPreview(null);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      setBannerSuccess('Business banner updated successfully!');
      setTimeout(() => setBannerSuccess(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to upload business banner.';
      setBannerError(msg);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!currentBusiness) return;
    if (!window.confirm('Are you sure you want to remove your business banner?')) return;

    setSavingBanner(true);
    setBannerError('');
    setBannerSuccess('');

    try {
      await api.patch(`/businesses/${currentBusiness.id}`, { banner: null });
      await fetchUserBusinesses();
      setBannerFile(null);
      setBannerPreview(null);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      setBannerSuccess('Business banner removed.');
      setTimeout(() => setBannerSuccess(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to remove banner.';
      setBannerError(msg);
    } finally {
      setSavingBanner(false);
    }
  };

  // --------------------------------------------------------------------------
  // Details Form Handlers
  // --------------------------------------------------------------------------
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || '',
        category: currentBusiness.category || '',
        description: currentBusiness.description || '',
        phone: currentBusiness.phone || '',
        email: currentBusiness.email || '',
        address: currentBusiness.address || '',
        website: currentBusiness.website || '',
        taxId: currentBusiness.taxId || ''
      });
      setDetailsError('');
      setDetailsSuccess('');
    }
  };

  const handleSaveDetails = async (e) => {
    if (e) e.preventDefault();
    if (!currentBusiness) return;

    setSavingDetails(true);
    setDetailsError('');
    setDetailsSuccess('');

    try {
      await api.patch(`/businesses/${currentBusiness.id}`, formData);
      await fetchUserBusinesses();
      setDetailsSuccess('Business details updated successfully!');
      setTimeout(() => setDetailsSuccess(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to update business details.';
      setDetailsError(msg);
    } finally {
      setSavingDetails(false);
    }
  };

  // Master "Save All Changes" (handles pending Logo, Banner, and Form Data in one click)
  const handleSaveAllChanges = async (e) => {
    if (e) e.preventDefault();
    if (!currentBusiness) return;

    setSavingAll(true);
    setDetailsError('');
    setDetailsSuccess('');
    setLogoError('');
    setBannerError('');

    try {
      // 1. Upload logo if a new file is pending
      if (logoFile) {
        const logoData = new FormData();
        logoData.append('file', logoFile);
        logoData.append('businessId', currentBusiness.id);
        logoData.append('assetType', 'logo');
        await api.post('/uploads/business-asset', logoData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setLogoFile(null);
        setLogoPreview(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
      }

      // 2. Upload banner if a new file is pending
      if (bannerFile) {
        const bannerData = new FormData();
        bannerData.append('file', bannerFile);
        bannerData.append('businessId', currentBusiness.id);
        bannerData.append('assetType', 'banner');
        await api.post('/uploads/business-asset', bannerData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerInputRef.current) bannerInputRef.current.value = '';
      }

      // 3. Save core business details
      await api.patch(`/businesses/${currentBusiness.id}`, formData);

      // 4. Refresh global auth context
      await fetchUserBusinesses();

      setDetailsSuccess('All business settings, branding, and details saved successfully!');
      setTimeout(() => setDetailsSuccess(''), 5000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'An error occurred while saving your changes. Please review the form and try again.';
      setDetailsError(msg);
    } finally {
      setSavingAll(false);
    }
  };

  if (!currentBusiness) {
    return (
      <div className="clay-card p-10 text-center max-w-xl mx-auto my-8">
        <Store className="w-12 h-12 text-[#3B1C5A]/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#3B1C5A]">No Business Selected</h3>
        <p className="text-xs text-[#3B1C5A]/70 mt-1 mb-4">
          Please register or select a storefront to configure its logo, banner, and settings.
        </p>
        <Link to="/merchant/business/new" className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5">
          <Store className="w-4 h-4" />
          <span>Register Business</span>
        </Link>
      </div>
    );
  }

  const effectiveLogo = logoPreview || currentBusiness.logo;
  const effectiveBanner = bannerPreview || currentBusiness.banner;
  const hasPendingLogo = !!logoFile;
  const hasPendingBanner = !!bannerFile;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* --------------------------------------------------------------------- */}
      {/* Top Header & Store Context Selector                                    */}
      {/* --------------------------------------------------------------------- */}
      <div className="clay-card p-6 sm:p-8 bg-white/80 border border-[#C6B7E2]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">
              <SlidersHorizontal className="w-4 h-4 text-[#E6B44C]" />
              <span>Merchant Configuration</span>
              <span>•</span>
              <span className="text-[#3B1C5A]">{currentBusiness.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] tracking-tight">
              Business Settings & Branding
            </h2>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/75 max-w-2xl">
              Configure your store&apos;s public brand presence, high-resolution logo, hero banner,
              and verifiable business credentials.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <Link
              to={`/customer/stores/${currentBusiness.id || currentBusiness.slug}`}
              className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
              title="Open public customer storefront"
            >
              <Eye className="w-3.5 h-3.5 text-[#3B1C5A]" />
              <span>Preview Storefront</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <button
              type="button"
              onClick={handleSaveAllChanges}
              disabled={savingAll || savingLogo || savingBanner || savingDetails}
              className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              {savingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                  <span>Saving All Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#E6B44C]" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Multi-business Switcher if merchant has > 1 store */}
        {businesses.length > 1 && (
          <div className="mt-5 pt-4 border-t border-[#C6B7E2]/30 flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-[#3B1C5A]/70 flex items-center gap-1.5 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#3B1C5A]" />
              <span>Configure Store:</span>
            </span>
            {businesses.map((biz) => (
              <button
                key={biz.id}
                type="button"
                onClick={() => switchBusiness(biz)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentBusiness.id === biz.id
                    ? 'clay-btn-primary shadow-sm'
                    : 'clay-btn-secondary hover:bg-white'
                }`}
              >
                {biz.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Global Success / Error Notification Bar */}
      {detailsSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{detailsSuccess}</span>
        </div>
      )}
      {detailsError && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{detailsError}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 1: BUSINESS LOGO                                              */}
      {/* --------------------------------------------------------------------- */}
      <section aria-labelledby="business-logo-heading" className="clay-card p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#C6B7E2]/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E6B44C]/25 text-[#3B1C5A] flex items-center justify-center">
                <Store className="w-4 h-4 text-[#3B1C5A]" />
              </div>
              <h3 id="business-logo-heading" className="text-xl font-bold text-[#3B1C5A]">
                Business Logo
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/75 mt-1">
              Your official brand emblem. Appears on your storefront header, product detail cards, checkout summaries, and customer communications.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-[#3B1C5A]/60 bg-[#F6F1E8] px-3 py-1.5 rounded-xl border border-[#C6B7E2]/25 self-start">
            Square 1:1 • JPG, PNG, WebP • Max 5MB
          </div>
        </div>

        {/* Logo Feedback messages */}
        {logoSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{logoSuccess}</span>
          </div>
        )}
        {logoError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{logoError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Logo Preview Box */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-[#F6F1E8] border-2 border-[#C6B7E2]/40 shadow-inner flex items-center justify-center overflow-hidden">
              {effectiveLogo ? (
                <img
                  src={effectiveLogo}
                  alt={`${currentBusiness.name} Logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-3">
                  <Store className="w-10 h-10 text-[#3B1C5A]/35 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-[#3B1C5A]/50 uppercase tracking-wider block">
                    No Logo
                  </span>
                </div>
              )}
            </div>

            {hasPendingLogo && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-[#3B1C5A] shadow-md border border-amber-500">
                Unsaved
              </span>
            )}
          </div>

          {/* Logo Controls */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-[#3B1C5A]">
                {effectiveLogo ? 'Current Business Logo' : 'Upload Your Store Logo'}
              </h4>
              <p className="text-xs text-[#3B1C5A]/70 mt-0.5 leading-relaxed">
                Choose a clear, centered high-resolution logo. We preserve its natural aspect ratio
                without stretching.
              </p>
            </div>

            <input
              type="file"
              ref={logoInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoSelect}
              className="hidden"
              id="business-logo-upload"
            />

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={savingLogo || savingAll}
                className="clay-btn-accent px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{effectiveLogo ? 'Replace Logo' : 'Upload Logo'}</span>
              </button>

              {hasPendingLogo ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveLogoOnly}
                    disabled={savingLogo || savingAll}
                    className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {savingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
                    )}
                    <span>Save Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelLogo}
                    disabled={savingLogo || savingAll}
                    className="clay-btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#3B1C5A]/70" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                currentBusiness.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={savingLogo || savingAll}
                    className="clay-btn-secondary hover:bg-rose-50 hover:text-rose-700 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Remove</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2: BUSINESS BANNER                                            */}
      {/* --------------------------------------------------------------------- */}
      <section aria-labelledby="business-banner-heading" className="clay-card p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#C6B7E2]/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E6B44C]/25 text-[#3B1C5A] flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#3B1C5A]" />
              </div>
              <h3 id="business-banner-heading" className="text-xl font-bold text-[#3B1C5A]">
                Business Banner
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/75 mt-1">
              Your flagship storefront header cover. Rendered across all storefront templates, customer inquiries, and brand showcase headers.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-[#3B1C5A]/60 bg-[#F6F1E8] px-3 py-1.5 rounded-xl border border-[#C6B7E2]/25 self-start">
            Wide 3:1 (1200×400px) • JPG, PNG, WebP • Max 5MB
          </div>
        </div>

        {/* Banner Feedback messages */}
        {bannerSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bannerSuccess}</span>
          </div>
        )}
        {bannerError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{bannerError}</span>
          </div>
        )}

        {/* Large Banner Preview Container */}
        <div className="space-y-4">
          <div className="relative w-full h-44 sm:h-56 lg:h-64 rounded-2xl bg-gradient-to-r from-[#3B1C5A] via-[#52297D] to-[#3B1C5A] border-2 border-[#C6B7E2]/40 shadow-inner overflow-hidden flex items-center justify-center">
            {effectiveBanner ? (
              <img
                src={effectiveBanner}
                alt={`${currentBusiness.name} Banner`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center p-6 text-white/70">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">No Storefront Banner Uploaded</p>
                <p className="text-[11px] text-white/60 mt-1">Upload a brand banner to enhance your storefront header appearance.</p>
              </div>
            )}

            {/* Subtle overlay gradient to show preview realism */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Banner Floating Metadata */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
              <span className="text-xs font-bold drop-shadow-md">
                {currentBusiness.name} Storefront Preview
              </span>
              {hasPendingBanner && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#3B1C5A] shadow-md border border-amber-500">
                  Unsaved Banner
                </span>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={bannerInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerSelect}
            className="hidden"
            id="business-banner-upload"
          />

          {/* Banner Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-[#3B1C5A]/70">
              <span className="font-semibold text-[#3B1C5A]">Adaptive Framing:</span> Banner adapts smoothly to desktop monitors, tablets, and smartphone displays.
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={savingBanner || savingAll}
                className="clay-btn-accent px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{effectiveBanner ? 'Replace Banner' : 'Upload Banner'}</span>
              </button>

              {hasPendingBanner ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveBannerOnly}
                    disabled={savingBanner || savingAll}
                    className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {savingBanner ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
                    )}
                    <span>Save Banner</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelBanner}
                    disabled={savingBanner || savingAll}
                    className="clay-btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#3B1C5A]/70" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                currentBusiness.banner && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    disabled={savingBanner || savingAll}
                    className="clay-btn-secondary hover:bg-rose-50 hover:text-rose-700 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Remove</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 3: BUSINESS DETAILS & CREDENTIALS (Preserving all 7 Fields)    */}
      {/* --------------------------------------------------------------------- */}
      <section aria-labelledby="business-details-heading" className="clay-card p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#C6B7E2]/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E6B44C]/25 text-[#3B1C5A] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#3B1C5A]" />
              </div>
              <h3 id="business-details-heading" className="text-xl font-bold text-[#3B1C5A]">
                Business Details & Credentials
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/75 mt-1">
              Maintain your official business identity, contact information, customer inquiries channels, and tax registrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              disabled={savingDetails || savingAll}
              className="clay-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset fields to saved values"
            >
              <RotateCcw className="w-3 h-3 text-[#3B1C5A]/60" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveDetails} className="space-y-5">
          {/* Field 1 & Category: Business Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Artisanal Roasters & Co."
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g. Specialty Coffee, Fashion"
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Field 2: Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell your customers about your craft, origin, and values..."
              className="clay-input w-full p-3.5 text-sm leading-relaxed"
            />
            <span className="text-[11px] text-[#3B1C5A]/60 mt-1 block">
              Between 10 and 3000 characters. Displays prominently on your storefront profile.
            </span>
          </div>

          {/* Field 3 & 4: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#3B1C5A]/60" />
                <span>Contact Phone</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#3B1C5A]/60" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="hello@yourbusiness.com"
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Field 5: Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#3B1C5A]/60" />
              <span>Registered Business Address</span> <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Suite 104, Craftworks District, Mumbai, MH - 400001"
              className="clay-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          {/* Field 6 & 7: Website URL & Tax / GST ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#3B1C5A]/60" />
                <span>Website URL</span>
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourstore.com"
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B1C5A]/60" />
                <span>Tax / GST ID</span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                className="clay-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Save Business Details Footer */}
          <div className="pt-4 border-t border-[#C6B7E2]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#3B1C5A]/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
              <span>Updates to your business credentials reflect instantly across all storefront pages.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={savingDetails || savingAll}
                className="clay-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={savingDetails || savingAll}
                className="clay-btn-primary px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {savingDetails ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                    <span>Saving Details...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>Save Business Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MerchantBusinessSettings;

