import { useState } from 'react';
import { X, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

const AddUserModal = ({ open, onClose }: AddUserModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Image too large', description: 'Max 5MB', variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Only JPG/PNG', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'user', status: 'active' });
    setAvatarPreview(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.password || !formData.role) {
      toast({ title: 'Missing fields', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: 'Password too short', description: 'Minimum 8 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');

      // Register user
      const regRes = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        fullName,
        phone: formData.phone || undefined,
      });
      const newUser = regRes.data?.data || regRes.data;
      const userId = newUser?.user?.id || newUser?.id;

      // Set role if not default 'user'
      if (formData.role !== 'user' && userId) {
        await api.put(`/auth/users/${userId}/role`, { role: formData.role });
      }

      // Suspend if status is not active
      if (formData.status !== 'active' && userId) {
        await api.put(`/auth/users/${userId}/status`, { is_active: false });
      }

      toast({ title: 'User created', description: `${fullName} has been added successfully` });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
      handleClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create user';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Add New User</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new user account with role and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg bg-muted/30">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted border-4 border-border flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="text-center">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Avatar</span>
                </div>
              </Label>
              <Input id="avatar" type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Enter first name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Enter last name" />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+252 XX XXX XXXX" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimum 8 characters" />
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
