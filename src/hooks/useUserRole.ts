
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles } from '@/services/roleService';
import { UserRole } from '@/types/roles';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userRoles = await getUserRoles(user.id);
        setRoles(userRoles.length > 0 ? userRoles : ['user']);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return roles.some(role => requiredRoles.includes(role));
  };

  const isAtLeastRole = (minRole: UserRole): boolean => {
    const roleHierarchy: UserRole[] = ['user', 'paid_user', 'moderator', 'admin', 'superadmin'];
    const userHighestRoleIndex = Math.max(...roles.map(role => roleHierarchy.indexOf(role)));
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    
    return userHighestRoleIndex >= minRoleIndex;
  };

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    isAtLeastRole,
    isUser: hasRole('user'),
    isPaidUser: hasRole('paid_user'),
    isModerator: hasRole('moderator'),
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('superadmin'),
  };
};
