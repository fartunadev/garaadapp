import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useProduct(id || "");
  const { data: allProducts } = useProducts();
  const { data: reviews } = useProductReviews(id || "");

  // Get related products - prioritize same subcategory, then category, then fill with others
  const relatedProducts = (() => {
    if (!allProducts || !product) return [];
    const inStock = allProducts.filter(p => p.id !== product.id && p.stock > 0);
    
    // Priority 1: Same subcategory
    const sameSubcat = product.subcategory_id 
      ? inStock.filter(p => p.subcategory_id === product.subcategory_id) 
      : [];
    
    // Priority 2: Same category but different subcategory
    const sameCat = inStock.filter(p => 
      p.category_id === product.category_id && 
      !sameSubcat.some(s => s.id === p.id)
    );
    
    // Priority 3: Other products to fill remaining slots
    const others = inStock.filter(p => 
      p.category_id !== product.category_id
    );
    
    return [...sameSubcat, ...sameCat, ...others].slice(0, 12);
  })();

  // Set default color and size when product loads
  useEffect(() => {
    if (product) {
      if (product.colors?.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product, selectedColor, selectedSize]);

  // Track product view in localStorage
  useEffect(() => {
    if (product) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const productData = {
        id: product.id,
        image: product.image_url,
        title: product.name,
        price: product.price,
        originalPrice: product.original_price,
        rating: product.rating,
        reviews: product.reviews_count,
      };
      
      const filtered = recentlyViewed.filter((p: any) => p.id !== product.id);
      const updated = [productData, ...filtered].slice(0, 20);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      window.dispatchEvent(new Event('recentlyViewedUpdate'));
    }
  }, [product]);

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Build image gallery from product_images and main image
  const images: string[] = [];
  if (product?.image_url) {
    images.push(product.image_url);
  }
  if (product?.product_images?.length) {
    const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
    sortedImages.forEach((img) => {
      if (!images.includes(img.image_url)) {
        images.push(img.image_url);
      }
    });
  }
  // Fallback if no images
  if (images.length === 0) {
    images.push("/placeholder.svg");
  }

  const colors = product?.colors?.length ? product.colors : ["Red", "Blue", "Black", "White"];
  const sizes = product?.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL"];

  const handleAddToCart = () => {
    if (!product) return;
    
    // Prevent adding out-of-stock items
    if (product.stock <= 0) {
      return;
    }
    
    addItem({
      productId: product.id,
      title: product.name,
      image: product.image_url || "/placeholder.svg",
      price: product.price,
      originalPrice: product.original_price || undefined,
      quantity,
      color: selectedColor,
      size: selectedSize,
      variant: `${selectedColor}, ${selectedSize}`,
      stock: product.stock,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleItem({
      id: product.id,
      title: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image_url || "/placeholder.svg",
      rating: product.rating || 0,
      reviews: product.reviews_count || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/")}>Go back to home</Button>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const discountPercent = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1">
        {/* Product Section */}
        <div className="container mx-auto px-3 py-4">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Image Gallery */}
            <div className="space-y-2">
              {/* Main Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-1.5">
                  {images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Title and rating - below images */}
              <h1 className="text-base font-semibold pt-1">{product.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating || 0) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
                <span>{product.rating?.toFixed(1) || '0'} ({reviews?.length || 0})</span>
                <span>• {product.stock} in stock</span>
              </div>
            </div>

            {/* Product Info - Compact */}
            <div className="space-y-2">
              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-xs text-muted-foreground line-through">
                      ${product.original_price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      -{discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Color Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Color:</label>
                <div className="flex flex-wrap gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2 py-1 rounded border text-[11px] transition-all ${
                        selectedColor === color
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Size:</label>
                <div className="flex flex-wrap gap-1">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-7 h-7 px-2 rounded border text-[11px] transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-xs font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{product.stock} available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {product.stock > 0 ? (
                  <Button variant="cta" className="flex-1 h-9 text-sm" onClick={handleAddToCart}>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Add to Cart
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1 h-9 text-sm opacity-50 cursor-not-allowed" disabled>
                    Out of Stock
                  </Button>
                )}
                <Button 
                  variant={inWishlist ? "default" : "outline"} 
                  onClick={handleWishlistToggle}
                  className="h-9 w-9 p-0"
                >
                  <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-medium">Free Shipping</span>
                  <span className="text-[8px] text-muted-foreground">On orders $10+</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-medium">Secure Payment</span>
                  <span className="text-[8px] text-muted-foreground">100% protected</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-medium">90-Day Returns</span>
                  <span className="text-[8px] text-muted-foreground">Easy returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-6 border border-border rounded-2xl overflow-hidden bg-card">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-muted/50">
                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">
                  Description
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">
                  Reviews ({reviews?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">
                  Shipping
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-5 space-y-4">
                {product.description ? (
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No description available for this product.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'High-quality materials and craftsmanship',
                    'Designed for comfort and durability',
                    'Perfect for everyday use',
                    'Easy to care and maintain',
                    'Satisfaction guaranteed',
                    'Environmentally friendly packaging',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
                {/* Product Specs */}
                <div className="border border-border rounded-xl overflow-hidden mt-2">
                  <div className="bg-muted px-4 py-2 border-b border-border">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product Details</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: 'SKU', value: String(product.id).slice(0, 8).toUpperCase() },
                      { label: 'Stock', value: `${product.stock} units` },
                      { label: 'Rating', value: `${product.rating?.toFixed(1) || '0'} / 5.0` },
                      ...(product.colors?.length ? [{ label: 'Available Colors', value: product.colors.join(', ') }] : []),
                      ...(product.sizes?.length ? [{ label: 'Available Sizes', value: product.sizes.join(', ') }] : []),
                    ].map((row, i) => (
                      <div key={i} className="flex items-center px-4 py-2.5">
                        <span className="text-xs font-medium text-muted-foreground w-36 flex-shrink-0">{row.label}</span>
                        <span className="text-xs text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6 space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.profile?.full_name || 'Anonymous'}</span>
                            {review.is_verified && (
                              <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </TabsContent>
              <TabsContent value="shipping" className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl"><Truck className="h-5 w-5 text-primary" /></div>
                    <h4 className="font-semibold text-sm">Free Shipping</h4>
                    <p className="text-xs text-muted-foreground">Free on orders $10+. Delivered in 7–14 business days.</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl"><Shield className="h-5 w-5 text-primary" /></div>
                    <h4 className="font-semibold text-sm">Secure Payment</h4>
                    <p className="text-xs text-muted-foreground">100% protected. All transactions are encrypted and safe.</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl"><RotateCcw className="h-5 w-5 text-primary" /></div>
                    <h4 className="font-semibold text-sm">90-Day Returns</h4>
                    <p className="text-xs text-muted-foreground">Easy returns. Full refund within 90 days, no questions asked.</p>
                  </div>
                </div>
                <div className="border border-border rounded-xl overflow-hidden mt-2">
                  <div className="bg-muted px-4 py-2 border-b border-border">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shipping Information</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: 'Standard Shipping', value: 'Free on orders $10+ (7–14 days)' },
                      { label: 'Express Shipping', value: '$4.99 (2–4 business days)' },
                      { label: 'Return Policy', value: '90 days from delivery date' },
                      { label: 'Payment Security', value: 'SSL encrypted, 100% protected' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center px-4 py-2.5">
                        <span className="text-xs font-medium text-muted-foreground w-40 flex-shrink-0">{row.label}</span>
                        <span className="text-xs text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {product.category?.name ? `More in ${product.category.name}` : "You May Also Like"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{relatedProducts.length} related products</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relatedProducts.map((relProduct) => (
                  <ProductCard
                    key={relProduct.id}
                    id={relProduct.id}
                    title={relProduct.name}
                    price={relProduct.price}
                    originalPrice={relProduct.original_price || undefined}
                    image={relProduct.image_url || "/placeholder.svg"}
                    rating={relProduct.rating || 0}
                    reviews={relProduct.reviews_count || 0}
                    badge={relProduct.is_flash_deal ? "sale" : relProduct.is_trending ? "hot" : undefined}
                    stock={relProduct.stock}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProductDetail;
