import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CustomerSideNavbar } from '../components/CustomerSideNavbar';
import { Footer } from '../components/Footer';
import { Menu, Store } from 'lucide-react';

export const CustomerLayout = () => {
  // Preserve sidebar lock state in localStorage (defaults to false = collapsed by default)
  const [isLocked, setIsLocked] = useState(() => {
    try {
      const saved = localStorage.getItem('bizora_customer_sidebar_locked');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleLock = () => {
    setIsLocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bizora_customer_sidebar_locked', JSON.stringify(next));
      } catch (e) {
        console.warn('Unable to persist sidebar lock state:', e);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#3B1C5A] flex flex-col selection:bg-[#E6B44C] selection:text-[#3B1C5A]">
      {/* Mobile Top Header - visible only on mobile screens (< md) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#F6F1E8]/90 backdrop-blur-md border-b border-[#C6B7E2]/40 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-[#3B1C5A] font-serif text-lg">
            Bizora<span className="text-[#E6B44C]">.</span>
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-[#3B1C5A] hover:bg-[#C6B7E2]/30 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop / Laptop / Tablet Floating SideNavbar */}
        <CustomerSideNavbar
          isLocked={isLocked}
          onToggleLock={toggleLock}
        />

        {/* Mobile Navigation Drawer Modal */}
        <CustomerSideNavbar
          isMobile={true}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Column with Natural Document Scrolling */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

          {/* Footer - placed after page content and reached via natural page scrolling */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;

