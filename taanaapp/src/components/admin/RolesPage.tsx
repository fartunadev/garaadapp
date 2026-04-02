import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, Save, CheckSquare, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Permission = {
  id?: string;
  role: string;
  page: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

const PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'customers', label: 'Customers' },
  { id: 'sellers', label: 'Sellers' },
  { id: 'categories', label: 'Categories' },
  { id: 'products', label: 'Products' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'orders', label: 'Orders' },
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'messages', label: 'Messages' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
  { id: 'roles', label: 'Roles' },
];

const ROLES = [
  { id: 'admin', label: 'Admin', color: 'bg-red-500/10 text-red-600 border-red-200', description: 'Full system access' },
  { id: 'seller', label: 'Seller', color: 'bg-blue-500/10 text-blue-600 border-blue-200', description: 'Manage own store & products' },
  { id: 'moderator', label: 'Moderator', color: 'bg-amber-500/10 text-amber-600 border-amber-200', description: 'Content moderation' },
  { id: 'user', label: 'User', color: 'bg-green-500/10 text-green-600 border-green-200', description: 'Basic customer access' },
];

const ACTIONS = ['can_view', 'can_create', 'can_edit', 'can_delete'] as const;
const ACTION_LABELS: Record<string, string> = {
  can_view: 'View',
  can_create: 'Create',
  can_edit: 'Edit',
  can_delete: 'Delete',
};

const ROLE_NAV: Record<string, string> = {
  admin: 'dashboard',
  moderator: 'users',
  seller: 'sellers',
  user: 'users',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-600 border-red-200',
  seller: 'bg-blue-500/10 text-blue-600 border-blue-200',
  moderator: 'bg-amber-500/10 text-amber-600 border-amber-200',
  user: 'bg-green-500/10 text-green-600 border-green-200',
};

const RolesPage = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [modalPermissions, setModalPermissions] = useState<Record<string, Permission>>({});

  const { data: dbPermissions, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const res = await api.get('/roles');
      return (res.data?.data || []) as Permission[];
    },
  });

  const { data: roleUsers } = useQuery({
    queryKey: ['role-users'],
    queryFn: async () => {
      const res = await api.get('/roles/users');
      const rows: { user_id: string; role: string; full_name: string | null; email: string | null }[] = res.data?.data || [];
      const grouped: Record<string, { user_id: string; full_name: string | null; email: string | null }[]> = {};
      rows.forEach(r => {
        if (!grouped[r.role]) grouped[r.role] = [];
        grouped[r.role].push({ user_id: r.user_id, full_name: r.full_name, email: r.email });
      });
      return grouped;
    },
  });

  // Build userId → role map
  const userRoleMap: Record<string, string> = {};
  if (roleUsers) {
    Object.entries(roleUsers).forEach(([role, users]) => {
      users.forEach(u => { userRoleMap[u.user_id] = role; });
    });
  }

  const { data: allUsers } = useQuery({
    queryKey: ['users-all'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return (res.data?.data || []) as { id: string; email: string | null; full_name: string | null }[];
    },
  });

  const permissionsMap: Record<string, Permission> = {};
  if (dbPermissions) {
    dbPermissions.forEach((p) => {
      permissionsMap[`${p.role}::${p.page}`] = p;
    });
  }

  const openEditModal = (roleId: string) => {
    const map: Record<string, Permission> = {};
    PAGES.forEach(page => {
      const key = `${roleId}::${page.id}`;
      map[key] = permissionsMap[key] || {
        role: roleId,
        page: page.id,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
      };
    });
    setModalPermissions(map);
    setEditingRole(roleId);
  };

  const getModalPerm = (page: string): Permission => {
    if (!editingRole) return { role: '', page, can_view: false, can_create: false, can_edit: false, can_delete: false };
    return modalPermissions[`${editingRole}::${page}`] || {
      role: editingRole,
      page,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    };
  };

  const togglePerm = (page: string, action: typeof ACTIONS[number]) => {
    if (!editingRole) return;
    const key = `${editingRole}::${page}`;
    const current = getModalPerm(page);
    setModalPermissions(prev => ({
      ...prev,
      [key]: { ...current, [action]: !current[action] },
    }));
  };

  const selectAll = () => {
    if (!editingRole) return;
    const updated = { ...modalPermissions };
    PAGES.forEach(page => {
      const key = `${editingRole}::${page.id}`;
      updated[key] = { ...getModalPerm(page.id), can_view: true, can_create: true, can_edit: true, can_delete: true };
    });
    setModalPermissions(updated);
  };

  const deselectAll = () => {
    if (!editingRole) return;
    const updated = { ...modalPermissions };
    PAGES.forEach(page => {
      const key = `${editingRole}::${page.id}`;
      updated[key] = { ...getModalPerm(page.id), can_view: false, can_create: false, can_edit: false, can_delete: false };
    });
    setModalPermissions(updated);
  };

  const togglePageAll = (pageId: string) => {
    if (!editingRole) return;
    const perm = getModalPerm(pageId);
    const allChecked = ACTIONS.every(a => perm[a]);
    const key = `${editingRole}::${pageId}`;
    setModalPermissions(prev => ({
      ...prev,
      [key]: { ...perm, can_view: !allChecked, can_create: !allChecked, can_edit: !allChecked, can_delete: !allChecked },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editingRole) return;
      const rolePerms = Object.values(modalPermissions);
      for (const perm of rolePerms) {
        await api.post('/roles', {
          role: perm.role,
          page: perm.page,
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
        });
      }
    },
    onSuccess: () => {
      toast.success('Permissions saved successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      setEditingRole(null);
    },
    onError: () => toast.error('Failed to save permissions'),
  });

  const getPermCount = (roleId: string) => {
    if (!dbPermissions) return 0;
    return dbPermissions.filter(p => p.role === roleId && (p.can_view || p.can_create || p.can_edit || p.can_delete)).length;
  };

  // Determine display data for the currently editing role or user
  let editingRoleData = ROLES.find(r => r.id === editingRole);
  let editingUserData: { id: string; full_name?: string | null; email?: string | null } | null = null;
  if (!editingRoleData && editingRole && editingRole.startsWith('user:') && allUsers) {
    const userId = editingRole.split(':')[1];
    editingUserData = allUsers.find(u => u.id === userId) || null;
    if (editingUserData) {
      editingRoleData = { id: editingRole, label: editingUserData.full_name || editingUserData.email || 'User', color: 'bg-muted text-muted-foreground border-border', description: 'User-specific permissions' } as any;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Role Permissions</h2>
          <p className="text-sm text-muted-foreground">Manage access permissions for each role</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map(role => (
          <Card key={role.id} className="hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{role.label}</CardTitle>
                <Badge variant="outline" className={role.color}>{role.id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                {getPermCount(role.id)} / {PAGES.length} pages with access
              </p>
              {roleUsers && roleUsers[role.id] && roleUsers[role.id].length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                    <Users className="w-3 h-3" />
                    <span>{roleUsers[role.id].length} user{roleUsers[role.id].length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {roleUsers[role.id].slice(0, 3).map(u => (
                      <div key={u.user_id} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-0.5">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground truncate max-w-[80px]">
                          {u.full_name || u.email?.split('@')[0] || 'Unknown'}
                        </span>
                      </div>
                    ))}
                    {roleUsers[role.id].length > 3 && (
                      <span className="text-xs text-muted-foreground self-center">+{roleUsers[role.id].length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
              {(!roleUsers || !roleUsers[role.id] || roleUsers[role.id].length === 0) && (
                <p className="text-xs text-muted-foreground mb-3">No users assigned</p>
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => openEditModal(role.id)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Users */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">All Users</h3>
          <p className="text-sm text-muted-foreground">{(allUsers || []).length} total users</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(allUsers || []).map(u => {
            const role = userRoleMap[u.id] || 'user';
            const navPage = ROLE_NAV[role] || 'users';
            const roleColor = ROLE_COLORS[role] || 'bg-muted text-muted-foreground border-border';
            return (
              <Card key={u.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{(u.full_name || u.email || '?')[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.full_name || u.email?.split('@')[0]}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${roleColor}`}>{role}</Badge>
                      {onNavigate && (
                        <Button size="sm" variant="outline" onClick={() => onNavigate(navPage)}>
                          <Pencil className="w-3 h-3 mr-1" />
                          {role === 'seller' ? 'Sellers' : role === 'admin' ? 'Dashboard' : 'Users'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg">
                {editingRoleData?.label} Permissions
              </DialogTitle>
              {editingRoleData && (
                <Badge variant="outline" className={editingRoleData.color}>{editingRoleData.id}</Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={selectAll}>
              <CheckSquare className="w-3 h-3 mr-1" /> Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-foreground">Page</th>
                  {ACTIONS.map(action => (
                    <th key={action} className="text-center py-2 px-3 text-sm font-semibold text-foreground">
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                  <th className="text-center py-2 px-3 text-sm font-semibold text-foreground">All</th>
                </tr>
              </thead>
              <tbody>
                {PAGES.map((page, idx) => {
                  const perm = getModalPerm(page.id);
                  const allChecked = ACTIONS.every(a => perm[a]);
                  return (
                    <tr key={page.id} className={`border-b border-border/50 ${idx % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      <td className="py-2 px-3 text-sm font-medium text-foreground">{page.label}</td>
                      {ACTIONS.map(action => (
                        <td key={action} className="text-center py-2 px-3">
                          <Checkbox checked={perm[action]} onCheckedChange={() => togglePerm(page.id, action)} />
                        </td>
                      ))}
                      <td className="text-center py-2 px-3">
                        <Checkbox checked={allChecked} onCheckedChange={() => togglePageAll(page.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;
