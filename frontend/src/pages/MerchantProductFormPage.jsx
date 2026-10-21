import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Package,
  Store,
  Eye,
  Info,
  DollarSign
} from 'lucide-react';

const DISPLAY_STYLES = [
  {
    id: 'standard',
    name: 'Standard Card',
    badge: 'Default',
    icon: Package,
    description: 'Balanced presentation with standard image height, clear title, price, and essential actions. Perfect for general catalog goods.',
    idealFor: 'Everyday products, groceries, electronics, and general retail.'
  },
  {
    id: 'editorial',
    name: 'Editorial Card',
    badge: 'Artisan & Fashion',
    icon: Sparkles,
    description: 'High-aspect photography with spacious margins, elegant typography, and a minimalist luxury feel.',
    idealFor: 'Apparel, jewelry, handcrafted items, home decor, and luxury lifestyle goods.'
  },
  {
    id: 'detailed',
    name: 'Detailed Card',
    badge: 'Specs & Data',
    icon: Layers,
    description: 'Information-rich layout featuring SKU tags, description snippets, and explicit real-time stock units count.',
    idealFor: 'Specialty coffee, gourmet pantry, industrial supplies, and multi-specification items.'
  }
];

export const MerchantProductFormPage = () => {
  const { id: editProductId } = useParams();
  const isEditMode = Boolean(editProductId);
  const navigate = useNavigate();
  const { user, selectedBusiness } = useAuth();

  // Categories list
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    stockQuantity: '10',
    lowStockThreshold: '5',
    images: [],
    displayStyle: 'standard',
    isPublished: true,
    status: 'active',
    attributes: {
      color: '',
      size: '',
      material: '',
      weight: ''
    }
  });

  // Load Categories for the selected business
  useEffect(() => {
    const fetchCats = async () => {
      if (!selectedBusiness?.id) return;
      try {
        const res = await api.get('/categories', {
          params: { businessId: selectedBusiness.id }
        });
        setCategories(res.data?.data?.categories || res.data?.data || []);
      } catch (err) {
        console.warn('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, [selectedBusiness?.id]);

  // Load existing product if Edit Mode
  useEffect(() => {
    if (!isEditMode || !editProductId) return;

    const loadProduct = async () => {
      setLoadingInitial(true);
      setErrorMessage('');
      try {
        const res = await api.get(`/products/${editProductId}`, {
          params: { businessId: selectedBusiness?.id }
        });
        const p = res.data?.data?.product;
        if (!p) throw new Error('Product not found');

        // Check if description has embedded JSON specs or standard text
        let attrObj = { color: '', size: '', material: '', weight: '' };
        let cleanDesc = p.description || '';

        setFormData({
          name: p.name || '',
          sku: p.sku || '',
          categoryId: p.categoryId || '',
          description: cleanDesc,
          price: p.price ? String(p.price) : '',
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          costPrice: p.costPrice ? String(p.costPrice) : '',
          stockQuantity: p.stockQuantity !== undefined ? String(p.stockQuantity) : '0',
          lowStockThreshold: p.lowStockThreshold !== undefined ? String(p.lowStockThreshold) : '5',
          images: Array.isArray(p.images) ? p.images : [],
          displayStyle: p.displayStyle || 'standard',
          isPublished: p.isPublished !== undefined ? p.isPublished : true,
          status: p.status || 'active',
          attributes: attrObj
        });
      } catch (err) {
        console.error('Failed to load product details for edit:', err);
        setErrorMessage(
          err.response?.data?.message || 'Unable to load product details. You might not have permission.'
        );
      } finally {
        setLoadingInitial(false);
      }
    };

    loadProduct();
  }, [isEditMode, editProductId, selectedBusiness?.id]);

  // Handle Image Upload to backend
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 8) {
      setFieldErrors((prev) => ({
        ...prev,
        images: 'Maximum 8 images allowed per product'
      }));
      return;
    }

    setUploadingImage(true);
    setFieldErrors((prev) => ({ ...prev, images: null }));

    try {
      const uploadForm = new FormData();
      files.forEach((f) => uploadForm.append('images', f));
      if (isEditMode) {
        uploadForm.append('productId', editProductId);
      }

      const res = await api.post('/uploads/products', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrls = res.data?.data?.images || [];
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls]
      }));
    } catch (err) {
      console.error('Failed to upload product image(s):', err);
      setFieldErrors((prev) => ({
        ...prev,
        images: err.response?.data?.message || 'Failed to upload image. Please ensure valid PNG/JPG/WEBP.'
      }));
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Set image as primary (move to index 0)
  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const copy = [...prev.images];
      const [selected] = copy.splice(index, 1);
      copy.unshift(selected);
      return { ...prev, images: copy };
    });
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const copy = [...prev.images];
      copy.splice(index, 1);
      return { ...prev, images: copy };
    });
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Product name is required (at least 2 characters)';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 200) {
      errors.name = 'Product name must be between 2 and 200 characters';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Valid selling price (₹) is required and cannot be negative';
    }

    if (formData.compareAtPrice) {
      const compNum = parseFloat(formData.compareAtPrice);
      if (isNaN(compNum) || compNum < 0) {
        errors.compareAtPrice = 'Original / Compare-at price cannot be negative';
      }
    }

    if (formData.costPrice) {
      const costNum = parseFloat(formData.costPrice);
      if (isNaN(costNum) || costNum < 0) {
        errors.costPrice = 'Cost price cannot be negative';
      }
    }

    const stockNum = parseInt(formData.stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stockQuantity = 'Stock quantity cannot be negative';
    }

    const thresholdNum = parseInt(formData.lowStockThreshold, 10);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      errors.lowStockThreshold = 'Low stock threshold cannot be negative';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;

    if (!selectedBusiness?.id) {
      setErrorMessage('No active business selected. Please select a business from the top menu.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        businessId: selectedBusiness.id,
        name: formData.name.trim(),
        sku: formData.sku.trim() || null,
        categoryId: formData.categoryId || null,
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 5,
        images: formData.images,
        displayStyle: formData.displayStyle || 'standard',
        isPublished: formData.isPublished,
        status: formData.status
      };

      if (isEditMode) {
        await api.patch(`/products/${editProductId}`, payload);
        setSuccessMessage('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        setSuccessMessage('Product created successfully!');
      }

      setTimeout(() => {
        navigate('/merchant/products');
      }, 1200);
    } catch (err) {
      console.error('Failed to save product:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to save product. Please check required fields.';
      setErrorMessage(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock product object for live preview
  const previewProduct = useMemo(() => {
    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    return {
      id: editProductId || 'preview-demo-id',
      name: formData.name.trim() || 'Sample Product Title',
      description: formData.description.trim() || 'Handmade with premium materials for discerning buyers.',
      price: formData.price ? parseFloat(formData.price) : 999.00,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
      stockQuantity: parseInt(formData.stockQuantity, 10) || 10,
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 5,
      sku: formData.sku.trim() || 'PRD-001',
      images: formData.images.length > 0 ? formData.images : [],
      displayStyle: formData.displayStyle,
      category: selectedCat ? { id: selectedCat.id, name: selectedCat.name } : { name: 'Featured Collection' },
      business: {
        id: selectedBusiness?.id || 'demo-biz-id',
        name: selectedBusiness?.name || 'Your Store'
      }
    };
  }, [formData, categories, editProductId, selectedBusiness]);

  if (loadingInitial) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#E6B44C] mx-auto" />
        <h2 className="text-xl font-bold text-[#3B1C5A]">Loading Product Details...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C6B7E2]/40">
        <div className="flex items-center space-x-3">
          <Link
            to="/merchant/products"
            className="p-2 rounded-2xl bg-white clay-card text-[#3B1C5A] hover:bg-[#F0EAFB] border border-[#C6B7E2]/40 transition-colors shadow-xs"
            aria-label="Back to products list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60">
              <Store className="w-3.5 h-3.5" />
              <span>{selectedBusiness?.name || 'Store'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] font-serif">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#3B1C5A]/70">Publishing Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              formData.isPublished && formData.status === 'active'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {formData.isPublished && formData.status === 'active' ? 'Active / Published' : 'Draft Mode'}
          </span>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="clay-card p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="clay-card p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{successMessage} Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* =========================================================================
            SECTION 1: BASIC INFORMATION
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-4">
          <div className="border-b border-[#C6B7E2]/30 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E6B44C]" />
              <span>1. Basic Product Information</span>
            </h2>
            <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
              Enter the product title, SKU code, and detailed description.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="prod-name" className="block text-xs font-bold text-[#3B1C5A]">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                }}
                placeholder="e.g. Handcrafted Kashmiri Pashmina Shawl"
                className={`clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border ${
                  fieldErrors.name ? 'border-rose-400 ring-2 ring-rose-200' : 'border-[#C6B7E2]/50'
                } text-[#3B1C5A]`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-sku" className="block text-xs font-bold text-[#3B1C5A]">
                SKU / Identifier
              </label>
              <input
                id="prod-sku"
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SHAWL-KASH-001"
                className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prod-desc" className="block text-xs font-bold text-[#3B1C5A]">
              Product Description
            </label>
            <textarea
              id="prod-desc"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the craftsmanship, materials, provenance, and special features of this product..."
              className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: PRODUCT IMAGES
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-4">
          <div className="border-b border-[#C6B7E2]/30 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#E6B44C]" />
                <span>2. Product Images</span>
              </h2>
              <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
                Upload up to 8 images. The first image serves as the primary storefront thumbnail.
              </p>
            </div>
            <span className="text-xs font-bold text-[#3B1C5A]/60">
              {formData.images.length} / 8 uploaded
            </span>
          </div>

          {/* Upload Button Box */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="clay-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs hover:bg-[#F0EAFB]">
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#3B1C5A]" />
              ) : (
                <Plus className="w-4 h-4 text-[#3B1C5A]" />
              )}
              <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image File(s)'}</span>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageFileChange}
                disabled={uploadingImage || formData.images.length >= 8}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-[#3B1C5A]/50">
              Supported formats: JPEG, PNG, WEBP, GIF (Max 5MB per file)
            </span>
          </div>

          {fieldErrors.images && (
            <p className="text-xs font-bold text-rose-600">{fieldErrors.images}</p>
          )}

          {/* Image Thumbnails Grid */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {formData.images.map((imgUrl, index) => {
                const isPrimary = index === 0;
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    className={`relative rounded-2xl overflow-hidden aspect-square border ${
                      isPrimary ? 'border-[#E6B44C] ring-2 ring-[#E6B44C]/40' : 'border-[#C6B7E2]/50'
                    } group bg-[#FAF6EE] shadow-xs`}
                  >
                    <img src={imgUrl} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#3B1C5A] text-[#E6B44C] shadow-sm">
                        Primary
                      </span>
                    )}

                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-[#3B1C5A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(index)}
                          title="Set as Primary Image"
                          className="p-1.5 rounded-xl bg-white/90 text-[#3B1C5A] hover:bg-[#E6B44C] hover:text-[#3B1C5A] transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title="Remove Image"
                        className="p-1.5 rounded-xl bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 3: CATEGORIES & CATALOG HIERARCHY
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-4">
          <div className="border-b border-[#C6B7E2]/30 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif flex items-center gap-2">
              <Store className="w-5 h-5 text-[#E6B44C]" />
              <span>3. Product Category</span>
            </h2>
            <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
              Assign this product to an existing store or global marketplace category.
            </p>
          </div>

          <div className="max-w-md space-y-1.5">
            <label htmlFor="prod-category" className="block text-xs font-bold text-[#3B1C5A]">
              Category Selection
            </label>
            <select
              id="prod-category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] cursor-pointer"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.businessId ? '(Store Category)' : '(Marketplace Category)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: PRICING & INVENTORY
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs space-y-4">
          <div className="border-b border-[#C6B7E2]/30 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#E6B44C]" />
              <span>4. Pricing & Inventory Tracking</span>
            </h2>
            <p className="text-xs text-[#3B1C5A]/60 mt-0.5">
              Set customer selling price, optional compare-at original price, stock quantities, and low stock threshold.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Selling Price */}
            <div className="space-y-1.5">
              <label htmlFor="prod-price" className="block text-xs font-bold text-[#3B1C5A]">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: null });
                }}
                placeholder="499.00"
                className={`clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border ${
                  fieldErrors.price ? 'border-rose-400 ring-2 ring-rose-200' : 'border-[#C6B7E2]/50'
                } text-[#3B1C5A] font-bold`}
              />
              {fieldErrors.price && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.price}</p>
              )}
            </div>

            {/* Compare At Price */}
            <div className="space-y-1.5">
              <label htmlFor="prod-compare-price" className="block text-xs font-bold text-[#3B1C5A]">
                Original / Compare-at Price (₹)
              </label>
              <input
                id="prod-compare-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                placeholder="699.00"
                className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A]"
              />
              <span className="text-[10px] text-[#3B1C5A]/50">Renders as strikethrough discount if higher</span>
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label htmlFor="prod-cost-price" className="block text-xs font-bold text-[#3B1C5A]">
                Cost Price (₹)
              </label>
              <input
                id="prod-cost-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="250.00"
                className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A]"
              />
              <span className="text-[10px] text-[#3B1C5A]/50">Merchant private margin tracking</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#C6B7E2]/30">
            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <label htmlFor="prod-stock" className="block text-xs font-bold text-[#3B1C5A]">
                Available Stock Quantity
              </label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="10"
                className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A] font-bold"
              />
              <span className="text-[10px] text-[#3B1C5A]/50">Products with 0 stock are marked Out of Stock</span>
            </div>

            {/* Low Stock Alert Threshold */}
            <div className="space-y-1.5">
              <label htmlFor="prod-low-threshold" className="block text-xs font-bold text-[#3B1C5A]">
                Low Stock Alert Threshold
              </label>
              <input
                id="prod-low-threshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                placeholder="5"
                className="clay-input w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#C6B7E2]/50 text-[#3B1C5A]"
              />
              <span className="text-[10px] text-[#3B1C5A]/50">Alerts when inventory dips below this value</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: PER-PRODUCT DISPLAY STYLE (CORE REQUIREMENT)
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border-2 border-[#E6B44C]/40 shadow-sm space-y-5">
          <div className="border-b border-[#C6B7E2]/30 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E6B44C]" />
                <h2 className="text-base sm:text-lg font-extrabold text-[#3B1C5A] font-serif">
                  5. Per-Product Display Style
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#3B1C5A] text-[#E6B44C]">
                  Core Feature
                </span>
              </div>
              <p className="text-xs text-[#3B1C5A]/70 mt-1 leading-relaxed">
                Select how this individual product is presented in your storefront and marketplace catalog.
                Changing this setting does not alter other products or change your global store template.
              </p>
            </div>
          </div>

          {/* Style Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DISPLAY_STYLES.map((style) => {
              const isSelected = formData.displayStyle === style.id;
              const Icon = style.icon;

              return (
                <div
                  key={style.id}
                  onClick={() => setFormData({ ...formData, displayStyle: style.id })}
                  className={`clay-card p-4 sm:p-5 rounded-3xl cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-[#F0EAFB] border-[#3B1C5A] ring-2 ring-[#3B1C5A]/25 shadow-md scale-[1.01]'
                      : 'bg-white hover:bg-[#FAF8F5] border-[#C6B7E2]/40 hover:border-[#3B1C5A]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isSelected ? 'bg-[#3B1C5A] text-[#E6B44C]' : 'bg-[#FAF6EE] text-[#3B1C5A]'
                        } shadow-xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSelected ? 'bg-[#3B1C5A] text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {style.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-[#3B1C5A] text-sm sm:text-base">
                        {style.name}
                      </h3>
                      <p className="text-xs text-[#3B1C5A]/75 mt-1 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#C6B7E2]/30 text-[10.5px] text-[#3B1C5A]/60 italic">
                    Best for: {style.idealFor}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Card Preview */}
          <div className="pt-4 border-t border-[#C6B7E2]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#E6B44C]" />
                <span>Live Card Preview (Selected Style: {formData.displayStyle})</span>
              </span>
              <span className="text-[11px] text-[#3B1C5A]/50">
                Shows exact customer storefront appearance
              </span>
            </div>

            <div className="p-4 sm:p-6 rounded-3xl bg-[#F6F1E8]/70 border border-[#C6B7E2]/50 max-w-sm mx-auto">
              <ProductCard product={previewProduct} previewStyle={formData.displayStyle} />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: PUBLISHING STATUS & SUBMIT
            ========================================================================= */}
        <div className="clay-card p-6 rounded-3xl bg-white/95 border border-[#C6B7E2]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-[#3B1C5A]">Publishing Lifecycle</h3>
            <div className="flex items-center space-x-4 pt-1">
              <label className="inline-flex items-center space-x-2 cursor-pointer text-xs font-bold text-[#3B1C5A]">
                <input
                  type="radio"
                  name="publishMode"
                  checked={formData.isPublished && formData.status === 'active'}
                  onChange={() => setFormData({ ...formData, isPublished: true, status: 'active' })}
                  className="text-[#3B1C5A] focus:ring-[#3B1C5A]"
                />
                <span>Publish Immediately (Active)</span>
              </label>

              <label className="inline-flex items-center space-x-2 cursor-pointer text-xs font-bold text-[#3B1C5A]">
                <input
                  type="radio"
                  name="publishMode"
                  checked={!formData.isPublished || formData.status === 'draft'}
                  onChange={() => setFormData({ ...formData, isPublished: false, status: 'draft' })}
                  className="text-[#3B1C5A] focus:ring-[#3B1C5A]"
                />
                <span>Save as Draft (Hidden from Customers)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/merchant/products"
              className="clay-btn-secondary px-5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="clay-btn-accent px-6 py-2.5 text-xs sm:text-sm font-bold rounded-2xl cursor-pointer shadow-md inline-flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditMode ? 'Update Product' : 'Save & Create Product'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MerchantProductFormPage;

