import ProductCard from "./ProductCard";
import { useTrendingProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingProducts = () => {
  const { data: products, isLoading } = useTrendingProducts();

  // Static fallback data
  const staticProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      title: "Running Shoes - Lightweight, Breathable, Cushioned Sole",
      price: 34.99,
      originalPrice: 89.99,
      rating: 4.7,
      reviews: 3245,
      sold: 8934,
      badge: "sale" as const,
      discount: 61,
      stock: 5,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?w=500&q=80",
      title: "Ceramic Coffee Mug Set - Modern Design, Dishwasher Safe, Set of 4",
      price: 14.99,
      originalPrice: 34.99,
      rating: 4.8,
      reviews: 1823,
      sold: 5621,
      badge: "new" as const,
      discount: 57,
      stock: 28,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=500&q=80",
      title: "Desk Organizer Set - Bamboo, Eco-Friendly, 6-Piece Collection",
      price: 22.99,
      originalPrice: 49.99,
      rating: 4.6,
      reviews: 2156,
      sold: 6234,
      discount: 54,
      stock: 150,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
      title: "Yoga Mat - Non-Slip, Extra Thick, Eco-Friendly Material",
      price: 18.99,
      originalPrice: 44.99,
      rating: 4.9,
      reviews: 4532,
      sold: 12345,
      badge: "hot" as const,
      discount: 58,
      stock: 9,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
      title: "Wireless Keyboard & Mouse Combo - Silent Click, Long Battery Life",
      price: 28.99,
      originalPrice: 79.99,
      rating: 4.5,
      reviews: 2891,
      sold: 7456,
      discount: 64,
      stock: 42,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80",
      title: "Indoor Plant Pot Set - Ceramic, Drainage Holes, Modern Design",
      price: 16.99,
      originalPrice: 39.99,
      rating: 4.7,
      reviews: 1654,
      sold: 4321,
      badge: "new" as const,
      discount: 58,
      stock: 6,
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=500&q=80",
      title: "Stainless Steel Water Bottle - Insulated, 32oz, BPA-Free",
      price: 19.99,
      originalPrice: 44.99,
      rating: 4.8,
      reviews: 3789,
      sold: 9876,
      discount: 56,
      stock: 200,
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1591702127627-e3c4c4d4e0b5?w=500&q=80",
      title: "LED Desk Lamp - Adjustable, Touch Control, USB Charging Port",
      price: 26.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 2345,
      sold: 5678,
      badge: "sale" as const,
      discount: 55,
      stock: 1,
    },
  ];

  // Map database products to display format - hide out-of-stock products
  const displayProducts = products && products.length > 0
    ? products.filter(product => product.stock > 0).map(product => ({
        id: product.id,
        image: product.image_url || '/placeholder.svg',
        title: product.name,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        rating: product.rating ? Number(product.rating) : 4.5,
        reviews: product.reviews_count || 0,
        sold: 0,
        badge: product.discount_percent > 50 ? "sale" as const : undefined,
        discount: product.discount_percent || 0,
        stock: product.stock,
      }))
    : staticProducts.filter(p => p.stock > 0);

  if (isLoading) {
    return (
      <section className="py-6 md:py-8 bg-background">
        <div className="container mx-auto px-4">
          <Skeleton className="h-40 rounded-2xl mb-6" />
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4 md:gap-1.5">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 mt-2 w-3/4" />
                <Skeleton className="h-4 mt-1 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Trending Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(14_100%_57%)] p-8 mb-6 shadow-lg">
          <div className="relative z-10 text-center text-white">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-4xl md:text-5xl">🛒</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1">TRENDING</h2>
            <p className="text-3xl md:text-4xl font-black mb-2">NOW</p>
            <p className="text-sm md:text-base font-semibold tracking-wide">DON'T MISS OUT →</p>
          </div>
          <div className="absolute top-4 left-4 text-4xl opacity-30">🔥</div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-30">🔥</div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4 md:gap-1.5">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
