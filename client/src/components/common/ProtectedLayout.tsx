import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedLayoutProps {
  allowedRoles?: Role[];
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Authenticating user...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const normalize = (r: string) => {
      if (r === 'RESTAURANT_ADMIN') return 'ADMIN';
      if (r === 'KITCHEN_STAFF') return 'KITCHEN';
      if (r === 'DELIVERY_PERSONNEL') return 'DELIVERY';
      return r;
    };

    const userNorm = normalize(user.role);
    const allowedNorm = allowedRoles.map(normalize);

    if (!allowedNorm.includes(userNorm) && !allowedRoles.includes(user.role)) {
      if (userNorm === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      if (userNorm === 'KITCHEN') return <Navigate to="/kitchen/dashboard" replace />;
      if (userNorm === 'DELIVERY') return <Navigate to="/delivery/dashboard" replace />;
      return <Navigate to="/menu" replace />;
    }
  }

  return <Outlet />;
};
