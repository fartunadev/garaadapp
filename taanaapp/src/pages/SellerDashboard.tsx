import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, DollarSign, 
  Star, TrendingUp, Menu, X, LogOut, Plus, AlertTriangle, Trash2, Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentSeller, useSellerOrders, useSellerProducts, useSellerPayouts } from '@/hooks/useSellers';
import ProductForm from '@/components/admin/ProductForm';
import SellerStoreSettings from '@/components/seller/SellerStoreSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { data: seller, isLoading: sellerLoading } = useCurrentSeller();
  const { data: orders } = useSellerOrders(seller?.id);
  const { data: products } = useSellerProducts(seller?.id);
  const { data: payouts } = useSellerPayouts(seller?.id);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleDeleteProduct = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    } catch {
      toast.error('Failed to update order status');
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || sellerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Not a Seller</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have a seller account yet. Contact admin to become a seller.
            </p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package, badge: products?.length?.toString() },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders?.length?.toString() },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const totalEarnings = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const lowStockProducts = products?.filter(p => p.stock <= 10) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Store Rating</p>
                <p className="text-2xl font-bold">{seller.rating || 0} ⭐</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-destructive/5 rounded">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">{product.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>${order.total?.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Products</h2>
        <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      
      <Card>
        <CardContent className="p-0">
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setEditingProduct(product); setShowProductForm(true); }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock <= 10 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteProduct(e, product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No products yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Orders</h2>
      
      <Card>
        <CardContent className="p-0">
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{order.order_items?.length || 0} items</TableCell>
                    <TableCell>${order.total?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderEarnings = () => {
    const commissionRate = seller.commission_rate || 10;
    const netEarnings = totalEarnings * (1 - commissionRate / 100);
    const pendingPayouts = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;
    const completedPayouts = payouts?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Earnings & Payouts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Gross Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Net Earnings ({100 - commissionRate}%)</p>
              <p className="text-2xl font-bold text-primary">${netEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Paid Out</p>
              <p className="text-2xl font-bold">${completedPayouts.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts && payouts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map(payout => (
                    <TableRow key={payout.id}>
                      <TableCell>{format(new Date(payout.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell>{payout.payment_method || 'Bank Transfer'}</TableCell>
                      <TableCell>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No payouts yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex bg-gradient-to-b from-primary to-primary/80 text-primary-foreground flex-col">
          <div className="p-6 border-b border-primary-foreground/20">
            <h1 className="text-xl font-bold">{seller.store_name}</h1>
            <p className="text-sm text-primary-foreground/70">Seller Dashboard</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-primary-foreground/20 rounded-full">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-primary-foreground/20">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-foreground/10 rounded-lg mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Go to Store</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-foreground/10 rounded-lg">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold capitalize">{currentPage}</h2>
              </div>
              <div className="flex items-center gap-3">
                {seller.is_verified && (
                  <Badge variant="default" className="gap-1">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {currentPage === 'dashboard' && renderDashboard()}
            {currentPage === 'products' && renderProducts()}
            {currentPage === 'orders' && renderOrders()}
            {currentPage === 'earnings' && renderEarnings()}
            {currentPage === 'settings' && <SellerStoreSettings seller={seller} />}
          </main>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground flex flex-col">
              <div className="p-6 border-b border-primary-foreground/20 flex items-center justify-between">
                <h1 className="text-xl font-bold">{seller.store_name}</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-primary-foreground/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === item.id ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-primary-foreground/20 rounded-full">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-primary-foreground/20">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-foreground/10 rounded-lg">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {showProductForm && createPortal(
        <ProductForm
          product={editingProduct}
          sellerId={seller.id}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
        />,
        document.body
      )}
    </>
  );
};

export default SellerDashboard;
