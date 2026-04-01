import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useShippingZone } from "@/hooks/useShippingZone";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import CheckoutForm from "@/components/CheckoutForm";
import { Database } from "@/integrations/supabase/client";

const Cart = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, updateQuantity, removeItem, updateItemStock } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { zone, detectedCountry, isDetecting, calculateShipping, applyPriceMultiplier } = useShippingZone();

  // Fetch and update stock for all cart items
  useEffect(() => {
    const fetchStockForItems = async () => {
      if (items.length === 0) return;

      const productIds = [...new Set(items.map((item) => String(item.productId)))];
      
      const { data: products } = await Database
        .from("products")
        .select("id, stock")
        .in("id", productIds);

      if (products) {
        products.forEach((product) => {
          updateItemStock(product.id, product.stock);
        });
      }
    };

    fetchStockForItems();
  }, [items.length]);

  const recommendedProducts = [
    {
      id: 4,
      title: "USB-C Cable 3pack",
      price: 9.99,
      originalPrice: 24.99,
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500",
      rating: 4.6,
      reviews: 423,
      badge: "hot" as const,
    },
    {
      id: 5,
      title: "Phone Stand Holder",
      price: 7.99,
      originalPrice: 19.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
      rating: 4.4,
      reviews: 234,
      badge: "sale" as const,
    },
    {
      id: 6,
      title: "Wireless Charger Pad",
      price: 14.99,
      originalPrice: 39.99,
      image: "https://images.unsplash.com/photo-1591290619762-c588f0736eb0?w=500",
      rating: 4.7,
      reviews: 567,
      badge: "new" as const,
    },
    {
      id: 7,
      title: "Screen Protector 2pack",
      price: 5.99,
      originalPrice: 14.99,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
      rating: 4.5,
      reviews: 189,
      badge: "hot" as const,
    },
  ];

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = applyPriceMultiplier(rawSubtotal);
  const savings = items.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  );
  const shipping = zone ? calculateShipping(1 * items.reduce((s, i) => s + i.quantity, 0)) : (subtotal > 10 ? 0 : 3.99);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    setShowCheckout(true);
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number, stock?: number) => {
    if (stock !== undefined && currentQuantity >= stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${stock} items available`,
        variant: "destructive",
      });
      return;
    }
    updateQuantity(itemId, currentQuantity + 1);
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              <Link to="/cart" className="hover:text-primary">Cart</Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-foreground">Checkout</span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-8">Checkout</h1>
            <CheckoutForm
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onBack={() => setShowCheckout(false)}
            />
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-foreground">Shopping Cart</span>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-8">Shopping Cart ({items.length} items)</h1>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <p className="text-sm md:text-base text-muted-foreground mb-4">Your cart is empty</p>
                  <Link to="/">
                    <Button>Continue Shopping</Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 md:gap-4 p-3 md:p-4 bg-card rounded-lg border border-border shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1 text-sm md:text-base line-clamp-2">{item.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {item.color && item.size ? `${item.color}, ${item.size}` : item.variant}
                          </p>
                          {item.stock !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.stock > 0 ? `${item.stock} available` : 'Out of stock'}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base md:text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                          {item.originalPrice && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {/* Quantity Controls - Pill Style */}
                        <div className="flex items-center bg-muted rounded-full border border-border overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleIncreaseQuantity(item.id, item.quantity, item.stock)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  {/* Location Detection */}
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    {isDetecting ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Detecting location...
                      </div>
                    ) : zone ? (
                      <div className="text-sm">
                        <span className="font-medium">{zone.country_name}</span>
                        <span className="text-muted-foreground"> • {zone.zone_name}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Est. {zone.estimated_days_min}-{zone.estimated_days_max} days from China
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Location not detected</span>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {zone && zone.price_multiplier > 1 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Regional adjustment ({((zone.price_multiplier - 1) * 100).toFixed(0)}%)</span>
                        <span>included</span>
                      </div>
                    )}
                    <div className="flex justify-between text-success">
                      <span>Savings</span>
                      <span className="font-medium">-${savings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping to {zone?.country_name || 'your location'}</span>
                      <span className="font-medium">${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Button 
                    variant="cta" 
                    size="lg" 
                    className="w-full mb-3"
                    onClick={handleProceedToCheckout}
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Security Badges */}
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm font-medium">🔒 Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Cart;
