import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { WelcomeHeaderIllustration } from '../components/WelcomeHeaderIllustration';
import { Sparkles, AlertCircle, RefreshCw, PackageOpen, Loader2 } from 'lucide-react';

export const CustomerHomePage = () => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist, toastMessage } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Recommended Products using the existing products API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sourced from existing /products endpoint as per fallback specifications
      const res = await api.get('/products', {
        params: {
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        }
      });
      const items = res.data?.data?.products || [];
      setProducts(items);
    } catch (err) {
      console.error('Failed to load recommended products:', err);
      setError('Unable to load recommended products at this time. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B1C5A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-[#E6B44C]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#E6B44C] shrink-0" />
          <span className="text-white font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          SECTION A: Welcome Header
          - Friendly customer greeting and short subtitle
          - Clean, visually appealing design
          - Uses existing customer information if available
          - NO quick-access shortcuts or dashboard statistic cards
          ===================================================================== */}
      <section aria-label="Welcome Header" className="clay-card-lavender p-6 sm:p-8 relative overflow-hidden border border-[#C6B7E2]/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs border border-[#C6B7E2]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
              <span>Curated For You</span>
            </div> */}

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3B1C5A] tracking-tight font-serif">
              {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome to Bizora!'}
            </h1>

            <p className="mt-2.5 text-sm sm:text-base text-[#3B1C5A]/75 leading-relaxed">
              Discover handpicked products and explore unique offerings from independent verified storefronts.
            </p>
          </div>

          {/* Prominent, Vertically-Centered Illustration on the Right */}
          <div className="w-full md:w-auto md:shrink-0 flex justify-center md:justify-end items-center">
            <WelcomeHeaderIllustration className="w-full max-w-[350px] sm:max-w-[410px] lg:max-w-[450px]" />
          </div>
        </div>

        {/* Ambient subtle glow decorative circle */}
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-30 pointer-events-none blur-2xl"
          style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
        />
      </section>

      {/* =====================================================================
          SECTION B: Recommended Products
          - Sourced from existing product API
          - Loading, empty, and error states
          - Reuses product components & displays image, name, price, action
          ===================================================================== */}
      <section aria-label="Recommended Products" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2 font-serif">
              <Sparkles className="w-5 h-5 text-[#E6B44C]" />
              <span>Recommended Products</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/65 mt-0.5">
              Handpicked selections based on verified products from independent businesses
            </p>
          </div>

          {!loading && !error && products.length > 0 && (
            <span className="text-xs font-bold text-[#3B1C5A]/70 px-3.5 py-1.5 rounded-xl bg-white clay-card border border-[#C6B7E2]/30 self-start sm:self-auto">
              {products.length} {products.length === 1 ? 'Product' : 'Products'} available
            </span>
          )}
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
              <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading curated recommendations...</p>
            </div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="clay-card p-4 space-y-3 bg-white/70 animate-pulse border border-[#C6B7E2]/30">
                  <div className="h-44 w-full bg-[#FAF6EE] rounded-2xl" />
                  <div className="h-4 w-3/4 bg-[#FAF6EE] rounded-lg" />
                  <div className="h-3 w-1/2 bg-[#FAF6EE] rounded-lg" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 w-16 bg-[#FAF6EE] rounded-lg" />
                    <div className="h-7 w-20 bg-[#FAF6EE] rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="clay-card p-8 sm:p-10 text-center max-w-lg mx-auto space-y-4 bg-white/95 border border-rose-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#3B1C5A]">Unable to Load Recommendations</h3>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/70 leading-relaxed">{error}</p>
            <button
              onClick={fetchProducts}
              className="clay-btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="clay-card p-10 sm:p-12 text-center max-w-lg mx-auto space-y-4 bg-white/90 border border-[#C6B7E2]/40">
            <div className="w-16 h-16 rounded-2xl bg-[#C6B7E2]/30 flex items-center justify-center mx-auto text-[#3B1C5A]">
              <PackageOpen className="w-8 h-8 text-[#E6B44C]" />
            </div>
            <h3 className="text-lg font-bold text-[#3B1C5A]">No Recommended Products Found</h3>
            <p className="text-xs sm:text-sm text-[#3B1C5A]/70 leading-relaxed">
              We couldn&apos;t find any published products at the moment. Please check back soon as merchants list new items.
            </p>
          </div>
        )}

        {/* 4. Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onToggleWishlist={toggleWishlist}
        isWishlisted={selectedProduct ? isWishlisted(selectedProduct.id) : false}
      />
    </div>
  );
};

export default CustomerHomePage;

