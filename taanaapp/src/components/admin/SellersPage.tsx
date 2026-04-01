import { useState } from 'react';
import { Star, CheckCircle, Clock, Search, MoreVertical, Ban, Trash2, Percent, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useSellers } from '@/hooks/useAdminData';
import { useVerifySeller, useToggleSellerStatus, useUpdateSellerCommission, useDeleteSeller } from '@/hooks/useSellerManagement';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AddSellerModal from './AddSellerModal';

const SellersPage = () => {
  const { data: sellers, isLoading } = useSellers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [addSellerModalOpen, setAddSellerModalOpen] = useState(false);
  const [newCommission, setNewCommission] = useState('');

  const verifySeller = useVerifySeller();
  const toggleStatus = useToggleSellerStatus();
  const updateCommission = useUpdateSellerCommission();
  const deleteSeller = useDeleteSeller();
  const { toast } = useToast();

  const filteredSellers = sellers?.filter(seller =>
    seller.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (seller.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) || [];

  const handleVerify = async (seller: any) => {
    try {
      await verifySeller.mutateAsync({ id: seller.id, is_verified: !seller.is_verified });
      toast({
        title: seller.is_verified ? 'Verification removed' : 'Seller verified',
        description: `${seller.store_name} has been ${seller.is_verified ? 'unverified' : 'verified'}`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (seller: any) => {
    try {
      await toggleStatus.mutateAsync({ id: seller.id, is_active: !seller.is_active });
      toast({
        title: seller.is_active ? 'Seller suspended' : 'Seller activated',
        description: `${seller.store_name} has been ${seller.is_active ? 'suspended' : 'activated'}`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedSeller || !newCommission) return;
    try {
      await updateCommission.mutateAsync({ 
        id: selectedSeller.id, 
        commission_rate: parseFloat(newCommission) 
      });
      toast({
        title: 'Commission updated',
        description: `Commission rate set to ${newCommission}%`,
      });
      setCommissionDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedSeller) return;
    try {
      await deleteSeller.mutateAsync(selectedSeller.id);
      toast({
        title: 'Seller deleted',
        description: `${selectedSeller.store_name} has been removed`,
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <Skeleton className="h-7 w-48 mb-4" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="p-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Sellers Management</h2>
          <Button onClick={() => setAddSellerModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Seller
          </Button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>
      
      {filteredSellers.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>No sellers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Shop Name</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Contact</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Products</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Sales</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Commission</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Joined</th>
                <th className="text-right py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 md:px-6">
                    <div className="flex items-center gap-3">
                      {seller.logo_url ? (
                        <img src={seller.logo_url} alt={seller.store_name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {seller.store_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-foreground text-sm">{seller.store_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{seller.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 md:px-6">
                    <div>
                      <div className="text-sm text-foreground">{seller.email || '-'}</div>
                      <div className="text-xs text-muted-foreground">{seller.phone || ''}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">{seller.total_products}</td>
                  <td className="py-3 px-4 md:px-6 font-semibold text-foreground text-sm">
                    ${seller.total_sales?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                    {seller.commission_rate}%
                  </td>
                  <td className="py-3 px-4 md:px-6">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        seller.is_verified 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                      }`}>
                        {seller.is_verified ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </span>
                      {!seller.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 w-fit">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                    {format(new Date(seller.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVerify(seller)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {seller.is_verified ? 'Remove Verification' : 'Verify Seller'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSeller(seller);
                          setNewCommission(seller.commission_rate?.toString() || '10');
                          setCommissionDialogOpen(true);
                        }}>
                          <Percent className="w-4 h-4 mr-2" />
                          Set Commission
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(seller)}
                          className={seller.is_active ? 'text-destructive' : 'text-success'}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {seller.is_active ? 'Suspend Seller' : 'Activate Seller'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedSeller(seller);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Seller
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seller</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSeller?.store_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Commission Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Commission Rate</DialogTitle>
            <DialogDescription>
              Set the commission rate for {selectedSeller?.store_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="commission">Commission Rate (%)</Label>
            <Input
              id="commission"
              type="number"
              min="0"
              max="100"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCommission}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Seller Modal */}
      <AddSellerModal 
        open={addSellerModalOpen} 
        onClose={() => setAddSellerModalOpen(false)} 
      />
    </div>
  );
};

export default SellersPage;
