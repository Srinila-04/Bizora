import React from 'react';
import { Check, X } from 'lucide-react';

export const PasswordRequirements = ({ password }) => {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special character (@$!%*?&#)', met: /[@$!%*?&#]/.test(password) }
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-[#F0EAFB]/70 border border-[#C6B7E2]/50 text-xs space-y-1.5 mt-2">
      <p className="font-bold text-[#3B1C5A] mb-1">Password Requirements:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                item.met
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#C6B7E2]/40 text-[#3B1C5A]/50'
              }`}
            >
              {item.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </span>
            <span
              className={
                item.met
                  ? 'text-emerald-700 font-semibold'
                  : 'text-[#3B1C5A]/70'
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;
