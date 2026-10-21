import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { PasswordRequirements } from '../components/PasswordRequirements';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Key,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showManualToken, setShowManualToken] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const validate = () => {
    const errs = {};
    if (!token.trim()) {
      errs.token = 'A valid reset token is required. Please use the link sent to your email.';
    }

    if (!password) {
      errs.password = 'New password is required';
    } else if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[@$!%*?&#]/.test(password)
    ) {
      errs.password = 'Password does not meet the security policy';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        password
      });

      setIsSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to reset password. The link or token may be invalid or expired. Please request a new link.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no token is provided in the URL and user hasn't toggled manual token entry
  const hasNoToken = !token && !showManualToken;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#3B1C5A] text-[#E6B44C] shadow-lg mb-4 border border-[#E6B44C]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EAFB] border border-[#C6B7E2]/60 text-xs font-semibold text-[#3B1C5A] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E6B44C]" />
            <span>Secure Password Reset</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3B1C5A] tracking-tight">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-[#3B1C5A]/75 max-w-sm mx-auto leading-relaxed">
            Create a strong, secure new password for your Bizora account.
          </p>
        </div>

        {/* Card */}
        <div className="clay-card p-6 sm:p-10 relative overflow-hidden rounded-[2rem] border border-[#C6B7E2]/50 shadow-xl bg-white/95 backdrop-blur-md">
          {isSuccess ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Success Badge */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#3B1C5A]">Password Updated!</h2>
                <p className="text-sm text-[#3B1C5A]/80 mt-2 leading-relaxed">
                  Your new password has been securely saved in the database. All previous active sessions have been signed out.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] text-left text-xs text-[#3B1C5A]/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#3B1C5A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Account Ready:</span>
                </div>
                <p className="text-xs text-[#3B1C5A]/70">
                  You can now sign in using your updated password.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/"
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                </Link>
              </div>
            </div>
          ) : hasNoToken ? (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3B1C5A]">Reset Link Missing</h2>
                <p className="text-xs sm:text-sm text-[#3B1C5A]/75 mt-2 leading-relaxed">
                  To protect your account, password resets require clicking the secure link sent to your registered email address.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  to="/forgot-password"
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 rounded-2xl shadow-md cursor-pointer"
                >
                  <span>Request Reset Link</span>
                  <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowManualToken(true)}
                  className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Key className="w-3 h-3 text-[#E6B44C]" />
                  <span>Have a manual reset token? Enter it here</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#C6B7E2]/30">
                <Link
                  to="/"
                  className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Token confirmation pill */}
              {token && !showManualToken && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Security Token Verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualToken(true)}
                    className="text-[11px] text-emerald-700 underline font-medium hover:text-emerald-900"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Manual token input only when requested or if token invalid */}
              {showManualToken && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/85 mb-2">
                    Reset Token <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value);
                        if (errors.token) setErrors((prev) => ({ ...prev, token: '' }));
                      }}
                      placeholder="Paste your reset token"
                      className={`clay-input w-full pl-10 pr-4 py-3 text-xs font-mono placeholder-[#3B1C5A]/40 rounded-2xl ${
                        errors.token ? '!border-rose-400 !bg-rose-50/50' : ''
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.token && (
                    <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.token}</p>
                  )}
                </div>
              )}

              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-bold text-xs">Reset Error</p>
                    <p className="text-xs text-rose-600/90 mt-0.5 leading-relaxed">{apiError}</p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/85 mb-2">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Enter secure new password"
                    className={`clay-input w-full pl-10 pr-11 py-3 text-sm placeholder-[#3B1C5A]/40 rounded-2xl transition-all ${
                      errors.password ? '!border-rose-400 !bg-rose-50/50' : ''
                    }`}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && <PasswordRequirements password={password} />}
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B1C5A]/85 mb-2">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B1C5A]/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="Re-enter your new password"
                    className={`clay-input w-full pl-10 pr-11 py-3 text-sm placeholder-[#3B1C5A]/40 rounded-2xl transition-all ${
                      errors.confirmPassword ? '!border-rose-400 !bg-rose-50/50' : ''
                    }`}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password && confirmPassword === password && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passwords match perfectly</span>
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 mt-6 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Save Password</span>
                    <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-[#C6B7E2]/30">
                <Link
                  to="/"
                  className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:underline flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
