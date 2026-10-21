import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F6F1E8] via-[#FAF6EE] to-[#EFE7D8] text-[#3B1C5A] selection:bg-[#E6B44C] selection:text-[#3B1C5A] relative p-3 sm:p-6 lg:p-8">
      {/* Subtle Ambient Clay Background Spheres with gentle floating animations */}
      <div
        className="fixed -top-24 -left-24 w-80 h-80 rounded-full opacity-35 pointer-events-none blur-3xl animate-float-1"
        style={{ background: 'radial-gradient(circle, #C6B7E2 0%, transparent 70%)' }}
      />
      <div
        className="fixed -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25 pointer-events-none blur-3xl animate-float-2"
        style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
      />
      <div
        className="fixed top-1/3 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl animate-float-3"
        style={{ background: 'radial-gradient(circle, #3B1C5A 0%, transparent 75%)' }}
      />

      {/* Main Authentication Canvas (Split-Screen Card) */}
      <main className="w-full flex items-center justify-center relative z-10 my-auto py-2 sm:py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
