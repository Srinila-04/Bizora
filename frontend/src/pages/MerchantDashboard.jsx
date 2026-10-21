import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Store,
  PlusCircle,
  Eye,
  Edit,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  X,
  CreditCard,
  Palette,
  Check,
  MessageSquare,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import MerchantOrdersSection from '../components/MerchantOrdersSection';
import MerchantCodReconciliation from '../components/MerchantCodReconciliation';
import MerchantStoreDesignStudio from '../components/MerchantStoreDesignStudio';
import MerchantCommunicationSection from '../components/MerchantCommunicationSection';
import MerchantBusinessSettings from '../components/MerchantBusinessSettings';
import DeleteBusinessModal from '../components/DeleteBusinessModal';
import { STOREFRONT_TEMPLATES_LIST, getStorefrontTemplate } from '../config/storefrontTemplates';

export const MerchantDashboard = () => {
  const { user, businesses, selectedBusiness, switchBusiness, fetchUserBusinesses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const getResolvedTab = (tab) => {
    if (tab === 'orders') return 'orders';
    if (tab === 'cod' || tab === 'earnings') return 'cod';
    if (tab === 'design' || tab === 'store-design' || tab === 'storedesign' || tab === 'template' || tab === 'theme') return 'design';
    if (tab === 'business-settings' || tab === 'settings' || tab === 'store-settings') return 'business-settings';
    if (tab === 'all-businesses') return 'all-businesses';
    if (tab === 'communication' || tab === 'messages' || tab === 'chat') return 'communication';
    if (location.pathname.includes('/store-design') || location.pathname.includes('/design')) return 'design';
    if (location.pathname.includes('/business-settings') || location.pathname.includes('/settings')) return 'business-settings';
    return 'overview';
  };

  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => getResolvedTab(tabParam));

  useEffect(() => {
    if (tabParam === 'inventory') {
      navigate('/merchant/inventory', { replace: true });
    } else if (tabParam === 'analytics' || tabParam === 'sales-analytics') {
      navigate('/merchant/analytics', { replace: true });
    } else if (tabParam === 'account') {
      navigate('/merchant/account', { replace: true });
    } else {
      setActiveTab(getResolvedTab(tabParam));
    }
  }, [tabParam, location.pathname, navigate]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Deletion modal state
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);
  const [deleteBusinessError, setDeleteBusinessError] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const openDeleteModal = (business) => {
    setBusinessToDelete(business);
    setDeleteBusinessError('');
  };

  const handleConfirmDeleteBusiness = async () => {
    if (!businessToDelete || isDeletingBusiness) return;
    setIsDeletingBusiness(true);
    setDeleteBusinessError('');

    try {
      const res = await api.delete(`/businesses/${businessToDelete.id}`);
      const successMsg = res.data?.message || `Business "${businessToDelete.name}" deleted successfully.`;

      // Update state without manual page refresh
      await fetchUserBusinesses();

      setBusinessToDelete(null);
      setActionSuccessMessage(successMsg);
      setTimeout(() => {
        setActionSuccessMessage('');
      }, 5000);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to delete business. Please try again.';
      setDeleteBusinessError(msg);
    } finally {
      setIsDeletingBusiness(false);
    }
  };

  useEffect(() => {
    fetchUserBusinesses();
  }, [fetchUserBusinesses]);

  const handleTogglePublish = async (businessId) => {
    if (!businessId || toggleLoading) return;
    setToggleLoading(true);
    try {
      const res = await api.post(`/businesses/${businessId}/toggle-publish`);
      await fetchUserBusinesses();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    } finally {
      setToggleLoading(false);
    }
  };

  const openEditModal = (business) => {
    setEditFormData({
      id: business.id,
      name: business.name,
      category: business.category || '',
      description: business.description || '',
      phone: business.phone || '',
      email: business.email || '',
      address: business.address || '',
      website: business.website || '',
      taxId: business.taxId || ''
    });
    setEditError('');
    setEditSuccess('');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError('');
    setEditSuccess('');

    try {
      const { id, ...data } = editFormData;
      await api.patch(`/businesses/${id}`, data);
      await fetchUserBusinesses();
      setEditSuccess('Business details updated successfully!');
      setTimeout(() => {
        setEditModalOpen(false);
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update business details.';
      setEditError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/60 mb-1">
            <span>Merchant Control Center</span>
            <span>•</span>
            <span className="text-[#3B1C5A] font-extrabold">{user?.firstName} {user?.lastName}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3B1C5A]">
            Merchant Dashboard
          </h1>
        </div>

        {/* Action Button: Register New Business */}
        <Link
          to="/merchant/business/new"
          className="clay-btn-accent px-5 py-3 text-xs sm:text-sm font-bold inline-flex items-center space-x-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Another Business</span>
        </Link>
      </div>

      {/* Action Notification Banner (e.g. business deletion success) */}
      {actionSuccessMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage('')}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100/60 transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Case 1: First-time Merchant (No businesses registered yet) */}
      {businesses.length === 0 ? (
        <div className="clay-card p-10 sm:p-16 text-center max-w-2xl mx-auto my-6 space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-[#E6B44C]/25 text-[#3B1C5A] clay-card flex items-center justify-center mx-auto shadow-md">
            <Store className="w-12 h-12 text-[#3B1C5A]" />
          </div>

          <div className="space-y-2">
            <span className="clay-badge-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              First-Time Merchant
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A]">
              Register Your First Business
            </h2>
            <p className="text-sm text-[#3B1C5A]/75 max-w-md mx-auto leading-relaxed">
              Your merchant account is active! You haven't registered any storefronts yet. Set up your first digital storefront to list products, accept customer orders, and publish to the marketplace.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/merchant/business/new"
              className="clay-btn-primary px-8 py-4 text-sm font-extrabold inline-flex items-center space-x-2 shadow-lg"
            >
              <Store className="w-5 h-5 text-[#E6B44C]" />
              <span>Register Your First Business</span>
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-[#C6B7E2]/40 text-xs text-[#3B1C5A]/80 text-left space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
              <Layers className="w-4 h-4 text-[#E6B44C]" />
              <span>Multiple Storefront Architecture</span>
            </div>
            <p className="leading-relaxed">
              Bizora allows you to manage multiple distinct businesses, separate inventories, and storefront brandings from this single account. You can add more businesses at any time.
            </p>
          </div>
        </div>
      ) : (
        /* Case 2: Returning Merchant (1+ businesses) */
        <div className="space-y-8">
          {/* Active Business Context Selector Bar */}
          <div className="clay-card p-4 sm:p-6 bg-white/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B1C5A] text-[#E6B44C] flex items-center justify-center font-bold shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/60">
                    Active Business Workspace ({businesses.length} Total)
                  </span>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-[#3B1C5A]">
                      {selectedBusiness?.name || 'Select a Business'}
                    </h2>
                    {selectedBusiness?.isPublished ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Draft / Unpublished
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Selector Pill Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#3B1C5A]/60 mr-1 hidden sm:inline">
                  Switch Business:
                </span>
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => switchBusiness(biz)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedBusiness?.id === biz.id
                        ? 'clay-btn-primary shadow-md'
                        : 'clay-btn-secondary hover:bg-white'
                    }`}
                  >
                    <span className="truncate max-w-[120px] inline-block">{biz.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Merchant Management Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <Store className="w-4 h-4 text-[#E6B44C]" />
              <span>Store Overview</span>
            </button>

            <button
              type="button"
              data-testid="tab-storefront-design"
              onClick={() => handleTabChange('design')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'design'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <Palette className="w-4 h-4 text-[#E6B44C]" />
              <span>Storefront Templates</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('orders')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <Package className="w-4 h-4 text-[#E6B44C]" />
              <span>Orders & Fulfilment</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('cod')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'cod'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#E6B44C]" />
              <span>COD Reconciliation</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('communication')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'communication'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#E6B44C]" />
              <span>Customer Inquiries</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('business-settings')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'business-settings'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#E6B44C]" />
              <span>Business Settings</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('all-businesses')}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'all-businesses'
                  ? 'clay-btn-primary shadow-md'
                  : 'clay-btn-secondary hover:bg-white'
              }`}
            >
              <Layers className="w-4 h-4 text-[#E6B44C]" />
              <span>All Storefronts ({businesses.length})</span>
            </button>
          </div>

          {/* Tab: Storefront Design & Templates Studio */}
          {activeTab === 'design' && (
            <MerchantStoreDesignStudio
              business={selectedBusiness}
              businesses={businesses}
              onSwitchBusiness={switchBusiness}
              onBusinessUpdated={fetchUserBusinesses}
            />
          )}

          {/* Tab 2: Orders & Fulfilment Workflow */}
          {activeTab === 'orders' && (
            <MerchantOrdersSection
              businessId={selectedBusiness?.id}
              businessName={selectedBusiness?.name}
            />
          )}

          {/* Tab 3: Cash on Delivery (COD) Reconciliation */}
          {activeTab === 'cod' && (
            <MerchantCodReconciliation
              businessId={selectedBusiness?.id}
              businessName={selectedBusiness?.name}
            />
          )}

          {/* Tab 4: Customer Communication */}
          {activeTab === 'communication' && (
            <MerchantCommunicationSection />
          )}

          {/* Tab 5: Business Settings & Branding */}
          {activeTab === 'business-settings' && (
            <MerchantBusinessSettings />
          )}

          {/* Tab 1: Store Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Draft Storefront Banner when Unpublished */}
              {selectedBusiness && !selectedBusiness.isPublished && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#3B1C5A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3B1C5A]">
                        Storefront is currently in Draft (Unpublished) Mode
                      </p>
                      <p className="text-xs text-[#3B1C5A]/70">
                        Customers cannot see &ldquo;{selectedBusiness?.name}&rdquo; in the Customer Business Store directory until you publish it.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePublish(selectedBusiness?.id)}
                    disabled={toggleLoading}
                    className="clay-btn-accent px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <ToggleRight className="w-4 h-4" />
                    <span>Publish Storefront Now</span>
                  </button>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="clay-card p-5 bg-white/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#3B1C5A]/60 uppercase">Storefront Status</span>
                <Store className="w-4 h-4 text-[#3B1C5A]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-[#3B1C5A]">
                  {selectedBusiness?.isPublished ? 'Live in Market' : 'Unpublished (Draft)'}
                </span>
                <button
                  onClick={() => handleTogglePublish(selectedBusiness?.id)}
                  disabled={toggleLoading}
                  className="clay-pill px-2.5 py-1 text-xs font-bold flex items-center gap-1 hover:bg-[#C6B7E2]/50 transition-colors"
                >
                  {selectedBusiness?.isPublished ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-amber-600" />
                      <span>Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="clay-card p-5 bg-white/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#3B1C5A]/60 uppercase">Category</span>
                <Package className="w-4 h-4 text-[#E6B44C]" />
              </div>
              <span className="text-lg font-extrabold text-[#3B1C5A] truncate block">
                {selectedBusiness?.category || 'General'}
              </span>
            </div>

            <div className="clay-card p-5 bg-white/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#3B1C5A]/60 uppercase">My Total Stores</span>
                <Layers className="w-4 h-4 text-[#3B1C5A]" />
              </div>
              <span className="text-2xl font-extrabold text-[#3B1C5A]">
                {businesses.length} Store{businesses.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="clay-card p-5 bg-white/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#3B1C5A]/60 uppercase">Tax ID / GST</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-extrabold text-[#3B1C5A] truncate block">
                {selectedBusiness?.taxId || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Active Business Detail Card */}
          {selectedBusiness && (
            <div className="clay-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C6B7E2]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-[#3B1C5A]">
                      {selectedBusiness.name}
                    </h3>
                    <span className="clay-pill px-2.5 py-0.5 rounded-full text-xs font-bold text-[#3B1C5A]">
                      {selectedBusiness.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#3B1C5A]/70 mt-1">
                    Store Slug: <code className="bg-[#C6B7E2]/30 px-1.5 py-0.5 rounded font-mono">/store/{selectedBusiness.slug}</code>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTabChange('business-settings')}
                    className="clay-btn-secondary px-4 py-2 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B1C5A]" />
                    <span>Store Settings & Branding</span>
                  </button>
                  <Link
                    to={`/marketplace`}
                    className="clay-btn-accent px-4 py-2 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in Market</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(selectedBusiness)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors flex items-center space-x-1.5 border border-rose-200/80 cursor-pointer"
                    title={`Delete ${selectedBusiness.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Business</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/70 mb-1">
                  About Storefront
                </h4>
                <p className="text-sm text-[#3B1C5A]/85 leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#C6B7E2]/30">
                  {selectedBusiness.description || 'No description provided yet.'}
                </p>
              </div>

              {/* Contact & Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/70 border border-[#C6B7E2]/30 flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#3B1C5A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#3B1C5A]/60 block">Customer Phone</span>
                    <span className="text-xs font-semibold text-[#3B1C5A]">{selectedBusiness.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 border border-[#C6B7E2]/30 flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#3B1C5A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#3B1C5A]/60 block">Contact Email</span>
                    <span className="text-xs font-semibold text-[#3B1C5A]">{selectedBusiness.email || user?.email}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 border border-[#C6B7E2]/30 flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#3B1C5A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#3B1C5A]/60 block">Business Address</span>
                    <span className="text-xs font-semibold text-[#3B1C5A] line-clamp-2">{selectedBusiness.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
          )}

          {/* All Owned Businesses Section */}
          {(activeTab === 'overview' || activeTab === 'all-businesses') && (
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#3B1C5A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#E6B44C]" />
                <span>All Registered Businesses ({businesses.length})</span>
              </h3>
              <Link
                to="/merchant/business/new"
                className="text-xs font-bold text-[#3B1C5A] hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#E6B44C]" />
                <span>Add Another Business</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  className={`clay-card p-5 relative transition-all ${
                    selectedBusiness?.id === b.id
                      ? 'border-2 border-[#3B1C5A] bg-white shadow-xl'
                      : 'bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#C6B7E2]/30 text-[#3B1C5A] flex items-center justify-center font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#3B1C5A] line-clamp-1">{b.name}</h4>
                        <span className="text-[10px] text-[#3B1C5A]/60">{b.category}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-xs text-[#3B1C5A]/75 line-clamp-2 mb-4 leading-relaxed">
                    {b.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#C6B7E2]/30 text-xs">
                    <button
                      onClick={() => switchBusiness(b)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        selectedBusiness?.id === b.id
                          ? 'bg-[#3B1C5A] text-white'
                          : 'clay-pill text-[#3B1C5A]'
                      }`}
                    >
                      {selectedBusiness?.id === b.id ? 'Selected' : 'Manage Store'}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          switchBusiness(b);
                          handleTabChange('business-settings');
                        }}
                        className="p-1.5 text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/20 rounded-lg transition-colors cursor-pointer"
                        title="Edit Business Settings & Branding"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(b);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer border border-rose-200/60"
                        title={`Delete ${b.name}`}
                        aria-label={`Delete ${b.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Edit Business Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-sm">
          <div className="clay-card w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/30 mb-4">
              <h3 className="text-lg font-bold text-[#3B1C5A]">Edit Business Details</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F6F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{editSuccess}</span>
              </div>
            )}

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="clay-input w-full px-3.5 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="clay-input w-full p-3.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="clay-input w-full px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="clay-input w-full px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="clay-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="clay-input w-full px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/80 mb-1">
                    Tax / GST ID
                  </label>
                  <input
                    type="text"
                    value={editFormData.taxId}
                    onChange={(e) => setEditFormData({ ...editFormData, taxId: e.target.value })}
                    className="clay-input w-full px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="clay-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Business Confirmation Modal */}
      <DeleteBusinessModal
        isOpen={Boolean(businessToDelete)}
        business={businessToDelete}
        isDeleting={isDeletingBusiness}
        error={deleteBusinessError}
        onClose={() => {
          if (!isDeletingBusiness) {
            setBusinessToDelete(null);
            setDeleteBusinessError('');
          }
        }}
        onConfirm={handleConfirmDeleteBusiness}
      />
    </div>
  );
};

export default MerchantDashboard;

