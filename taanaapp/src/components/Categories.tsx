import { useCategories } from "@/hooks/useCategories";
import { categoriesData } from "@/data/categories";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const Categories = ({ selectedCategory, onSelectCategory }: CategoriesProps) => {
  const { data: categories, isLoading } = useCategories();

  // Use database categories if available, otherwise fall back to static data
  const displayCategories = categories && categories.length > 0 
    ? categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        image: cat.image_url || '/placeholder.svg'
      }))
    : categoriesData.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        image: cat.image
      }));

  // Add "All" as the first category
  const allCategories = [
    { name: "All", slug: null as string | null, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80" },
    ...displayCategories
  ];

  if (isLoading) {
    return (
      <section className="py-3 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1.5 bg-background border-b border-border">
      <div className="container mx-auto px-3">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {allCategories.map((category) => (
            <button
              key={category.slug || 'all'}
              onClick={() => onSelectCategory(category.slug)}
              className="flex flex-col items-center gap-0.5 flex-shrink-0 group"
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                selectedCategory === category.slug
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border group-hover:border-primary'
              }`}>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className={`text-[10px] md:text-xs font-medium whitespace-nowrap ${
                selectedCategory === category.slug ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
