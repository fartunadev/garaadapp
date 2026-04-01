import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Percent, Target, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  discount_percent: number | null;
  discount_code: string | null;
  target_audience: string | null;
  budget: number | null;
  created_at: string;
}

const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const res = await api.get('/marketing/campaigns');
      return res.data?.data || [];
    },
  });
};

const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: { name: string; type: string; description?: string | null; status?: string; start_date?: string | null; end_date?: string | null; discount_percent?: number | null; discount_code?: string | null; target_audience?: string | null; budget?: number | null }) => {
      const res = await api.post('/marketing/campaigns', campaign);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign created successfully' });
    },
  });
};

const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Campaign> & { id: string }) => {
      const res = await api.put(`/marketing/campaigns/${id}`, data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign updated successfully' });
    },
  });
};

const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/marketing/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted successfully' });
    },
  });
};

const MarketingPage = () => {
  const { data: campaigns, isLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount',
    status: 'draft',
    start_date: '',
    end_date: '',
    discount_percent: '',
    discount_code: '',
    target_audience: '',
    budget: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'discount',
      status: 'draft',
      start_date: '',
      end_date: '',
      discount_percent: '',
      discount_code: '',
      target_audience: '',
      budget: '',
    });
    setEditingCampaign(null);
  };

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        type: campaign.type,
        status: campaign.status,
        start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
        end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        discount_percent: campaign.discount_percent?.toString() || '',
        discount_code: campaign.discount_code || '',
        target_audience: campaign.target_audience || '',
        budget: campaign.budget?.toString() || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description || null,
      type: formData.type,
      status: formData.status,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      discount_code: formData.discount_code || null,
      target_audience: formData.target_audience || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    };

    if (editingCampaign) {
      await updateCampaign.mutateAsync({ id: editingCampaign.id, ...payload });
    } else {
      await createCampaign.mutateAsync(payload);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const filteredCampaigns = campaigns?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'scheduled': return 'bg-primary/10 text-primary border-primary/20';
      case 'ended': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="w-4 h-4" />;
      case 'flash_sale': return <Tag className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Marketing Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage promotions and discount campaigns</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Total Campaigns</p>
          <p className="text-2xl font-bold text-foreground">{campaigns?.length || 0}</p>
        </div>
        <div className="bg-success/10 p-4 rounded-xl border border-success/20">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-success">{campaigns?.filter(c => c.status === 'active').length || 0}</p>
        </div>
        <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
          <p className="text-sm text-muted-foreground mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-orange-600">{campaigns?.filter(c => c.status === 'scheduled').length || 0}</p>
        </div>
        <div className="bg-muted p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Draft</p>
          <p className="text-2xl font-bold text-foreground">{campaigns?.filter(c => c.status === 'draft').length || 0}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Discount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCampaigns?.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      {campaign.discount_code && (
                        <p className="text-xs text-muted-foreground font-mono">Code: {campaign.discount_code}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(campaign.type)}
                      <span className="text-sm capitalize">{campaign.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {campaign.discount_percent ? (
                      <span className="font-semibold text-success">{campaign.discount_percent}% OFF</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {campaign.start_date && campaign.end_date ? (
                      <>
                        {format(new Date(campaign.start_date), 'MMM d')} - {format(new Date(campaign.end_date), 'MMM d, yyyy')}
                      </>
                    ) : (
                      'Not set'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${getStatusColor(campaign.status)} capitalize`}>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(campaign)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!filteredCampaigns || filteredCampaigns.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenModal()}>
              Create your first campaign
            </Button>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale 2026"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="flash_sale">Flash Sale</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="clearance">Clearance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Percent</Label>
                <Input
                  type="number"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  placeholder="15"
                />
              </div>
              <div>
                <Label>Discount Code</Label>
                <Input
                  value={formData.discount_code}
                  onChange={(e) => setFormData({ ...formData, discount_code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER25"
                />
              </div>
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(v) => setFormData({ ...formData, target_audience: v })}>
                <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                  <SelectItem value="returning">Returning Customers</SelectItem>
                  <SelectItem value="vip">VIP Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget ($)</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingPage;
