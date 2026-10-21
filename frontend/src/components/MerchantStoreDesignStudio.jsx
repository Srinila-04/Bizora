import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Store,
  Layers,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  ArrowRight,
  Save,
  RotateCcw,
  ShoppingBag,
  PlusCircle,
  HelpCircle,
  Info,
  RefreshCw,
  CheckCheck
} from 'lucide-react';
import {
  CATEGORIES_REGISTRY,
  SUPPORTED_CATEGORIES_LIST,
  normalizeCategoryKey,
  getCategoryMetadata
} from '../config/categoryRegistry';
import {
  STOREFRONT_TEMPLATE_REGISTRY,
  getTemplatesForCategory,
  getTemplateById,
  resolveStorefrontTemplate
} from '../config/storefrontTemplateRegistry';
import { StorefrontPageRenderer } from './StorefrontTemplateRenderer';

export const MerchantStoreDesignStudio = ({
  business,
  businesses = [],
  onSwitchBusiness,
  onBusinessUpdated
}) => {
  if (!business) return null;

  // 1. Business Category Resolution
  const businessCategoryKey = useMemo(
    () => normalizeCategoryKey(business.businessType || business.category || 'fashion-apparel'),
    [business.businessType, business.category]
  );
  const businessCategoryMeta = useMemo(
    () => getCategoryMetadata(business.businessType || business.category || 'fashion-apparel'),
    [business.businessType, business.category]
  );

  // Active Category state for template gallery browsing (Step 2)
  const [galleryCategory, setGalleryCategory] = useState(businessCategoryKey);

  // Synchronize category tab when business changes
  useEffect(() => {
    setGalleryCategory(businessCategoryKey);
  }, [businessCategoryKey]);

  // Templates list for the selected gallery category (Exactly 5 Templates)
  const categoryTemplates = useMemo(() => {
    return getTemplatesForCategory(galleryCategory);
  }, [galleryCategory]);

  // Current published and draft state from business
  const currentPublishedTemplateId =
    business.themeSettings?.template ||
    businessCategoryMeta?.defaultTemplateId ||
    'universal-classic';
  const currentDraftTemplateId = business.themeSettings?.draft?.template || null;

  // Selected Template Key (Step 4)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    currentDraftTemplateId || currentPublishedTemplateId
  );

  // Synchronize selected template if business changes
  useEffect(() => {
    const published =
      business.themeSettings?.template ||
      businessCategoryMeta?.defaultTemplateId ||
      'universal-classic';
    const draft = business.themeSettings?.draft?.template || null;
    setSelectedTemplateKey(draft || published);
  }, [business, businessCategoryMeta]);

  // Interactive Storefront Preview Modal States (Step 3)
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingTemplateKey, setPreviewingTemplateKey] = useState(selectedTemplateKey);
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Publish Confirmation Modal State (Step 5)
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  // Action status states
  const [savingAction, setSavingAction] = useState(null); // 'draft' | 'publish' | null
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Products for live preview
  const [previewProducts, setPreviewProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch real products for live preview
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (!business.id) return;
      setLoadingProducts(true);
      try {
        const res = await api.get('/products', {
          params: { businessId: business.id, limit: 16 }
        });
        if (isMounted) {
          setPreviewProducts(res.data?.data?.products || []);
        }
      } catch (err) {
        console.warn('Could not load products for store design preview:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [business.id]);

  // Selected Template Definition
  const selectedTemplate = useMemo(() => {
    return getTemplateById(selectedTemplateKey);
  }, [selectedTemplateKey]);

  // Current Published Template Definition
  const currentPublishedTemplate = useMemo(() => {
    return getTemplateById(currentPublishedTemplateId);
  }, [currentPublishedTemplateId]);

  // Template currently shown inside the preview modal
  const previewModalTemplate = useMemo(() => {
    return getTemplateById(previewingTemplateKey);
  }, [previewingTemplateKey]);

  // Whether the merchant has an unpublished selection
  const hasUnpublishedSelection = selectedTemplateKey !== currentPublishedTemplateId;

  // -------------------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------------------

  // Step 4: Select a template
  const handleSelectTemplate = (tplId) => {
    setSelectedTemplateKey(tplId);
    const chosen = getTemplateById(tplId);
    setFeedbackSuccess(`Template "${chosen.name}" selected! Click "Publish Storefront" to make it live.`);
    setTimeout(() => setFeedbackSuccess(''), 5000);
  };

  // Step 3: Open full interactive preview modal
  const handleOpenPreviewModal = (tplId) => {
    setPreviewingTemplateKey(tplId);
    setPreviewModalOpen(true);
  };

  // Close preview modal
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
  };

  // Select template from inside preview modal
  const handleSelectFromPreview = (tplId) => {
    handleSelectTemplate(tplId);
  };

  // Revert back to the currently published template
  const handleRevertToPublished = () => {
    setSelectedTemplateKey(currentPublishedTemplateId);
    setFeedbackSuccess(`Reverted selection back to currently published design "${currentPublishedTemplate.name}".`);
    setTimeout(() => setFeedbackSuccess(''), 4000);
  };

  // Save selection as draft without publishing
  const handleSaveDraft = async () => {
    setSavingAction('draft');
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      await api.patch(`/businesses/${business.id}/theme`, {
        template: selectedTemplateKey,
        layout: selectedTemplate.layoutType,
        isDraft: true
      });
      if (onBusinessUpdated) await onBusinessUpdated();
      setFeedbackSuccess(`Draft saved! "${selectedTemplate.name}" saved as your draft. Live store remains unchanged.`);
      setTimeout(() => setFeedbackSuccess(''), 5000);
    } catch (err) {
      setFeedbackError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save draft design.'
      );
    } finally {
      setSavingAction(null);
    }
  };

  // Step 5: Publish live storefront after confirmation
  const handleConfirmPublish = async () => {
    setSavingAction('publish');
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      await api.patch(`/businesses/${business.id}/theme`, {
        template: selectedTemplateKey,
        layout: selectedTemplate.layoutType,
        isDraft: false
      });
      if (onBusinessUpdated) await onBusinessUpdated();
      setPublishConfirmOpen(false);
      setPreviewModalOpen(false);
      setFeedbackSuccess(
        `Storefront published live successfully! Customers visiting your store will now experience the "${selectedTemplate.name}" design.`
      );
      setTimeout(() => setFeedbackSuccess(''), 7000);
    } catch (err) {
      setFeedbackError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to publish storefront design.'
      );
    } finally {
      setSavingAction(null);
    }
  };

  return (
    <div className="w-full space-y-8 font-sans pb-16">
      {/* =====================================================================
          1. HEADER & STORE CONTEXT BAR (Step 1: Open Store Design)
         ===================================================================== */}
      <div className="clay-card p-6 sm:p-8 bg-white/85 backdrop-blur-md border border-[#C6B7E2]/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Store Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-sm shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 data-testid="storefront-design-heading" className="text-xl sm:text-2xl font-black tracking-tight text-[#3B1C5A]">
                    Storefront Design
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF5EE] text-[#3B1C5A] border border-[#E6B44C]/60">
                    Template Studio
                  </span>
                </div>
                <p className="text-xs text-[#3B1C5A]/70 mt-0.5">
                  Select from five category-crafted storefront templates, preview with your actual products, and publish to customers.
                </p>
              </div>
            </div>

            {/* Store Information Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#3B1C5A]/80">
              <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                <Store className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>{business.name}</span>
              </div>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#F6F1E8] font-bold text-[#3B1C5A] border border-[#C6B7E2]/40 text-[11px]">
                {businessCategoryMeta?.name || business.category || 'General Store'}
              </span>
              <span>•</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Template: {currentPublishedTemplate.name}</span>
              </div>

              {/* Multi-business switcher if merchant owns multiple stores */}
              {businesses.length > 1 && (
                <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#C6B7E2]/50">
                  <span className="text-[11px] text-[#3B1C5A]/60">Switch Store:</span>
                  <select
                    value={business.id}
                    onChange={(e) => {
                      const found = businesses.find((b) => b.id === e.target.value);
                      onSwitchBusiness?.(found || e.target.value);
                    }}
                    className="text-xs bg-white border border-[#C6B7E2] rounded-xl px-2.5 py-1 text-[#3B1C5A] font-bold focus:outline-none focus:ring-2 focus:ring-[#E6B44C]"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.category || 'Store'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/customer/stores/${business.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn-secondary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:bg-white transition-all shadow-xs"
              title="Open customer storefront in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#3B1C5A]" />
              <span>View Customer Storefront</span>
            </Link>

            <button
              type="button"
              onClick={() => setPublishConfirmOpen(true)}
              className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#E6B44C]" />
              <span>Publish Storefront</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback Alert Messages */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-[#3B1C5A] text-white text-xs font-bold shadow-lg flex items-center justify-between gap-3 border border-[#E6B44C] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#E6B44C] shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <Link
            to={`/customer/stores/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-[#E6B44C] text-[#3B1C5A] rounded-xl font-black hover:bg-[#d8a742] transition-colors shrink-0"
          >
            View Live Store →
          </Link>
        </div>
      )}

      {feedbackError && (
        <div className="p-4 rounded-2xl bg-rose-900 text-white text-xs font-bold shadow-lg flex items-center gap-2.5 border border-rose-400 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* =====================================================================
          2. STEP 2: SELECT PRODUCT CATEGORY
         ===================================================================== */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3B1C5A] text-[#E6B44C] text-xs font-black flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-extrabold text-[#3B1C5A]">
                Select Product Category
              </h2>
            </div>
            <p className="text-xs text-[#3B1C5A]/70 ml-8 mt-0.5">
              Choose your store category to display its five specialized storefront templates.
            </p>
          </div>

          <span className="text-[11px] font-bold text-[#3B1C5A]/60 ml-8 sm:ml-0">
            Showing category: <strong className="text-[#3B1C5A]">{CATEGORIES_REGISTRY[galleryCategory]?.name || 'Adaptive'}</strong> ({categoryTemplates.length} Templates)
          </span>
        </div>

        {/* Category Pills Scroller */}
        <div data-testid="category-pills-bar" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SUPPORTED_CATEGORIES_LIST.map((cat) => {
            const isCurrentGalleryCat = galleryCategory === cat.id;
            const isStoreNativeCat = businessCategoryKey === cat.id;
            const count = getTemplatesForCategory(cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setGalleryCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
                  isCurrentGalleryCat
                    ? 'bg-[#3B1C5A] text-white border-[#3B1C5A] shadow-md ring-2 ring-[#E6B44C]/60'
                    : 'bg-white hover:bg-[#FAF5EE] text-[#3B1C5A] border-[#C6B7E2]/60 shadow-xs'
                }`}
              >
                <span>{cat.name}</span>
                {isStoreNativeCat && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black ${
                      isCurrentGalleryCat
                        ? 'bg-[#E6B44C] text-[#3B1C5A]'
                        : 'bg-[#FAF5EE] text-[#3B1C5A] border border-[#E6B44C]/50'
                    }`}
                  >
                    Your Store
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCurrentGalleryCat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Universal Adaptive Category */}
          <button
            type="button"
            onClick={() => setGalleryCategory('universal')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
              galleryCategory === 'universal'
                ? 'bg-[#3B1C5A] text-white border-[#3B1C5A] shadow-md ring-2 ring-[#E6B44C]/60'
                : 'bg-white hover:bg-[#FAF5EE] text-[#3B1C5A] border-[#C6B7E2]/60 shadow-xs'
            }`}
          >
            <span>Universal Adaptive</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                galleryCategory === 'universal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              5
            </span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          3. STEPS 3 & 4: TEMPLATE CARDS DISPLAY
         ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3B1C5A] text-[#E6B44C] text-xs font-black flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-extrabold text-[#3B1C5A]">
                Choose &amp; Preview Storefront Templates
              </h2>
            </div>
            <p className="text-xs text-[#3B1C5A]/70 ml-8 mt-0.5">
              Review each design, preview the full storefront with your actual products, and select your preferred layout.
            </p>
          </div>

          <div className="text-xs text-[#3B1C5A]/70 ml-8 sm:ml-0 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6B44C]" />
            <span>Currently Selected: <strong className="text-[#3B1C5A]">{selectedTemplate.name}</strong></span>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${categoryTemplates.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-6`}>
          {categoryTemplates.map((tpl, index) => {
            const isSelected = selectedTemplateKey === tpl.id;
            const isLive = currentPublishedTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                className={`clay-card rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
                  isSelected
                    ? 'ring-3 ring-[#E6B44C] border-[#3B1C5A] shadow-xl bg-white scale-[1.02]'
                    : 'border-[#C6B7E2]/50 hover:border-[#3B1C5A]/50 bg-white/90 hover:shadow-lg'
                }`}
              >
                {/* Card Top: Preview Visual & Badges */}
                <div className="relative w-full overflow-hidden bg-slate-100">
                  {/* Status Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs shadow-xs">
                      #{index + 1} • {tpl.layoutType}
                    </span>

                    <div className="flex items-center gap-1">
                      {isLive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Live</span>
                        </span>
                      )}

                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#E6B44C] text-[#3B1C5A] shadow-xs flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-[#3B1C5A]" />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Template Preview Image or Visual Blueprint */}
                  {tpl.previewImage ? (
                    <div className="h-56 sm:h-64 w-full overflow-hidden relative group-hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => handleOpenPreviewModal(tpl.id)}>
                      <img
                        src={tpl.previewImage}
                        alt={`${tpl.name} reference design preview`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <span className="text-[11px] font-bold text-white bg-black/70 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                          <Eye className="w-3 h-3 text-[#E6B44C]" />
                          <span>Click to Preview Storefront</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* High-fidelity Visual Blueprint Fallback for Categories with Pending Static Images */
                    <div
                      className={`h-56 sm:h-64 w-full bg-gradient-to-br ${tpl.tokens?.headerGradient || 'from-slate-800 to-slate-900'} p-5 flex flex-col justify-between text-white relative cursor-pointer`}
                      onClick={() => handleOpenPreviewModal(tpl.id)}
                    >
                      <div className="pt-6 space-y-1">
                        <span className="text-[9px] font-mono tracking-widest uppercase opacity-75 block">
                          DESIGN BLUEPRINT
                        </span>
                        <h4 className="font-bold text-sm leading-snug drop-shadow-sm">
                          {tpl.name}
                        </h4>
                      </div>

                      {/* Mock Layout Structure & Color Swatches */}
                      <div className="space-y-3 bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="opacity-80">Color Identity</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                              style={{ backgroundColor: tpl.tokens?.primary || '#3B1C5A' }}
                              title="Primary brand token"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                              style={{ backgroundColor: tpl.tokens?.secondary || '#E6B44C' }}
                              title="Secondary brand token"
                            />
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ backgroundColor: tpl.tokens?.secondary || '#E6B44C', width: '60%' }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] opacity-75 font-mono">
                          <span>{tpl.categoryName}</span>
                          <span>Interactive Preview Available</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Middle: Information */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-[#3B1C5A] tracking-tight">
                      {tpl.name}
                    </h3>
                    <p className="text-[11px] text-[#3B1C5A]/70 line-clamp-2 leading-relaxed">
                      {tpl.tagline || tpl.description}
                    </p>
                  </div>

                  {/* Card Bottom: Two Explicit Action Buttons (Preview & Select) */}
                  <div className="pt-3 border-t border-[#C6B7E2]/30 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Step 3: Preview Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPreviewModal(tpl.id)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-[#FAF5EE] hover:bg-[#F6F1E8] text-[#3B1C5A] border border-[#C6B7E2]/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title={`Preview ${tpl.name} with real store data`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#3B1C5A]" />
                        <span>Preview</span>
                      </button>

                      {/* Step 4: Select Template Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-[#3B1C5A] text-white shadow-sm'
                            : 'bg-white hover:bg-[#3B1C5A] hover:text-white text-[#3B1C5A] border border-[#3B1C5A]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Choose Template</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          4. STEP 4 (DETAIL) & STEP 5: SELECTED TEMPLATE ACTION DOCK
         ===================================================================== */}
      <section className="clay-card p-6 sm:p-8 bg-white/90 border border-[#C6B7E2]/60 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Selected Template Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3B1C5A] text-[#E6B44C] text-xs font-black flex items-center justify-center">
                3
              </span>
              <h2 className="text-base font-extrabold text-[#3B1C5A]">
                Review Selection & Publish Live
              </h2>
            </div>

            <div className="ml-8 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-[#3B1C5A]">
                  Selected Design: {selectedTemplate.name}
                </span>

                {hasUnpublishedSelection ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    Unpublished Selection
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Active on Customer Storefront
                  </span>
                )}
              </div>

              <p className="text-xs text-[#3B1C5A]/70 max-w-2xl leading-relaxed">
                {selectedTemplate.description}
              </p>
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 ml-8 lg:ml-0">
            {hasUnpublishedSelection && (
              <button
                type="button"
                onClick={handleRevertToPublished}
                title="Discard selection and restore live published template"
                className="clay-btn-secondary px-3.5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#3B1C5A]" />
                <span>Revert</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenPreviewModal(selectedTemplateKey)}
              className="clay-btn-secondary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:bg-white"
            >
              <Eye className="w-3.5 h-3.5 text-[#3B1C5A]" />
              <span>Full Preview</span>
            </button>

            <button
              type="button"
              disabled={savingAction !== null}
              onClick={handleSaveDraft}
              className="clay-btn-secondary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:bg-white"
            >
              {savingAction === 'draft' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
              ) : (
                <Save className="w-3.5 h-3.5 text-[#3B1C5A]" />
              )}
              <span>Save as Draft</span>
            </button>

            {/* Step 5: Prominent Publish Action */}
            <button
              type="button"
              disabled={savingAction !== null}
              onClick={() => setPublishConfirmOpen(true)}
              className="clay-btn-primary px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              {savingAction === 'publish' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#E6B44C]" />
              )}
              <span>Publish Storefront Design</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. STEP 5: PUBLISH CONFIRMATION MODAL
         ===================================================================== */}
      {publishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-6 sm:p-8 bg-white border border-[#C6B7E2] shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] border border-[#E6B44C]/60 flex items-center justify-center text-[#3B1C5A] shrink-0">
                <Sparkles className="w-6 h-6 text-[#E6B44C]" />
              </div>
              <button
                type="button"
                onClick={() => setPublishConfirmOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-[#3B1C5A]">
                Publish Storefront Design?
              </h3>
              <p className="text-xs text-[#3B1C5A]/80 leading-relaxed">
                You are about to publish the <strong>{selectedTemplate.name}</strong> template as the active storefront for <strong>{business.name}</strong>.
              </p>
              <p className="text-xs text-[#3B1C5A]/80 leading-relaxed">
                Customers visiting your store will immediately see this new storefront layout. You can return anytime to select another template or make updates.
              </p>

              {/* Design Comparison Summary */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#C6B7E2]/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#3B1C5A]/60">Currently Published:</span>
                  <span className="font-bold text-slate-700">{currentPublishedTemplate.name}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#C6B7E2]/40 pt-2">
                  <span className="text-[#3B1C5A]/60">New Live Design:</span>
                  <span className="font-extrabold text-[#3B1C5A] flex items-center gap-1">
                    <span>{selectedTemplate.name}</span>
                    <Sparkles className="w-3 h-3 text-[#E6B44C]" />
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={savingAction !== null}
                onClick={() => setPublishConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingAction !== null}
                onClick={handleConfirmPublish}
                className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingAction === 'publish' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#E6B44C]" />
                )}
                <span>Yes, Publish Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. FULL-SCREEN INTERACTIVE STOREFRONT PREVIEW MODAL (Step 3 Preview)
         ===================================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Preview Bar with Viewport Switcher & Actions */}
          <div className="bg-[#3B1C5A] text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-[#E6B44C]/30 shadow-md shrink-0">
            {/* Left: Template Details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E6B44C]">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">
                    Preview: {previewModalTemplate.name}
                  </h3>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#E6B44C] text-[#3B1C5A]">
                    {previewModalTemplate.categoryName}
                  </span>
                </div>
                <p className="text-[11px] text-white/70">
                  Rendering {business.name} with real store products & catalog data
                </p>
              </div>
            </div>

            {/* Center: Device Viewport Switcher */}
            <div className="hidden md:flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-[#E6B44C] text-[#3B1C5A] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport('tablet')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewViewport === 'tablet'
                    ? 'bg-[#E6B44C] text-[#3B1C5A] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-[#E6B44C] text-[#3B1C5A] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px)</span>
              </button>
            </div>

            {/* Right: Modal Actions */}
            <div className="flex items-center gap-2.5">
              {selectedTemplateKey !== previewingTemplateKey ? (
                <button
                  type="button"
                  onClick={() => handleSelectFromPreview(previewingTemplateKey)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E6B44C] text-[#3B1C5A] hover:bg-[#d8a742] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Select This Template</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPublishConfirmOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E6B44C] text-[#3B1C5A] hover:bg-[#d8a742] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish This Design</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClosePreviewModal}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close preview modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main: Viewport Frame Rendering Actual Storefront */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start bg-slate-950/40">
            <div
              className={`transition-all duration-300 ${
                previewViewport === 'desktop'
                  ? 'w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden'
                  : previewViewport === 'tablet'
                  ? 'w-[768px] rounded-3xl border-8 border-slate-900 bg-white shadow-2xl overflow-hidden my-4'
                  : 'w-[390px] rounded-3xl border-8 border-slate-900 bg-white shadow-2xl overflow-hidden my-4'
              }`}
            >
              {/* Storefront Page Renderer with Real Store Data */}
              <StorefrontPageRenderer
                business={business}
                products={previewProducts}
                template={previewModalTemplate}
                isPreview={true}
              />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#3B1C5A] text-white px-6 py-3 flex items-center justify-between border-t border-[#E6B44C]/30 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E6B44C]" />
              <span>
                Viewing {previewModalTemplate.name} with real product pricing, images, and live shopping flow
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClosePreviewModal}
                className="px-4 py-1.5 text-xs text-white/80 hover:text-white"
              >
                Close Preview
              </button>

              {selectedTemplateKey !== previewingTemplateKey && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectFromPreview(previewingTemplateKey);
                    setPreviewModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#E6B44C] text-[#3B1C5A] hover:bg-[#d8a742] transition-all cursor-pointer"
                >
                  Choose This Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantStoreDesignStudio;
