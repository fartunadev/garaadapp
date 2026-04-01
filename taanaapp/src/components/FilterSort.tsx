import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface FilterSortProps {
  onSortChange?: (sort: string) => void;
  onPriceChange?: (range: number[]) => void;
}

const FilterSort = ({ onSortChange, onPriceChange }: FilterSortProps) => {
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [filterOpen, setFilterOpen] = useState(false);

  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "best-selling", label: "Best Selling" },
    { value: "rating", label: "Top Rated" },
    { value: "newest", label: "Newest Arrivals" },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onPriceChange?.(value);
  };

  return (
    <div className="flex items-center gap-2 py-3 bg-background">
      {/* Sort Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="text-xs">Sort</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Sort By</SheetTitle>
          </SheetHeader>
          <RadioGroup value={sortBy} onValueChange={handleSortChange} className="mt-4 space-y-3">
            {sortOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </SheetContent>
      </Sheet>

      {/* Filter Button */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs">Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Price Range
              </Label>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">${priceRange[0]}</span>
                  <span className="text-muted-foreground">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button 
              className="w-full" 
              onClick={() => setFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FilterSort;
