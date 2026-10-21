import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Standardized Pagination Component for Bizora Digital Market
 *
 * Implements accessible, theme-consistent (Claymorphism: purple/lavender/gold),
 * mobile-responsive pagination with smart compact numbered buttons, visible item range,
 * and optional page-size selection.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current 1-indexed page
 * @param {number} props.totalPages - Total available pages
 * @param {number} [props.totalItems] - Total records count (optional)
 * @param {number} [props.pageSize=10] - Number of items per page
 * @param {Function} props.onPageChange - Callback when a page is clicked `(newPage: number) => void`
 * @param {Function} [props.onPageSizeChange] - Callback when page size changes `(newSize: number) => void`
 * @param {number[]} [props.pageSizeOptions=[10, 25, 50]] - Available page size options
 * @param {boolean} [props.showPageSizeSelector=false] - Whether to show page size selector dropdown
 * @param {string} [props.itemName='items'] - Plural noun describing items (e.g., 'orders', 'products', 'stores')
 * @param {boolean} [props.showFirstLast=false] - Whether to show jump-to-first / jump-to-last buttons
 * @param {string} [props.className=''] - Additional container classes
 * @param {string} [props.ariaLabel='Pagination Navigation'] - Accessible label for the navigation
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  showPageSizeSelector = false,
  itemName = 'items',
  showFirstLast = false,
  className = '',
  ariaLabel = 'Pagination Navigation'
}) => {
  // If there are no items and only 1 page, don't display unnecessary pagination clutter
  if (totalItems === 0 && totalPages <= 1) {
    return null;
  }

  // Ensure safe numbers
  const safeCurrent = Math.max(1, Math.min(currentPage || 1, Math.max(1, totalPages || 1)));
  const safeTotalPages = Math.max(1, totalPages || 1);
  const showSelector = Boolean(showPageSizeSelector || onPageSizeChange);

  // Compute smart numbered pages layout
  const getPageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const pages = getPageNumbers(safeCurrent, safeTotalPages);

  // Calculate visible item range
  let rangeText = '';
  if (totalItems !== undefined && totalItems !== null) {
    if (totalItems === 0) {
      rangeText = `No ${itemName} found`;
    } else {
      const from = (safeCurrent - 1) * pageSize + 1;
      const to = Math.min(safeCurrent * pageSize, totalItems);
      rangeText = `Showing ${from}–${to} of ${totalItems} ${itemName}`;
    }
  } else {
    rangeText = `Page ${safeCurrent} of ${safeTotalPages}`;
  }

  const handlePageClick = (page) => {
    if (page === '...' || page === safeCurrent) return;
    if (page >= 1 && page <= safeTotalPages && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={`w-full clay-card p-3 sm:p-4 bg-white/95 border border-[#C6B7E2]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 transition-all shadow-xs ${className}`}
    >
      {/* Left section: Visible range and optional page-size selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#3B1C5A]/85 font-medium order-2 sm:order-1">
        <span className="font-bold text-[#3B1C5A] tracking-tight">{rangeText}</span>

        {showSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#C6B7E2]/50">
            <label htmlFor="bizora-page-size-select" className="text-[#79688A] text-[11px] font-bold uppercase tracking-wider">
              Show:
            </label>
            <select
              id="bizora-page-size-select"
              aria-label={`Select number of ${itemName} per page`}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="clay-input text-xs font-bold py-1 px-2.5 rounded-xl border border-[#C6B7E2]/50 bg-white text-[#3B1C5A] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B1C5A]/25"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right section: Navigation controls (First, Prev, Numbers, Next, Last) */}
      {safeTotalPages > 1 && (
        <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
          {/* First Page Button (Optional) */}
          {showFirstLast && (
            <button
              type="button"
              onClick={() => handlePageClick(1)}
              disabled={safeCurrent <= 1}
              aria-label="First page"
              className="p-1.5 sm:p-2 rounded-xl text-[#3B1C5A] bg-white clay-card border border-[#C6B7E2]/40 hover:bg-[#F0EAFB] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}

          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(safeCurrent - 1)}
            disabled={safeCurrent <= 1}
            aria-label="Previous page"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-[#3B1C5A] bg-white clay-card border border-[#C6B7E2]/40 hover:bg-[#F0EAFB] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Prev</span>
          </button>

          {/* Numbered Page Buttons with Ellipsis */}
          <div className="flex items-center gap-1">
            {pages.map((p, index) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    aria-hidden="true"
                    className="w-6 sm:w-7 text-center text-[#79688A] text-xs font-extrabold select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === safeCurrent;

              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => handlePageClick(p)}
                  aria-label={`Page ${p}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#3B1C5A] text-white shadow-md shadow-[#3B1C5A]/30 border border-[#3B1C5A]'
                      : 'bg-white text-[#3B1C5A] hover:bg-[#F0EAFB] border border-[#C6B7E2]/40 shadow-2xs'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(safeCurrent + 1)}
            disabled={safeCurrent >= safeTotalPages}
            aria-label="Next page"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-[#3B1C5A] bg-white clay-card border border-[#C6B7E2]/40 hover:bg-[#F0EAFB] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page Button (Optional) */}
          {showFirstLast && (
            <button
              type="button"
              onClick={() => handlePageClick(safeTotalPages)}
              disabled={safeCurrent >= safeTotalPages}
              aria-label="Last page"
              className="p-1.5 sm:p-2 rounded-xl text-[#3B1C5A] bg-white clay-card border border-[#C6B7E2]/40 hover:bg-[#F0EAFB] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Pagination;

