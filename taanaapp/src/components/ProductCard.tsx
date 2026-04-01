import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import ProductQuickView from "./ProductQuickView";
import { toast } from "sonner";

interface ProductCardProps {
  id?: number | string;
  image: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  sold?: number;
  badge?: "hot" | "new" | "sale";
  discount?: number;
  stock?: number;
  colors?: string[];
  sizes?: string[];
}

const ProductCard = ({
  id,
  image,
  title,
  description,
   category, 
  price,
  originalPrice,
  rating,
  reviews,
  sold,
  badge,
  discount,
  stock,
  colors,
  sizes,
}: ProductCardProps) => {
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = id ? isInWishlist(id) : false;
  const [showQuickView, setShowQuickView] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      toggleItem({
        id,
        title,
        image,
        price,
        originalPrice,
        rating,
        reviews,
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      setShowQuickView(true);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent adding out-of-stock items
    if (stock !== undefined && stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    
    if (id) {
      addItem({
        productId: id,
        title,
        image,
        price,
        originalPrice,
        quantity: 1,
        stock, // Pass stock to cart context
      });
      toast.success("Added to cart!");
    }
  };

  const handleProductClick = () => {
    if (id) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  
      const productData = { id, image, title, description, category, price, originalPrice, rating, reviews, sold, badge, discount, stock };
      const filtered = recentlyViewed.filter((p: any) => p.id !== id);
      const updated = [productData, ...filtered].slice(0, 20);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      window.dispatchEvent(new Event('recentlyViewedUpdate'));
    }
  };

  return (
    <>
      <Link to={id ? `/product/${id}` : "#"} onClick={handleProductClick}>
        <Card className="group relative overflow-hidden border hover:shadow-hover transition-all duration-300 bg-card h-full">
          {/* Image Section - Compact square */}
          {/* <div className="relative aspect-[4/5] overflow-hidden bg-muted"> */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          
            {/* Badges - Compact */}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5">
              {badge === "hot" && (
                <Badge className="bg-foreground text-white border-0 shadow-md text-[8px] px-1 py-0 font-bold">BLACK FRIDAY</Badge>
              )}
              {badge === "new" && (
                <Badge className="bg-badge-new text-white border-0 shadow-md text-[8px] px-1 py-0 font-bold">BEST-SELLING</Badge>
              )}
              {badge === "sale" && (
                <Badge className="bg-badge-sale text-white border-0 shadow-md text-[8px] px-1 py-0">💰 SALE</Badge>
              )}
              {discount && (
                <Badge className="bg-destructive text-white border-0 shadow-md font-bold text-[8px] px-1 py-0">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Stock Urgency Badge */}
            {stock !== undefined && stock <= 10 && stock > 0 && (
              <div className="absolute bottom-1 left-1">
                <Badge className="bg-destructive text-white border-0 shadow-md text-[8px] px-1 py-0 font-bold">
                  Only {stock} left
                </Badge>
              </div>
            )}
            {stock !== undefined && stock > 10 && stock <= 50 && (
              <div className="absolute bottom-1 left-1">
                <Badge className="bg-amber-500 text-white border-0 shadow-md text-[8px] px-1 py-0 font-bold">
                  Limited stock
                </Badge>
              </div>
            )}

            {/* Wishlist Button */}
            <Button
              size="icon"
              variant="secondary"
              onClick={handleWishlistClick}
              className={`absolute top-1 right-1 h-6 w-6 rounded-full transition-all shadow-md ${
                inWishlist 
                  ? 'opacity-100 bg-primary hover:bg-primary/90' 
                  : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
              }`}
            >
              <Heart 
                className={`h-3 w-3 ${inWishlist ? 'fill-white text-white' : ''}`} 
              />
            </Button>

            {/* Quick View Button - Desktop only */}
            <Button
              size="icon"
              variant="secondary"
              onClick={handleQuickView}
              className="absolute bottom-2 right-2 h-7 w-7 rounded-full transition-all shadow-md opacity-0 group-hover:opacity-100 hidden md:flex"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Content Section - Compact */}
          <div className="p-1.5 space-y-0.5">
            

  {/* Category */}
  {category && (
    <p className="text-[9px] text-primary font-medium truncate">{category}</p>
  )}

            {/* Title */}
            <h3 className="text-[10px] md:text-[11px] text-foreground line-clamp-1 font-medium leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Description - NEW */}
            {description && (
              <p className="text-[9px] text-muted-foreground line-clamp-1 leading-tight">
                {description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-1">
              <span className="text-xs md:text-sm font-bold text-primary">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-[8px] md:text-[9px] text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating - Compact */}
            <div className="flex items-center gap-0.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2 w-2 ${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[8px] text-muted-foreground">
                ({reviews})
              </span>
            </div>

            {/* Quick Add to Cart - Simple button (hidden if out of stock) */}
            {stock === undefined || stock > 0 ? (
              <div className="pt-0.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-6 text-[9px] gap-0.5"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-2.5 w-2.5" />
                  Add
                </Button>
              </div>
            ) : (
              <div className="pt-0.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-6 text-[9px] gap-0.5 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Out of Stock
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Link>

      {/* Quick View Modal */}
      {id && showQuickView && (
        <ProductQuickView
          open={showQuickView}
          onOpenChange={setShowQuickView}
          product={{
            id,
            image,
            title,
            description,
            price,
            originalPrice,
            rating,
            reviews,
            sold,
            badge,
            discount,
            colors,
            sizes,
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
