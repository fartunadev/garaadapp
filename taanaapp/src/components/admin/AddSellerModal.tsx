import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Store, Mail, Phone, MapPin, Percent } from "lucide-react";

interface AddSellerModalProps {
  open: boolean;
  onClose: () => void;
}

const AddSellerModal = ({ open, onClose }: AddSellerModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    phone: "",
    description: "",
    address: "",
    city: "",
    country: "",
    commissionRate: "10",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storeName || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Try to register a new user account for the seller
      const tempPassword = `TempPass${Math.random().toString(36).substring(2, 10)}!`;
      const regRes = await api.post('/auth/register', {
        email: formData.email,
        password: tempPassword,
        fullName: formData.storeName,
      });
      const regData = regRes.data?.data || regRes.data;
      let newUserId: string = regData?.user?.id || regData?.id;

      // If registration didn't return an ID, throw
      if (!newUserId) {
        throw new Error('Unable to create seller account: registration did not return a user ID');
      }

      // Step 2: Create seller profile linked to that new user.
      await api.post('/sellers/register', {
        userId: newUserId,
        storeName: formData.storeName,
        storeDescription: formData.description || null,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
      });

      toast({
        title: 'Seller added successfully',
        description: `${formData.storeName} has been added as a seller`,
      });

      queryClient.invalidateQueries({ queryKey: ['sellers'] });

      // Reset form
      setFormData({
        storeName: '',
        email: '',
        phone: '',
        description: '',
        address: '',
        city: '',
        country: '',
        commissionRate: '10',
      });

      onClose();
    } catch (error: any) {
      // If the email already exists (409), try to locate the existing user and reuse their ID
      const status = error?.response?.status;
      if (status === 409) {
        try {
          const usersRes = await api.get('/auth/users', { params: { search: formData.email, limit: 1 } });
          const existing = usersRes.data?.data?.[0];
          const existingUserId = existing?.id;

          if (!existingUserId) {
            throw new Error('Email already registered but user lookup failed');
          }

          // Create seller profile for existing user
          await api.post('/sellers/register', {
            userId: existingUserId,
            storeName: formData.storeName,
            storeDescription: formData.description || null,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
          });

          toast({
            title: 'Seller added for existing user',
            description: `${formData.storeName} was linked to an existing account`,
          });

          queryClient.invalidateQueries({ queryKey: ['sellers'] });
          setFormData({
            storeName: '',
            email: '',
            phone: '',
            description: '',
            address: '',
            city: '',
            country: '',
            commissionRate: '10',
          });
          onClose();
        } catch (innerErr: any) {
          const msg = innerErr?.response?.data?.message || innerErr?.message || 'Error adding seller';
          toast({ title: 'Error adding seller', description: msg, variant: 'destructive' });
        }
      } else {
        const msg = error?.response?.data?.message || error?.message || 'Error adding seller';
        toast({ title: 'Error adding seller', description: msg, variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Add New Seller
          </DialogTitle>
          <DialogDescription>
            Create a new seller account. They will receive access to their seller dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              name="storeName"
              placeholder="Enter store name"
              value={formData.storeName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seller@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+252 XX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Store Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of the store..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <Input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
              <Input
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="commissionRate" className="flex items-center gap-1">
              <Percent className="w-3 h-3" /> Commission Rate (%)
            </Label>
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              min="0"
              max="100"
              placeholder="10"
              value={formData.commissionRate}
              onChange={handleChange}
              className="w-32"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Seller"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSellerModal;
