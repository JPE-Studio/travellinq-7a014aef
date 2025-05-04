
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';

const AdminDashboardLink: React.FC = () => {
  const { roles, isAtLeastRole } = useUserRole();
  
  if (!isAtLeastRole('moderator')) {
    return null;
  }
  
  const isSuperAdmin = roles.includes('superadmin');
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator');
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          {isAdmin || isSuperAdmin ? (
            <ShieldAlert className="h-4 w-4 mr-2" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Mod'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(isAdmin || isSuperAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/admin">Dashboard</Link>
          </DropdownMenuItem>
        )}
        {(isAdmin || isSuperAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/admin/users">User Management</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/admin/reports">Reports</Link>
        </DropdownMenuItem>
        {(isAdmin || isSuperAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/admin/data">Data Export</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminDashboardLink;
