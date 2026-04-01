import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: number | string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variant?: string;
  color?: string;
  size?: string;
  stock?: number; // Track available stock
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemStock: (productId: string | number, stock: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  cartAnimating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartAnimating, setCartAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 600);
  }, []);

  const addItem = (item: Omit<CartItem, "id">) => {
    // Check stock before adding
    if (item.stock !== undefined && item.stock <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = items.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.color === item.color &&
        i.size === item.size
    );

    if (existingItemIndex > -1) {
      const existingItem = items[existingItemIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      
      // Check if new quantity exceeds stock
      const availableStock = item.stock ?? existingItem.stock ?? Infinity;
      if (newQuantity > availableStock) {
        toast({
          title: "Stock limit reached",
          description: `Only ${availableStock} items available in stock`,
          variant: "destructive",
        });
        // Add only the remaining available quantity
        const remainingQuantity = availableStock - existingItem.quantity;
        if (remainingQuantity > 0) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity = availableStock;
          updatedItems[existingItemIndex].stock = availableStock;
          setItems(updatedItems);
        }
        return;
      }

      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].stock = item.stock ?? existingItem.stock;
      setItems(updatedItems);
      toast({
        title: "Updated cart",
        description: `${item.title} quantity updated`,
      });
    } else {
      const newItem = {
        ...item,
        id: `${item.productId}-${item.color}-${item.size}-${Date.now()}`,
      };
      setItems([...items, newItem]);
      toast({
        title: "Added to cart",
        description: `${item.title} has been added to your cart`,
      });
    }
    triggerAnimation();
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    const item = items.find((i) => i.id === id);
    if (item && item.stock !== undefined && quantity > item.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateItemStock = (productId: string | number, stock: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, stock } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItemStock,
        clearCart,
        totalItems,
        subtotal,
        cartAnimating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
