
import React, { useState, useEffect } from 'react';
import { Loader2, Search, Shield, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { getUsersWithRoles, assignRole, removeRole } from '@/services/roleService';
import { blockUser, setGhostMode, updateFeedRadius } from '@/services/adminService';
import { UserRole } from '@/types/roles';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedRadius, setFeedRadius] = useState(20);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersWithRoles();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.pseudonym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFeedRadius(user.feed_radius || 20);
    setDialogOpen(true);
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      setSubmitting(true);
      await blockUser(userId, blocked);
      toast({
        title: blocked ? "User blocked" : "User unblocked",
        description: blocked 
          ? "The user has been blocked from the platform."
          : "The user has been unblocked and can now use the platform."
      });
      await loadUsers();
    } catch (err: any) {
      console.error("Error blocking user:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGhostMode = async (userId: string, ghostMode: boolean) => {
    try {
      setSubmitting(true);
      await setGhostMode(userId, ghostMode);
      toast({
        title: "Ghost mode updated",
        description: ghostMode 
          ? "Ghost mode has been enabled for this user."
          : "Ghost mode has been disabled for this user."
      });
      await loadUsers();
    } catch (err: any) {
      console.error("Error updating ghost mode:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to update ghost mode",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFeedRadius = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      await updateFeedRadius(selectedUser.id, feedRadius);
      toast({
        title: "Feed radius updated",
        description: `Feed radius has been set to ${feedRadius} km.`
      });
      setDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error("Error updating feed radius:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to update feed radius",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout title="User Management">
      <div className="mb-6 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
                  </TableCell>
                  <TableCell>{user.location || 'Unknown'}</TableCell>
                  <TableCell>{getRoleBadges(user.roles || ['user'])}</TableCell>
                  <TableCell>{new Date(user.joined_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.is_blocked ? (
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                        Blocked
                      </Badge>
                    ) : user.ghost_mode ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                        Ghost Mode
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Edit user settings"
                      >
                        Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            disabled={user.roles?.includes('paid_user')}
                            onClick={() => handleRoleChange(user.id, 'paid_user', true)}
                          >
                            Assign Paid User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={!user.roles?.includes('paid_user')}
                            onClick={() => handleRoleChange(user.id, 'paid_user', false)}
                          >
                            Remove Paid User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={user.roles?.includes('moderator')}
                            onClick={() => handleRoleChange(user.id, 'moderator', true)}
                          >
                            Assign Moderator
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={!user.roles?.includes('moderator')}
                            onClick={() => handleRoleChange(user.id, 'moderator', false)}
                          >
                            Remove Moderator
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant={user.is_blocked ? "default" : "destructive"}
                        size="sm"
                        title={user.is_blocked ? "Unblock user" : "Block user"}
                        onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                      >
                        {user.is_blocked ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedUser && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit User Settings</DialogTitle>
              <DialogDescription>
                Update settings for {selectedUser.pseudonym}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Feed Radius</h4>
                <p className="text-sm text-muted-foreground">
                  Set the maximum feed radius for this user (in km).
                  {selectedUser.roles?.includes('paid_user') 
                    ? ' Paid users can have a radius up to 100 km.' 
                    : ' Regular users are limited to 20 km.'}
                </p>
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={feedRadius}
                    onChange={(e) => setFeedRadius(parseInt(e.target.value))}
                    min={1}
                    max={selectedUser.roles?.includes('paid_user') ? 100 : 20}
                    className="w-20"
                  />
                  <span className="ml-2">km</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Ghost Mode</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, the user's location will not be visible to others.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedUser.ghost_mode ? "default" : "outline"}
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleGhostMode(selectedUser.id, true)}
                  >
                    Enabled
                  </Button>
                  <Button
                    variant={!selectedUser.ghost_mode ? "default" : "outline"}
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleGhostMode(selectedUser.id, false)}
                  >
                    Disabled
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-muted-foreground">
                  Block or unblock this user's account.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant={!selectedUser.is_blocked ? "default" : "outline"}
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleBlockUser(selectedUser.id, false)}
                  >
                    Active
                  </Button>
                  <Button
                    variant={selectedUser.is_blocked ? "destructive" : "outline"}
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleBlockUser(selectedUser.id, true)}
                  >
                    Blocked
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => setDialogOpen(false)} 
                variant="outline"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateFeedRadius}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
