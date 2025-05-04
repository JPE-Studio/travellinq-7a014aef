
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/roles';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  minimumRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  minimumRole
}) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, hasAnyRole, isAtLeastRole } = useUserRole();
  const location = useLocation();

  // If still loading, show a loading indicator
  if (authLoading || rolesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check minimum role if specified
  if (minimumRole && !isAtLeastRole(minimumRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
