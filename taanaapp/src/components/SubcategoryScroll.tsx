import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubcategoriesByCategorySlug } from "@/hooks/useCategories";
import { categoriesData } from "@/data/categories";
import { Skeleton } from "@/components/ui/skeleton";

interface SubcategoryScrollProps {
  selectedCategory: string | null;
}

const SubcategoryScroll = ({ selectedCategory }: SubcategoryScrollProps) => {
  // Don't render if no category is selected (showing all products)
  if (!selectedCategory) {
    return null;
  }
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: subcategories, isLoading } = useSubcategoriesByCategorySlug(selectedCategory);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({ left: newScrollPosition, behavior: "smooth" });
    }
  };

  // Use database subcategories if available, otherwise fall back to static data
  const currentCategory = categoriesData.find(cat => cat.slug === selectedCategory);
  const staticSubcategories = currentCategory?.subcategories || [];
  
  const displaySubcategories = subcategories && subcategories.length > 0
    ? subcategories.map(sub => ({
        name: sub.name,
        slug: sub.slug,
        image: sub.image_url || '/placeholder.svg'
      }))
    : staticSubcategories;

  if (isLoading) {
    return (
      <section className="bg-background py-3 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displaySubcategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-3 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative group">
          {/* Scroll Left Button - Hidden on mobile */}
          <Button
            variant="secondary"
            size="icon"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Subcategories Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          >
            {displaySubcategories.map((subcategory, index) => (
              <Link
                key={`${subcategory.slug}-${index}`}
                to={`/category/${selectedCategory}/${subcategory.slug}`}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group/item"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-border group-hover/item:border-primary transition-colors">
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] md:text-xs text-center text-muted-foreground max-w-[80px] line-clamp-2 leading-tight group-hover/item:text-foreground transition-colors">
                  {subcategory.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Scroll Right Button - Hidden on mobile */}
          <Button
            variant="secondary"
            size="icon"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SubcategoryScroll;
