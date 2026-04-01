import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import FilterSort from "@/components/FilterSort";
import ProductCard from "@/components/ProductCard";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";

  // Mock products data - in real app, this would be filtered based on search query and category
  const products = [
    { id: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", title: "Premium Wireless Headphones", price: 89.99, originalPrice: 129.99, rating: 4.5, reviews: 234, sold: 1500, badge: "hot" as const },
    { id: 2, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300", title: "Classic Analog Watch", price: 159.99, originalPrice: 249.99, rating: 4.8, reviews: 189, sold: 890, badge: "sale" as const, discount: 36 },
    { id: 3, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300", title: "Designer Sunglasses", price: 79.99, rating: 4.3, reviews: 567, sold: 2100 },
    { id: 4, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300", title: "Leather Backpack", price: 119.99, originalPrice: 179.99, rating: 4.6, reviews: 423, sold: 1245, badge: "new" as const },
    { id: 5, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300", title: "Running Shoes", price: 129.99, rating: 4.7, reviews: 890, sold: 3200, badge: "hot" as const },
    { id: 6, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300", title: "Smart Watch Pro", price: 299.99, originalPrice: 399.99, rating: 4.9, reviews: 1234, sold: 4567, badge: "sale" as const, discount: 25 },
  ];

  const breadcrumbItems = [
    { label: "Search Results", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="container mx-auto px-3 md:px-4 py-4">
          {/* Search Header */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {query ? `Search results for "${query}"` : "Search Products"}
            </h1>
            {category !== "All" && (
              <p className="text-sm text-muted-foreground mt-1">
                in {category}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} products found
            </p>
          </div>

          <FilterSort />

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Search;
