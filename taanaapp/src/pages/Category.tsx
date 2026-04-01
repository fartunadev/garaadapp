import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { categoriesData } from "@/data/categories";
import SubcategoryNav from "@/components/SubcategoryNav";
import { useProducts } from "@/hooks/useProducts";
import { useCategories, useSubcategoriesByCategorySlug } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Category = () => {
  const { category, subcategory } = useParams();
  
  // Fetch data from database
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategoriesByCategorySlug(category || "");
  const { data: products, isLoading } = useProducts();
  
  // Find current category from database
  const currentCategory = categories?.find(cat => cat.slug === category);
  const currentSubcategory = subcategories?.find(sub => sub.slug === subcategory);
  
  // Fallback to static data if DB category not found
  const staticCategory = categoriesData.find(cat => cat.slug === category);

  // Filter products based on category and subcategory
  const filteredProducts = products?.filter(product => {
    // Hide out-of-stock products from customers
    if (product.stock <= 0) return false;
    
    // If subcategory is selected, filter by subcategory
    if (subcategory && currentSubcategory) {
      return product.subcategory_id === currentSubcategory.id;
    }
    
    // If only category is selected, filter by category
    if (category && currentCategory) {
      return product.category_id === currentCategory.id;
    }
    
    return true;
  }) || [];

  const formatCategoryName = (name?: string) => {
    return name ? decodeURIComponent(name).replace(/-/g, " ") : "";
  };

  const breadcrumbItems = [
    { label: formatCategoryName(category), href: `/category/${category}` },
  ];

  if (subcategory) {
    breadcrumbItems.push({ label: formatCategoryName(subcategory), href: "#" });
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Show SubcategoryNav only when category is selected */}
        {category && staticCategory && (
          <SubcategoryNav category={staticCategory} />
        )}
        
        <div className="container mx-auto px-3 md:px-4 py-4">
          {/* Category Header */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {formatCategoryName(subcategory || category)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-4">
          {filteredProducts.map((product) => {
                // Get the best available image
                const productImage = product.product_images?.[0]?.image_url || product.image_url || "/placeholder.svg";
                
                return (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    image={productImage}
                    title={product.name}
                    description={product.description || ""}
                    price={product.price}
                    originalPrice={product.original_price || undefined}
                    rating={product.rating || 0}
                    reviews={product.reviews_count || 0}
                    stock={product.stock}
                    discount={product.discount_percent || undefined}
                    badge={product.is_flash_deal ? "hot" : product.is_trending ? "new" : undefined}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 mt-4">
              <p className="text-muted-foreground">No products found in this category</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Category;
