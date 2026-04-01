import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Loader2, ArrowLeft, Check, Smartphone, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAddresses } from "@/hooks/useAddresses";
import { useToast } from "@/hooks/use-toast";
import { useShippingZone } from "@/hooks/useShippingZone";

interface CheckoutFormProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onBack: () => void;
}

// Somalia Mobile Money & International Payment Methods
const paymentMethods = [
  { id: "sahal", name: "Sahal", icon: "📱", category: "somalia", description: "Sahal Mobile Money" },
  { id: "evc_plus", name: "EVC Plus", icon: "📱", category: "somalia", description: "Hormuud Telecom" },
  { id: "waafi", name: "Waafi", icon: "📱", category: "somalia", description: "Hormuud Telecom" },
  { id: "zaad", name: "Zaad", icon: "📱", category: "somalia", description: "Telesom" },
  { id: "stripe", name: "Card Payment", icon: "💳", category: "international", description: "Visa, Mastercard, etc." },
  { id: "paypal", name: "PayPal", icon: "🅿️", category: "international", description: "PayPal account" },
  { id: "cod", name: "Cash on Delivery", icon: "💵", category: "other", description: "Pay when delivered" },
];

const CheckoutForm = ({ subtotal, shipping, tax, total, onBack }: CheckoutFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  const { items, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { data: savedAddresses } = useAddresses();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { zone } = useShippingZone();

  // Auto-select default address
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [savedAddresses, selectedAddressId]);

  const selectedAddress = savedAddresses?.find(a => a.id === selectedAddressId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAddress) {
      toast({
        title: "No address selected",
        description: "Please select a shipping address or add one in your account settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        items,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: selectedAddress.address_line1 + (selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ""),
        shippingCity: selectedAddress.city,
        shippingCountry: selectedAddress.country,
        shippingPhone: selectedAddress.phone || "",
        paymentMethod: paymentMethods.find(p => p.id === paymentMethod)?.name || "Cash on Delivery",
        notes,
      });

      // Navigate to order confirmation with order details
      navigate("/order-confirmation", {
        state: {
          orderNumber: order.order_number,
          items: items.map(item => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            color: item.color,
            size: item.size,
          })),
          subtotal,
          shipping,
          tax,
          total,
          paymentMethod: paymentMethods.find(p => p.id === paymentMethod)?.name || "Cash on Delivery",
          shippingAddress: selectedAddress.address_line1,
          shippingCity: selectedAddress.city,
          shippingCountry: selectedAddress.country,
        },
      });

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const somaliaPayments = paymentMethods.filter(p => p.category === "somalia");
  const internationalPayments = paymentMethods.filter(p => p.category === "international");
  const otherPayments = paymentMethods.filter(p => p.category === "other");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      {/* Shipping Address Selection */}
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Shipping Address</h2>
        </div>

        {savedAddresses && savedAddresses.length > 0 ? (
          <div className="grid gap-3">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{address.label}</span>
                      {address.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{address.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-muted-foreground mt-1">📞 {address.phone}</p>
                    )}
                  </div>
                  {selectedAddressId === address.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No saved addresses found.</p>
            <p className="text-sm mt-2">Your shipping address from signup will be used.</p>
          </div>
        )}

        {/* Order Notes */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="notes">Order Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions for delivery..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Payment Method</h2>
        </div>

        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          {/* Somalia Mobile Money */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Mobile Money (Somalia)</h3>
            </div>
            <div className="grid gap-2">
              {somaliaPayments.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <span className="font-medium">{method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* International Payments */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">International Payments</h3>
            </div>
            <div className="grid gap-2">
              {internationalPayments.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <span className="font-medium">{method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Other Payments */}
          <div>
            <div className="grid gap-2">
              {otherPayments.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <span className="font-medium">{method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Order Summary */}
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        {zone && (
          <div className="flex items-center gap-2 mb-4 p-2 rounded bg-muted/50 text-sm">
            <MapPin className="h-3 w-3 text-primary" />
            <span>Shipping to <strong>{zone.country_name}</strong> • Est. {zone.estimated_days_min}-{zone.estimated_days_max} days</span>
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping to {zone?.country_name || 'destination'}</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>

        <Button 
          type="submit"
          variant="cta" 
          size="lg" 
          className="w-full"
          disabled={createOrder.isPending || !selectedAddress}
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            `Place Order • $${total.toFixed(2)}`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          🔒 Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  );
};

export default CheckoutForm;
