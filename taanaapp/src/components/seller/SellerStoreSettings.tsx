import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Upload } from 'lucide-react';
import type { Seller } from '@/hooks/useSellers';

interface SellerStoreSettingsProps {
  seller: Seller;
}

const SellerStoreSettings = ({ seller }: SellerStoreSettingsProps) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    store_name: seller.store_name || '',
    store_description: seller.store_description || '',
    logo_url: seller.logo_url || '',
    banner_url: seller.banner_url || '',
    phone: seller.phone || '',
    email: seller.email || '',
    address: seller.address || '',
    city: seller.city || '',
    country: seller.country || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url || res.data?.url || '';
      handleChange(field, url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/sellers/${seller.id}`, {
        storeName: form.store_name,
        storeDescription: form.store_description,
        logoUrl: form.logo_url,
        bannerUrl: form.banner_url,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
      });
      toast.success('Store settings updated');
      queryClient.invalidateQueries({ queryKey: ['current-seller'] });
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Store Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input id="store_name" value={form.store_name} onChange={e => handleChange('store_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_description">Store Description</Label>
            <Textarea id="store_description" rows={4} value={form.store_description} onChange={e => handleChange('store_description', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-4">
              {form.logo_url && (
                <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-border" />
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <span><Upload className="w-4 h-4" /> Upload Logo</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo_url')} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Store Banner</Label>
            <div className="space-y-2">
              {form.banner_url && (
                <img src={form.banner_url} alt="Banner" className="w-full h-32 rounded-lg object-cover border border-border" />
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <span><Upload className="w-4 h-4" /> Upload Banner</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'banner_url')} disabled={uploading} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={e => handleChange('address', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={e => handleChange('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country} onChange={e => handleChange('country', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerStoreSettings;
