import React, { useState } from 'react';
import { Store, ShieldCheck, Mail, Phone, MapPin, X, Info } from 'lucide-react';
import { TermsModal } from './TermsModal';

export const Footer = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalType, setInfoModalType] = useState('about'); // 'about' | 'contact'

  const openAbout = () => {
    setInfoModalType('about');
    setShowInfoModal(true);
  };

  const openContact = () => {
    setInfoModalType('contact');
    setShowInfoModal(true);
  };

  return (
    <footer className="mt-12 border-t border-[#C6B7E2]/35 py-8 text-xs text-[#3B1C5A]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#3B1C5A] flex items-center justify-center text-[#E6B44C] shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-[#3B1C5A] font-serif text-sm">
                Bizora<span className="text-[#E6B44C]">.</span>
              </span>
              <p className="text-[11px] text-[#3B1C5A]/60">Digital Marketplace & Small Business Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-[#3B1C5A]/80">
            <button
              onClick={openAbout}
              className="hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={openContact}
              className="hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right text-[11px] text-[#3B1C5A]/60">
            <span>&copy; {new Date().getFullYear()} Bizora Platform. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Reusable Terms of Service & Privacy Policy Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* About & Contact Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-sm">
          <div className="clay-card w-full max-w-lg bg-white p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C6B7E2]/30 flex items-center justify-center text-[#3B1C5A]">
                  {infoModalType === 'about' ? <Info className="w-5 h-5 text-[#3B1C5A]" /> : <Mail className="w-5 h-5 text-[#3B1C5A]" />}
                </div>
                <h3 className="text-lg font-bold text-[#3B1C5A]">
                  {infoModalType === 'about' ? 'About Bizora' : 'Contact Support'}
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-lg text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-[#3B1C5A]/80 leading-relaxed">
              {infoModalType === 'about' ? (
                <>
                  <p>
                    Bizora is an AI-powered digital commerce platform designed to empower independent creators, artisans, and small business owners.
                  </p>
                  <p>
                    Our customer account portal lets shoppers discover curated independent storefronts, manage wishlists, and track orders directly from passionate sellers.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#3B1C5A]">
                    <ShieldCheck className="w-4 h-4 text-[#E6B44C]" />
                    <span>Verified Merchants & Encrypted Checkout</span>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Have questions about an order, a storefront, or your account? Our support team is here to help.
                  </p>
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-[#E6B44C] shrink-0" />
                      <span>support@bizora.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-[#E6B44C] shrink-0" />
                      <span>+1 (555) 019-9234 (Mon-Fri, 9am-6pm PST)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#E6B44C] shrink-0" />
                      <span>Seattle, Washington, USA</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[#C6B7E2]/30 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="clay-btn-primary px-5 py-2 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

