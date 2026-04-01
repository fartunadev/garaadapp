import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Truck, Calendar, ArrowRight, Copy, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

interface OrderConfirmationState {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderConfirmationState | null>(null);

  useEffect(() => {
    if (location.state) {
      setOrderData(location.state as OrderConfirmationState);
    } else {
      // If no order data, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleCopyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
    }
  };

  // Generate tracking number (mock)
  const trackingNumber = orderData?.orderNumber 
    ? `TRK-${orderData.orderNumber.split('-')[1] || Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    : '';

  // Estimated delivery date (5-7 business days)
  const estimatedDelivery = {
    from: format(addDays(new Date(), 5), "MMM d, yyyy"),
    to: format(addDays(new Date(), 7), "MMM d, yyyy"),
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Number Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-primary">{orderData.orderNumber}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyOrderNumber}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-medium">{format(new Date(), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                  <p className="font-semibold text-foreground">{trackingNumber}</p>
                  <Badge variant="secondary" className="mt-2">Processing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                  <p className="font-semibold text-foreground">
                    {estimatedDelivery.from} - {estimatedDelivery.to}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">5-7 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items ({orderData.items.length})
            </h2>
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      {item.size && <span>• Size: {item.size}</span>}
                      {item.color && <span>• Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{orderData.shipping > 0 ? `$${orderData.shipping.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {orderData.shippingAddress && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p className="text-muted-foreground text-sm">
                  {orderData.shippingAddress}<br />
                  {orderData.shippingCity}, {orderData.shippingCountry}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <p className="text-muted-foreground text-sm">{orderData.paymentMethod}</p>
              <Badge variant="outline" className="mt-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                Payment Pending
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View All Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default OrderConfirmation;
