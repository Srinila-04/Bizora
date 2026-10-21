import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E8] text-[#3B1C5A] selection:bg-[#E6B44C] selection:text-[#3B1C5A]">
      {/* Authenticated Marketplace / Merchant Navigation Bar */}
      <Navbar />

      {/* Authenticated Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Application Footer */}
      {/* <footer className="border-t border-[#C6B7E2]/30 py-6 text-center text-xs text-[#3B1C5A]/60 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-[#3B1C5A]/80">
            &copy; {new Date().getFullYear()} Bizora Platform. All rights reserved.
          </span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Deep Purple (#3B1C5A)</span>
            <span>Golden Yellow (#E6B44C)</span>
            <span>Lavender (#C6B7E2)</span>
            <span>Cream (#F6F1E8)</span>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default AppLayout;

