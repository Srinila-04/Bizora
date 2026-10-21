import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Tag,
  Palette,
  ShieldCheck,
  Truck,
  Cpu,
  Layers,
  Award,
  Leaf,
  HeartHandshake,
  Compass,
  BookOpen,
  Dumbbell,
  Wrench,
  Briefcase,
  Clock,
  Flame,
  Coffee,
  Check,
  Zap,
  RotateCcw,
  Package
} from 'lucide-react';
import { resolveStorefrontTemplate } from '../config/storefrontTemplates';
import { normalizeCategoryKey, getCategoryMetadata } from '../config/categoryRegistry';
import {
  FashionAarohiEthnicTemplate,
  FashionKynaChikankariTemplate,
  FashionAuroraMinimalTemplate,
  FashionVibrantPopTemplate,
  FashionDarkHeritageTemplate,
  FashionEditorialLuxuryTemplate,
  FashionNoirMonochromeTemplate,
  FashionArtisanalEarthTemplate
} from './templates/fashion';
import {
  BeautyGloweriveSkincareTemplate,
  BeautyGlowcareWellnessTemplate,
  BeautyEloraLavenderTemplate
} from './templates/beauty';
import {
  ElectronicsTechnovaModernTemplate,
  ElectronicsAuroraCyberTemplate,
  ElectronicsTechhavenNeonTemplate
} from './templates/electronics';
import { UniversalModularStorefrontTemplate } from './UniversalModularStorefrontTemplate';

/**
 * Helper to extract location string from business object
 */
export const getFormattedBusinessLocation = (business) => {
  if (!business) return 'India';
  const addr = business.addressDetails || {};
  const parts = [];
  if (addr.district || addr.city) parts.push(addr.district || addr.city);
  if (addr.state) parts.push(addr.state);
  if (parts.length > 0) return parts.join(', ');
  if (business.address) return business.address;
  return 'India';
};

/**
 * Top Storefront Disambiguation & Context Header
 * Displayed at the top of the product detail page and storefront page
 */
export const StorefrontContextBanner = ({ business, isProductPage = false, backUrl = null, isPreview = false }) => {
  if (!business) return null;
  const template = resolveStorefrontTemplate(business, isPreview);
  const { tokens } = template;
  const storeUrl = `/customer/stores/${business.id || business.slug}`;

  return (
    <aside
      aria-label="Storefront Context Notice"
      className={`p-3.5 px-4.5 rounded-2xl ${tokens.badgeSecondary} text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs border transition-all`}
    >
      <div className="flex items-center gap-2">
        <Store className="w-4 h-4 shrink-0 opacity-80" />
        <span className="leading-snug">
          {isProductPage ? (
            <>
              You are viewing this product within <strong>{business.name}&apos;s</strong> dedicated storefront ({template.name}).
            </>
          ) : (
            <>
              You are browsing <strong>{business.name}&apos;s</strong> official storefront catalog ({template.name}).
            </>
          )}
        </span>
        {template.isDraftPreview && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
            Draft Preview
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isProductPage && (
          <Link
            to={storeUrl}
            className="text-xs font-bold underline hover:opacity-80 flex items-center gap-1 transition-opacity"
          >
            <span>Visit Full Store</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
        <Link
          to={backUrl || "/customer/shop"}
          className="text-xs font-bold opacity-80 hover:opacity-100 flex items-center gap-1 transition-opacity"
        >
          <span>Marketplace Shop</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};

/**
 * Full Storefront Branding Banner Header
 * Supports distinct layout styles:
 * - 'editorial-spacious': Minimalist, expansive magazine-style header with generous whitespace
 * - 'specs-dense': Technical, structured header with hardware metrics and dark accents
 * - 'compact-quick': High-efficiency marketplace canopy with rapid category tags
 * - 'story-boutique': Warm handcrafted boutique header with craftsman provenance
 */
export const StorefrontHeaderBanner = ({
  business,
  showFullDetails = true,
  isPreview = false,
  previewTemplate = null
}) => {
  if (!business) return null;
  const template = previewTemplate || resolveStorefrontTemplate(business, isPreview);
  const { tokens } = template;
  const layoutType = template.layoutType || 'story-boutique';
  const storeUrl = `/customer/stores/${business.id || business.slug}`;
  const bannerHeightClass = template.headerLayout?.bannerHeight || 'h-36 sm:h-48';

  // =========================================================================
  // VARIANT 1: EDITORIAL SPACIOUS (Minimal Luxe, Haute Couture, Architecture)
  // =========================================================================
  if (layoutType === 'editorial-spacious') {
    return (
      <section
        aria-label="Merchant Storefront Information"
        className={`overflow-hidden border ${tokens.border} ${tokens.cardBg} ${tokens.roundedCard} shadow-sm transition-all`}
      >
        {/* Full-width refined hero banner */}
        <div className={`${bannerHeightClass} w-full bg-gradient-to-r ${tokens.headerGradient} relative overflow-hidden flex items-center justify-between p-6 sm:p-10`}>
          {business.banner && (
            <img
              src={business.banner}
              alt={`${business.name} Banner`}
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Top-right template badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/30 hidden sm:inline-block">
              {template.cardLayout?.categoryTag || 'Editorial Studio'}
            </span>
            <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/60 text-white backdrop-blur-md border border-white/20">
              {template.name}
            </span>
          </div>

          {/* Floating Editorial Quote / Slogan */}
          <div className="relative z-10 max-w-xl text-white">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 block mb-1">
              Curated Merchant Experience
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-black tracking-tight drop-shadow-sm">
              {business.name}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-serif italic mt-1 line-clamp-1">
              {business.description || template.tagline}
            </p>
          </div>
        </div>

        {/* Brand bar with minimalist alignment */}
        <div className="p-6 sm:p-8 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-black/5 pb-5">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 ${tokens.roundedCard} bg-white border-2 ${tokens.border} shadow-lg overflow-hidden flex items-center justify-center shrink-0 -mt-12 relative z-20`}>
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Store className="w-10 h-10 opacity-70 text-slate-700" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl sm:text-3xl font-serif font-black ${tokens.textPrimary}`}>
                    {business.name}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Independent Brand" />
                </div>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span className={`${tokens.badgePrimary} px-3 py-0.5 ${tokens.roundedBadge} text-[10px] font-bold uppercase tracking-widest`}>
                    {business.category || template.categoryName}
                  </span>
                  <span className={`flex items-center gap-1 ${tokens.textMuted} text-xs`}>
                    <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    <span>{getFormattedBusinessLocation(business)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Navigation CTAs */}
            <div className="flex items-center gap-2.5">
              <Link
                to={storeUrl}
                className={`${tokens.btnPrimary} px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-sm uppercase tracking-wider`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Storefront Catalog</span>
              </Link>
              <Link
                to="/customer/shop"
                className={`${tokens.btnSecondary} px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Global Shop</span>
              </Link>
            </div>
          </div>

          {showFullDetails && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <p className={`${tokens.textSecondary} max-w-2xl font-serif leading-relaxed text-xs sm:text-sm`}>
                {business.description || 'Exclusive curated collection directly from the creator.'}
              </p>
              <div className="flex items-center gap-4 text-xs shrink-0 font-medium">
                {business.phone && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5 opacity-70" />
                    <span>{business.phone}</span>
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Mail className="w-3.5 h-3.5 opacity-70" />
                    <span>{business.email}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // =========================================================================
  // VARIANT 2: SPECS DENSE (Tech Minimal, Gaming Zone, Spec Precision, Garage)
  // =========================================================================
  if (layoutType === 'specs-dense') {
    return (
      <section
        aria-label="Merchant Storefront Information"
        className={`overflow-hidden border-2 ${tokens.border} ${tokens.cardBg} ${tokens.roundedCard} shadow-md transition-all`}
      >
        {/* High-tech top status bar */}
        <div className="bg-slate-900 px-5 py-2 text-white flex items-center justify-between text-[11px] font-mono border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              {template.name} • Official Hardware & Tech Storefront
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">100% Genuine Components</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">Verified Merchant Tier</span>
          </div>
        </div>

        {/* Technical Banner */}
        <div className={`${bannerHeightClass} w-full bg-gradient-to-r ${tokens.headerGradient} relative overflow-hidden flex items-center p-6 sm:p-8`}>
          {business.banner && (
            <img
              src={business.banner}
              alt={`${business.name} Banner`}
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-slate-950/70" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Cpu className="w-8 h-8 text-cyan-400" />
                )}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-mono font-black tracking-tight text-white">
                    {business.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold">
                    SPEC VERIFIED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Category: {business.category || template.categoryName} • Region: {getFormattedBusinessLocation(business)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={storeUrl}
                className={`${tokens.btnPrimary} px-4 py-2 text-xs font-mono font-bold inline-flex items-center gap-1.5 shadow-sm rounded-xl`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Browse Inventory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Specs Highlights Toolbar */}
        {showFullDetails && (
          <div className="p-4 sm:p-5 bg-slate-900/5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center flex-wrap gap-4 text-slate-700 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Original Manufacturer Guarantee</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Dispatched Directly from Merchant Facility</span>
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
              {business.phone && <span>Support: {business.phone}</span>}
              {business.email && <span>Email: {business.email}</span>}
            </div>
          </div>
        )}
      </section>
    );
  }

  // =========================================================================
  // VARIANT 3: COMPACT QUICK (Fresh Harvest, Fast Tech, Streetwear Drop, Pantry)
  // =========================================================================
  if (layoutType === 'compact-quick') {
    return (
      <section
        aria-label="Merchant Storefront Information"
        className={`overflow-hidden border ${tokens.border} ${tokens.cardBg} ${tokens.roundedCard} shadow-sm transition-all`}
      >
        <div className={`${bannerHeightClass} w-full bg-gradient-to-r ${tokens.headerGradient} relative overflow-hidden flex items-center p-5 sm:p-7`}>
          {business.banner && (
            <img
              src={business.banner}
              alt={`${business.name} Banner`}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-16 h-16 sm:w-18 sm:h-18 ${tokens.roundedCard} bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0`}>
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <ShoppingBag className="w-7 h-7 text-emerald-700" />
                )}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    {business.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[9px] uppercase tracking-wider">
                    FAST SHOP
                  </span>
                </div>
                <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                  {business.description || template.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-xs border border-white/25">
                {template.name}
              </span>
              <Link
                to={storeUrl}
                className={`${tokens.btnPrimary} px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm rounded-xl`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store Catalog</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick shopping trust bar */}
        {showFullDetails && (
          <div className="p-3.5 px-6 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-4 font-semibold text-[11px]">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Rapid Dispatch Ready</span>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Direct From Merchant Inventory</span>
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-medium">
              Location: {getFormattedBusinessLocation(business)}
            </div>
          </div>
        )}
      </section>
    );
  }

  // =========================================================================
  // VARIANT 4: STORY BOUTIQUE (Artisan Roaster, Parisian, Botanical, Library)
  // =========================================================================
  return (
    <section
      aria-label="Merchant Storefront Information"
      className={`overflow-hidden border ${tokens.border} ${tokens.cardBg} ${tokens.roundedCard} relative shadow-sm transition-all`}
    >
      {/* Banner Backdrop */}
      <div className={`${bannerHeightClass} w-full bg-gradient-to-r ${tokens.headerGradient} relative overflow-hidden transition-all duration-300`}>
        {business.banner && (
          <img
            src={business.banner}
            alt={`${business.name} Banner`}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Template watermark badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
          {template.cardLayout?.categoryTag && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20 hidden sm:inline-block">
              {template.cardLayout.categoryTag}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/50 text-white/95 backdrop-blur-md border border-white/25">
            {template.name}
          </span>
          {template.isDraftPreview && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-sm">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Store Identity Content */}
      <div className="p-5 sm:p-7 -mt-10 sm:-mt-12 relative z-10 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-3.5 sm:gap-4">
            {/* Store Logo */}
            <div
              className={`w-18 h-18 sm:w-22 sm:h-22 ${tokens.roundedCard} bg-white border-2 ${tokens.border} shadow-xl overflow-hidden flex items-center justify-center shrink-0 text-slate-800`}
            >
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Store className="w-8 h-8 opacity-60" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Link to={storeUrl} className="group flex items-center gap-1.5">
                  <h1 className={`text-xl sm:text-2xl font-black ${tokens.textPrimary} ${tokens.fontHeading} group-hover:opacity-85 transition-opacity`}>
                    {business.name}
                  </h1>
                </Link>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Independent Merchant" />
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs mt-1">
                <span className={`${tokens.badgePrimary} px-2.5 py-0.5 ${tokens.roundedBadge} text-[10px] font-bold uppercase tracking-wider`}>
                  {business.category || template.categoryName || 'Independent Store'}
                </span>
                <span className={`flex items-center gap-1 ${tokens.textSecondary} text-[11px]`}>
                  <MapPin className="w-3 h-3 text-[#E6B44C] shrink-0" />
                  <span>{getFormattedBusinessLocation(business)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <Link
              to={storeUrl}
              className={`${tokens.btnPrimary} px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Storefront</span>
            </Link>
            <Link
              to="/customer/shop"
              className={`${tokens.btnSecondary} px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Global Shop</span>
            </Link>
          </div>
        </div>

        {/* Store Description & Details */}
        {showFullDetails && business.description && (
          <p className={`text-xs sm:text-sm ${tokens.textSecondary} max-w-3xl leading-relaxed pt-1 font-serif`}>
            {business.description}
          </p>
        )}

        {/* Store Contact Snippets */}
        {showFullDetails && (
          <div className={`pt-2 flex items-center flex-wrap gap-4 text-xs ${tokens.textMuted} border-t ${tokens.border}`}>
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 opacity-60" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 opacity-60" />
                <span>{business.email}</span>
              </div>
            )}
            {business.website && (
              <a
                href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline text-[#3B1C5A]"
              >
                <Globe className="w-3 h-3 opacity-60" />
                <span>Official Website</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Category-Specific Feature Banner
 * Visually communicates the distinct shopping characteristics of the merchant's category
 */
export const CategoryHeroFeature = ({ categoryId, template }) => {
  const normKey = normalizeCategoryKey(categoryId || 'food-beverage');
  const tokens = template?.tokens || {};

  switch (normKey) {
    case 'fashion-apparel':
      return (
        <aside
          aria-label="Fashion & Apparel Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white shadow-sm border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-serif tracking-wide text-white">
                  Curated Lookbook & Outfit Framing
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                  Seasonal Drops
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 font-serif">
                3:4 Portrait Lookbook imagery, garment fabric transparency, and size variant selections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-medium text-neutral-300">
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">100% Authentic Fabric</span>
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">Tailored Fit Guide</span>
          </div>
        </aside>
      );

    case 'electronics-gadgets':
      return (
        <aside
          aria-label="Electronics & Gadgets Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-sm border border-cyan-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-mono tracking-tight text-white">
                  Technical Specifications & Architecture
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 uppercase">
                  Verified SKU
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Technical compare tags, SKU identifiers, real-time stock levels, and compatibility guarantee.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-cyan-300">
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-cyan-700/50">Hardware Warranty</span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-cyan-700/50">Direct OEM Supply</span>
          </div>
        </aside>
      );

    case 'beauty-personal-care':
      return (
        <aside
          aria-label="Beauty & Personal Care Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-rose-50/80 text-rose-950 shadow-sm border border-rose-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-200/60 flex items-center justify-center shrink-0 text-rose-600">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950">
                  Clean Ingredients & Dermatological Care
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-200 text-rose-900 uppercase">
                  Cruelty Free
                </span>
              </div>
              <p className="text-xs text-rose-800/80 mt-0.5">
                Gentle formulations, dermatologically inspected, vegan certified, and transparent routine steps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-rose-900">
            <span className="px-3 py-1 rounded-xl bg-white border border-rose-200">Paraben Free</span>
            <span className="px-3 py-1 rounded-xl bg-white border border-rose-200">pH Balanced</span>
          </div>
        </aside>
      );

    case 'home-living':
      return (
        <aside
          aria-label="Home & Living Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-[#FAF6F0] text-[#3E2723] shadow-sm border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-serif text-[#3E2723]">
                  Room Architecture & Material Blueprint
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900 uppercase">
                  16:10 Showroom Aspect
                </span>
              </div>
              <p className="text-xs text-[#5D4037] mt-0.5 font-serif">
                Dimensional fit guidance, timber and joinery provenance, and spatial aesthetic styling.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-medium text-[#3E2723]">
            <span className="px-3 py-1 rounded-xl bg-white border border-amber-200">Solid Joinery</span>
            <span className="px-3 py-1 rounded-xl bg-white border border-amber-200">Room Fit Guarantee</span>
          </div>
        </aside>
      );

    case 'food-beverage':
      return (
        <aside
          aria-label="Food & Beverage Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-emerald-950 text-emerald-50 shadow-sm border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/60 flex items-center justify-center shrink-0 text-emerald-300">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-emerald-100">
                  Harvest Freshness & Flavor Profiles
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400 text-emerald-950 uppercase">
                  Farm Direct
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Batch roast dates, flavor tasting notes, 100% natural ingredients, and quick basket replenishment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-medium text-emerald-200">
            <span className="px-3 py-1 rounded-xl bg-emerald-900 border border-emerald-700">Artisan Roasted</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-900 border border-emerald-700">Small Batch</span>
          </div>
        </aside>
      );

    case 'artisanal-handmade':
      return (
        <aside
          aria-label="Artisanal & Handmade Highlights"
          className="p-4 sm:p-5 rounded-3xl bg-amber-50 text-amber-950 shadow-sm border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-900">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-serif text-amber-950">
                  Master Craftsman Guild & Heritage Provenance
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-300 text-amber-950 uppercase">
                  Handcrafted
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 font-serif">
                100% handmade in individual atelier studios. Numbered artisan batches with certificate of provenance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-serif font-bold text-amber-900">
            <span className="px-3 py-1 rounded-xl bg-white border border-amber-300">Maker Signed</span>
            <span className="px-3 py-1 rounded-xl bg-white border border-amber-300">Traditional Techniques</span>
          </div>
        </aside>
      );

    default:
      return null;
  }
};

/**
 * Story & Merchant Philosophy Spotlight
 * Used in 'story-boutique' layouts to showcase independent seller authenticity
 */
export const StorefrontStorySection = ({ business, template }) => {
  if (!business || !business.description) return null;
  const tokens = template?.tokens || {};

  return (
    <section
      aria-label="Merchant Story Spotlight"
      className={`p-6 sm:p-8 rounded-3xl ${tokens.cardBg || 'bg-white'} border ${tokens.border || 'border-amber-200'} shadow-sm space-y-4`}
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
        <HeartHandshake className="w-4 h-4 text-amber-600" />
        <span>Merchant Heritage & Philosophy</span>
      </div>
      <blockquote className={`text-sm sm:text-base ${tokens.textPrimary} font-serif italic leading-relaxed`}>
        &ldquo;{business.description}&rdquo;
      </blockquote>
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-black/5">
        <span className="font-semibold text-slate-700">{business.name} • Independent Partner</span>
        <span>Verified Bizora Merchant Hub</span>
      </div>
    </section>
  );
};

/**
 * Master Category Storefront Page Renderer
 * Inspects business template and renders the dedicated category template experience
 */
export const StorefrontPageRenderer = ({
  business,
  products = [],
  template: templateOverride = null,
  isPreview = false,
  customColors = {},
  onOpenContact = null,
  fallbackView = null,
  isEditable = false,
  selectedSectionId = null,
  onSelectSection = null,
  contentOverrides = null,
  sectionOrder = null,
  customSections = null
}) => {
  if (!business) return null;
  const template = templateOverride || resolveStorefrontTemplate(business, isPreview);
  const templateId = template?.id || '';
  const effectiveContentOverrides = contentOverrides || template?.contentOverrides || {};
  const effectiveSectionOrder = sectionOrder || template?.sectionOrder || null;
  const effectiveCustomSections = customSections || template?.customSections || {};

  // If viewing outside editor, check if specific dedicated fashion templates apply
  // without conflicting with merchant custom section overrides
  const hasCustomOverrides = Object.keys(effectiveContentOverrides).length > 0;
  if (!isEditable && !hasCustomOverrides) {
    // 1. Template 1: Aarohi Ethnic Wear (Traditional Meets Trendy)
    if (templateId === 'fashion-aarohi-ethnic' || templateId === 'fashion-editorial-luxury') {
      return (
        <FashionAarohiEthnicTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 2. Template 2: KYNA Studio Chikankari Atelier (Terracotta Craft)
    if (templateId === 'fashion-kyna-chikankari' || templateId === 'fashion-artisanal-earth' || templateId === 'fashion-modern-boutique') {
      return (
        <FashionKynaChikankariTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 3. Template 3: AURORA Contemporary Sage & Everyday Lifestyle
    if (templateId === 'fashion-aurora-minimal' || templateId === 'fashion-minimal-luxe') {
      return (
        <FashionAuroraMinimalTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 4. Template 4: Vibrant Pop & Streetwear (John Clothes Style)
    if (templateId === 'fashion-vibrant-pop' || templateId === 'fashion-trend-pop') {
      return (
        <FashionVibrantPopTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 5. Template 5: Timeless Dark Atelier (Vlore Style)
    if (templateId === 'fashion-dark-heritage' || templateId === 'fashion-editorial-studio' || templateId === 'fashion-noir-monochrome' || templateId === 'fashion-urban-street') {
      return (
        <FashionDarkHeritageTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // =============================================================
    // BEAUTY & PERSONAL CARE DEDICATED REFERENCE TEMPLATES (3)
    // =============================================================
    // 1. Beauty Template 1: Glowérive Natural Skincare
    if (templateId === 'beauty-glowerive-skincare' || templateId === 'beauty-clean-botanical') {
      return (
        <BeautyGloweriveSkincareTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 2. Beauty Template 2: GlowCare Health & Beauty
    if (templateId === 'beauty-glowcare-wellness' || templateId === 'beauty-glamour-studio' || templateId === 'beauty-vibrant-glow') {
      return (
        <BeautyGlowcareWellnessTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 3. Beauty Template 3: ELORA Clean Beauty
    if (templateId === 'beauty-elora-lavender' || templateId === 'beauty-luxury-apothecary' || templateId === 'beauty-clinical-derma') {
      return (
        <BeautyEloraLavenderTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // =============================================================
    // ELECTRONICS & GADGETS DEDICATED REFERENCE TEMPLATES (3)
    // =============================================================
    // 1. Electronics Template 1: TechNova Modern Electronics
    if (templateId === 'electronics-technova-modern' || templateId === 'tech-spec-precision' || templateId === 'tech-gadget-showcase' || templateId === 'tech-minimal-clean') {
      return (
        <ElectronicsTechnovaModernTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 2. Electronics Template 2: AURORA Cybernetic Sage & Audio
    if (templateId === 'electronics-aurora-cyber' || templateId === 'tech-audio-studio') {
      return (
        <ElectronicsAuroraCyberTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }

    // 3. Electronics Template 3: TechHaven Next-Gen Cyberpunk
    if (templateId === 'electronics-techhaven-neon' || templateId === 'tech-gaming-cyber') {
      return (
        <ElectronicsTechhavenNeonTemplate
          business={business}
          products={products}
          isPreview={isPreview}
          customColors={customColors}
          onOpenContact={onOpenContact}
        />
      );
    }
  }

  // Universal Modular Storefront Template for ALL 60 templates and categories!
  return (
    <UniversalModularStorefrontTemplate
      business={business}
      products={products}
      template={template}
      isPreview={isPreview}
      isEditable={isEditable}
      selectedSectionId={selectedSectionId}
      onSelectSection={onSelectSection}
      contentOverrides={effectiveContentOverrides}
      sectionOrder={effectiveSectionOrder}
      customSections={effectiveCustomSections}
      customColors={customColors}
      onOpenContact={onOpenContact}
    />
  );
};

export { UniversalModularStorefrontTemplate };

export default {
  StorefrontContextBanner,
  StorefrontHeaderBanner,
  CategoryHeroFeature,
  StorefrontStorySection,
  StorefrontPageRenderer,
  UniversalModularStorefrontTemplate,
  getFormattedBusinessLocation
};
