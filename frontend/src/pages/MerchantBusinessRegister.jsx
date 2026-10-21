import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import CustomDropdown from '../components/CustomDropdown';
import {
  Store,
  Layers,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  Tag,
  Check,
  ToggleRight
} from 'lucide-react';

const MARKETPLACE_CATEGORIES = [
  // 'Food & Beverage',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Home & Living',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Artisanal & Handmade',
  'Books, Toys & Stationery',
  'Professional Services',
  'Sports & Fitness',
  'Automotive & Hardware'
];

export const MerchantBusinessRegister = () => {
  const { user, fetchUserBusinesses, switchBusiness } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    addressCountry: 'USA',
    website: '',
    taxId: '',
    socialInstagram: '',
    socialFacebook: '',
    logoUrl: '',
    bannerUrl: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBusiness, setCreatedBusiness] = useState(null);
  const [isPublishedLive, setIsPublishedLive] = useState(false);
  const [publishingNow, setPublishingNow] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, [type]: 'Only JPG, PNG or WEBP images are allowed' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [type]: 'File size must be under 5MB' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(previewUrl);
      setErrors((prev) => ({ ...prev, logo: '' }));
    } else {
      setBannerFile(file);
      setBannerPreview(previewUrl);
      setErrors((prev) => ({ ...prev, banner: '' }));
    }
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!formData.name.trim()) errs.name = 'Business name is required';
      else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

      if (!formData.category) errs.category = 'Please select a marketplace category';

      if (!formData.description.trim()) {
        errs.description = 'Business description is required';
      } else if (formData.description.trim().length < 10) {
        errs.description = 'Please provide a detailed description (at least 10 characters)';
      }
    }

    if (s === 2) {
      if (!formData.phone.trim()) {
        errs.phone = 'Business phone number is required';
      } else if (!/^\+?[\d\s-]{7,20}$/.test(formData.phone.trim())) {
        errs.phone = 'Please enter a valid phone number';
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid contact email';
      }

      if (!formData.addressStreet.trim()) errs.addressStreet = 'Street address is required';
      if (!formData.addressCity.trim()) errs.addressCity = 'City is required';
      if (!formData.addressState.trim()) errs.addressState = 'State / Region is required';
      if (!formData.addressPostalCode.trim()) errs.addressPostalCode = 'Postal code is required';
    }

    if (s === 3) {
      if (formData.website && !/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i.test(formData.website.trim())) {
        errs.website = 'Please enter a valid website URL (e.g. https://mystore.com)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const addressString = `${formData.addressStreet.trim()}, ${formData.addressCity.trim()}, ${formData.addressState.trim()} ${formData.addressPostalCode.trim()}, ${formData.addressCountry.trim()}`;

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: addressString,
        addressDetails: {
          street: formData.addressStreet.trim(),
          city: formData.addressCity.trim(),
          state: formData.addressState.trim(),
          postalCode: formData.addressPostalCode.trim(),
          country: formData.addressCountry.trim()
        },
        website: formData.website.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
        socialLinks: {
          instagram: formData.socialInstagram.trim() || undefined,
          facebook: formData.socialFacebook.trim() || undefined
        },
        isPublished: true
      };

      const res = await api.post('/businesses', payload);
      const newBusiness = res.data.data.business;

      // Handle optional file uploads if provided
      if (logoFile) {
        try {
          const lData = new FormData();
          lData.append('file', logoFile);
          lData.append('businessId', newBusiness.id);
          lData.append('assetType', 'logo');
          await api.post('/uploads/business-asset', lData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (uploadErr) {
          console.warn('Logo upload skipped/failed:', uploadErr);
        }
      }

      if (bannerFile) {
        try {
          const bData = new FormData();
          bData.append('file', bannerFile);
          bData.append('businessId', newBusiness.id);
          bData.append('assetType', 'banner');
          await api.post('/uploads/business-asset', bData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (uploadErr) {
          console.warn('Banner upload skipped/failed:', uploadErr);
        }
      }

      // Refresh list of merchant businesses in context
      await fetchUserBusinesses();
      switchBusiness(newBusiness);

      setCreatedBusiness(newBusiness);
      setIsPublishedLive(true);
      setIsSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to register business. Please review your details and try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantPublish = async () => {
    if (!createdBusiness?.id || publishingNow) return;
    setPublishingNow(true);
    try {
      await api.post(`/businesses/${createdBusiness.id}/toggle-publish`);
      setIsPublishedLive(true);
      await fetchUserBusinesses();
    } catch (err) {
      console.error('Failed to publish business:', err);
    } finally {
      setPublishingNow(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/merchant/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#3B1C5A]/70 hover:text-[#3B1C5A] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Merchant Dashboard</span>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6B44C] text-[#3B1C5A] clay-card flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A]">
              Register a New Digital Business
            </h1>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/70">
              One account, multiple storefronts. Add a storefront to your portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="mb-8 p-4 clay-card bg-white/70">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, label: 'Store Identity' },
            { num: 2, label: 'Contact & Location' },
            { num: 3, label: 'Branding & Social' },
            { num: 4, label: 'Review & Submit' }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                step === s.num
                  ? 'text-[#3B1C5A] font-bold'
                  : step > s.num
                  ? 'text-emerald-700 font-medium cursor-pointer'
                  : 'text-[#3B1C5A]/40 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  step === s.num
                    ? 'bg-[#3B1C5A] text-white shadow-md'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#C6B7E2]/30 text-[#3B1C5A]/60'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-[11px] hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="clay-card p-6 sm:p-10 relative">
        {/* Success Screen */}
        {isSuccess ? (
          <div className="text-center py-8 space-y-5 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#3B1C5A]">
              Storefront Registered!
            </h2>
            <p className="text-sm text-[#3B1C5A]/80 max-w-lg mx-auto">
              <strong className="text-[#3B1C5A]">{createdBusiness?.name}</strong> has been registered under your merchant identity.
            </p>

            {/* Storefront Visibility Status & Instant Publish Action */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3B1C5A]/70 uppercase tracking-wide">
                  Storefront Status
                </span>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  isPublishedLive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isPublishedLive ? 'Live in Market' : 'Unpublished (Draft)'}
                </span>
              </div>
              <p className="text-xs text-[#3B1C5A]/80 leading-relaxed">
                {isPublishedLive
                  ? 'Your store is live and visible to customers on the Business Store page!'
                  : 'By default, newly created stores are saved in Draft mode. Publish now to make it visible to customers in the Business Store directory immediately.'}
              </p>
              {!isPublishedLive ? (
                <button
                  type="button"
                  onClick={handleInstantPublish}
                  disabled={publishingNow}
                  className="clay-btn-accent w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {publishingNow ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Storefront...</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span>Publish Storefront to Customers Now</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/customer/business-store"
                  className="clay-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
                >
                  <Eye className="w-4 h-4" />
                  <span>View in Customer Business Store</span>
                </Link>
              )}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/merchant/dashboard')}
                className="clay-btn-primary px-6 py-3 text-sm font-bold w-full sm:w-auto"
              >
                Go to Merchant Dashboard
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  setFormData({
                    name: '',
                    category: '',
                    description: '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    addressStreet: '',
                    addressCity: '',
                    addressState: '',
                    addressPostalCode: '',
                    addressCountry: 'USA',
                    website: '',
                    taxId: '',
                    socialInstagram: '',
                    socialFacebook: '',
                    logoUrl: '',
                    bannerUrl: ''
                  });
                  setLogoFile(null);
                  setBannerFile(null);
                  setLogoPreview('');
                  setBannerPreview('');
                }}
                className="clay-btn-secondary px-6 py-3 text-sm font-bold w-full sm:w-auto"
              >
                Register Another Business
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-semibold text-xs">Submission Error</p>
                  <p className="text-xs text-rose-600/90 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* STEP 1: Store Identity */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#C6B7E2]/30 pb-3">
                  <h2 className="text-lg font-bold text-[#3B1C5A]">Step 1: Storefront Identity</h2>
                  <p className="text-xs text-[#3B1C5A]/70">Enter public details for your digital business.</p>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Artisan Roasters & Bakery"
                    className={`clay-input w-full px-4 py-3 text-sm ${
                      errors.name ? '!border-rose-400 !bg-rose-50/50' : ''
                    }`}
                  />
                  {errors.name && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* Category Selector */}
                <div>
                  <CustomDropdown
                    name="category"
                    label="Marketplace Category"
                    required
                    value={formData.category}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, category: val }));
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: '' }));
                      }
                      setApiError('');
                    }}
                    placeholder="Select a Category..."
                    options={MARKETPLACE_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                    error={errors.category}
                    icon={Tag}
                    size="lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                    Business Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your products, specialty, artisan heritage, or services..."
                    className={`clay-input w-full p-4 text-sm ${
                      errors.description ? '!border-rose-400 !bg-rose-50/50' : ''
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-[#3B1C5A]/60">
                    <span>Minimum 10 characters</span>
                    <span>{formData.description.length} chars</span>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="clay-btn-primary px-6 py-3 text-sm font-bold flex items-center space-x-2"
                  >
                    <span>Next: Contact & Location</span>
                    <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Contact & Location */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#C6B7E2]/30 pb-3">
                  <h2 className="text-lg font-bold text-[#3B1C5A]">Step 2: Contact & Location</h2>
                  <p className="text-xs text-[#3B1C5A]/70">
                    Customer enquiry channels and business address.
                  </p>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                      Business Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className={`clay-input w-full pl-10 pr-4 py-3 text-sm ${
                          errors.phone ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                      Business Contact Email <span className="text-[10px] text-[#3B1C5A]/50 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@yourbusiness.com"
                        className={`clay-input w-full pl-10 pr-4 py-3 text-sm ${
                          errors.email ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
                  </div>
                </div>

                {/* Structured Address */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80">
                    Business Address <span className="text-rose-500">*</span>
                  </h3>

                  <div>
                    <input
                      type="text"
                      name="addressStreet"
                      value={formData.addressStreet}
                      onChange={handleInputChange}
                      placeholder="Street Address (e.g. 104 Market Street, Suite 200)"
                      className={`clay-input w-full px-4 py-3 text-sm ${
                        errors.addressStreet ? '!border-rose-400 !bg-rose-50/50' : ''
                      }`}
                    />
                    {errors.addressStreet && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{errors.addressStreet}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        name="addressCity"
                        value={formData.addressCity}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`clay-input w-full px-4 py-3 text-sm ${
                          errors.addressCity ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                      />
                      {errors.addressCity && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.addressCity}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="addressState"
                        value={formData.addressState}
                        onChange={handleInputChange}
                        placeholder="State / Province"
                        className={`clay-input w-full px-4 py-3 text-sm ${
                          errors.addressState ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                      />
                      {errors.addressState && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.addressState}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="addressPostalCode"
                        value={formData.addressPostalCode}
                        onChange={handleInputChange}
                        placeholder="Postal / ZIP Code"
                        className={`clay-input w-full px-4 py-3 text-sm ${
                          errors.addressPostalCode ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                      />
                      {errors.addressPostalCode && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.addressPostalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="clay-btn-secondary px-5 py-3 text-sm font-semibold flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="clay-btn-primary px-6 py-3 text-sm font-bold flex items-center space-x-2"
                  >
                    <span>Next: Branding & Online</span>
                    <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Branding & Online */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#C6B7E2]/30 pb-3">
                  <h2 className="text-lg font-bold text-[#3B1C5A]">Step 3: Branding & Online Presence</h2>
                  <p className="text-xs text-[#3B1C5A]/70">
                    Storefront logo, banner, links, and tax information.
                  </p>
                </div>

                {/* Upload Logo & Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Logo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                      Store Logo <span className="text-[10px] text-[#3B1C5A]/50 font-normal">(Optional)</span>
                    </label>
                    <div className="clay-input p-4 text-center border-dashed border-2 border-[#C6B7E2]/60 hover:border-[#3B1C5A] transition-colors relative">
                      {logoPreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-16 h-16 rounded-xl object-cover mb-2 border border-[#C6B7E2]"
                          />
                          <span className="text-xs text-emerald-700 font-semibold">Image Selected</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2">
                          <UploadCloud className="w-8 h-8 text-[#3B1C5A]/40 mb-1" />
                          <span className="text-xs font-semibold text-[#3B1C5A]/80">Upload Logo</span>
                          <span className="text-[10px] text-[#3B1C5A]/50">PNG, JPG, WEBP (Max 5MB)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {errors.logo && <p className="text-xs text-rose-600 mt-1">{errors.logo}</p>}
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                      Storefront Banner <span className="text-[10px] text-[#3B1C5A]/50 font-normal">(Optional)</span>
                    </label>
                    <div className="clay-input p-4 text-center border-dashed border-2 border-[#C6B7E2]/60 hover:border-[#3B1C5A] transition-colors relative">
                      {bannerPreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            className="w-full h-16 rounded-xl object-cover mb-2 border border-[#C6B7E2]"
                          />
                          <span className="text-xs text-emerald-700 font-semibold">Banner Selected</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2">
                          <UploadCloud className="w-8 h-8 text-[#3B1C5A]/40 mb-1" />
                          <span className="text-xs font-semibold text-[#3B1C5A]/80">Upload Banner</span>
                          <span className="text-[10px] text-[#3B1C5A]/50">PNG, JPG, WEBP (Max 5MB)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {errors.banner && <p className="text-xs text-rose-600 mt-1">{errors.banner}</p>}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                    Website URL <span className="text-[10px] text-[#3B1C5A]/50 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.yourdomain.com"
                      className={`clay-input w-full pl-10 pr-4 py-3 text-sm ${
                        errors.website ? '!border-rose-400 !bg-rose-50/50' : ''
                      }`}
                    />
                  </div>
                  {errors.website && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.website}</p>}
                </div>

                {/* Tax / GST Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1.5">
                    GSTIN / Tax ID <span className="text-[10px] text-[#3B1C5A]/50 font-normal">(Conditional / Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="e.g. 27AAAAA0000A1Z5 or US-EIN"
                    className="clay-input w-full px-4 py-3 text-sm"
                  />
                  <p className="text-[11px] text-[#3B1C5A]/60 mt-1">
                    Provide if registered for commercial sales tax or GST in your jurisdiction.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="clay-btn-secondary px-5 py-3 text-sm font-semibold flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="clay-btn-primary px-6 py-3 text-sm font-bold flex items-center space-x-2"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Reviewable Summary & Live Preview */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#C6B7E2]/30 pb-3">
                  <h2 className="text-lg font-bold text-[#3B1C5A]">Step 4: Review Your Business Profile</h2>
                  <p className="text-xs text-[#3B1C5A]/70">
                    Verify all information before creating your digital storefront.
                  </p>
                </div>

                {/* Live Claymorphic Storefront Preview Card */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70 mb-2 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#E6B44C]" /> Live Storefront Card Preview
                  </h3>

                  <div className="clay-card-lavender overflow-hidden border border-white/90">
                    {/* Banner preview or gradient */}
                    <div className="h-28 bg-gradient-to-r from-[#3B1C5A] via-[#52297D] to-[#7946A8] relative">
                      {bannerPreview && (
                        <img
                          src={bannerPreview}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          New Store
                        </span>
                      </div>
                    </div>

                    <div className="p-6 relative pt-0">
                      {/* Logo avatar */}
                      <div className="-mt-10 mb-3 flex items-end justify-between">
                        <div className="w-20 h-20 rounded-2xl bg-white clay-card p-1 shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Store className="w-9 h-9 text-[#3B1C5A]" />
                          )}
                        </div>
                        <span className="clay-pill px-3 py-1 rounded-full text-xs font-bold text-[#3B1C5A]">
                          {formData.category || 'Category'}
                        </span>
                      </div>

                      <h4 className="text-xl font-extrabold text-[#3B1C5A]">{formData.name || 'Your Business Name'}</h4>
                      <p className="text-xs text-[#3B1C5A]/70 mt-1 line-clamp-2">
                        {formData.description || 'Business description will appear here...'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#C6B7E2]/30 flex flex-wrap items-center gap-4 text-xs text-[#3B1C5A]/75">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#3B1C5A]" />
                          <span>{formData.phone || 'Phone'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#3B1C5A]" />
                          <span className="truncate max-w-[200px]">
                            {formData.addressCity}, {formData.addressState}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Structured Review Summary Table */}
                <div className="p-4 rounded-2xl bg-white/70 border border-[#C6B7E2]/30 text-xs space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#3B1C5A] mb-2">
                    Submission Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#3B1C5A]/85">
                    <div>
                      <span className="text-[#3B1C5A]/60">Owner Account:</span>{' '}
                      <strong>{user?.firstName} {user?.lastName} ({user?.email})</strong>
                    </div>
                    <div>
                      <span className="text-[#3B1C5A]/60">Category:</span>{' '}
                      <strong>{formData.category}</strong>
                    </div>
                    <div>
                      <span className="text-[#3B1C5A]/60">Customer Phone:</span>{' '}
                      <strong>{formData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[#3B1C5A]/60">Full Address:</span>{' '}
                      <strong>{formData.addressStreet}, {formData.addressCity}, {formData.addressState} {formData.addressPostalCode}</strong>
                    </div>
                    {formData.website && (
                      <div>
                        <span className="text-[#3B1C5A]/60">Website:</span>{' '}
                        <strong>{formData.website}</strong>
                      </div>
                    )}
                    {formData.taxId && (
                      <div>
                        <span className="text-[#3B1C5A]/60">Tax / GST:</span>{' '}
                        <strong>{formData.taxId}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="clay-btn-secondary px-5 py-3 text-sm font-semibold flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Branding</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="clay-btn-accent px-8 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-60 cursor-pointer shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#3B1C5A]" />
                        <span>Creating Storefront...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Register Business</span>
                        <CheckCircle2 className="w-4 h-4 text-[#3B1C5A]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default MerchantBusinessRegister;

