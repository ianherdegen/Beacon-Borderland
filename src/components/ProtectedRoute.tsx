import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
};
