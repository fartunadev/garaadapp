import { useState } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Mail, Ban, Edit, Shield, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddUserModal from './AddUserModal';
import { useProfilesWithRoles } from '@/hooks/useAdminData';
import { useUpdateUserRole, useUpdateUserStatus } from '@/hooks/useUserManagement';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const { data: profiles, isLoading } = useProfilesWithRoles();
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const { toast } = useToast();

  // Only show admin, seller, moderator users - not regular customers
  const staffUsers = profiles?.filter(user => {
    const roles = user.roles || [];
    return roles.includes('admin') || roles.includes('seller') || roles.includes('moderator');
  }) || [];

  const filteredUsers = staffUsers.filter(user =>
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getRoleDisplay = (roles: string[]) => {
    if (roles.includes('admin')) return { label: 'Admin', class: 'bg-accent/10 text-accent border border-accent/20' };
    if (roles.includes('seller')) return { label: 'Seller', class: 'bg-primary/10 text-primary border border-primary/20' };
    if (roles.includes('moderator')) return { label: 'Moderator', class: 'bg-orange-500/10 text-orange-600 border border-orange-500/20' };
    return { label: 'User', class: 'bg-muted text-muted-foreground border border-border' };
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      await updateRole.mutateAsync({
        userId: selectedUser.id,
        role: selectedRole as 'admin' | 'moderator' | 'user' | 'seller',
      });
      toast({
        title: 'Role updated',
        description: `User role changed to ${selectedRole}`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    
    try {
      await updateStatus.mutateAsync({
        userId: selectedUser.id,
        isActive: !selectedUser.is_active,
      });
      toast({
        title: 'Status updated',
        description: `User ${selectedUser.is_active ? 'suspended' : 'activated'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setStatusDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            variant="default" 
            size="default"
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">User</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Role</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Location</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Joined</th>
                  <th className="text-right py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleDisplay(user.roles || []);
                  return (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name || ''} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-semibold text-sm">
                                {(user.full_name || user.email || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">{user.full_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 md:px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.class}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 md:px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                        {user.city && user.country ? `${user.city}, ${user.country}` : user.country || '-'}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.roles?.[0] || 'user');
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="w-4 h-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className={`gap-2 ${user.is_active ? 'text-destructive' : 'text-success'}`}
                              onClick={() => {
                                setSelectedUser(user);
                                setStatusDialogOpen(true);
                              }}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="w-4 h-4" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for {selectedUser?.full_name || selectedUser?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Toggle Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_active ? 'Suspend User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.is_active
                ? `Are you sure you want to suspend ${selectedUser?.full_name || selectedUser?.email}? They will no longer be able to access the platform.`
                : `Are you sure you want to activate ${selectedUser?.full_name || selectedUser?.email}? They will regain access to the platform.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusToggle}
              className={selectedUser?.is_active ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {selectedUser?.is_active ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
