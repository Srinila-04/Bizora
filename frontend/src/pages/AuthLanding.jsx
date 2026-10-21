import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TermsModal } from '../components/TermsModal';
import bizoraLogo from '../assets/bizora-logo.png';
import {
  LogIn,
  UserPlus,
  ShoppingBag,
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AuthLanding = ({ defaultMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, registerCustomer, registerMerchant, loading } = useAuth();

  // Determine initial mode:
  // Default is 'login' so that Login appears first and exclusively on initial load.
  const determineInitialMode = () => {
    if (defaultMode) return defaultMode;
    const urlMode = searchParams.get('mode');
    const urlRole = searchParams.get('role');
    if (urlMode === 'customer' || (urlMode === 'register' && urlRole === 'customer')) return 'customer';
    if (urlMode === 'merchant' || (urlMode === 'register' && urlRole === 'merchant')) return 'merchant';
    if (location.pathname === '/register/customer') return 'customer';
    if (location.pathname === '/register/merchant') return 'merchant';
    if (urlMode === 'register-choice' || location.pathname === '/register') return 'register-choice';
    return 'login';
  };

  const [activeMode, setActiveMode] = useState(determineInitialMode);

  // If already authenticated and not loading, redirect to appropriate destination strictly based on role
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const redirect = searchParams.get('redirect');
      if (user.role === 'business_owner') {
        if (redirect && (redirect.startsWith('/merchant') || redirect.startsWith('/marketplace'))) {
          navigate(redirect, { replace: true });
        } else {
          navigate('/merchant/dashboard', { replace: true });
        }
      } else if (user.role === 'customer') {
        if (redirect && redirect.startsWith('/customer')) {
          navigate(redirect, { replace: true });
        } else {
          navigate('/customer/home', { replace: true });
        }
      } else {
        navigate('/merchant/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate, searchParams]);

  // Sync mode changes if query params change
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlRole = searchParams.get('role');
    if (urlMode === 'customer' || (urlMode === 'register' && urlRole === 'customer')) {
      setActiveMode('customer');
    } else if (urlMode === 'merchant' || (urlMode === 'register' && urlRole === 'merchant')) {
      setActiveMode('merchant');
    } else if (urlMode === 'register-choice' || urlMode === 'register') {
      setActiveMode('register-choice');
    } else if (urlMode === 'login') {
      setActiveMode('login');
    }
  }, [searchParams]);

  const switchMode = (mode) => {
    setActiveMode(mode);
    setSearchParams((prev) => {
      if (mode === 'login') {
        prev.set('mode', 'login');
        prev.delete('role');
      } else if (mode === 'register-choice') {
        prev.set('mode', 'register');
        prev.delete('role');
      } else {
        prev.set('mode', 'register');
        prev.set('role', mode);
      }
      return prev;
    });
    setApiError('');
    setErrors({});
  };

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Customer register form state
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showCustomerConfirm, setShowCustomerConfirm] = useState(false);

  // Merchant register form state
  const [merchantData, setMerchantData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showMerchantPassword, setShowMerchantPassword] = useState(false);
  const [showMerchantConfirm, setShowMerchantConfirm] = useState(false);

  // Feedback states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Clear any legacy remembered identifier from local storage
  useEffect(() => {
    try {
      localStorage.removeItem('bizora_remember_identifier');
    } catch {
      // Ignore storage errors
    }
  }, []);

  // ------------------ LOGIN HANDLER ------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginData.identifier.trim()) {
      errs.identifier = 'Email or mobile number is required';
    }
    if (!loginData.password) {
      errs.password = 'Password is required';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const { user: loggedInUser, businesses } = await login({
        identifier: loginData.identifier.trim(),
        password: loginData.password
      });

      const redirectPath = searchParams.get('redirect');

      if (loggedInUser.role === 'business_owner') {
        // Business owners must be directed to their merchant portal
        // Only honor redirect if it is an explicit merchant or marketplace route
        if (redirectPath && (redirectPath.startsWith('/merchant') || redirectPath.startsWith('/marketplace'))) {
          navigate(redirectPath);
        } else if (!businesses || businesses.length === 0) {
          navigate('/merchant/business/new');
        } else {
          navigate('/merchant/dashboard');
        }
      } else if (loggedInUser.role === 'customer') {
        // Customers go to customer home or valid customer redirect
        if (redirectPath && redirectPath.startsWith('/customer')) {
          navigate(redirectPath);
        } else {
          navigate('/customer/home');
        }
      } else {
        // Admin or other role fallback
        if (redirectPath && !redirectPath.startsWith('/customer')) {
          navigate(redirectPath);
        } else {
          navigate('/customer/home');
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Invalid credentials. Please verify your email/mobile and password.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ CUSTOMER REGISTRATION HANDLER ------------------
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!customerData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!customerData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!customerData.phone.trim()) {
      errs.phone = 'Mobile Number is required';
    } else if (!/^\+?[\d\s-]{7,20}$/.test(customerData.phone.trim())) {
      errs.phone = 'Please enter a valid mobile number';
    }

    const pwd = customerData.password;
    if (!pwd) {
      errs.password = 'Password is required';
    } else if (
      pwd.length < 8 ||
      !/[A-Z]/.test(pwd) ||
      !/[a-z]/.test(pwd) ||
      !/[0-9]/.test(pwd) ||
      !/[@$!%*?&#]/.test(pwd)
    ) {
      errs.password = 'Password does not meet complexity requirements';
    }

    if (!customerData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (customerData.password !== customerData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!customerData.acceptTerms) {
      errs.acceptTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await registerCustomer({
        fullName: customerData.fullName.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.trim() || undefined,
        password: customerData.password
      });

      setSuccessMessage('Customer account created! Directing you to your account...');
      setTimeout(() => {
        navigate('/customer/home');
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please check your details.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ MERCHANT REGISTRATION HANDLER ------------------
  const handleMerchantSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!merchantData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!merchantData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchantData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!merchantData.phone.trim()) {
      errs.phone = 'Mobile Number is required for merchant registration';
    } else if (!/^\+?[\d\s-]{7,20}$/.test(merchantData.phone.trim())) {
      errs.phone = 'Please enter a valid mobile number';
    }

    const pwd = merchantData.password;
    if (!pwd) {
      errs.password = 'Password is required';
    } else if (
      pwd.length < 8 ||
      !/[A-Z]/.test(pwd) ||
      !/[a-z]/.test(pwd) ||
      !/[0-9]/.test(pwd) ||
      !/[@$!%*?&#]/.test(pwd)
    ) {
      errs.password = 'Password does not meet complexity requirements';
    }

    if (!merchantData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (merchantData.password !== merchantData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!merchantData.acceptTerms) {
      errs.acceptTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await registerMerchant({
        fullName: merchantData.fullName.trim(),
        email: merchantData.email.trim().toLowerCase(),
        phone: merchantData.phone.trim(),
        password: merchantData.password
      });

      setSuccessMessage('Merchant account created! Directing you to register your business...');
      setTimeout(() => {
        navigate('/merchant/business/new');
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Merchant registration failed. Please review your details.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compact Password Requirements Checklist Pill Bar (Zero vertical bloat)
  const renderPasswordPills = (password) => {
    if (!password) return null;
    const criteria = [
      { label: '8+ chars', met: password.length >= 8 },
      { label: 'A-Z', met: /[A-Z]/.test(password) },
      { label: 'a-z', met: /[a-z]/.test(password) },
      { label: '0-9', met: /[0-9]/.test(password) },
      { label: 'symbol', met: /[@$!%*?&#]/.test(password) }
    ];
    return (
      <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
        {criteria.map((c, i) => (
          <span
            key={i}
            className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
              c.met
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#C6B7E2]/25 text-[#3B1C5A]/65'
            }`}
          >
            {c.met ? '✓ ' : '• '}{c.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl my-auto">
      {/* Master Split Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[16px_20px_45px_rgba(59,28,90,0.12),-8px_-8px_24px_rgba(255,255,255,0.95)] border border-white/80 overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
        
        {/* =================================================================
            MOBILE BRAND HEADER (Visible ONLY on < lg screens)
            Compact height (~44px) so no scrolling occurs on mobile
            ================================================================= */}
        <div className="lg:hidden bg-gradient-to-r from-[#45206C] via-[#3B1C5A] to-[#240F39] text-white px-3.5 py-2 flex items-center justify-between shrink-0 relative overflow-hidden border-b border-[#C6B7E2]/20">
          {/* Subtle animated floating ambient balls */}
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-30 animate-float-1"
            style={{ background: 'radial-gradient(circle, #C6B7E2 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none opacity-20 animate-float-2"
            style={{ background: 'radial-gradient(circle, #E6B44C 0%, transparent 70%)' }}
          />

          <div className="flex items-center space-x-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#F6F1E8] p-1 shadow flex items-center justify-center shrink-0">
              <img src={bizoraLogo} alt="Bizora" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm font-serif leading-none tracking-tight block">
                Welcome to Bizora
              </span>
              <span className="text-[10px] text-[#F6F1E8]/80 italic block -mt-0.5">
                Your marketplace. Your business.
              </span>
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-semibold text-[#E6B44C] bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            {activeMode === 'login' ? 'Sign In' : 'Registration'}
          </div>
        </div>

        {/* =================================================================
            DESKTOP LEFT SIDE: Brand, Logo & Animated Violet Background
            Visible on lg+ viewports with subtle slow floating balls
            ================================================================= */}
        <div className="hidden lg:flex lg:w-[40%] xl:w-[42%] bg-gradient-to-br from-[#45206C] via-[#3B1C5A] to-[#240F39] text-white p-8 xl:p-10 relative overflow-hidden flex-col justify-between select-none">
          
          {/* Animated Soft Floating Balls moving slowly in different directions */}
          {/* Floating Ball 1: Large Deep Purple 3D Matte Sphere */}
          <div
            className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none animate-float-1"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #5E2F90 0%, #3B1C5A 55%, #1F0A32 100%)',
              boxShadow: '16px 20px 40px rgba(22, 6, 38, 0.65), inset 4px 4px 8px rgba(255, 255, 255, 0.18)'
            }}
          />

          {/* Floating Ball 2: Medium 3D Matte Sphere at lower-left */}
          <div
            className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full pointer-events-none animate-float-2"
            style={{
              background: 'radial-gradient(circle at 40% 40%, #703B9F 0%, #3B1C5A 65%, #180728 100%)',
              boxShadow: '10px 14px 28px rgba(22, 6, 38, 0.55), inset 3px 3px 6px rgba(255, 255, 255, 0.15)'
            }}
          />

          {/* Floating Ball 3: Soft Lavender floating accent sphere */}
          <div
            className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none opacity-25 animate-float-3"
            style={{
              background: 'radial-gradient(circle, #C6B7E2 0%, transparent 70%)'
            }}
          />

          {/* Floating Ball 4: Soft Golden accent ball */}
          <div
            className="absolute top-1/2 -left-8 w-28 h-28 rounded-full pointer-events-none opacity-20 animate-float-4"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #FDE49E 0%, #E6B44C 70%, transparent 100%)'
            }}
          />

          {/* Golden Star sparkle accent echoing logo */}
          <div className="absolute top-8 right-8 pointer-events-none opacity-30">
            <Sparkles className="w-7 h-7 text-[#E6B44C]" />
          </div>

          {/* Brand Content (Uncluttered, Centered) */}
          <div className="relative z-10 my-auto">
            {/* Actual Bizora Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 xl:w-20 xl:h-20 rounded-2xl bg-[#F6F1E8] shadow-xl p-2.5 border-2 border-white/20 mb-5 backdrop-blur-sm transition-transform hover:scale-105 duration-300">
              <img
                src={bizoraLogo}
                alt="Bizora Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>

            {/* Welcome Heading */}
            <h1 className="text-2xl xl:text-4xl font-extrabold text-white tracking-tight font-serif mb-2 leading-tight">
              Welcome to Bizora
            </h1>

            {/* Tagline */}
            <p className="text-xs xl:text-sm text-[#F6F1E8]/90 font-light italic leading-relaxed max-w-xs">
              Your marketplace. Your business. Your possibilities.
            </p>
          </div>

          {/* Desktop Left Subtle Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#F6F1E8]/70">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6B44C] animate-pulse" />
              Unified Marketplace &amp; Merchant Hub
            </span>
          </div>
        </div>

        {/* =================================================================
            RIGHT SIDE: Form Area (Login | Register Choices | Single Form)
            Natural responsive flow with standard document scrolling
            ================================================================= */}
        <div className="flex-1 lg:w-[60%] xl:w-[58%] p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative bg-white">
          
          {/* Subtle Bottom-Right Clay Arc echoing reference (strictly contained to prevent container overflow) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl sm:rounded-3xl">
            <div
              className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #D7CCEE 0%, #C6B7E2 60%, transparent 100%)'
              }}
            />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto">
            
            {/* Global Success Alert */}
            {successMessage && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Global API Error Alert */}
            {apiError && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  
                  <p className="text-rose-600/90 text-[11px] mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* =================================================================
                MODE 1: LOGIN FORM ONLY (Shown by default on website load)
                No tabs for customer or merchant appear above this form!
                ================================================================= */}
            {activeMode === 'login' && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-3.5 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#3B1C5A] tracking-tight font-serif leading-tight">
                    Welcome Back!
                  </h2>
                  <p className="text-xs text-[#3B1C5A]/70 mt-1 italic">
                    Sign in to continue to Bizora.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
                  {/* Field: Email Address or Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                      Email Address or Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginData.identifier}
                        onChange={(e) => {
                          setLoginData({ ...loginData, identifier: e.target.value });
                          if (errors.identifier) setErrors({ ...errors, identifier: '' });
                          setApiError('');
                        }}
                        placeholder="e.g. name@example.com or +1 555-0199"
                        className={`clay-input w-full pl-9 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                          errors.identifier ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                        disabled={isSubmitting}
                        autoComplete="username"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.identifier}</p>
                    )}
                  </div>

                  {/* Field: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                          setApiError('');
                        }}
                        placeholder="Enter your password"
                        className={`clay-input w-full pl-9 pr-12 py-2 sm:py-2.5 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                          errors.password ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5" /> 
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> 
                          </span>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>
                    )}
                  </div>

                  {/* Primary button: Sign In */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="clay-btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 mt-2 disabled:opacity-60 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E6B44C]" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E6B44C]" />
                      </>
                    )}
                  </button>

                  {/* Divider: OR */}
                  <div className="relative my-3 sm:my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#C6B7E2]/40" />
                    </div>
                    <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                      <span className="bg-white px-3 text-[#3B1C5A]/60 font-bold tracking-widest">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Create Account Option Below Login */}
                  <div className="text-center pt-0.5">
                    <p className="text-xs font-semibold text-[#3B1C5A]/70 mb-2 italic">
                      New to Bizora?
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode('register-choice')}
                      className="clay-btn-secondary w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold text-[#3B1C5A] border border-[#C6B7E2]/60 hover:bg-[#EFE8FA] hover:border-[#3B1C5A] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#3B1C5A]" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =================================================================
                MODE 2: REGISTRATION CHOICE SELECTION
                Shown when user clicks "Create Account" below login
                ================================================================= */}
            {activeMode === 'register-choice' && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center text-xs font-semibold text-[#3B1C5A]/70 hover:text-[#3B1C5A] mb-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
                  </button>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B1C5A] tracking-tight font-serif leading-tight">
                    Create Your Account
                  </h2>
                  <p className="text-xs text-[#3B1C5A]/70 mt-0.5 italic">
                    Select how you would like to use Bizora:
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option A: Customer Account */}
                  <button
                    type="button"
                    onClick={() => switchMode('customer')}
                    className="w-full p-3.5 rounded-2xl text-left bg-gradient-to-r from-[#FAF8FC] to-[#F3EFFB] border border-[#C6B7E2]/50 hover:border-[#3B1C5A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3B1C5A] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-5 h-5 text-[#E6B44C]" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-[#3B1C5A] block">
                          Customer Registration
                        </span>
                        <span className="text-xs text-[#3B1C5A]/70 block">
                          Shop and discover unique items from independent sellers
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#3B1C5A]/60 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  {/* Option B: Merchant Account */}
                  <button
                    type="button"
                    onClick={() => switchMode('merchant')}
                    className="w-full p-3.5 rounded-2xl text-left bg-gradient-to-r from-[#FFFDF9] to-[#FDF8EE] border border-[#E6B44C]/50 hover:border-[#E6B44C] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E6B44C] text-[#3B1C5A] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Store className="w-5 h-5 text-[#3B1C5A]" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-[#3B1C5A] block">
                          Merchant Registration
                        </span>
                        <span className="text-xs text-[#3B1C5A]/70 block">
                          Sell and scale multiple businesses under one merchant account
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#3B1C5A]/60 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  <div className="pt-2 text-center text-xs text-[#3B1C5A]/70">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#3B1C5A] hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                MODE 3: CUSTOMER REGISTRATION FORM ONLY
                Compact responsive grid so zero scrolling occurs on any viewport
                ================================================================= */}
            {activeMode === 'customer' && (
              <div className="animate-in fade-in duration-200">
                {/* Top Navigation Links */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C6B7E2]/25">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center text-xs font-semibold text-[#3B1C5A]/75 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('merchant')}
                    className="text-xs font-semibold text-[#3B1C5A]/75 hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
                  >
                    Want to sell? Merchant Sign Up &rarr;
                  </button>
                </div>

                {/* Heading & Subtitle */}
                <div className="mb-3.5 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#3B1C5A] tracking-tight font-serif leading-tight">
                    Customer Registration
                  </h2>
                  <p className="text-xs text-[#3B1C5A]/70 mt-1 italic">
                    Shop and discover items from independent sellers.
                  </p>
                </div>

                <form onSubmit={handleCustomerSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
                  {/* Row 1: Full Name & Email Address (Two-column on desktop, stacked on mobile) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={customerData.fullName}
                          onChange={(e) => {
                            setCustomerData({ ...customerData, fullName: e.target.value });
                            if (errors.fullName) setErrors({ ...errors, fullName: '' });
                          }}
                          placeholder="e.g. Sarah Jenkins"
                          className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.fullName ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={customerData.email}
                          onChange={(e) => {
                            setCustomerData({ ...customerData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          placeholder="name@example.com"
                          className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.email ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Mobile Number (Full width on all screens) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      {/* <span className="text-[10px] font-medium text-[#3B1C5A]/60 bg-[#C6B7E2]/25 px-2 py-0.5 rounded-full">
                        Optional
                      </span> */}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => {
                          setCustomerData({ ...customerData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="e.g : 7924361890"
                        className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                          errors.phone ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* Row 3: Password & Confirm Password (Two-column on desktop, stacked on mobile) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showCustomerPassword ? 'text' : 'password'}
                          value={customerData.password}
                          onChange={(e) => {
                            setCustomerData({ ...customerData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: '' });
                          }}
                          placeholder="Min. 8 characters"
                          className={`clay-input w-full pl-9 pr-10 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.password ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                        >
                          {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {customerData.password && renderPasswordPills(customerData.password)}
                      {errors.password && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showCustomerConfirm ? 'text' : 'password'}
                          value={customerData.confirmPassword}
                          onChange={(e) => {
                            setCustomerData({ ...customerData, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                          }}
                          placeholder="Repeat your password"
                          className={`clay-input w-full pl-9 pr-10 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.confirmPassword ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomerConfirm(!showCustomerConfirm)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                        >
                          {showCustomerConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={customerData.acceptTerms}
                        onChange={(e) => {
                          setCustomerData({ ...customerData, acceptTerms: e.target.checked });
                          if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: '' });
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#3B1C5A] focus:ring-[#C6B7E2] accent-[#3B1C5A] shrink-0"
                        disabled={isSubmitting}
                      />
                      <span className="text-xs text-[#3B1C5A]/80 leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="font-bold underline text-[#3B1C5A] hover:text-[#E6B44C]"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="font-bold underline text-[#3B1C5A] hover:text-[#E6B44C]"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.acceptTerms}</p>
                    )}
                  </div>

                  {/* Primary Button: Create Account */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="clay-btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md mt-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E6B44C]" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 text-[#E6B44C]" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2 sm:pt-2.5 text-xs text-[#3B1C5A]/70">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#3B1C5A] hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =================================================================
                MODE 4: MERCHANT REGISTRATION FORM ONLY
                Compact responsive grid so zero scrolling occurs on any viewport
                ================================================================= */}
            {activeMode === 'merchant' && (
              <div className="animate-in fade-in duration-200">
                {/* Top Navigation Links */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C6B7E2]/25">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center text-xs font-semibold text-[#3B1C5A]/75 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('customer')}
                    className="text-xs font-semibold text-[#3B1C5A]/75 hover:text-[#3B1C5A] hover:underline transition-colors cursor-pointer"
                  >
                    Want to shop? Customer Sign Up &rarr;
                  </button>
                </div>

                {/* Heading & Subtitle */}
                <div className="mb-3.5 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#3B1C5A] tracking-tight font-serif leading-tight">
                    Merchant Registration
                  </h2>
                  <p className="text-xs text-[#3B1C5A]/70 mt-1 italic">
                    Sell and scale multiple businesses under one merchant account.
                  </p>
                </div>

                <form onSubmit={handleMerchantSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
                  {/* Row 1: Full Name & Email Address (Two-column on desktop, stacked on mobile) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={merchantData.fullName}
                          onChange={(e) => {
                            setMerchantData({ ...merchantData, fullName: e.target.value });
                            if (errors.fullName) setErrors({ ...errors, fullName: '' });
                          }}
                          placeholder="e.g. Elena Rostova"
                          className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.fullName ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={merchantData.email}
                          onChange={(e) => {
                            setMerchantData({ ...merchantData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          placeholder="owner@yourbrand.com"
                          className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.email ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Mobile Number (Full width on all screens, Required for Merchant) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={merchantData.phone}
                        onChange={(e) => {
                          setMerchantData({ ...merchantData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="e.g : 4563218910"
                        className={`clay-input w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                          errors.phone ? '!border-rose-400 !bg-rose-50/50' : ''
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* Row 3: Password & Confirm Password (Two-column on desktop, stacked on mobile) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showMerchantPassword ? 'text' : 'password'}
                          value={merchantData.password}
                          onChange={(e) => {
                            setMerchantData({ ...merchantData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: '' });
                          }}
                          placeholder="Min. 8 characters"
                          className={`clay-input w-full pl-9 pr-10 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.password ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMerchantPassword(!showMerchantPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                        >
                          {showMerchantPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {merchantData.password && renderPasswordPills(merchantData.password)}
                      {errors.password && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3B1C5A]/85 mb-1.5">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B1C5A]/45">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showMerchantConfirm ? 'text' : 'password'}
                          value={merchantData.confirmPassword}
                          onChange={(e) => {
                            setMerchantData({ ...merchantData, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                          }}
                          placeholder="Repeat your password"
                          className={`clay-input w-full pl-9 pr-10 py-2 text-xs sm:text-sm placeholder-[#3B1C5A]/40 ${
                            errors.confirmPassword ? '!border-rose-400 !bg-rose-50/50' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMerchantConfirm(!showMerchantConfirm)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3B1C5A]/50 hover:text-[#3B1C5A] transition-colors cursor-pointer"
                        >
                          {showMerchantConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={merchantData.acceptTerms}
                        onChange={(e) => {
                          setMerchantData({ ...merchantData, acceptTerms: e.target.checked });
                          if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: '' });
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#3B1C5A] focus:ring-[#C6B7E2] accent-[#3B1C5A] shrink-0"
                        disabled={isSubmitting}
                      />
                      <span className="text-xs text-[#3B1C5A]/80 leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="font-bold underline text-[#3B1C5A] hover:text-[#E6B44C]"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="font-bold underline text-[#3B1C5A] hover:text-[#E6B44C]"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.acceptTerms}</p>
                    )}
                  </div>

                  {/* Primary Button: Create Merchant Account */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="clay-btn-accent w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md mt-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B1C5A]" />
                        <span>Registering Merchant...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Merchant Account</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3B1C5A]" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2 sm:pt-2.5 text-xs text-[#3B1C5A]/70">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#3B1C5A] hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Privacy Policy Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};

export default AuthLanding;
