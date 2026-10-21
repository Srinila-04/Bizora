import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import CustomDropdown from '../components/CustomDropdown';
import { getCategoryImageUrl } from '../config/categoryImages';
import { SUPPORTED_CATEGORIES_LIST } from '../config/categoryRegistry';
import shopHeaderImage from '../assets/shop-header-character.png';
import {
  INDIAN_STATES,
  getDistrictsForState,
  matchBusinessLocation
} from '../utils/indiaLocations';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  PackageOpen,
  AlertCircle,
  RefreshCw,
  Loader2,
  Tag,
  ArrowUpDown,
  MapPin,
  Star
} from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', sortBy: 'createdAt', sortOrder: 'DESC' },
  { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'ASC' },
  { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'DESC' },
  { label: 'Name: A to Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Stock: High to Low', sortBy: 'stockQuantity', sortOrder: 'DESC' }
];

export const CustomerShopPage = () => {
  const [searchParams] = useSearchParams();
  const { isWishlisted, toggleWishlist, toastMessage } = useWishlist();

  // Search input state
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');

  // 1. Category Filter state
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => searchParams.get('category') || '');

  // 2. Price Range states (Indian Rupee ₹)
  const [minPrice, setMinPrice] = useState(() => searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') || '');
  const [customMinInput, setCustomMinInput] = useState(() => searchParams.get('minPrice') || '');
  const [customMaxInput, setCustomMaxInput] = useState(() => searchParams.get('maxPrice') || '');
  const [priceError, setPriceError] = useState('');
  const [isCustomPriceOpen, setIsCustomPriceOpen] = useState(() => {
    const min = searchParams.get('minPrice');
    const max = searchParams.get('maxPrice');
    if (!min && !max) return false;
    if (min === '' && max === '499.99') return false;
    if (min === '500' && max === '999.99') return false;
    if (min === '1000' && max === '4999.99') return false;
    return true;
  });

  // 3. Business Location state (Indian States & Districts)
  const [selectedState, setSelectedState] = useState(() => searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(() => searchParams.get('district') || '');

  // 4. Customer Rating state (Text only format)
  const [selectedRating, setSelectedRating] = useState(() => {
    const r = searchParams.get('rating');
    return r ? parseInt(r, 10) : null;
  });

  // Sort state
  const [sortIndex, setSortIndex] = useState(0);

  // Infinite Scroll & Pagination state (loads 8 products per batch)
  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);
  const [rawProducts, setRawProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    totalPages: 1,
    hasNextPage: false
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Product details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category horizontal scroll ref and overflow state
  const categoryScrollRef = useRef(null);
  const productSectionRef = useRef(null);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const [canScroll, setCanScroll] = useState(false);

  // Check if categories container horizontally overflows
  const checkCategoryOverflow = useCallback(() => {
    if (categoryScrollRef.current) {
      const el = categoryScrollRef.current;
      setCanScroll(el.scrollWidth > el.clientWidth + 5);
    }
  }, []);

  // Districts list cascading from selectedState
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Derive current price dropdown selection
  const priceDropdownValue = useMemo(() => {
    if (minPrice === '' && maxPrice === '') return isCustomPriceOpen ? 'custom' : '';
    if (minPrice === '' && maxPrice === '499.99') return 'under500';
    if (minPrice === '500' && maxPrice === '999.99') return '500to1000';
    if (minPrice === '1000' && maxPrice === '4999.99') return '1000to5000';
    return 'custom';
  }, [minPrice, maxPrice, isCustomPriceOpen]);

  // Selected Category Object
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId || c.slug === selectedCategoryId);
  }, [selectedCategoryId, categories]);

  // Fetch available categories with deduplication and canonical marketplace integration
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/categories');
      const rawApiCats = res.data?.data?.categories || [];

      // 1. Deduplicate API categories by normalized name (collapses repeated test entries like 19 "Beverages")
      const groupedApiCats = {};
      rawApiCats.forEach((cat) => {
        if (!cat || !cat.name) return;
        const normKey = cat.name.toLowerCase().trim();
        if (!groupedApiCats[normKey]) {
          groupedApiCats[normKey] = {
            id: cat.id,
            name: cat.name,
            slug: cat.slug || normKey,
            description: cat.description,
            imageUrl: cat.imageUrl,
            ids: [cat.id],
            isDbCategory: true
          };
        } else {
          groupedApiCats[normKey].ids.push(cat.id);
          if (cat.imageUrl && !groupedApiCats[normKey].imageUrl) {
            groupedApiCats[normKey].imageUrl = cat.imageUrl;
          }
        }
      });

      // 2. Canonical marketplace categories to showcase full Bizora offerings
      const combined = [];
      const seenNames = new Set();

      SUPPORTED_CATEGORIES_LIST.forEach((regCat) => {
        if (
          regCat.slug === 'professional-services' ||
          regCat.slug === 'automotive-hardware' ||
          regCat.slug === 'books-toys-stationery'
        ) {
          return;
        }

        const norm = regCat.name.toLowerCase().trim();
        seenNames.add(norm);

        let matchingApiCat = null;
        for (const [key, apiCat] of Object.entries(groupedApiCats)) {
          if (key === norm || (regCat.aliases && regCat.aliases.some((a) => a.toLowerCase() === key))) {
            matchingApiCat = apiCat;
            break;
          }
        }

        combined.push({
          id: regCat.id,
          name: regCat.name,
          slug: regCat.slug,
          description: regCat.description,
          imageUrl: matchingApiCat?.imageUrl || null,
          ids: matchingApiCat ? matchingApiCat.ids : [],
          isMarketplace: true,
          aliases: regCat.aliases || []
        });
      });

      // 3. Add any DB-specific categories that were not covered by canonical categories (e.g. "Whole Bean Coffee", "Brewing Equipment", "Beverages")
      Object.entries(groupedApiCats).forEach(([key, apiCat]) => {
        const alreadyRepresented = combined.some(
          (c) => c.name.toLowerCase().trim() === key
        );
        if (!alreadyRepresented) {
          seenNames.add(key);
          combined.push(apiCat);
        }
      });

      setCategories(combined);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Check overflow on category update or window resize
  useEffect(() => {
    checkCategoryOverflow();
    window.addEventListener('resize', checkCategoryOverflow);
    return () => window.removeEventListener('resize', checkCategoryOverflow);
  }, [categories, checkCategoryOverflow]);

  // Debounce search query input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== searchQuery) {
        setSearchQuery(searchInput.trim());
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Fetch Initial Batch (Page 1) when filters, search, or sort change
  const fetchProducts = useCallback(async () => {
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    setPage(1);

    try {
      const activeSort = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
      const isMarketplaceCat = selectedCategory && (!selectedCategory.ids || selectedCategory.ids.length === 0) && !selectedCategory.isDbCategory;
      const params = {
        page: 1,
        limit: isMarketplaceCat ? 50 : PRODUCTS_PER_PAGE,
        sortBy: activeSort.sortBy,
        sortOrder: activeSort.sortOrder
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedCategory?.ids?.length > 0) {
        params.categoryId = selectedCategory.ids.length === 1 ? selectedCategory.ids[0] : selectedCategory.ids;
      } else if (selectedCategory?.id && selectedCategory.isDbCategory) {
        params.categoryId = selectedCategory.id;
      }
      if (minPrice !== '') {
        params.minPrice = minPrice;
      }
      if (maxPrice !== '') {
        params.maxPrice = maxPrice;
      }

      const res = await api.get('/products', { params });
      const fetchedProducts = res.data?.data?.products || [];
      const fetchedPagination = res.data?.data?.pagination || {
        total: fetchedProducts.length,
        page: 1,
        limit: isMarketplaceCat ? 50 : PRODUCTS_PER_PAGE,
        totalPages: 1,
        hasNextPage: false
      };

      setRawProducts(fetchedProducts);
      setPagination({
        ...fetchedPagination,
        hasNextPage: fetchedPagination.page < fetchedPagination.totalPages
      });
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Unable to load products right now. Please verify your connection and try again.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [sortIndex, searchQuery, selectedCategoryId, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load More Products when user scrolls down
  const loadMoreProducts = useCallback(async () => {
    if (isFetchingRef.current || loading || loadingMore || !pagination.hasNextPage) {
      return;
    }

    isFetchingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);

    const nextPage = page + 1;

    try {
      const activeSort = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
      const isMarketplaceCat = selectedCategory && (!selectedCategory.ids || selectedCategory.ids.length === 0) && !selectedCategory.isDbCategory;
      const params = {
        page: nextPage,
        limit: isMarketplaceCat ? 50 : PRODUCTS_PER_PAGE,
        sortBy: activeSort.sortBy,
        sortOrder: activeSort.sortOrder
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedCategory?.ids?.length > 0) {
        params.categoryId = selectedCategory.ids.length === 1 ? selectedCategory.ids[0] : selectedCategory.ids;
      } else if (selectedCategory?.id && selectedCategory.isDbCategory) {
        params.categoryId = selectedCategory.id;
      }
      if (minPrice !== '') {
        params.minPrice = minPrice;
      }
      if (maxPrice !== '') {
        params.maxPrice = maxPrice;
      }

      const res = await api.get('/products', { params });
      const fetchedProducts = res.data?.data?.products || [];
      const fetchedPagination = res.data?.data?.pagination || {
        total: pagination.total,
        page: nextPage,
        limit: PRODUCTS_PER_PAGE,
        totalPages: pagination.totalPages,
        hasNextPage: false
      };

      setRawProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = fetchedProducts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setPagination({
        ...fetchedPagination,
        hasNextPage: nextPage < fetchedPagination.totalPages
      });
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more products:', err);
      setLoadMoreError('Unable to load more products. Please check your connection.');
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [
    page,
    loading,
    loadingMore,
    pagination.hasNextPage,
    pagination.total,
    pagination.totalPages,
    sortIndex,
    searchQuery,
    selectedCategoryId,
    minPrice,
    maxPrice
  ]);

  // 1. Intersection Observer for Infinite Scroll Sentinel
  useEffect(() => {
    if (loading || loadingMore || !pagination.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0
      }
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, [loading, loadingMore, pagination.hasNextPage, loadMoreProducts]);

  // 2. Window Scroll Event Listener (Fallback for mobile viewports)
  useEffect(() => {
    if (loading || loadingMore || !pagination.hasNextPage) return;

    const handleWindowScroll = () => {
      if (isFetchingRef.current || loading || loadingMore || !pagination.hasNextPage) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.offsetHeight || document.body.offsetHeight;

      if (scrollBottom >= docHeight - 400) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [loading, loadingMore, pagination.hasNextPage, loadMoreProducts]);

  // Apply category, location, and rating filters on the products
  const displayedProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      // 0. Marketplace Category filter (when category has no dedicated DB categoryId)
      if (selectedCategory && (!selectedCategory.ids || selectedCategory.ids.length === 0) && !selectedCategory.isDbCategory) {
        const catName = (selectedCategory.name || '').toLowerCase();
        const prodCatName = (product.category?.name || '').toLowerCase();
        const bizCat = (product.business?.category || '').toLowerCase();
        const catSlug = (selectedCategory.slug || '').toLowerCase();

        const nameMatch = prodCatName && (prodCatName.includes(catName) || catName.includes(prodCatName));
        const bizMatch = bizCat && (
          bizCat.includes(catName) ||
          catName.includes(bizCat) ||
          bizCat.includes(catSlug) ||
          catSlug.includes(bizCat) ||
          (selectedCategory.aliases && selectedCategory.aliases.some((a) => bizCat.includes(a.toLowerCase()) || a.toLowerCase().includes(bizCat)))
        );

        if (!nameMatch && !bizMatch) {
          return false;
        }
      }

      // 1. Business Location filter
      if (selectedState || selectedDistrict) {
        const matchesLocation = matchBusinessLocation(product.business, selectedState, selectedDistrict);
        if (!matchesLocation) return false;
      }

      // 2. Customer Rating filter (using real verified rating data)
      if (selectedRating !== null) {
        const productRating = product.averageRating !== undefined && product.averageRating !== null
          ? parseFloat(product.averageRating)
          : null;

        // If product has no verified ratings, it does not meet the minimum rating threshold
        if (productRating === null || isNaN(productRating)) {
          return false;
        }
        if (productRating < selectedRating) {
          return false;
        }
      }

      return true;
    });
  }, [rawProducts, selectedCategory, selectedState, selectedDistrict, selectedRating]);

  // Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  // Category Selection
  const handleSelectCategory = (categoryId) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('');
    } else {
      setSelectedCategoryId(categoryId);
    }
    setPage(1);
  };

  // Price Dropdown Handler
  const handlePriceDropdownChange = (val) => {
    setPriceError('');
    if (val === '') {
      setMinPrice('');
      setMaxPrice('');
      setCustomMinInput('');
      setCustomMaxInput('');
      setIsCustomPriceOpen(false);
    } else if (val === 'under500') {
      setMinPrice('');
      setMaxPrice('499.99');
      setCustomMinInput('');
      setCustomMaxInput('499.99');
      setIsCustomPriceOpen(false);
    } else if (val === '500to1000') {
      setMinPrice('500');
      setMaxPrice('999.99');
      setCustomMinInput('500');
      setCustomMaxInput('999.99');
      setIsCustomPriceOpen(false);
    } else if (val === '1000to5000') {
      setMinPrice('1000');
      setMaxPrice('4999.99');
      setCustomMinInput('1000');
      setCustomMaxInput('4999.99');
      setIsCustomPriceOpen(false);
    } else if (val === 'custom') {
      setIsCustomPriceOpen(true);
      return; // Do not reset pagination until custom range is applied
    }
    setPage(1);
  };

  // Custom Price Range Apply
  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    setPriceError('');
    const minVal = customMinInput.trim();
    const maxVal = customMaxInput.trim();

    const minNum = parseFloat(minVal);
    const maxNum = parseFloat(maxVal);

    if (minVal !== '' && (isNaN(minNum) || minNum < 0)) {
      setPriceError('Please enter a valid non-negative minimum price');
      return;
    }
    if (maxVal !== '' && (isNaN(maxNum) || maxNum < 0)) {
      setPriceError('Please enter a valid non-negative maximum price');
      return;
    }
    if (minVal !== '' && maxVal !== '' && minNum > maxNum) {
      setPriceError('Minimum price cannot exceed maximum price');
      return;
    }

    setMinPrice(minVal);
    setMaxPrice(maxVal);
    setPage(1);
  };

  // State & District Handlers
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedDistrict(''); // Reset district when state changes
    setPage(1);
  };

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setPage(1);
  };

  // Rating Filter Handler (Dropdown)
  const handleRatingDropdownChange = (ratingVal) => {
    if (!ratingVal) {
      setSelectedRating(null);
    } else {
      setSelectedRating(parseInt(ratingVal, 10));
    }
    setPage(1);
  };

  // Clear All Filters
  const handleClearAllFilters = () => {
    setSelectedCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setCustomMinInput('');
    setCustomMaxInput('');
    setIsCustomPriceOpen(false);
    setPriceError('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedRating(null);
    setSearchInput('');
    setSearchQuery('');
    setSortIndex(0);
    setPage(1);
  };

  // Individual filter removal
  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case 'category':
        setSelectedCategoryId('');
        break;
      case 'price':
        setMinPrice('');
        setMaxPrice('');
        setCustomMinInput('');
        setCustomMaxInput('');
        setIsCustomPriceOpen(false);
        setPriceError('');
        break;
      case 'state':
        setSelectedState('');
        setSelectedDistrict('');
        break;
      case 'district':
        setSelectedDistrict('');
        break;
      case 'rating':
        setSelectedRating(null);
        break;
      case 'search':
        setSearchInput('');
        setSearchQuery('');
        break;
      default:
        break;
    }
    setPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    selectedCategoryId ||
    minPrice !== '' ||
    maxPrice !== '' ||
    selectedState ||
    selectedDistrict ||
    selectedRating !== null ||
    searchQuery.trim()
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryId) count++;
    if (minPrice !== '' || maxPrice !== '') count++;
    if (selectedState) count++;
    if (selectedDistrict) count++;
    if (selectedRating !== null) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategoryId, minPrice, maxPrice, selectedState, selectedDistrict, selectedRating, searchQuery]);

  // Selected Category Name for Discovery Toolbar
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return 'All Products';
    return selectedCategory ? selectedCategory.name : 'Filtered Category';
  }, [selectedCategoryId, selectedCategory]);

  // Horizontal scroll for categories
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Open product details modal
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Reusable 4 Main Filter Dropdowns (Desktop Sidebar & Mobile Drawer)
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* ===================================================================
          FILTER 1: Category Dropdown
          =================================================================== */}
      <div className="border-b border-[#C6B7E2]/30 pb-5">
        <label className="font-extrabold text-sm text-[#3B1C5A] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Category</span>
          {selectedCategoryId && (
            <button
              onClick={() => handleRemoveFilter('category')}
              className="text-[11px] font-bold text-[#E6B44C] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </label>

        <CustomDropdown
          value={selectedCategoryId}
          onChange={(val) => handleSelectCategory(val)}
          placeholder="All Categories"
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((cat) => ({ value: cat.id || cat.slug, label: cat.name }))
          ]}
          ariaLabel="Filter by category"
          clearable={Boolean(selectedCategoryId)}
          size="sm"
        />
      </div>

      {/* ===================================================================
          FILTER 2: Price Range Dropdown (Indian Rupee ₹)
          =================================================================== */}
      <div className="border-b border-[#C6B7E2]/30 pb-5">
        <label className="font-extrabold text-sm text-[#3B1C5A] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Price Range</span>
          {(minPrice !== '' || maxPrice !== '') && (
            <button
              onClick={() => handleRemoveFilter('price')}
              className="text-[11px] font-bold text-[#E6B44C] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </label>

        <CustomDropdown
          value={priceDropdownValue}
          onChange={(val) => handlePriceDropdownChange(val)}
          placeholder="All Prices"
          options={[
            { value: '', label: 'All Prices' },
            { value: 'under500', label: 'Under ₹500' },
            { value: '500to1000', label: '₹500–₹1,000' },
            { value: '1000to5000', label: '₹1,000–₹5,000' },
            { value: 'custom', label: 'Custom Range' }
          ]}
          ariaLabel="Filter by price range"
          clearable={Boolean(priceDropdownValue)}
          size="sm"
          className="mb-2.5"
        />

        {/* Custom Price Range Inputs when Custom Range is selected */}
        {(priceDropdownValue === 'custom' || isCustomPriceOpen) && (
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#C6B7E2]/30 space-y-2 animate-in fade-in duration-200">
            <span className="text-[11px] font-bold text-[#3B1C5A]/70 uppercase tracking-wide block">
              Enter Custom Range (₹)
            </span>

            <form onSubmit={handleApplyCustomPrice} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#3B1C5A]/60 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Min"
                    value={customMinInput}
                    onChange={(e) => setCustomMinInput(e.target.value)}
                    className="clay-input w-full pl-6 pr-2 py-1.5 text-xs bg-white"
                    aria-label="Minimum Price in Rupees"
                  />
                </div>
                <span className="text-xs text-[#3B1C5A]/50 font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#3B1C5A]/60 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Max"
                    value={customMaxInput}
                    onChange={(e) => setCustomMaxInput(e.target.value)}
                    className="clay-input w-full pl-6 pr-2 py-1.5 text-xs bg-white"
                    aria-label="Maximum Price in Rupees"
                  />
                </div>
              </div>

              {priceError && (
                <p className="text-[11px] text-rose-600 font-semibold">{priceError}</p>
              )}

              <button
                type="submit"
                className="clay-btn-primary w-full py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Apply Range
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ===================================================================
          FILTER 3: Business Location Dropdowns (Indian States & Districts)
          =================================================================== */}
      <div className="border-b border-[#C6B7E2]/30 pb-5">
        <label className="font-extrabold text-sm text-[#3B1C5A] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Business Location</span>
          </span>
          {(selectedState || selectedDistrict) && (
            <button
              onClick={() => handleRemoveFilter('state')}
              className="text-[11px] font-bold text-[#E6B44C] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </label>

        <div className="space-y-2.5">
          {/* State Dropdown */}
          <div>
            <span className="text-[11px] font-bold text-[#3B1C5A]/70 uppercase tracking-wide block mb-1">
              State / Union Territory
            </span>
            <CustomDropdown
              value={selectedState}
              onChange={(val) => handleStateChange(val)}
              placeholder="All States & Territories"
              options={[
                { value: '', label: 'All States & Territories' },
                ...INDIAN_STATES.map((st) => ({ value: st, label: st }))
              ]}
              icon={MapPin}
              ariaLabel="Select Indian State"
              clearable={Boolean(selectedState)}
              size="sm"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <span className="text-[11px] font-bold text-[#3B1C5A]/70 uppercase tracking-wide block mb-1">
              District / City
            </span>
            <CustomDropdown
              value={selectedDistrict}
              onChange={(val) => handleDistrictChange(val)}
              placeholder={selectedState ? `All Districts in ${selectedState}` : 'Select State First'}
              disabled={!selectedState}
              options={[
                { value: '', label: selectedState ? `All Districts in ${selectedState}` : 'Select State First' },
                ...availableDistricts.map((dst) => ({ value: dst, label: dst }))
              ]}
              icon={MapPin}
              ariaLabel="Select District"
              clearable={Boolean(selectedDistrict)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* ===================================================================
          FILTER 4: Product Rating Dropdown (Clean text format, distinguished from seller rating)
          =================================================================== */}
      <div className="border-b border-[#C6B7E2]/30 pb-5">
        <label className="font-extrabold text-sm text-[#3B1C5A] uppercase tracking-wider mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#E6B44C] fill-[#E6B44C]" />
            <span>Product Rating</span>
          </span>
          {selectedRating !== null && (
            <button
              onClick={() => handleRemoveFilter('rating')}
              className="text-[11px] font-bold text-[#E6B44C] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </label>
        <span className="text-[11px] text-[#3B1C5A]/60 block mb-2">
          Based on verified product reviews
        </span>

        <CustomDropdown
          value={selectedRating !== null ? String(selectedRating) : ''}
          onChange={(val) => handleRatingDropdownChange(val)}
          placeholder="All Product Ratings"
          options={[
            { value: '', label: 'All Product Ratings' },
            { value: '4', label: '4 Stars & Above (Product)' },
            { value: '3', label: '3 Stars & Above (Product)' },
            { value: '2', label: '2 Stars & Above (Product)' },
            { value: '1', label: '1 Star & Above (Product)' }
          ]}
          icon={Star}
          ariaLabel="Filter by verified product rating"
          clearable={selectedRating !== null}
          size="sm"
        />
      </div>

      {/* Reset All Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAllFilters}
          className="clay-btn-secondary w-full py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#3B1C5A]/70" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B1C5A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-[#E6B44C]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#E6B44C] shrink-0" />
          <span className="text-white font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          SECTION 1: Shop Header and Search
          ===================================================================== */}
      <section aria-label="Shop Header" className="clay-card-lavender p-6 sm:p-8 relative overflow-hidden border border-[#C6B7E2]/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs border border-[#C6B7E2]/40">
              <ShoppingBag className="w-3.5 h-3.5 text-[#E6B44C]" />
              <span>Marketplace Catalog</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3B1C5A] tracking-tight font-serif">
              Shop Products
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#3B1C5A]/75 leading-relaxed">
              Discover products from independent businesses.
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-6 relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B1C5A]/60" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, brands, or stores..."
                className="clay-input w-full pl-11 pr-24 py-3 sm:py-3.5 text-xs sm:text-sm bg-white shadow-md shadow-[#3B1C5A]/5 rounded-2xl focus:ring-2 focus:ring-[#3B1C5A]"
              />

              <div className="absolute inset-y-1.5 right-1.5 flex items-center space-x-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search input"
                    className="p-1.5 rounded-xl text-[#3B1C5A]/50 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="clay-btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold cursor-pointer rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3D Shopping Character Illustration (Transparent PNG) */}
          <div className="w-full md:w-auto md:shrink-0 flex justify-center md:justify-end items-center">
            <div className="relative w-48 sm:w-56 md:w-64 lg:w-72 select-none pointer-events-none">
              <img
                src={shopHeaderImage}
                alt="Bizora Shopping Experience"
                className="w-full h-auto object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = '/images/shop-header-character.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Ambient subtle glow decorative circle */}
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-30 pointer-events-none blur-2xl"
          style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
        />
      </section>

      {/* =====================================================================
          SECTION 2: Browse Categories — Circular Image Design
          ===================================================================== */}
      <section aria-label="Browse Categories" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#3B1C5A] tracking-tight font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E6B44C]" />
              <span>Browse Categories</span>
            </h2>
            <p className="text-xs text-[#3B1C5A]/65 mt-0.5">
              Explore specialized offerings across our verified merchant network
            </p>
          </div>

          {/* Carousel Left/Right Buttons — Circular Buttons Matching Reference */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-xs border border-[#C6B7E2]/40 hover:border-[#3B1C5A]/50 flex items-center justify-center text-[#3B1C5A] hover:bg-[#FAF7F2] transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-xs border border-[#C6B7E2]/40 hover:border-[#3B1C5A]/50 flex items-center justify-center text-[#3B1C5A] hover:bg-[#FAF7F2] transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Category Circular Showcase */}
        <div
          ref={categoryScrollRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto py-3 px-1 scrollbar-none scroll-smooth"
        >
          {/* 1. All Products Option */}
          <button
            onClick={() => handleSelectCategory('')}
            className="flex flex-col items-center group cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1C5A] rounded-2xl p-1"
            aria-label="Show all products"
          >
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-200 ${
                !selectedCategoryId
                  ? 'border-2 border-[#3B1C5A] ring-2 ring-[#3B1C5A]/25 shadow-md shadow-[#3B1C5A]/15 bg-white scale-105'
                  : 'border border-[#D4C8EB] shadow-xs group-hover:border-[#3B1C5A]/60 bg-white/95 group-hover:scale-102'
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3B1C5A] to-[#61338E] flex items-center justify-center text-[#E6B44C] shadow-inner">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            </div>
            <span
              className={`mt-2 text-xs sm:text-sm text-center line-clamp-2 max-w-[85px] sm:max-w-[95px] leading-tight transition-colors ${
                !selectedCategoryId
                  ? 'font-bold text-[#3B1C5A]'
                  : 'font-medium text-[#3B1C5A]/75 group-hover:text-[#3B1C5A]'
              }`}
            >
              All Products
            </span>
          </button>

          {/* 2. Dynamic Categories with Deduplication and Distinct Images */}
          {categoriesLoading && categories.length === 0
            ? [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="flex flex-col items-center shrink-0 animate-pulse space-y-2 p-1">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#FAF6EE] border border-[#C6B7E2]/30" />
                  <div className="h-3 w-14 bg-[#FAF6EE] rounded-lg" />
                </div>
              ))
            : categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
                const catImg = getCategoryImageUrl(cat);

                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => handleSelectCategory(cat.id || cat.slug)}
                    className="flex flex-col items-center group cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1C5A] rounded-2xl p-1"
                    aria-label={`Filter by ${cat.name}`}
                  >
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-200 ${
                        isSelected
                          ? 'border-2 border-[#3B1C5A] ring-2 ring-[#3B1C5A]/25 shadow-md shadow-[#3B1C5A]/15 bg-white scale-105'
                          : 'border border-[#D4C8EB] shadow-xs group-hover:border-[#3B1C5A]/60 bg-white/95 group-hover:scale-102'
                      }`}
                    >
                      <img
                        src={catImg}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-[#FAF6EE] to-[#EFE7D8] flex items-center justify-center text-[#3B1C5A]">
                        <Tag className="w-6 h-6 text-[#E6B44C]" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 text-xs sm:text-sm text-center line-clamp-2 max-w-[85px] sm:max-w-[95px] leading-tight transition-colors ${
                        isSelected
                          ? 'font-bold text-[#3B1C5A]'
                          : 'font-medium text-[#3B1C5A]/75 group-hover:text-[#3B1C5A]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
        </div>
      </section>

      {/* =====================================================================
          SECTIONS 3 & 4: Discovery Toolbar + 4 Main Dropdown Filters & Grid
          ===================================================================== */}
      <div ref={productSectionRef} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ===================================================================
            Desktop Filter Sidebar (Left): 4 Main Dropdown Filters
            1. Category
            2. Price Range
            3. Business Location (Indian States & Districts)
            4. Customer Rating
            =================================================================== */}
        <aside
          aria-label="Product Filters"
          className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-6 self-start clay-card p-6 bg-white/95 border border-[#C6B7E2]/40 shadow-md"
        >
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C6B7E2]/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#3B1C5A]" />
              <h2 className="font-extrabold text-base text-[#3B1C5A] font-serif">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-[#E6B44C] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {renderFilterControls()}
        </aside>

        {/* ===================================================================
            Right Column: Discovery Toolbar + Active Filters + Product Grid
            =================================================================== */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* SECTION 3: Product Discovery Toolbar */}
          <div className="clay-card p-4 sm:p-5 bg-white/95 border border-[#C6B7E2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-[#3B1C5A] font-serif truncate">
                  {selectedCategoryName}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#3B1C5A]/60 mt-0.5">
                {loading
                  ? 'Loading products...'
                  : pagination.total > displayedProducts.length
                  ? `Showing ${displayedProducts.length} of ${pagination.total} products`
                  : displayedProducts.length === 1
                  ? '1 product available'
                  : `Showing all ${displayedProducts.length} products`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Drawer Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden clay-pill px-3.5 py-2 rounded-xl text-xs font-bold text-[#3B1C5A] flex items-center gap-2 cursor-pointer shadow-xs"
                aria-label="Open filter drawer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#3B1C5A] text-[#E6B44C] text-[10px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3B1C5A]/60 hidden sm:inline">Sort:</span>
                <div className="w-48 sm:w-52">
                  <CustomDropdown
                    value={sortIndex}
                    onChange={(val) => {
                      setSortIndex(parseInt(val, 10));
                      setPage(1);
                    }}
                    options={SORT_OPTIONS.map((opt, idx) => ({ value: idx, label: opt.label }))}
                    icon={ArrowUpDown}
                    ariaLabel="Sort products by"
                    size="sm"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Tags Row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-[#3B1C5A]/60 mr-1">Active Filters:</span>

              {searchQuery.trim() && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => handleRemoveFilter('search')}
                    aria-label="Remove search filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCategoryId && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <span>Category: {selectedCategoryName}</span>
                  <button
                    onClick={() => handleRemoveFilter('category')}
                    aria-label="Remove category filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {(minPrice !== '' || maxPrice !== '') && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <span>
                    Price:{' '}
                    {minPrice !== '' && maxPrice !== ''
                      ? `₹${minPrice} - ₹${maxPrice}`
                      : minPrice !== ''
                      ? `₹${minPrice}+`
                      : `Under ₹${maxPrice}`}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter('price')}
                    aria-label="Remove price filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedState && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <MapPin className="w-3 h-3 text-[#E6B44C]" />
                  <span>State: {selectedState}</span>
                  <button
                    onClick={() => handleRemoveFilter('state')}
                    aria-label="Remove state filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedDistrict && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <MapPin className="w-3 h-3 text-[#E6B44C]" />
                  <span>District: {selectedDistrict}</span>
                  <button
                    onClick={() => handleRemoveFilter('district')}
                    aria-label="Remove district filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedRating !== null && (
                <span className="clay-pill px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FAF7F2]">
                  <span>Product Rating: {selectedRating} Stars & Above</span>
                  <button
                    onClick={() => handleRemoveFilter('rating')}
                    aria-label="Remove product rating filter"
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAllFilters}
                className="text-xs font-extrabold text-[#3B1C5A] hover:text-[#E6B44C] underline transition-colors cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* =================================================================
              SECTION 4.B: Product Grid States (Loading, Error, Empty, List)
              ================================================================= */}
          {/* 1. Loading State */}
          {loading && (
            <div className="space-y-6">
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
                <p className="text-xs font-semibold text-[#3B1C5A]/70">Loading marketplace products...</p>
              </div>

              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
            <div className="clay-card p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 bg-white/95 border border-rose-200">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#3B1C5A]">Unable to Load Products</h3>
              <p className="text-xs sm:text-sm text-[#3B1C5A]/70 leading-relaxed">{error}</p>
              <button
                onClick={fetchProducts}
                className="clay-btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!loading && !error && displayedProducts.length === 0 && (
            <div className="clay-card p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 bg-white/95 border border-[#C6B7E2]/40 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF6EE] border border-[#C6B7E2]/30 flex items-center justify-center mx-auto text-[#3B1C5A]">
                <PackageOpen className="w-8 h-8 text-[#E6B44C]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#3B1C5A]">No Products Found</h3>
                <p className="text-xs sm:text-sm text-[#3B1C5A]/70 leading-relaxed">
                  {selectedState || selectedDistrict
                    ? `No businesses currently offer products in ${selectedDistrict ? `${selectedDistrict}, ` : ''}${selectedState || 'the selected location'}. Try clearing the location filter or searching other areas.`
                    : selectedRating !== null
                    ? `No verified products currently match the "${selectedRating} Stars & Above" rating filter. (Customer ratings are shown only for verified customer reviews).`
                    : 'We could not find any products matching your current filters or search keywords.'}
                </p>
              </div>
              {hasActiveFilters && (
                <div className="pt-2">
                  <button
                    onClick={handleClearAllFilters}
                    className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Product Grid */}
          {!loading && !error && displayedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
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

          {/* =================================================================
              SECTION 5: Infinite Scroll Sentinel & Progressive Loading Feedback
              ================================================================= */}
          {!loading && !error && displayedProducts.length > 0 && (
            <div className="pt-4 pb-8 space-y-4">
              {/* Invisible sentinel tracked by IntersectionObserver */}
              <div ref={sentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />

              {/* Loading More Indicator & Skeleton Cards */}
              {loadingMore && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 opacity-75">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={`loading-more-skeleton-${n}`}
                        className="clay-card p-4 space-y-3 bg-white/70 animate-pulse border border-[#C6B7E2]/30"
                      >
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

                  <div className="flex flex-col items-center justify-center py-3">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#FAF7F2] border border-[#E6B44C]/50 shadow-sm text-[#3B1C5A]">
                      <Loader2 className="w-4 h-4 text-[#E6B44C] animate-spin" />
                      <span className="text-xs sm:text-sm font-bold tracking-wide">
                        Loading more products...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Loading Next Batch */}
              {loadMoreError && (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>{loadMoreError}</span>
                  </div>
                  <button
                    onClick={loadMoreProducts}
                    className="clay-btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tap to Retry Loading</span>
                  </button>
                </div>
              )}

              {/* Subtle Scroll Hint when more products exist */}
              {pagination.hasNextPage && !loadingMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={loadMoreProducts}
                    className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 hover:bg-white border border-[#C6B7E2]/50 text-xs font-bold text-[#3B1C5A] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E6B44C] group-hover:scale-110 transition-transform" />
                    <span>Scroll down for more products (or tap to load)</span>
                  </button>
                </div>
              )}

              {/* End of Catalog State */}
              {!pagination.hasNextPage && !loadingMore && (
                <div className="flex flex-col items-center justify-center text-center pt-6 pb-2 space-y-1">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#F0EAFB] border border-[#C6B7E2]/50 text-[#3B1C5A] text-xs font-bold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
                    <span>
                      You&apos;ve viewed all {displayedProducts.length} product{displayedProducts.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3B1C5A]/60">
                    Merchants regularly add fresh products to Bizora. Check back soon!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          Mobile Filter Drawer Modal (< lg screens)
          ===================================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-[#3B1C5A]/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            role="dialog"
            aria-label="Product Filters Drawer"
            className="relative ml-auto m-3 w-80 max-w-[calc(100vw-2rem)] rounded-3xl bg-white clay-card p-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border border-[#C6B7E2]/50 max-h-[calc(100vh-1.5rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#C6B7E2]/40 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#3B1C5A]" />
                <h3 className="font-extrabold text-lg text-[#3B1C5A] font-serif">Filters</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters drawer"
                className="p-1.5 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F0EAFB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {renderFilterControls()}
            </div>

            <div className="pt-4 mt-4 border-t border-[#C6B7E2]/30 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="clay-btn-primary flex-1 py-2.5 text-xs font-bold cursor-pointer"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    handleClearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="clay-btn-secondary px-3 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

export default CustomerShopPage;
