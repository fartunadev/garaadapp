import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "@/data/categories";

interface SubcategoryNavProps {
  category: Category;
}

const SubcategoryNav = ({ category }: SubcategoryNavProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const subcategories = category.subcategories;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-background border-b">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 lg:gap-4">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.slug}
              to={`/category/${category.slug}/${subcategory.slug}`}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <img
                  src={subcategory.image}
                  alt={subcategory.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] lg:text-xs text-center leading-tight text-foreground line-clamp-2 max-w-[80px]">
                {subcategory.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile: Scrollable with rows */}
        <div className="md:hidden relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="inline-grid grid-cols-4 gap-3 min-w-max">
              {subcategories.slice(0, 16).map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  to={`/category/${category.slug}/${subcategory.slug}`}
                  className="flex flex-col items-center gap-1.5 w-20"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-center leading-tight text-foreground line-clamp-2">
                    {subcategory.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Scroll indicators */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubcategoryNav;
