import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

export const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B1C5A]/40 backdrop-blur-sm">
      <div className="clay-card w-full max-w-2xl max-h-[85vh] flex flex-col bg-white p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#C6B7E2]/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6B7E2]/30 flex items-center justify-center text-[#3B1C5A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3B1C5A]">Terms of Service & Privacy Policy</h2>
              <p className="text-xs text-[#3B1C5A]/70">Effective date: October 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#3B1C5A]/60 hover:text-[#3B1C5A] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with natural mouse-wheel/touchpad scrolling */}
        <div className="overflow-y-auto pr-2 my-4 space-y-4 text-sm text-[#3B1C5A]/85 leading-relaxed">
          <section>
            <h3 className="font-bold text-base text-[#3B1C5A] mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E6B44C]" /> 1. Acceptance of Terms
            </h3>
            <p>
              By accessing or using Bizora (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service. If you are registering as a merchant, you warrant that you are authorized to represent and register business entities on our platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base text-[#3B1C5A] mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E6B44C]" /> 2. Multi-Merchant Account Architecture
            </h3>
            <p>
              Merchants maintain a single owner identity which may govern one or multiple distinct businesses. Storefront operations, products, and fulfillment remain strictly compartmentalized per registered business profile.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base text-[#3B1C5A] mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E6B44C]" /> 3. Data Privacy & Security
            </h3>
            <p>
              Bizora respects your privacy. We employ industry-standard encryption, salted bcrypt password hashing, and token rotation. We do not sell user data to third parties. Customer contact and shipping information is provided to merchants exclusively for order fulfillment and verified communications.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base text-[#3B1C5A] mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E6B44C]" /> 4. Merchant Obligations
            </h3>
            <p>
              Merchants agree to provide accurate business details, compliant product listings, and fulfill customer orders promptly. Fraudulent storefront representations or counterfeit items are grounds for immediate termination.
            </p>
          </section>
        </div>

        {/* Footer */}
        {/* <div className="pt-4 border-t border-[#C6B7E2]/40 flex justify-end">
          <button
            onClick={onClose}
            className="clay-btn-primary px-6 py-2.5 text-sm"
          >
            I Understand & Agree
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default TermsModal;

