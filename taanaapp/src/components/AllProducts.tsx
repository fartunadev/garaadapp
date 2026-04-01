import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface AllProductsProps {
  selectedCategory: string | null;
}

const AllProducts = ({ selectedCategory }: AllProductsProps) => {
  const { data: products, isLoading } = useProducts();

  // Filter products by category if one is selected and hide out-of-stock products
  const filteredProducts = (selectedCategory && products
    ? products.filter(product => product.category?.slug === selectedCategory)
    : products)?.filter(product => product.stock > 0);

  // Map database products to display format
  const displayProducts = filteredProducts?.map(product => ({
    id: product.id,
    image: product.image_url || '/placeholder.svg',
    title: product.name,
    description: product.description || undefined,
     category: (product as any).subcategory_name || (product as any).category_name || product.category?.name,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    rating: product.rating ? Number(product.rating) : 4.5,
    reviews: product.reviews_count || 0,
    sold: 0,
    badge: product.is_flash_deal ? "sale" as const : product.is_trending ? "hot" as const : undefined,
    discount: product.discount_percent || undefined,
    stock: product.stock,
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
  })) || [];

  if (isLoading) {
    return (
      <section className="py-4 md:py-6 bg-background">
        <div className="container mx-auto px-2">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] rounded-lg" />
                <Skeleton className="h-3 mt-1 w-3/4" />
                <Skeleton className="h-3 mt-1 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <section className="py-4 md:py-6 bg-background">
        <div className="container mx-auto px-2">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
            {selectedCategory ? "No products in this category" : "All Products"}
          </h2>
          <p className="text-muted-foreground text-sm">No products found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-6 bg-background">
      <div className="container mx-auto px-2">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
          {selectedCategory ? `Products` : "All Products"}
        </h2>
        
        {/* Products Grid - Compact with more columns on mobile */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
