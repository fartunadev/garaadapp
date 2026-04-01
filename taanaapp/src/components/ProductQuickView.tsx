import { useState } from "react";
import { ShoppingCart, Heart, Star, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductQuickViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: number | string;
    image: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    sold?: number;
    badge?: "hot" | "new" | "sale";
    discount?: number;
    colors?: string[];
    sizes?: string[];
  };
}

const ProductQuickView = ({ open, onOpenChange, product }: ProductQuickViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const isMobile = useIsMobile();

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variant: `${selectedColor} / ${selectedSize}`,
    });
    toast.success(`${quantity} item(s) added to cart!`);
    onOpenChange(false);
  };

  const handleWishlist = () => {
    toggleItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews,
    });
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const productContent = (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
      {/* Product Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge === "hot" && (
            <Badge className="bg-badge-hot text-white border-0 shadow-md text-xs">
              BLACK FRIDAY
            </Badge>
          )}
          {product.badge === "new" && (
            <Badge className="bg-badge-new text-white border-0 shadow-md text-xs">
              BEST-SELLING ITEM
            </Badge>
          )}
          {product.badge === "sale" && (
            <Badge className="bg-badge-sale text-white border-0 shadow-md text-xs">
              💰 SALE
            </Badge>
          )}
          {product.discount && (
            <Badge className="bg-destructive text-white border-0 shadow-md font-bold text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground leading-tight mb-2">
            {product.title}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">
              ({product.reviews.toLocaleString()})
            </span>
            {product.sold && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {product.sold.toLocaleString()} sold
                </span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 py-2 border-y">
          <span className="text-2xl md:text-3xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="text-xs text-success font-semibold">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </>
          )}
        </div>

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div>
            <p className="text-xs md:text-sm font-medium mb-2">Size:</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-2 transition-all ${
                    selectedSize === size
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {colors.length > 0 && (
          <div>
            <p className="text-xs md:text-sm font-medium mb-2">Color:</p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-2 transition-all ${
                    selectedColor === color
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <span className="px-3 md:px-4 text-xs md:text-sm font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 h-10 md:h-11 text-sm md:text-base"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            variant={inWishlist ? "default" : "outline"}
            size="icon"
            className="h-10 w-10 md:h-11 md:w-11"
            onClick={handleWishlist}
          >
            <Heart
              className={`h-4 w-4 md:h-5 md:w-5 ${inWishlist ? "fill-white" : ""}`}
            />
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-around text-center pt-3 border-t text-[10px] md:text-xs">
          <div>
            <div className="font-semibold text-success mb-0.5">✓</div>
            <div className="text-muted-foreground">Free Shipping</div>
          </div>
          <div>
            <div className="font-semibold text-success mb-0.5">✓</div>
            <div className="text-muted-foreground">90-Day Returns</div>
          </div>
          <div>
            <div className="font-semibold text-success mb-0.5">✓</div>
            <div className="text-muted-foreground">Secure Payment</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{product.title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {productContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>
        {productContent}
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
