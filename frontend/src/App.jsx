import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Auth Pages (Rendered inside AuthLayout)
import { AuthLanding } from './pages/AuthLanding';
import { CustomerRegister } from './pages/CustomerRegister';
import { MerchantRegister } from './pages/MerchantRegister';
import { LoginPage } from './pages/LoginPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Application Pages (Rendered inside AppLayout with Navbar & App Footer)
import { MarketplacePage } from './pages/MarketplacePage';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { MerchantBusinessRegister } from './pages/MerchantBusinessRegister';
import { MerchantProductsPage } from './pages/MerchantProductsPage';
import { MerchantProductFormPage } from './pages/MerchantProductFormPage';
import { MerchantInventoryPage } from './pages/MerchantInventoryPage';
import { MerchantAnalyticsPage } from './pages/MerchantAnalyticsPage';
import { MerchantAccountPage } from './pages/MerchantAccountPage';
import { MerchantLayout } from './layouts/MerchantLayout';

// Customer Account Pages & Layout
import { CustomerLayout } from './layouts/CustomerLayout';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { CustomerShopPage } from './pages/CustomerShopPage';
import { CustomerProductDetailsPage } from './pages/CustomerProductDetailsPage';
import { CustomerStorefrontPage } from './pages/CustomerStorefrontPage';
import { CustomerCartPage } from './pages/CustomerCartPage';
import { CustomerWishlistPage } from './pages/CustomerWishlistPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

const RoleAwareFallback = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#FAF7F2]">
        <div className="w-16 h-16 rounded-2xl bg-white clay-card flex items-center justify-center text-[#3B1C5A]">
          <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
        </div>
        <p className="text-sm font-semibold text-[#3B1C5A]/70">Checking authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'business_owner') {
      return <Navigate to="/merchant/dashboard" replace />;
    }
    if (user?.role === 'customer') {
      return <Navigate to="/customer/home" replace />;
    }
  }

  return <Navigate to="/" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <NotificationProvider>
              <Routes>
              
              <Route element={<AuthLayout />}>
                {/* The root "/" route is the initial Login & Registration portal */}
                <Route path="/" element={<AuthLanding />} />
                <Route path="/login" element={<AuthLanding />} />
                <Route path="/register" element={<AuthLanding />} />
                <Route path="/register/customer" element={<CustomerRegister />} />
                <Route path="/register/merchant" element={<MerchantRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* =================================================================
                  CUSTOMER ACCOUNT EXPERIENCE (SideNavbar & Customer Home)
                  Renders with floating collapsible SideNavbar, Welcome Header,
                  Recommended Products, Under-construction placeholders, & Footer
                  ================================================================= */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'business_owner', 'admin']}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/customer/home" replace />} />
                <Route path="home" element={<CustomerHomePage />} />
                <Route path="shop" element={<CustomerShopPage />} />
                <Route path="products/:id" element={<CustomerProductDetailsPage />} />
                <Route path="stores/:storeId/products/:id" element={<CustomerProductDetailsPage />} />
                <Route path="stores/:id" element={<CustomerStorefrontPage />} />
                <Route path="business-store" element={<CustomerStorefrontPage />} />
                <Route path="business store" element={<CustomerStorefrontPage />} />
                <Route path="business%20store" element={<CustomerStorefrontPage />} />
                <Route path="stores" element={<CustomerStorefrontPage />} />
                <Route path="store" element={<CustomerStorefrontPage />} />
                <Route path="business" element={<CustomerStorefrontPage />} />
                <Route path="orders" element={<CustomerOrdersPage />} />
                <Route path="orders/:id" element={<CustomerOrdersPage />} />
                <Route path="wishlist" element={<CustomerWishlistPage />} />
                <Route path="cart" element={<CustomerCartPage />} />
                <Route path="account" element={<CustomerAccountPage />} />
                {/* Fallback for unknown customer routes */}
                <Route path="*" element={<Navigate to="/customer/home" replace />} />
              </Route>

              {/* =================================================================
                  MERCHANT ACCOUNT EXPERIENCE (SideNavbar & Merchant Portal)
                  Renders with floating collapsible SideNavbar matching Customer experience
                  ================================================================= */}
              <Route
                path="/merchant"
                element={
                  <ProtectedRoute allowedRoles={['business_owner']}>
                    <MerchantLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/merchant/dashboard" replace />} />
                <Route path="dashboard" element={<MerchantDashboard />} />
                <Route path="store-design" element={<MerchantDashboard />} />
                <Route path="design" element={<MerchantDashboard />} />
                <Route path="business-settings" element={<MerchantDashboard />} />
                <Route path="settings" element={<MerchantDashboard />} />
                <Route path="business/new" element={<MerchantBusinessRegister />} />
                <Route path="products" element={<MerchantProductsPage />} />
                <Route path="products/new" element={<MerchantProductFormPage />} />
                <Route path="products/:id/edit" element={<MerchantProductFormPage />} />
                <Route path="inventory" element={<MerchantInventoryPage />} />
                <Route path="analytics" element={<MerchantAnalyticsPage />} />
                <Route path="sales-analytics" element={<MerchantAnalyticsPage />} />
                <Route path="account" element={<MerchantAccountPage />} />
                {/* Fallback for unknown merchant routes */}
                <Route path="*" element={<Navigate to="/merchant/dashboard" replace />} />
              </Route>

              {/* =================================================================
                  MERCHANT MARKETPLACE VIEW (Rendered inside MerchantLayout)
                  ================================================================= */}
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute allowedRoles={['business_owner']}>
                    <MerchantLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MarketplacePage />} />
              </Route>

          {/* Fallback unknown paths redirect role-awarely */}
          <Route path="*" element={<RoleAwareFallback />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};

export default App;
