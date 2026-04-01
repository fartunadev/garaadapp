import { useState } from 'react';
import { Search, Eye, Mail, ShoppingCart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfilesWithRoles } from '@/hooks/useAdminData';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CustomerDetailsModalProps {
  customer: any;
  orders: any[];
  open: boolean;
  onClose: () => void;
}

const CustomerDetailsModal = ({ customer, orders, open, onClose }: CustomerDetailsModalProps) => {
  if (!customer) return null;
  
  const customerOrders = orders.filter(o => o.user_id === customer.user_id);
  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {customer.avatar_url ? (
                <img src={customer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {(customer.full_name || 'C').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{customer.full_name || 'Unknown'}</h3>
              <p className="text-sm text-muted-foreground">{customer.email || 'No email'}</p>
              <p className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                customer.is_active 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-medium mb-3">
              <MapPin className="w-4 h-4" />
              Address
            </div>
            <p className="text-sm text-foreground">{customer.address || 'No address'}</p>
            <p className="text-sm text-muted-foreground">
              {[customer.city, customer.country].filter(Boolean).join(', ') || 'No location'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{customerOrders.length}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
            <div className="bg-success/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-success">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {format(new Date(customer.created_at), 'MMM yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">Member Since</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Recent Orders</h4>
            {customerOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {customerOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${order.total}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-success/10 text-success' :
                        order.status === 'shipped' ? 'bg-accent/10 text-accent' :
                        order.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: profiles, isLoading: loadingProfiles } = useProfilesWithRoles();
  const { data: orders, isLoading: loadingOrders } = useAdminOrders();

  // Filter to only show customers (users with 'user' role or no special roles)
  const customers = (profiles || []).filter(p => {
    const roles = p.roles || [];
    return roles.length === 0 || roles.includes('user');
  });

  const filteredCustomers = customers.filter(customer =>
    (customer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCustomerOrderCount = (userId: string) => {
    return (orders || []).filter(o => o.user_id === userId).length;
  };

  const getCustomerTotalSpent = (userId: string) => {
    return (orders || []).filter(o => o.user_id === userId).reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  if (loadingProfiles || loadingOrders) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
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
      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search customers by name, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Customers ({filteredCustomers.length})
          </h2>
        </div>

        {paginatedCustomers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Contact</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Location</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Orders</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Total Spent</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
                  <th className="text-right py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-semibold text-sm">
                              {(customer.full_name || 'C').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{customer.full_name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {format(new Date(customer.created_at), 'MMM yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <div className="text-sm">
                        <p className="text-foreground">{customer.email || '-'}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                      {[customer.city, customer.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <div className="flex items-center gap-1 text-sm">
                        <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">{getCustomerOrderCount(customer.user_id)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:px-6 font-semibold text-foreground text-sm">
                      ${getCustomerTotalSpent(customer.user_id).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.is_active 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewDetails(customer)}
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <CustomerDetailsModal
        customer={selectedCustomer}
        orders={orders || []}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
};

export default CustomersPage;
