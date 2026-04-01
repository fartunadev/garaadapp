import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "@/hooks/use-toast";

export interface WishlistItem {
  id: number | string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number | string) => void;
  isInWishlist: (id: number | string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const { data: products } = useProducts();
  const previousPricesRef = useRef<Map<string | number, { price: number; stock: number }>>(new Map());
  const initialLoadRef = useRef(true);

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  // Wishlist notifications for sales and back in stock
  useEffect(() => {
    if (!products || items.length === 0) return;

    if (initialLoadRef.current) {
      items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          previousPricesRef.current.set(item.id, { price: product.price, stock: product.stock });
        }
      });
      initialLoadRef.current = false;
      return;
    }

    items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;

      const previous = previousPricesRef.current.get(item.id);
      
      if (previous) {
        if (product.price < previous.price) {
          const discount = Math.round(((previous.price - product.price) / previous.price) * 100);
          toast({
            title: '🎉 Wishlist Item on Sale!',
            description: `${product.name} is now ${discount}% off!`,
          });
        }

        if (previous.stock === 0 && product.stock > 0) {
          toast({
            title: '📦 Back in Stock!',
            description: `${product.name} is back in stock!`,
          });
        }
      }

      previousPricesRef.current.set(item.id, { price: product.price, stock: product.stock });
    });
  }, [products, items]);

  const addItem = (item: WishlistItem) => {
    if (!items.find(i => i.id === item.id)) {
      setItems([...items, item]);
      toast({
        title: "Added to wishlist",
        description: `${item.title} has been added to your wishlist`,
      });
    }
  };

  const removeItem = (id: number | string) => {
    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const isInWishlist = (id: number | string) => {
    return items.some(item => item.id === id);
  };

  const toggleItem = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const clearWishlist = () => {
    setItems([]);
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
