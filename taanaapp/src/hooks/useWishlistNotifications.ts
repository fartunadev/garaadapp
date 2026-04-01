import { useEffect, useRef } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from '@/hooks/use-toast';

export const useWishlistNotifications = () => {
  const { items: wishlistItems } = useWishlist();
  const { data: products } = useProducts();
  const previousPricesRef = useRef<Map<string | number, { price: number; stock: number }>>(new Map());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!products || wishlistItems.length === 0) return;

    // Skip notifications on initial load
    if (initialLoadRef.current) {
      // Store initial prices/stock
      wishlistItems.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          previousPricesRef.current.set(item.id, { 
            price: product.price, 
            stock: product.stock 
          });
        }
      });
      initialLoadRef.current = false;
      return;
    }

    wishlistItems.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;

      const previous = previousPricesRef.current.get(item.id);
      
      if (previous) {
        // Check for price drop (sale)
        if (product.price < previous.price) {
          const discount = Math.round(((previous.price - product.price) / previous.price) * 100);
          toast({
            title: '🎉 Wishlist Item on Sale!',
            description: `${product.name} is now ${discount}% off! Was $${previous.price.toFixed(2)}, now $${product.price.toFixed(2)}`,
          });
        }

        // Check for back in stock
        if (previous.stock === 0 && product.stock > 0) {
          toast({
            title: '📦 Back in Stock!',
            description: `${product.name} from your wishlist is back in stock!`,
          });
        }
      }

      // Update stored values
      previousPricesRef.current.set(item.id, { 
        price: product.price, 
        stock: product.stock 
      });
    });
  }, [products, wishlistItems]);
};
