import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white clay-card flex items-center justify-center text-[#3B1C5A]">
          <Loader2 className="w-8 h-8 animate-spin text-[#E6B44C]" />
        </div>
        <p className="text-sm font-semibold text-[#3B1C5A]/70">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'business_owner') {
      return <Navigate to="/merchant/dashboard" replace />;
    }
    return <Navigate to="/customer/home" replace />;
  }

  return children;
};

export default ProtectedRoute;

