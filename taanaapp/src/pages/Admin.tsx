import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, DollarSign, 
  Star, MessageSquare, Settings, TrendingUp,
  Tag, Menu, X, BarChart3, ShoppingBag, Heart, LogOut, 
  MapPin, CreditCard, Grid, Boxes, UserCheck, Shield  
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '@/components/admin/DashboardStats';
import CategoriesPage from '@/components/admin/CategoriesPage';
import ProductsPage from '@/components/admin/ProductsPage';
import PaymentsPage from '@/components/admin/PaymentsPage';
import SellersPage from '@/components/admin/SellersPage';
import ReviewsPage from '@/components/admin/ReviewsPage';
import MessagesPage from '@/components/admin/MessagesPage';
import PayoutsPage from '@/components/admin/PayoutsPage';
import ReportsPage from '@/components/admin/ReportsPage';
import MarketingPage from '@/components/admin/MarketingPage';
import SlidesPage from '@/components/admin/SlidesPage';
import OrdersPage from '@/components/admin/OrdersPage';
import NotificationBell from '@/components/admin/NotificationBell';
import UsersPage from '@/components/admin/UsersPage';
import CustomersPage from '@/components/admin/CustomersPage';
import SettingsPage from '@/components/admin/SettingsPage';
import AddressesPage from '@/components/admin/AddressesPage';
import RolesPage from '@/components/admin/RolesPage';
import InventoryPage from '@/components/admin/InventoryPage';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { useRealtimeOrders, useRealtimeReviews } from '@/hooks/useRealtimeOrders';

const getRoleVariant = (userRole?: string) => {
  if (userRole === 'admin') return 'superAdmin';
  if (userRole === 'seller') return 'seller';
  return 'buyer';
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [currentRole, setCurrentRole] = useState('superAdmin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enable real-time subscriptions for orders and reviews
  useRealtimeOrders();
  useRealtimeReviews();

  // Redirect to auth if not authenticated; set role based on user.role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (user) {
        setCurrentRole(getRoleVariant(user.role));
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  // Extra guard: if user is authenticated but not admin, redirect to account
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  useEffect(() => {
    if (!roleLoading && !isAdmin && isAuthenticated) {
      navigate('/account');
    }
  }, [isAdmin, roleLoading, isAuthenticated, navigate]);

  const navigationItems = {
    superAdmin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Users', icon: Users, badge: '' },
      { id: 'customers', label: 'Customers', icon: UserCheck, badge: '' },
      { id: 'sellers', label: 'Sellers', icon: ShoppingBag, badge: '' },
      { id: 'categories', label: 'Categories', icon: Grid },
      { id: 'products', label: 'Products', icon: Package, badge: '' },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '' },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'payouts', label: 'Payouts', icon: DollarSign },
      { id: 'reviews', label: 'Reviews', icon: Star, badge: '' },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '' },
      { id: 'marketing', label: 'Marketing', icon: Tag },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'roles', label: 'Roles', icon: Shield },
      { id: 'slides', label: 'Slides', icon: Tag },
    ],
    seller: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'products', label: 'My Products', icon: Package, badge: '' },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'reviews', label: 'Reviews', icon: Star, badge: '' },
      { id: 'payouts', label: 'Payouts', icon: DollarSign },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '' },
      { id: 'settings', label: 'Settings', icon: Settings }
    ],
    buyer: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'orders', label: 'My Orders', icon: ShoppingCart, badge: '' },
      { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: '' },
      { id: 'reviews', label: 'My Reviews', icon: Star },
      { id: 'addresses', label: 'Addresses', icon: MapPin },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
<aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-gradient-to-b from-[#15616d] to-[#15616d]/80 text-white transition-all duration-300 flex-col`}>
        <div className="p-6 border-b border-primary-foreground/20">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-2xl font-bold">ShopAdmin</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems[currentRole].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id ? 'bg-primary-foreground/20 shadow-lg' : 'hover:bg-primary-foreground/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-destructive rounded-full">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/20">
          {/* {sidebarOpen && (
            <div className="mb-3">
              <label className="text-xs text-primary-foreground/70 mb-2 block">Switch Role</label>
              <select 
                value={currentRole} 
                onChange={(e) => {
                  setCurrentRole(e.target.value);
                  setCurrentPage('dashboard');
                }}
                className="w-full px-3 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg text-primary-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
              >
                <option value="superAdmin">Super Admin</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
          )} */}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-foreground/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-foreground" />
              </button>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  {currentRole === 'superAdmin' ? 'Super Admin' : 
                   currentRole === 'seller' ? 'Seller Dashboard' : 'My Account'}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-foreground text-sm truncate max-w-[120px]">
                    {user?.fullName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentPage === 'dashboard' && <DashboardStats currentRole={currentRole} />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'customers' && <CustomersPage />}
          {currentPage === 'categories' && <CategoriesPage />}
          {currentPage === 'products' && <ProductsPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'orders' && <OrdersPage />}
          {currentPage === 'payments' && <PaymentsPage />}
          {currentPage === 'payouts' && <PayoutsPage />}
          {currentPage === 'sellers' && <SellersPage />}
          {currentPage === 'reviews' && <ReviewsPage />}
          {currentPage === 'messages' && <MessagesPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'marketing' && <MarketingPage />}
          {currentPage === 'slides' && <SlidesPage />}
          {currentPage === 'addresses' && <AddressesPage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'roles' && <RolesPage />}
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground flex flex-col">
            <div className="p-6 border-b border-primary-foreground/20 flex items-center justify-between">
              <h1 className="text-2xl font-bold">ShopAdmin</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-primary-foreground/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigationItems[currentRole].map((item) => (
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
                    <span className="px-2 py-1 text-xs bg-destructive rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-primary-foreground/20">
              <div className="mb-3">
                <label className="text-xs text-primary-foreground/70 mb-2 block">Switch Role</label>
                <select 
                  value={currentRole} 
                  onChange={(e) => {
                    setCurrentRole(e.target.value);
                    setCurrentPage('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg text-primary-foreground text-sm"
                >
                  <option value="superAdmin">Super Admin</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-foreground/10 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Admin;
