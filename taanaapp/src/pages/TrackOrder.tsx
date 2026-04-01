import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { OrderTrackingTimeline } from "@/components/OrderTrackingTimeline";
import { Package, Search, MapPin, CreditCard, Truck } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['track-order', searchedOrderNumber],
    queryFn: async () => {
      if (!searchedOrderNumber) return null;
      
      try {
        const res = await api.get('/orders', { params: { search: searchedOrderNumber } });
        const orders = res.data?.data || res.data || [];
        const found = orders.find((o: any) => o.order_number === searchedOrderNumber);
        return found || null;
      } catch {
        return null;
      }
    },
    enabled: !!searchedOrderNumber,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedOrderNumber(orderNumber.trim());
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-3 md:px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order number to see the delivery status</p>
          </div>

          {/* Search Form */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter order number (e.g., ORD-ABC123)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!orderNumber.trim() || isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="space-y-3 mt-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 w-24 bg-muted rounded" />
                          <div className="h-3 w-32 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && searchedOrderNumber && (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center">
                <p className="text-destructive">Something went wrong. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {/* No Order Found */}
          {!isLoading && !error && searchedOrderNumber && !order && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground">
                  We couldn't find an order with number "{searchedOrderNumber}".
                  Please check the order number and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-4">
              {/* Order Header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    <Badge className={statusColors[order.status] || "bg-muted"}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardHeader>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Tracking Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTrackingTimeline orderId={order.id} currentStatus={order.status} />
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Items ({order.order_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.shipping_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_city}, {order.shipping_country}
                    </p>
                    {order.shipping_phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone: {order.shipping_phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${order.shipping_cost.toFixed(2)}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="capitalize">{order.payment_method || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status</span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {order.payment_status || "pending"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default TrackOrder;
