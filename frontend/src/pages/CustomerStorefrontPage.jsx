import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import CustomDropdown from '../components/CustomDropdown';
import { INDIAN_STATES, getDistrictsForState, matchBusinessLocation } from '../utils/indiaLocations';
import {
  Store,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  MessageSquare
} from 'lucide-react';
import { ContactMerchantModal } from '../components/ContactMerchantModal';
import { getStorefrontTemplate } from '../config/storefrontTemplates';
import {
  StorefrontContextBanner,
  StorefrontHeaderBanner,
  CategoryHeroFeature,
  StorefrontStorySection,
  StorefrontPageRenderer
} from '../components/StorefrontTemplateRenderer';

export const CustomerStorefrontPage = () => {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist, toastMessage } = useWishlist();

  // Determine if viewing a single specific store or the directory of all stores
  const businessId = routeId || searchParams.get('businessId') || null;

  // Single Business View States
  const [business, setBusiness] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(Boolean(businessId));
  const [storeError, setStoreError] = useState(null);
  const [storeProductSearch, setStoreProductSearch] = useState('');

  // Business Directory States (when no businessId is specified)
  const [businesses, setBusinesses] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(!businessId);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Directory Pagination states
  const [directoryPage, setDirectoryPage] = useState(1);
  const [directoryPageSize, setDirectoryPageSize] = useState(9);

  // Contact Merchant modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedBusinessForContact, setSelectedBusinessForContact] = useState(null);

  // 1. Fetch Single Business Storefront Data
  const fetchSingleBusiness = useCallback(async () => {
    if (!businessId) return;
    setStoreLoading(true);
    setStoreError(null);
    try {
      // 1. Get business details
      const bizRes = await api.get(`/businesses/${businessId}`);
      const bizData = bizRes.data?.data?.business || bizRes.data?.data || null;
      if (!bizData) throw new Error('Business not found');
      setBusiness(bizData);

      // 2. Get products for this specific business
      const prodRes = await api.get('/products', {
        params: {
          businessId: bizData.id,
          limit: 36
        }
      });
      setStoreProducts(prodRes.data?.data?.products || []);
    } catch (err) {
      console.error('Failed to load business storefront:', err);
      setStoreError(
        err.response?.data?.message ||
        'Unable to load business storefront. The store may be unavailable or inactive.'
      );
    } finally {
      setStoreLoading(false);
    }
  }, [businessId]);

  // 2. Fetch Directory of All Businesses
  const fetchBusinessDirectory = useCallback(async () => {
    if (businessId) return;
    setDirectoryLoading(true);
    try {
      const res = await api.get('/businesses', {
        params: { limit: 200 }
      });
      setBusinesses(res.data?.data?.businesses || []);
    } catch (err) {
      console.error('Failed to load business directory:', err);
    } finally {
      setDirectoryLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchSingleBusiness();
    } else {
      fetchBusinessDirectory();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [businessId, fetchSingleBusiness, fetchBusinessDirectory]);

  // Filtered store products for single business
  const filteredStoreProducts = useMemo(() => {
    if (!storeProductSearch.trim()) return storeProducts;
    const q = storeProductSearch.toLowerCase().trim();
    return storeProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [storeProducts, storeProductSearch]);

  // Progressive scroll display for store products
  const [visibleProductsCount, setVisibleProductsCount] = useState(8);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const storeProductsSentinelRef = useRef(null);

  // Reset visible products count on store product search
  useEffect(() => {
    setVisibleProductsCount(8);
  }, [storeProductSearch]);

  const displayedStoreProducts = useMemo(() => {
    return filteredStoreProducts.slice(0, visibleProductsCount);
  }, [filteredStoreProducts, visibleProductsCount]);

  const hasMoreStoreProducts = visibleProductsCount < filteredStoreProducts.length;

  const handleLoadMoreStoreProducts = useCallback(() => {
    if (loadingMoreProducts || !hasMoreStoreProducts) return;
    setLoadingMoreProducts(true);
    setTimeout(() => {
      setVisibleProductsCount((prev) => Math.min(prev + 8, filteredStoreProducts.length));
      setLoadingMoreProducts(false);
    }, 250);
  }, [loadingMoreProducts, hasMoreStoreProducts, filteredStoreProducts.length]);

  // Observer for progressive store products scroll
  useEffect(() => {
    if (!hasMoreStoreProducts || loadingMoreProducts) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMoreStoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    const target = storeProductsSentinelRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [hasMoreStoreProducts, loadingMoreProducts, handleLoadMoreStoreProducts]);

  // Filtered business directory
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (directorySearch.trim()) {
        const q = directorySearch.toLowerCase().trim();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesCategory = b.category?.toLowerCase().includes(q);
        const matchesDesc = b.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }
      if (selectedState || selectedDistrict) {
        if (!matchBusinessLocation(b, selectedState, selectedDistrict)) return false;
      }
      return true;
    });
  }, [businesses, directorySearch, selectedState, selectedDistrict]);

  // Sliced paginated business directory
  const directoryTotalPages = Math.max(1, Math.ceil(filteredBusinesses.length / directoryPageSize));
  const safeDirectoryPage = Math.min(Math.max(1, directoryPage), directoryTotalPages);
  const paginatedBusinesses = useMemo(() => {
    const start = (safeDirectoryPage - 1) * directoryPageSize;
    return filteredBusinesses.slice(start, start + directoryPageSize);
  }, [filteredBusinesses, safeDirectoryPage, directoryPageSize]);

  // Reset directory page on filters
  useEffect(() => {
    setDirectoryPage(1);
  }, [directorySearch, selectedState, selectedDistrict]);

  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Format business location
  const getBusinessLocation = (b) => {
    if (!b) return 'India';
    const addr = b.addressDetails || {};
    const parts = [];
    if (addr.district || addr.city) parts.push(addr.district || addr.city);
    if (addr.state) parts.push(addr.state);
    if (parts.length > 0) return parts.join(', ');
    if (b.address) return b.address;
    return 'India';
  };

  // =========================================================================
  // VIEW A: SINGLE BUSINESS STOREFRONT
  // =========================================================================
  if (businessId) {
    if (storeLoading) {
      return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-6">
          <div className="h-44 rounded-3xl bg-white/70 animate-pulse clay-card" />
          <div className="h-8 w-48 bg-white/70 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white/70 animate-pulse clay-card" />
            ))}
          </div>
        </div>
      );
    }

    if (storeError || !business) {
      return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="clay-card p-10 bg-white/95 border border-rose-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-[#3B1C5A]">Storefront Unavailable</h2>
            <p className="text-sm text-[#3B1C5A]/70 leading-relaxed">
              {storeError || 'The storefront you requested could not be located.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/customer/business-store"
                className="clay-btn-secondary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>Browse Stores</span>
              </Link>
              <Link
                to="/customer/shop"
                className="clay-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 text-[#E6B44C]" />
                <span>Marketplace Shop</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const template = getStorefrontTemplate(business);
    const { tokens } = template;

    const defaultStorefrontView = (
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Store Header Banner */}
        <StorefrontHeaderBanner business={business} showFullDetails={true} />

        {/* Category-Specific Hero Feature Banner */}
        <CategoryHeroFeature categoryId={business.category || template.categoryId} template={template} />

        {/* Story Section for Boutique & Artisanal Layouts */}
        {(template.layoutType === 'story-boutique' || template.categoryId === 'artisanal-handmade') && (
          <StorefrontStorySection business={business} template={template} />
        )}

        {/* Store Catalog Section */}
        <section aria-label="Store Products" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${tokens.textPrimary} ${tokens.fontHeading}`}>
                Products from {business.name}
              </h2>
              <p className={`text-xs ${tokens.textSecondary} mt-0.5`}>
                Showing {filteredStoreProducts.length} product(s) available from this store ({template.name})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedBusinessForContact(business);
                  setContactModalOpen(true);
                }}
                className="clay-pill px-4 py-2 text-xs font-bold text-[#3B1C5A] bg-white hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#C6B7E2]/60 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>Contact Merchant</span>
              </button>

              {/* In-store Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#3B1C5A]/50" />
                <input
                  type="text"
                  value={storeProductSearch}
                  onChange={(e) => setStoreProductSearch(e.target.value)}
                  placeholder="Search within this store..."
                  className="clay-input w-full pl-9 pr-4 py-2 text-xs bg-white shadow-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredStoreProducts.length === 0 ? (
            <div className="clay-card p-10 text-center bg-white/95 border border-[#C6B7E2]/40 space-y-3">
              <ShoppingBag className="w-8 h-8 text-[#E6B44C] mx-auto" />
              <h3 className="text-base font-bold text-[#3B1C5A]">No Products Match Search</h3>
              <p className="text-xs text-[#3B1C5A]/70">
                {storeProductSearch
                  ? `No products found matching "${storeProductSearch}" in this store.`
                  : 'This merchant currently does not have any active products listed.'}
              </p>
              {storeProductSearch && (
                <button
                  onClick={() => setStoreProductSearch('')}
                  className="clay-btn-secondary px-4 py-1.5 text-xs font-bold"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dynamic Grid Density according to Template Layout Type */}
              <div
                className={
                  template.layoutType === 'editorial-spacious'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                    : template.layoutType === 'specs-dense'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
                    : template.layoutType === 'compact-quick'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                }
              >
                {displayedStoreProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    template={template}
                    templateStyle={template.cardDisplayStyle}
                    isWishlisted={isWishlisted(prod.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>

              {/* Progressive Store Products Scroll Loading */}
              <div ref={storeProductsSentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />

              {loadingMoreProducts && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E6B44C]/40 text-[#3B1C5A] text-xs font-bold">
                    <Loader2 className="w-4 h-4 text-[#E6B44C] animate-spin" />
                    <span>Loading more products...</span>
                  </div>
                </div>
              )}

              {hasMoreStoreProducts && !loadingMoreProducts && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMoreStoreProducts}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-[#C6B7E2]/50 text-xs font-bold text-[#3B1C5A] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E6B44C] group-hover:scale-110 transition-transform" />
                    <span>Scroll down for more products (or tap to load)</span>
                  </button>
                </div>
              )}

              {!hasMoreStoreProducts && filteredStoreProducts.length > 0 && (
                <div className="flex flex-col items-center justify-center text-center pt-4 pb-2 space-y-1">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EAFB] border border-[#C6B7E2]/50 text-[#3B1C5A] text-xs font-bold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>
                      You&apos;ve viewed all {filteredStoreProducts.length} product{filteredStoreProducts.length === 1 ? '' : 's'} in this store
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    );

    return (
      <div className="w-full space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3B1C5A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-[#E6B44C]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Sparkles className="w-4 h-4 text-[#E6B44C] shrink-0" />
            <span className="text-white font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Global Marketplace Disambiguation Notice Banner */}
        <div className="max-w-6xl mx-auto px-4">
          <StorefrontContextBanner business={business} isProductPage={false} />
        </div>

        {/* Dedicated Category Storefront Page Renderer */}
        <StorefrontPageRenderer
          business={business}
          products={storeProducts}
          template={template}
          onOpenContact={() => {
            setSelectedBusinessForContact(business);
            setContactModalOpen(true);
          }}
          fallbackView={defaultStorefrontView}
        />

        {/* Contact Merchant Modal */}
        <ContactMerchantModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedBusinessForContact(null);
          }}
          businessId={selectedBusinessForContact?.id || business?.id}
          businessName={selectedBusinessForContact?.name || business?.name || 'Merchant'}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW B: BUSINESS STORE DIRECTORY (Browse All Verified Merchants)
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <section aria-label="Stores Directory Header" className="clay-card-lavender p-6 sm:p-8 border border-[#C6B7E2]/50 space-y-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider shadow-xs border border-[#C6B7E2]/40">
            <Store className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Merchant Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3B1C5A] font-serif tracking-tight">
            Independent Business Stores
          </h1>
          <p className="text-xs sm:text-sm text-[#3B1C5A]/75 leading-relaxed">
            Discover verified merchant storefronts, learn their unique stories, and shop their dedicated catalogs directly.
          </p>
        </div>

        {/* Directory Search & Filters */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#3B1C5A]/50" />
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="Search store name or category..."
              className="clay-input w-full pl-9 pr-4 py-2.5 text-xs bg-white shadow-xs rounded-full border-2 border-[#C6B7E2]/60 focus:border-[#3B1C5A]"
            />
          </div>

          {/* State Filter with smooth oval dropdown */}
          <div>
            <CustomDropdown
              value={selectedState}
              onChange={(val) => {
                setSelectedState(val);
                setSelectedDistrict('');
              }}
              placeholder="All States in India"
              options={[
                { value: '', label: 'All States in India' },
                ...INDIAN_STATES.map((s) => ({ value: s, label: s }))
              ]}
              icon={MapPin}
              clearable={Boolean(selectedState)}
              ariaLabel="Filter by Indian State"
            />
          </div>

          {/* District Filter with smooth oval dropdown */}
          <div>
            <CustomDropdown
              value={selectedDistrict}
              onChange={(val) => setSelectedDistrict(val)}
              placeholder={selectedState ? `All Districts in ${selectedState}` : 'All Districts (Select State First)'}
              disabled={!selectedState}
              options={[
                { value: '', label: selectedState ? `All Districts in ${selectedState}` : 'All Districts' },
                ...availableDistricts.map((d) => ({ value: d, label: d }))
              ]}
              icon={MapPin}
              clearable={Boolean(selectedDistrict)}
              ariaLabel="Filter by District"
            />
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      {directoryLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
          <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading verified businesses...</p>
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="clay-card p-12 text-center bg-white/95 border border-[#C6B7E2]/40 space-y-3">
          <Store className="w-10 h-10 text-[#E6B44C] mx-auto" />
          <h3 className="text-base font-bold text-[#3B1C5A]">No Business Storefronts Found</h3>
          <p className="text-xs text-[#3B1C5A]/70 max-w-md mx-auto">
            No independent businesses currently match your search criteria. Try removing filters or searching by a different name.
          </p>
          {(directorySearch || selectedState || selectedDistrict) && (
            <button
              onClick={() => {
                setDirectorySearch('');
                setSelectedState('');
                setSelectedDistrict('');
              }}
              className="clay-btn-secondary px-4 py-2 text-xs font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBusinesses.map((b) => (
              <div
                key={b.id}
                className="clay-card p-6 bg-white/95 border border-[#C6B7E2]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0EAFB] border border-[#C6B7E2]/40 overflow-hidden flex items-center justify-center text-[#3B1C5A] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {b.logo ? (
                        <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-[#3B1C5A]" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#3B1C5A] truncate group-hover:text-[#40205E]">
                          {b.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Merchant" />
                      </div>
                      <span className="clay-badge-gold px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mt-0.5">
                        {b.category || 'General Store'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[#3B1C5A]/70">
                    <MapPin className="w-3.5 h-3.5 text-[#E6B44C] shrink-0" />
                    <span className="truncate">{getBusinessLocation(b)}</span>
                  </div>

                  {b.description && (
                    <p className="text-xs text-[#3B1C5A]/75 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#C6B7E2]/30 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBusinessForContact(b);
                      setContactModalOpen(true);
                    }}
                    className="clay-pill px-3 py-1.5 rounded-xl text-xs font-bold text-[#3B1C5A] bg-[#FAF7F2] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 shadow-xs border border-[#C6B7E2]/40 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>Contact</span>
                  </button>

                  <Link
                    to={`/customer/stores/${b.id}`}
                    className="clay-pill px-4 py-1.5 rounded-xl text-xs font-bold text-[#3B1C5A] hover:bg-[#3B1C5A] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Enter Store</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Standardized Directory Pagination */}
          {filteredBusinesses.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={safeDirectoryPage}
                totalPages={directoryTotalPages}
                totalItems={filteredBusinesses.length}
                pageSize={directoryPageSize}
                onPageChange={setDirectoryPage}
                onPageSizeChange={(newSize) => {
                  setDirectoryPageSize(newSize);
                  setDirectoryPage(1);
                }}
                pageSizeOptions={[9, 18, 36]}
                showPageSizeSelector={true}
                itemName="stores"
                ariaLabel="Merchant Directory Pagination"
              />
            </div>
          )}
        </div>
      )}

      {/* Contact Merchant Modal */}
      <ContactMerchantModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedBusinessForContact(null);
        }}
        businessId={selectedBusinessForContact?.id}
        businessName={selectedBusinessForContact?.name || 'Merchant'}
      />
    </div>
  );
};

export default CustomerStorefrontPage;

