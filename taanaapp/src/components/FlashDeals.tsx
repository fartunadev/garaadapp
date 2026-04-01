import ProductCard from "./ProductCard";
import { useFlashDeals } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const FlashDeals = () => {
  const { data: products, isLoading } = useFlashDeals();

  // Static fallback data
  const staticDeals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      title: "Premium Wireless Headphones - Noise Cancelling, 40H Battery Life",
      price: 24.99,
      originalPrice: 89.99,
      rating: 4.8,
      reviews: 2456,
      sold: 12453,
      badge: "hot" as const,
      discount: 72,
      stock: 3,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      title: "Smart Watch Series 8 - Fitness Tracker, Heart Rate Monitor, GPS",
      price: 39.99,
      originalPrice: 149.99,
      rating: 4.7,
      reviews: 8932,
      sold: 25631,
      badge: "hot" as const,
      discount: 73,
      stock: 7,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
      title: "Unisex Designer Sunglasses - UV Protection, Polarized Lens",
      price: 12.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 3421,
      sold: 15234,
      badge: "hot" as const,
      discount: 78,
      stock: 35,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80",
      title: "Portable Bluetooth Speaker - Waterproof, 24H Playtime, Deep Bass",
      price: 18.99,
      originalPrice: 69.99,
      rating: 4.9,
      reviews: 5621,
      sold: 18765,
      badge: "hot" as const,
      discount: 73,
      stock: 2,
    },
  ];

  // Map database products to display format - hide out-of-stock products
  const displayDeals = products && products.length > 0
    ? products.filter(product => product.stock > 0).map(product => ({
        id: product.id,
        image: product.image_url || '/placeholder.svg',
        title: product.name,
        description: product.description || undefined,
         category: (product as any).subcategory_name || (product as any).category_name || undefined,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        rating: product.rating ? Number(product.rating) : 4.5,
        reviews: product.reviews_count || 0,
        sold: 0,
        badge: "hot" as const,
        discount: product.discount_percent || undefined,
        stock: product.stock,
      }))
    : staticDeals.filter(d => d.stock > 0);

  if (isLoading) {
    return (
      <section className="bg-background py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-xl md:text-2xl">⚡</div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">Lightning deals</h2>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-1 md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-28 md:w-auto flex-shrink-0">
                  <Skeleton className="aspect-[4/5] rounded-lg" />
                  <Skeleton className="h-3 mt-1 w-3/4" />
                  <Skeleton className="h-3 mt-1 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-xl md:text-2xl">⚡</div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Lightning deals</h2>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground font-medium">
            Limited time offer →
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 lg:grid-cols-6">
          {displayDeals.map((deal) => (
            <ProductCard key={deal.id} {...deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

 export default FlashDeals;
// import ProductCard from "./ProductCard";
// import { useFlashDeals } from "@/hooks/useProducts";
// import { Skeleton } from "@/components/ui/skeleton";



// // ✅ Define badge type
// type BadgeType = "hot" | "new" | "sale";

// const FlashDeals = () => {
//   const { data: products, isLoading } = useFlashDeals();

//   // ✅ Map API data safely
//   const displayDeals =
//     products?.length
//       ? products
//           .filter((product: any) => product.stock > 0)
//           .map((product: any) => {
//             const badge: BadgeType = "hot"; // you can make this dynamic later

//             return {
//               id: product.id,
//               image: product.image_url || "/placeholder.svg",
//               title: product.name,
//               description: product.description || "",
//               price: Number(product.price) || 0,
//               originalPrice: product.original_price
//                 ? Number(product.original_price)
//                 : undefined,
//               rating: product.rating ? Number(product.rating) : 4.5,
//               reviews: product.reviews_count || 0,
//               sold: 0,
//               badge,
//               discount: product.discount_percent || 0,
//               stock: product.stock,
//             };
//           })
//       : [];

//   // ✅ Loading state
//   if (isLoading) {
//     return (
//       <section className="bg-background py-4 md:py-6">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="text-xl md:text-2xl">⚡</div>
//             <h2 className="text-lg md:text-xl font-bold">
//               Lightning deals
//             </h2>
//           </div>

//           <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 lg:grid-cols-6">
//             {[...Array(6)].map((_, i) => (
//               <div key={i}>
//                 <Skeleton className="aspect-[4/5] rounded-lg" />
//                 <Skeleton className="h-3 mt-1 w-3/4" />
//                 <Skeleton className="h-3 mt-1 w-1/2" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-background py-4 md:py-6">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <div className="text-xl md:text-2xl">⚡</div>
//             <h2 className="text-lg md:text-xl font-bold">
//               Lightning deals
//             </h2>
//           </div>

//           <div className="text-xs md:text-sm text-muted-foreground font-medium">
//             Limited time offer →
//           </div>
//         </div>

//         {/* Content */}
//         {displayDeals.length > 0 ? (
//           <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 lg:grid-cols-6">
//             {displayDeals.map((deal) => (
//               <ProductCard key={deal.id} {...deal} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-10 text-muted-foreground">
//             No deals available
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default FlashDeals;