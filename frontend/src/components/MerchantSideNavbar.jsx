import React, { useState } from 'react';
import { NavLink, useLocation, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Layers,
  Package,
  Palette,
  BarChart3,
  Megaphone,
  DollarSign,
  MessageSquare,
  SlidersHorizontal,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChatUnread } from '../hooks/useChatUnread';
import SignOutConfirmModal from './SignOutConfirmModal';

// Final Merchant Navigation Menu Items (Exact 12 Items in Specified Order):
// 1. Dashboard
// 2. My Businesses
// 3. Products
// 4. Inventory
// 5. Orders
// 6. Store Design
// 7. Sales & Analytics
// 8. Marketing & Promotions
// 9. Payments & Earnings
// 10. Customer Communication
// 11. Business Settings
// 12. Account (always the final item)
const MERCHANT_MENU_ITEMS = [
  {
    name: 'Dashboard',
    path: '/merchant/dashboard',
    tab: 'overview',
    icon: LayoutDashboard,
    isAvailable: true,
    description: 'Store overview & summary'
  },
  {
    name: 'My Businesses',
    path: '/merchant/dashboard?tab=all-businesses',
    tab: 'all-businesses',
    icon: Store,
    isAvailable: true,
    description: 'Manage storefronts & workspaces'
  },
  {
    name: 'Products',
    path: '/merchant/products',
    tab: 'products',
    icon: ShoppingBag,
    isAvailable: true,
    description: 'Manage store catalog, pricing & stock'
  },
  {
    name: 'Inventory',
    path: '/merchant/inventory',
    tab: 'inventory',
    icon: Layers,
    isAvailable: true,
    description: 'Stock tracking, variant management & reorder alerts'
  },
  {
    name: 'Orders',
    path: '/merchant/dashboard?tab=orders',
    tab: 'orders',
    icon: Package,
    isAvailable: true,
    description: 'Order fulfillment & dispatch'
  },
  {
    name: 'Store Design',
    path: '/merchant/dashboard?tab=design',
    tab: 'design',
    icon: Palette,
    isAvailable: true,
    description: 'Storefront templates, themes & branding'
  },
  {
    name: 'Sales & Analytics',
    path: '/merchant/analytics',
    tab: 'analytics',
    icon: BarChart3,
    isAvailable: true,
    description: 'Sales performance, trends & financial metrics'
  },
  // {
  //   name: 'Marketing & Promotions',
  //   path: null,
  //   tab: 'marketing',
  //   icon: Megaphone,
  //   isAvailable: false,
  //   description: 'Promotions & discount campaigns (Coming Soon)'
  // },
  {
    name: 'Payments & Earnings',
    path: '/merchant/dashboard?tab=cod',
    tab: 'cod',
    icon: DollarSign,
    isAvailable: true,
    description: 'COD reconciliation & revenue ledger'
  },
  {
    name: 'Customer Communication',
    path: '/merchant/dashboard?tab=communication',
    tab: 'communication',
    icon: MessageSquare,
    isAvailable: true,
    description: 'Customer chat & inquiries'
  },
  {
    name: 'Business Settings',
    path: '/merchant/dashboard?tab=business-settings',
    tab: 'business-settings',
    icon: SlidersHorizontal,
    isAvailable: true,
    description: 'Store configurations, logo & banner'
  },
  {
    name: 'Account',
    path: '/merchant/account',
    tab: 'account',
    icon: User,
    isAvailable: true,
    description: 'Merchant profile & security credentials'
  }
];

export const MerchantSideNavbar = ({
  isLocked = false,
  onToggleLock,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onMobileClose
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, selectedBusiness, logout } = useAuth();
  const { unreadCount } = useChatUnread();

  const handleToggleLock = onToggleLock || onToggle;

  // Sidebar is expanded if:
  // - in mobile drawer, OR
  // - locked open by user, OR
  // - currently hovered by mouse cursor
  const isExpanded = isMobile || isLocked || isHovered;
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      setShowSignOutConfirm(false);
      navigate('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  const isRouteActive = (item) => {
    const isMerchantBasePath =
      location.pathname === '/merchant/dashboard' ||
      location.pathname === '/merchant' ||
      location.pathname === '/merchant/';
    const currentTab = searchParams.get('tab') || 'overview';

    if (item.name === 'Dashboard') {
      return isMerchantBasePath && (!searchParams.get('tab') || currentTab === 'overview' || currentTab === 'dashboard');
    }
    if (item.name === 'My Businesses') {
      return isMerchantBasePath && currentTab === 'all-businesses';
    }
    if (item.name === 'Products') {
      return location.pathname.startsWith('/merchant/products');
    }
    if (item.name === 'Inventory') {
      return location.pathname.startsWith('/merchant/inventory') || (isMerchantBasePath && currentTab === 'inventory');
    }
    if (item.name === 'Orders') {
      return isMerchantBasePath && currentTab === 'orders';
    }
    if (item.name === 'Store Design') {
      return (
        (isMerchantBasePath && (currentTab === 'design' || currentTab === 'store-design' || currentTab === 'template')) ||
        location.pathname.includes('/store-design') ||
        location.pathname.includes('/design')
      );
    }
    if (item.name === 'Payments & Earnings') {
      return isMerchantBasePath && (currentTab === 'cod' || currentTab === 'earnings');
    }
    if (item.name === 'Sales & Analytics') {
      return (
        location.pathname.startsWith('/merchant/analytics') ||
        location.pathname.startsWith('/merchant/sales-analytics') ||
        (isMerchantBasePath && (currentTab === 'analytics' || currentTab === 'sales-analytics'))
      );
    }
    if (item.name === 'Account') {
      return (
        location.pathname.startsWith('/merchant/account') ||
        (isMerchantBasePath && currentTab === 'account')
      );
    }
    if (item.tab && currentTab === item.tab && isMerchantBasePath) {
      return true;
    }
    if (item.path && location.pathname === item.path) {
      return true;
    }
    return false;
  };

  // Nav list markup reused in desktop floating panel and mobile floating drawer
  const navContent = (
    <div className="flex flex-col h-full justify-between select-none min-h-0">
      {/* Top Header & Brand */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div
          className={`flex items-center pb-3.5 mb-2.5 border-b border-[#C6B7E2]/30 shrink-0 ${
            !isExpanded && !isMobile ? 'justify-center' : 'justify-between'
          }`}
        >
          {isExpanded ? (
            <Link
              to="/merchant/dashboard"
              onClick={isMobile ? onMobileClose : undefined}
              className="flex items-center space-x-2.5 group overflow-hidden"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/20 shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-extrabold tracking-tight text-[#3B1C5A] font-serif truncate whitespace-nowrap">
                  Bizora<span className="text-[#E6B44C]">.</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#3B1C5A]/60 -mt-1 truncate whitespace-nowrap">
                  Merchant Portal
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/merchant/dashboard"
              title="Bizora Merchant Dashboard"
              className="w-9 h-9 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/20 shrink-0 hover:scale-105 transition-transform"
            >
              <Store className="w-5 h-5" />
            </Link>
          )}

          {/* Action Button: Mobile Close OR Desktop Lock/Unlock Toggle */}
          {isMobile ? (
            <button
              onClick={onMobileClose}
              aria-label="Close navigation menu"
              className="p-2 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/25 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            isExpanded && (
              <button
                onClick={handleToggleLock}
                aria-label={isLocked ? 'Unlock sidebar (auto-collapse)' : 'Lock sidebar open'}
                title={
                  isLocked
                    ? 'Sidebar is locked open. Click to unlock (auto-collapse on leave)'
                    : 'Click to lock sidebar open'
                }
                className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 ml-1 flex items-center justify-center ${
                  isLocked
                    ? 'bg-[#3B1C5A] text-[#E6B44C] shadow-sm shadow-[#3B1C5A]/20 hover:bg-[#3B1C5A]/90 ring-1 ring-[#E6B44C]/40'
                    : 'text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/30'
                }`}
              >
                {isLocked ? (
                  <PanelLeftClose className="w-4.5 h-4.5" />
                ) : (
                  <PanelLeftOpen className="w-4.5 h-4.5" />
                )}
              </button>
            )
          )}
        </div>

        {/* Collapsed state quick-lock button (visible when collapsed & not hovered) */}
        {!isMobile && !isExpanded && (
          <div className="flex justify-center mb-2 shrink-0">
            <button
              onClick={handleToggleLock}
              aria-label="Lock sidebar open"
              title="Click to lock sidebar open"
              className="p-1.5 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/30 transition-all cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items (Exact 12 Merchant Entries) */}
        <nav aria-label="Merchant Navigation" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
          {MERCHANT_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item);
            const isAccount = item.name === 'Account';

            return (
              <React.Fragment key={item.name}>
                {isAccount && <div className="my-1.5 border-t border-[#C6B7E2]/30" />}
                {item.isAvailable && item.path ? (
                  <div className="relative group">
                    <NavLink
                      to={item.path}
                      onClick={isMobile ? onMobileClose : undefined}
                      title={!isExpanded ? item.name : undefined}
                      aria-label={item.name}
                      className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                        !isExpanded
                          ? 'justify-center w-10 h-10 mx-auto'
                          : 'px-3 py-2 space-x-3 w-full'
                      } ${
                        active
                          ? 'bg-[#3B1C5A] text-white shadow-md shadow-[#3B1C5A]/25 font-bold'
                          : 'text-[#3B1C5A]/75 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/25 font-semibold'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Icon
                          className={`w-4.5 h-4.5 transition-transform ${
                            active ? 'text-[#E6B44C]' : 'text-[#3B1C5A]/80 group-hover:scale-110'
                          }`}
                        />
                        {item.tab === 'communication' && unreadCount > 0 && !isExpanded && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                        )}
                      </div>
                      {isExpanded && (
                        <span className="text-xs font-bold tracking-tight truncate flex-1 whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                      {isExpanded && item.tab === 'communication' && unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 bg-rose-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                      {isExpanded && active && (
                        <span className="w-1.5 h-3.5 rounded-full bg-[#E6B44C] shrink-0" />
                      )}
                    </NavLink>

                    {/* Accessible hover tooltip when collapsed in desktop view */}
                    {!isExpanded && (
                      <div
                        role="tooltip"
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#3B1C5A] text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap"
                      >
                        {item.tab === 'communication' && unreadCount > 0
                          ? `${item.name} (${unreadCount} unread)`
                          : item.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <div
                      title={!isExpanded ? `${item.name} (Coming Soon)` : undefined}
                      aria-label={`${item.name} - Coming Soon`}
                      className={`flex items-center rounded-2xl transition-all duration-200 cursor-not-allowed select-none opacity-60 hover:opacity-85 ${
                        !isExpanded
                          ? 'justify-center w-10 h-10 mx-auto'
                          : 'px-3 py-2 space-x-3 w-full hover:bg-[#C6B7E2]/15'
                      } text-[#3B1C5A]/70`}
                    >
                      <div className="relative shrink-0">
                        <Icon className="w-4.5 h-4.5 text-[#3B1C5A]/60" />
                      </div>
                      {isExpanded && (
                        <span className="text-xs font-medium tracking-tight truncate flex-1 whitespace-nowrap text-[#3B1C5A]/70">
                          {item.name}
                        </span>
                      )}
                      {isExpanded && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-[#C6B7E2]/40 text-[#3B1C5A]/70 border border-[#C6B7E2]/60 uppercase tracking-wide shrink-0">
                          Soon
                        </span>
                      )}
                    </div>

                    {/* Accessible hover tooltip when collapsed in desktop view */}
                    {!isExpanded && (
                      <div
                        role="tooltip"
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#3B1C5A] text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap"
                      >
                        {item.name} (Coming Soon)
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Merchant Info, Store Name, Sign Out */}
      <div className="pt-2.5 border-t border-[#C6B7E2]/30 space-y-1.5 shrink-0 mt-1.5">
        {user && (
          <div
            className={`flex items-center rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 ${
              !isExpanded ? 'p-1.5 justify-center' : 'p-2 justify-between'
            }`}
            title={
              !isExpanded
                ? `${user.firstName || ''} ${user.lastName || ''} (${selectedBusiness ? selectedBusiness.name : 'Merchant'})`
                : undefined
            }
          >
            <Link
              to="/merchant/account"
              onClick={isMobile ? onMobileClose : undefined}
              className="flex items-center space-x-2.5 min-w-0 group hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-[#3B1C5A] text-[#E6B44C] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.firstName ? user.firstName.charAt(0).toUpperCase() : 'M'}</span>
                )}
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#3B1C5A] group-hover:text-[#3B1C5A]/80 truncate whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#3B1C5A]/60 truncate whitespace-nowrap">
                    {selectedBusiness ? selectedBusiness.name : 'Merchant Store'}
                  </span>
                </div>
              )}
            </Link>

            {isExpanded && (
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(true)}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 rounded-lg text-[#3B1C5A]/60 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isSigningOut={isSigningOut}
      />
    </div>
  );

  // If rendering for mobile drawer overlay
  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <div className="fixed inset-0 z-50 md:hidden flex">
        {/* Backdrop */}
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-[#3B1C5A]/40 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Floating Drawer with outer margins & rounded corners */}
        <aside
          role="dialog"
          aria-label="Merchant Navigation Drawer"
          className="relative m-3 w-72 max-w-[calc(100vw-1.5rem)] rounded-3xl bg-white clay-card p-4 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border border-[#C6B7E2]/50"
        >
          {navContent}
        </aside>
      </div>
    );
  }

  // Desktop / Laptop / Tablet Floating SideNavbar
  // Mirrors CustomerSideNavbar: sticky top-4, left margin, rounded-3xl clay-card, natural floating panel
  return (
    <aside
      role="navigation"
      aria-label="Merchant Account Navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex flex-col sticky top-4 self-start ml-4 my-4 h-[calc(100vh-2rem)] rounded-3xl clay-card bg-white/95 backdrop-blur-md border border-[#C6B7E2]/50 shadow-xl shadow-[#3B1C5A]/8 p-4 shrink-0 transition-[width] duration-300 ease-in-out z-20 overflow-x-hidden ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {navContent}
    </aside>
  );
};

export default MerchantSideNavbar;

