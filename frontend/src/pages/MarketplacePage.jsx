import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Pagination } from '../components/Pagination';
import {
  Store,
  Search,
  Sparkles,
  MapPin,
  Phone,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  'All',
  // 'Food & Beverage',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Home & Living',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Artisanal & Handmade'
];

export const MarketplacePage = () => {
  const { user } = useAuth();

  // Authenticated customers must not use the legacy marketplace landing page
  if (user?.role === 'customer') {
    return <Navigate to="/customer/home" replace />;
  }

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Reset page on search or category filter change
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;

        const res = await api.get('/businesses', { params });
        setBusinesses(res.data.data.businesses || []);
        setPagination(res.data.data.pagination || { page, limit, total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load marketplace storefronts:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchMarketplace, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedCategory, page, limit]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Banner */}
      <div className="clay-card-lavender p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm border border-[#C6B7E2]/50">
          <Sparkles className="w-4 h-4 text-[#E6B44C]" />
          <span>Curated Digital Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#3B1C5A] tracking-tight font-serif max-w-3xl mx-auto">
          Shop Direct from Independent Creators & Businesses
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[#3B1C5A]/75 max-w-xl mx-auto leading-relaxed">
          Bizora connects you directly to passionate independent businesses, local artisans, and boutique digital storefronts.
        </p>

        {/* Search Bar in Clay Style */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3B1C5A]/50">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search stores by name, specialty, or description..."
            className="clay-input w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-white shadow-lg"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'clay-btn-primary shadow-md'
                : 'clay-pill hover:bg-[#C6B7E2]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Business Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#E6B44C]" />
            <span>Discover Storefronts</span>
          </h2>
          <span className="text-xs font-semibold text-[#3B1C5A]/60">
            {businesses.length} store{businesses.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
            <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading marketplace businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C6B7E2]/30 flex items-center justify-center mx-auto text-[#3B1C5A]">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#3B1C5A]">No stores found</h3>
            <p className="text-xs text-[#3B1C5A]/70">
              No published businesses match your search. Try changing your filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="clay-card overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 group bg-white/80"
              >
                {/* Banner / Header */}
                <div className="h-28 bg-gradient-to-r from-[#3B1C5A] to-[#61338E] relative">
                  {biz.banner && (
                    <img
                      src={biz.banner.startsWith('/uploads') ? biz.banner : biz.banner}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {biz.category || 'Featured'}
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-0 flex-1 flex flex-col">
                  {/* Logo Avatar */}
                  <div className="-mt-9 mb-3 flex items-end justify-between">
                    <div className="w-18 h-18 rounded-2xl bg-white clay-card p-1 shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
                      {biz.logo ? (
                        <img
                          src={biz.logo}
                          alt={biz.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-[#3B1C5A]" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#3B1C5A] group-hover:text-[#E6B44C] transition-colors">
                    {biz.name}
                  </h3>

                  <p className="text-xs text-[#3B1C5A]/75 mt-2 line-clamp-3 leading-relaxed flex-1">
                    {biz.description || 'Welcome to our digital storefront! Browse our catalog.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#C6B7E2]/30 space-y-1.5 text-[11px] text-[#3B1C5A]/70">
                    {biz.address && (
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#3B1C5A]/60 shrink-0" />
                        <span className="truncate">{biz.address}</span>
                      </div>
                    )}
                    {biz.phone && (
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#3B1C5A]/60 shrink-0" />
                        <span>{biz.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#C6B7E2]/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#3B1C5A]/60">
                      By {biz.owner?.firstName} {biz.owner?.lastName}
                    </span>
                    <span className="clay-pill px-3 py-1 text-xs font-bold flex items-center gap-1 group-hover:bg-[#3B1C5A] group-hover:text-white transition-colors">
                      <span>Visit Store</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Standardized Marketplace Stores Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="pt-6">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[12, 24, 48]}
              showPageSizeSelector={true}
              itemName="stores"
              ariaLabel="Marketplace Stores Pagination"
            />
          </div>
        )}
      </div>

      {/* Prospective Merchant Callout Card */}
      <div className="clay-card p-8 sm:p-10 bg-gradient-to-br from-[#FCFAF6] to-[#F3EEFA] border border-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="clay-badge-gold px-3 py-0.5 rounded-full text-[11px] font-bold uppercase">
            Grow Your Business
          </span>
          <h3 className="text-2xl font-extrabold text-[#3B1C5A]">
            Ready to Sell Your Products on Bizora?
          </h3>
          <p className="text-xs sm:text-sm text-[#3B1C5A]/70 max-w-xl">
            Register your merchant account in minutes. Manage multiple storefronts, list inventory, and reach thousands of verified buyers.
          </p>
        </div>

        <Link
          to="/register/merchant"
          className="clay-btn-accent px-6 py-3.5 text-sm font-bold shrink-0 inline-flex items-center space-x-2"
        >
          <span>Open a Merchant Account</span>
          <ArrowRight className="w-4 h-4 text-[#3B1C5A]" />
        </Link>
      </div>
    </div>
  );
};

export default MarketplacePage;

