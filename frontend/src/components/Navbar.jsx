import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, User, LogOut, ChevronDown, PlusCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SignOutConfirmModal from './SignOutConfirmModal';

export const Navbar = () => {
  const { user, isMerchant, isCustomer, businesses, selectedBusiness, switchBusiness, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

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

  return (
    <nav className="sticky top-0 z-40 bg-[#F6F1E8]/90 backdrop-blur-md border-b border-[#C6B7E2]/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to={isMerchant ? "/merchant/dashboard" : isCustomer ? "/customer/home" : "/"} className="flex items-center space-x-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-md shadow-[#3B1C5A]/20 transition-transform group-hover:scale-105">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-[#3B1C5A] font-serif">
                  Bizora
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#3B1C5A]/60 -mt-1">
                  Digital Market
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/marketplace"
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#3B1C5A]/85 hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/20 transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-[#3B1C5A]" />
                Explore Marketplace
              </Link>
            </div>
          </div>

          {/* Right section: Auth status */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Merchant Business Switcher dropdown */}
                {isMerchant && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="clay-pill px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 border-2 border-[#C6B7E2]/60 hover:border-[#3B1C5A]/50 transition-all shadow-xs"
                    >
                      <Store className="w-3.5 h-3.5 text-[#3B1C5A]" />
                      <span className="max-w-[130px] truncate">
                        {selectedBusiness ? selectedBusiness.name : 'No Store Selected'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#E6B44C] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white/98 backdrop-blur-md rounded-3xl p-2.5 shadow-2xl shadow-[#3B1C5A]/20 border-2 border-[#C6B7E2]/70 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#3B1C5A]/70 border-b border-[#C6B7E2]/30">
                          My Businesses ({businesses.length})
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1.5 space-y-1 custom-scrollbar">
                          {businesses.length === 0 ? (
                            <div className="px-3.5 py-2 text-xs text-[#3B1C5A]/60 italic">
                              No businesses registered yet
                            </div>
                          ) : (
                            businesses.map((biz) => (
                              <button
                                key={biz.id}
                                onClick={() => {
                                  switchBusiness(biz);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 rounded-full text-xs font-medium flex items-center justify-between transition-colors ${
                                  selectedBusiness?.id === biz.id
                                    ? 'bg-[#3B1C5A] text-white font-bold shadow-xs'
                                    : 'text-[#3B1C5A] hover:bg-[#F0EAFB]'
                                }`}
                              >
                                <span className="truncate">{biz.name}</span>
                                {selectedBusiness?.id === biz.id && (
                                  <Check className="w-3.5 h-3.5 text-[#E6B44C] shrink-0 ml-1.5" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                        <div className="pt-1.5 border-t border-[#C6B7E2]/30 mt-1">
                          <Link
                            to="/merchant/business/new"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full text-left px-3.5 py-2 rounded-full text-xs font-semibold text-[#3B1C5A] hover:bg-[#E6B44C]/20 flex items-center space-x-2 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-[#E6B44C]" />
                            <span>Register New Business</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dashboard link for merchants */}
                {isMerchant && (
                  <Link
                    to="/merchant/dashboard"
                    className="clay-btn-secondary px-3.5 py-1.5 text-xs font-semibold hidden sm:inline-flex"
                  >
                    Merchant Dashboard
                  </Link>
                )}

                {/* User Info & Badge */}
                <div className="flex items-center space-x-2 pl-2 border-l border-[#C6B7E2]/40">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-[#3B1C5A]">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#3B1C5A]/60">
                      {isMerchant ? 'Merchant' : isCustomer ? 'Customer' : 'Admin'}
                    </span>
                  </div>

                  {isMerchant ? (
                    <span className="clay-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      Merchant
                    </span>
                  ) : (
                    <span className="clay-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                      Customer
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSignOutConfirm(true)}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-2 rounded-xl text-[#3B1C5A]/70 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className="clay-btn-secondary px-4 py-2 text-xs sm:text-sm font-semibold"
                >
                  Sign In
                </Link>

                <Link
                  to="/register/customer"
                  className="clay-btn-primary px-4 py-2 text-xs sm:text-sm font-semibold hidden sm:inline-flex"
                >
                  Join as Shopper
                </Link>

                <Link
                  to="/register/merchant"
                  className="clay-btn-accent px-4 py-2 text-xs sm:text-sm"
                >
                  Sell on Bizora
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isSigningOut={isSigningOut}
      />
    </nav>
  );
};

export default Navbar;

