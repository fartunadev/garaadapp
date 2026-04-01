import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdvancedFilters = () => {
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({
    category: "Category",
    material: "Material",
    color: "Color",
    size: "Size",
    sheer: "Sheer",
    season: "Season",
  });

  const filterOptions = {
    category: ["All Categories", "Women's Clothing", "Electronics", "Home & Kitchen", "Fashion", "Beauty", "Sports"],
    material: ["Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Leather", "Synthetic"],
    color: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Gray", "Brown"],
    size: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    sheer: ["Non-Sheer", "Semi-Sheer", "Sheer"],
    season: ["Spring", "Summer", "Fall", "Winter", "All Season"],
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  return (
    <div className="bg-background border-b sticky top-[120px] md:top-[140px] z-40">
      <div className="container mx-auto px-3 md:px-4">
        {/* Desktop: Horizontal scrollable filters */}
        <div className="hidden md:flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
          {Object.entries(filterOptions).map(([key, options]) => (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0 h-8 text-xs"
                >
                  {activeFilters[key]}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto bg-popover">
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleFilterChange(key, option)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Mobile: Horizontal scrollable filters */}
        <div className="md:hidden flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
          {Object.entries(filterOptions).map(([key, options]) => (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0 h-7 text-[10px] px-2"
                >
                  {activeFilters[key]}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[250px] overflow-y-auto bg-popover">
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleFilterChange(key, option)}
                    className="text-xs"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
