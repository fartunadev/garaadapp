import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { User, ShoppingBag, Heart, Store, Package, LogOut, ChevronRight, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { Skeleton } from "@/components/ui/skeleton";
import SellerRegistrationModal from "@/components/account/SellerRegistrationModal";
/**/
const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useCustomerOrders();
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-muted-foreground">
              Sign in to view your orders, save favorites, and manage your account.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>Create Account</Button>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 3) || [];

  const menuItems = [
    { icon: Package, label: "My Orders", description: "View order history", onClick: () => navigate('/orders') },
    { icon: MapPinned, label: "Track Order", description: "Track your order status", onClick: () => navigate('/track-order') },
    { icon: Heart, label: "Wishlist", description: "Your saved items", onClick: () => navigate('/wishlist') },
    { icon: Store, label: "Become a Seller", description: "Start selling on our platform", onClick: () => setShowSellerModal(true) },
    { icon: LogOut, label: "Logout", description: "Sign out of your account", onClick: handleSignOut },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-3 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Profile Header - Compact */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground truncate">{user?.email}</h1>
                  <p className="text-xs text-muted-foreground">Welcome back!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">
                  {orders?.filter(o => o.status === 'pending').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">
                  {orders?.filter(o => o.status === 'shipped').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">
                  {orders?.filter(o => o.status === 'delivered').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders - Compact */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShoppingBag className="h-4 w-4" />
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-xs">Your latest purchases</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/orders')}>
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/orders')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.order_items?.slice(0, 2).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.product_image || '/placeholder.svg'}
                              alt={item.product_name}
                              className="h-10 w-10 rounded-lg border-2 border-background object-cover"
                            />
                          ))}
                          {(order.order_items?.length || 0) > 2 && (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                              +{(order.order_items?.length || 0) - 2}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                  <Button variant="link" onClick={() => navigate('/')}>Start Shopping</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Items - Compact */}
          <Card>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${
                    index !== menuItems.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <BottomNav />

      <SellerRegistrationModal 
        open={showSellerModal} 
        onOpenChange={setShowSellerModal} 
      />
    </div>
  );
};


export default Account;
