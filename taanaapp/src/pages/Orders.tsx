import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Download, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCustomerOrders, CustomerOrder } from "@/hooks/useCustomerOrders";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { OrderTrackingTimeline } from "@/components/OrderTrackingTimeline";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Package },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const OrderCard = ({ order }: { order: CustomerOrder }) => {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateInvoicePDF({
      orderNumber: order.order_number,
      orderDate: order.created_at,
      shippingAddress: order.shipping_address || undefined,
      shippingCity: order.shipping_city || undefined,
      shippingCountry: order.shipping_country || undefined,
      shippingPhone: order.shipping_phone || undefined,
      items: order.order_items,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total,
      paymentMethod: order.payment_method || undefined,
      paymentStatus: order.payment_status || undefined,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Order Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-foreground">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
            {/* Download Invoice Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownloadInvoice}
              title="Download Invoice"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {order.order_items.slice(0, 3).map((item) => (
              <div key={item.id} className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {order.order_items.length > 3 && (
              <span className="text-sm text-muted-foreground">+{order.order_items.length - 3} more</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Order Tracking Timeline */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Order Timeline</h4>
            </div>
            <OrderTrackingTimeline orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Tracking Number */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="text-xs text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-semibold text-foreground">
                TRK-{order.order_number.split('-')[1] || 'PENDING'}-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Order Items</h4>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    {item.size && <span>• Size: {item.size}</span>}
                    {item.color && <span>• Color: {item.color}</span>}
                  </div>
                </div>
                <span className="text-sm font-semibold">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Shipping Address</h4>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
              </p>
              {order.shipping_phone && (
                <p className="text-sm text-muted-foreground">Phone: {order.shipping_phone}</p>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-1 pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cost ? `$${order.shipping_cost.toFixed(2)}` : 'FREE'}</span>
            </div>
            {order.tax && order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span>{order.payment_method || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status</span>
            <Badge variant="outline" className={`${
              order.payment_status === 'completed' 
                ? 'bg-success/10 text-success border-success/20' 
                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
            }`}>
              {order.payment_status || 'Pending'}
            </Badge>
          </div>

          {/* Download Invoice Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDownloadInvoice}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const { data: orders, isLoading } = useCustomerOrders();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Sign in to view orders</h1>
            <p className="text-muted-foreground">
              Please sign in to see your order history
            </p>
            <Link to="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">No orders yet</h2>
            <p className="text-muted-foreground">Start shopping to see your orders here</p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Orders;
