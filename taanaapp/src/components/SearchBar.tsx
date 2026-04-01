import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
}

const SearchBar = ({ className, isMobile = false }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-0 rounded-lg overflow-hidden">
        {/* Search Input */}
        <div className="flex-1 relative bg-background border border-r-0 border-border rounded-l-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(searchQuery);
              }
            }}
            placeholder="Search for products..."
            className={`${isMobile ? 'h-9 text-sm' : 'h-10 md:h-11'} pl-10 pr-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground`}
          />
        </div>

        {/* Search Button - Full primary color */}
        <Button
          onClick={() => handleSearch(searchQuery)}
          size={isMobile ? "sm" : "default"}
          className={`rounded-none rounded-r-lg ${isMobile ? 'h-9' : 'h-10 md:h-11'} px-4 md:px-6 bg-primary hover:bg-primary/90 text-primary-foreground`}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
