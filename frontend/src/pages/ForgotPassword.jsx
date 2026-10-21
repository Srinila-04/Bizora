import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your account email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setApiError('');

    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Unable to process password reset request. Please check your network and try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAnother = () => {
    setSubmitted(false);
    setEmail('');
    setError('');
    setApiError('');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#3B1C5A] text-[#E6B44C] shadow-lg mb-4 border border-[#E6B44C]/30">
            <KeyRound className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EAFB] border border-[#C6B7E2]/60 text-xs font-semibold text-[#3B1C5A] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Account Recovery</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3B1C5A] tracking-tight">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-[#3B1C5A]/75 max-w-sm mx-auto leading-relaxed">
            Enter your registered email address and we will send a secure link to reset your password.
          </p>
        </div>

        {/* Card */}
        <div className="clay-card p-6 sm:p-10 relative overflow-hidden rounded-[2rem] border border-[#C6B7E2]/50 shadow-xl bg-white/95 backdrop-blur-md">
          {submitted ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Success Badge */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#3B1C5A]">Check Your Inbox</h2>
                <p className="text-sm text-[#3B1C5A]/80 mt-2 leading-relaxed">
                  We've sent a secure password reset link to:
                </p>
                <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-[#F0EAFB] border border-[#C6B7E2] text-sm font-semibold text-[#3B1C5A]">
                  {email}
                </div>
              </div>

              {/* Guidance Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] text-left text-xs text-[#3B1C5A]/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                  <Mail className="w-3.5 h-3.5 text-[#E6B44C]" />
                  <span>Next Steps:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#3B1C5A]/75">
                  <li>Click the link inside the email to choose a new password.</li>
                  <li>The reset link will automatically expire in <strong>1 hour</strong>.</li>
                  <li>Can't find it? Be sure to check your <em>Spam</em> or <em>Promotions</em> folder.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <Mail className="w-4 h-4 text-[#E6B44C]" />
                  <span>Open Gmail Inbox</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                </a>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>Resend Email</span>
                  </button>
                  <span className="text-[#3B1C5A]/30">&bull;</span>
                  <button
                    type="button"
                    onClick={handleResetAnother}
                    className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:underline cursor-pointer"
                  >
                    Try another email
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#C6B7E2]/30">
                <Link
                  to="/"
                  className="clay-btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 rounded-2xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                  <p className="text-xs leading-relaxed font-medium">{apiError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/85 mb-2">
                  Account Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      setApiError('');
                    }}
                    placeholder="name@example.com or user@gmail.com"
                    className={`clay-input w-full pl-10 pr-4 py-3 text-sm placeholder-[#3B1C5A]/40 rounded-2xl transition-all ${
                      error ? '!border-rose-400 !bg-rose-50/50' : ''
                    }`}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 mt-6 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-[#C6B7E2]/30">
                <Link
                  to="/"
                  className="text-xs font-semibold text-[#3B1C5A]/75 hover:text-[#3B1C5A] hover:underline flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
