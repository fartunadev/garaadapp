import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
        <ol className="flex items-center gap-1 md:gap-2 text-xs md:text-sm overflow-x-auto scrollbar-hide">
          <li className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {item.href ? (
                <>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-none"
                  >
                    {item.label}
                  </Link>
                  {index < items.length - 1 && (
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  )}
                </>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[100px] md:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
