import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Heart,
  ShoppingCart,
  User,
  Hammer,
  ArrowLeft
} from 'lucide-react';

const ICON_MAP = {
  shop: ShoppingBag,
  'business-store': Store,
  wishlist: Heart,
  cart: ShoppingCart,
  account: User
};

export const CustomerPlaceholderPage = ({ title = 'Page', pageKey = 'shop' }) => {
  const Icon = ICON_MAP[pageKey] || Hammer;

  return (
    <div className="max-w-3xl mx-auto py-12 sm:py-16 text-center">
      <div className="clay-card p-8 sm:p-14 bg-white/90 border border-[#C6B7E2]/50 shadow-xl space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6B44C]/20 border border-[#E6B44C]/50 text-[#3B1C5A] text-xs font-bold uppercase tracking-wider">
          <Hammer className="w-3.5 h-3.5 text-[#3B1C5A]" />
          <span>Under Construction</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-[#F8F5FD] clay-card flex items-center justify-center mx-auto text-[#3B1C5A] shadow-md">
          <Icon className="w-10 h-10 text-[#3B1C5A]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B1C5A] tracking-tight font-serif">
            {title} Page is Under Construction
          </h1>
          <p className="text-sm text-[#3B1C5A]/70 max-w-md mx-auto leading-relaxed">
            We are actively crafting the {title.toLowerCase()} experience for Bizora shoppers. Please check back soon for upcoming features.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-center">
          <Link
            to="/customer/home"
            className="clay-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#E6B44C]" />
            <span>Back to Customer Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerPlaceholderPage;

