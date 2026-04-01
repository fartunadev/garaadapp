import { useState, useEffect } from 'react';
import { Bell, Package, MessageSquare, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: 'order' | 'message' | 'stock';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Fetch low stock products
  const { data: lowStockProducts } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const res = await api.get('/products');
      const products = res.data?.data || res.data || [];
      return products.filter((p: any) => p.stock <= 10).slice(0, 10);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders-notifications'],
    queryFn: async () => {
      const res = await api.get('/orders');
      const orders = res.data?.data || res.data || [];
      return orders.slice(0, 5);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Build notifications from real data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Add low stock alerts
    lowStockProducts?.forEach(product => {
      const severity = product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? 'Critical' : 'Low';
      newNotifications.push({
        id: `stock-${product.id}`,
        type: 'stock',
        title: `${severity}: ${product.name}`,
        description: product.stock === 0 ? 'Product is out of stock!' : `Only ${product.stock} items left in stock`,
        time: 'Inventory alert',
        read: readIds.has(`stock-${product.id}`),
      });
    });

    // Add recent orders
    recentOrders?.forEach(order => {
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = 'Just now';
      if (diffMins > 0 && diffMins < 60) {
        timeStr = `${diffMins} min ago`;
      } else if (diffHours > 0 && diffHours < 24) {
        timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffHours >= 24) {
        timeStr = `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
      }

      newNotifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'Order Received',
        description: `${order.order_number} - $${order.total?.toFixed(2)}`,
        time: timeStr,
        read: readIds.has(`order-${order.id}`),
      });
    });

    setNotifications(newNotifications);
  }, [lowStockProducts, recentOrders, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-primary" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-xl shadow-lg border border-border z-50 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'stock' ? 'bg-destructive/10' : 'bg-muted'
                        }`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            notification.type === 'stock' ? 'text-destructive' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
