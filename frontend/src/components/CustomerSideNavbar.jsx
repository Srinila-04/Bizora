import React, { useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Store,
  Package,
  Heart,
  ShoppingCart,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useChatUnread } from '../hooks/useChatUnread';
import SignOutConfirmModal from './SignOutConfirmModal';

// Main menu items:
const MENU_ITEMS = [
  { name: 'Home', path: '/customer/home', icon: Home },
  { name: 'Shop', path: '/customer/shop', icon: ShoppingBag },
  { name: 'Business Store', path: '/customer/business-store', icon: Store },
  { name: 'My Orders', path: '/customer/orders', icon: Package },
  { name: 'Messages', path: '/customer/account?tab=messages', icon: MessageSquare },
  { name: 'Wishlist', path: '/customer/wishlist', icon: Heart },
  { name: 'Cart', path: '/customer/cart', icon: ShoppingCart },
  { name: 'Account', path: '/customer/account', icon: User }
];

export const CustomerSideNavbar = ({
  isLocked = false,
  onToggleLock,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onMobileClose
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
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

  const isRouteActive = (itemPath) => {
    if (itemPath === '/customer/home') {
      return (
        location.pathname === '/customer/home' ||
        location.pathname === '/customer' ||
        location.pathname === '/customer/'
      );
    }
    if (itemPath === '/customer/shop') {
      return location.pathname.startsWith('/customer/shop') || location.pathname.startsWith('/customer/products');
    }
    if (itemPath === '/customer/business-store') {
      return location.pathname.startsWith('/customer/business-store') || location.pathname.startsWith('/customer/stores');
    }
    if (itemPath === '/customer/orders') {
      return location.pathname.startsWith('/customer/orders');
    }
    if (itemPath === '/customer/account?tab=messages') {
      return location.pathname.startsWith('/customer/account') && location.search.includes('tab=messages');
    }
    if (itemPath === '/customer/account') {
      return location.pathname.startsWith('/customer/account') && !location.search.includes('tab=messages');
    }
    return location.pathname.startsWith(itemPath);
  };

  // Nav list markup reused in desktop floating panel and mobile floating drawer
  const navContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header & Brand */}
      <div>
        <div className={`flex items-center pb-4 mb-4 border-b border-[#C6B7E2]/30 ${
          !isExpanded && !isMobile ? 'justify-center' : 'justify-between'
        }`}>
          {isExpanded ? (
            <Link
              to="/customer/home"
              onClick={isMobile ? onMobileClose : undefined}
              className="flex items-center space-x-2.5 group overflow-hidden"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/20 shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-extrabold tracking-tight text-[#3B1C5A] font-serif truncate whitespace-nowrap">
                  Bizora<span className="text-[#E6B44C]">.</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#3B1C5A]/60 -mt-1 truncate whitespace-nowrap">
                  Customer Portal
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/customer/home"
              title="Bizora Home"
              className="w-10 h-10 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/20 shrink-0 hover:scale-105 transition-transform"
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
                aria-label={isLocked ? "Unlock sidebar (auto-collapse)" : "Lock sidebar open"}
                title={isLocked ? "Sidebar is locked open. Click to unlock (auto-collapse on leave)" : "Click to lock sidebar open"}
                className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 ml-1 flex items-center justify-center ${
                  isLocked
                    ? 'bg-[#3B1C5A] text-[#E6B44C] shadow-sm shadow-[#3B1C5A]/20 hover:bg-[#3B1C5A]/90 ring-1 ring-[#E6B44C]/40'
                    : 'text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/30'
                }`}
              >
                {isLocked ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </button>
            )
          )}
        </div>

        {/* Collapsed state quick-lock button (visible when collapsed & not hovered) */}
        {!isMobile && !isExpanded && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleToggleLock}
              aria-label="Lock sidebar open"
              title="Click to lock sidebar open"
              className="p-2 rounded-xl text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/30 transition-all cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items (Exact Required Order: 1. Home, 2. Shop, 3. Business Store, 4. Wishlist, 5. Cart, 6. Account) */}
        <nav aria-label="Customer Navigation" className="space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.path);

            return (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.path}
                  onClick={isMobile ? onMobileClose : undefined}
                  title={!isExpanded ? item.name : undefined}
                  aria-label={item.name}
                  className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                    !isExpanded
                      ? 'justify-center w-12 h-12 mx-auto'
                      : 'px-3.5 py-3 space-x-3 w-full'
                  } ${
                    active
                      ? 'bg-[#3B1C5A] text-white shadow-md shadow-[#3B1C5A]/25 font-bold'
                      : 'text-[#3B1C5A]/75 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/25 font-semibold'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icon
                      className={`w-5 h-5 transition-transform ${
                        active ? 'text-[#E6B44C]' : 'text-[#3B1C5A]/80 group-hover:scale-110'
                      }`}
                    />
                    {!isExpanded && item.name === 'Wishlist' && wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                    )}
                    {!isExpanded && item.name === 'Cart' && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E6B44C] border-2 border-white" />
                    )}
                    {!isExpanded && item.name === 'Messages' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                    )}
                  </div>
                  {isExpanded && (
                    <span className="text-sm tracking-tight truncate flex-1 whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                  {isExpanded && item.name === 'Wishlist' && wishlistCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      active ? 'bg-[#E6B44C] text-[#3B1C5A]' : 'bg-[#C6B7E2]/50 text-[#3B1C5A]'
                    }`}>
                      {wishlistCount}
                    </span>
                  )}
                  {isExpanded && item.name === 'Cart' && cartCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      active ? 'bg-[#E6B44C] text-[#3B1C5A]' : 'bg-[#E6B44C]/30 text-[#3B1C5A] border border-[#E6B44C]/40'
                    }`}>
                      {cartCount}
                    </span>
                  )}
                  {isExpanded && item.name === 'Messages' && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                  {isExpanded && active && item.name !== 'Wishlist' && item.name !== 'Cart' && item.name !== 'Messages' && (
                    <span className="w-1.5 h-4 rounded-full bg-[#E6B44C] shrink-0" />
                  )}
                </NavLink>

                {/* Accessible hover tooltip when collapsed in desktop view */}
                {!isExpanded && (
                  <div
                    role="tooltip"
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#3B1C5A] text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap"
                  >
                    {item.name === 'Wishlist' && wishlistCount > 0
                      ? `Wishlist (${wishlistCount})`
                      : item.name === 'Cart' && cartCount > 0
                      ? `Cart (${cartCount})`
                      : item.name === 'Messages' && unreadCount > 0
                      ? `Messages (${unreadCount} unread)`
                      : item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Info, Logout */}
      <div className="pt-4 border-t border-[#C6B7E2]/30 space-y-2">
        {/* User Card */}
        {user && (
          <div
            className={`flex items-center rounded-2xl bg-[#FAF7F2] border border-[#C6B7E2]/40 ${
              !isExpanded ? 'p-1.5 justify-center' : 'p-2.5 justify-between'
            }`}
            title={!isExpanded ? `${user.firstName || ''} ${user.lastName || ''} (Customer)` : undefined}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#3B1C5A] text-[#E6B44C] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#3B1C5A] truncate whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#3B1C5A]/50 whitespace-nowrap">
                    Customer
                  </span>
                </div>
              )}
            </div>

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
          aria-label="Customer Navigation Drawer"
          className="relative m-3 w-72 max-w-[calc(100vw-1.5rem)] rounded-3xl bg-white clay-card p-4 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border border-[#C6B7E2]/50"
        >
          {navContent}
        </aside>
      </div>
    );
  }

  // Desktop / Laptop / Tablet Floating SideNavbar
  // Notice: outer spacing on top (top-4 / my-4), left (ml-4), bottom (my-4 / h-[calc(100vh-2rem)])
  // Rounded corners (rounded-3xl), polished floating panel appearance
  // Never attached to window border!
  return (
    <aside
      role="navigation"
      aria-label="Customer Account Navigation"
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

export default CustomerSideNavbar;

