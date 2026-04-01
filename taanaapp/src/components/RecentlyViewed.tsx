import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Clock } from "lucide-react";

const RecentlyViewed = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setProducts(recentlyViewed.slice(0, 8)); // Show max 8 items
    };

    loadRecentlyViewed();

    // Listen for storage changes
    window.addEventListener('storage', loadRecentlyViewed);
    
    // Custom event for same-tab updates
    const handleRecentlyViewedUpdate = () => loadRecentlyViewed();
    window.addEventListener('recentlyViewedUpdate', handleRecentlyViewedUpdate);

    return () => {
      window.removeEventListener('storage', loadRecentlyViewed);
      window.removeEventListener('recentlyViewedUpdate', handleRecentlyViewedUpdate);
    };
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">Recently Viewed</h2>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground font-medium">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Products Grid - Horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-1.5">
            {products.map((product) => (
              // <div key={product.id} className="w-36 md:w-auto flex-shrink-0">
              <div key={product.id} className="w-24 md:w-auto flex-shrink-0">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
