import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { Pagination } from '../components/Pagination';
import { Heart, Sparkles, ArrowLeft, PackageOpen, Loader2 } from 'lucide-react';

export const CustomerWishlistPage = () => {
  const { wishlistItems, wishlistProductIds, toggleWishlist, loading } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalPages = Math.max(1, Math.ceil(wishlistItems.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return wishlistItems.slice(start, start + pageSize);
  }, [wishlistItems, safePage, pageSize]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Wishlist Header Banner */}
      <div className="clay-card-lavender p-6 sm:p-8 relative overflow-hidden border border-[#C6B7E2]/50">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs border border-[#C6B7E2]/40">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Saved Favorites</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3B1C5A] tracking-tight font-serif flex items-center gap-3">
            <span>My Wishlist</span>
            {wishlistItems.length > 0 && (
              <span className="text-sm sm:text-base font-bold text-[#3B1C5A]/60 px-3 py-1 rounded-full bg-white clay-card">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#3B1C5A]/75 leading-relaxed">
            All the items you&apos;ve loved and saved. View details or manage your saved products anytime.
          </p>
        </div>

        {/* Ambient decorative glow */}
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-25 pointer-events-none blur-2xl"
          style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
        />
      </div>

      {/* Main Wishlist Section */}
      <section aria-label="Saved Products Grid">
        {loading && wishlistItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
            <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading saved items...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="clay-card p-10 sm:p-14 text-center max-w-lg mx-auto space-y-5 bg-white/95 border border-[#C6B7E2]/40 shadow-lg">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <Heart className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#3B1C5A]">Your Wishlist is Empty</h2>
              <p className="text-xs sm:text-sm text-[#3B1C5A]/70 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t added any items to your wishlist yet. Explore recommended products on your Home page and tap the heart icon to save what you love.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/customer/home"
                className="clay-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-[#E6B44C]" />
                <span>Explore Recommended Products</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedItems.map((product) => {
                const productId = product.id || product.productId;
                return (
                  <ProductCard
                    key={productId}
                    product={product}
                    onViewDetails={handleViewDetails}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlistProductIds.has(productId)}
                  />
                );
              })}
            </div>

            {/* Standardized Wishlist Pagination */}
            {wishlistItems.length > 0 && (
              <div className="pt-2">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={wishlistItems.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1);
                  }}
                  pageSizeOptions={[12, 24, 48]}
                  showPageSizeSelector={true}
                  itemName="saved items"
                  ariaLabel="Wishlist Pagination"
                />
              </div>
            )}
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
        isWishlisted={selectedProduct ? wishlistProductIds.has(selectedProduct.id) : false}
      />
    </div>
  );
};

export default CustomerWishlistPage;

