
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { getUsersWithRoles, assignRole, removeRole } from '@/services/roleService';
import { UserRole } from '@/types/roles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RolesManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersWithRoles();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole, add: boolean) => {
    try {
      setSubmitting(true);
      
      if (add) {
        await assignRole(userId, role);
        toast({
          title: "Role added",
          description: `The ${role} role has been assigned.`
        });
      } else {
        await removeRole(userId, role);
        toast({
          title: "Role removed",
          description: `The ${role} role has been removed.`
        });
      }
      
      await loadUsers();
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadges = (roles: UserRole[]) => {
    return roles.map(role => {
      let className = "";
      
      switch (role) {
        case 'superadmin':
          className = "bg-purple-100 text-purple-800 border-purple-300";
          break;
        case 'admin':
          className = "bg-red-100 text-red-800 border-red-300";
          break;
        case 'moderator':
          className = "bg-blue-100 text-blue-800 border-blue-300";
          break;
        case 'paid_user':
          className = "bg-green-100 text-green-800 border-green-300";
          break;
        default:
          className = "bg-gray-100 text-gray-800 border-gray-200";
      }
      
      return (
        <Badge key={role} variant="outline" className={`mr-1 ${className}`}>
          {role === 'paid_user' ? 'Paid' : role}
        </Badge>
      );
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Role Management">
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Role Management">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Role Management">
      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Current Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.pseudonym}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {user.pseudonym.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.pseudonym}</span>
                    </div>
                    <div className="md:hidden mt-2">
                      {getRoleBadges(user.roles || ['user'])}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getRoleBadges(user.roles || ['user'])}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm"
                        variant={user.roles?.includes('user') ? "default" : "outline"}
                        disabled={submitting || user.roles?.includes('user')}
                        onClick={() => handleRoleChange(user.id, 'user', true)}
                      >
                        User
                      </Button>
                      <Button 
                        size="sm"
                        variant={user.roles?.includes('paid_user') ? "default" : "outline"}
                        disabled={submitting}
                        onClick={() => handleRoleChange(user.id, 'paid_user', user.roles?.includes('paid_user') ? false : true)}
                      >
                        {user.roles?.includes('paid_user') ? "Remove Paid" : "Add Paid"}
                      </Button>
                      <Button 
                        size="sm"
                        variant={user.roles?.includes('moderator') ? "default" : "outline"}
                        disabled={submitting}
                        onClick={() => handleRoleChange(user.id, 'moderator', user.roles?.includes('moderator') ? false : true)}
                      >
                        {user.roles?.includes('moderator') ? "Remove Mod" : "Add Mod"}
                      </Button>
                      <Button 
                        size="sm"
                        variant={user.roles?.includes('admin') ? "default" : "outline"}
                        disabled={submitting}
                        onClick={() => handleRoleChange(user.id, 'admin', user.roles?.includes('admin') ? false : true)}
                      >
                        {user.roles?.includes('admin') ? "Remove Admin" : "Add Admin"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default RolesManagement;
