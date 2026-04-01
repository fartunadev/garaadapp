import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";

const Wishlist = () => {
  const { items, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
    });
  };

  const recommendedProducts = [
    {
      id: 13,
      title: "Smart LED Bulb",
      price: 12.99,
      originalPrice: 29.99,
      image: "https://images.unsplash.com/photo-1558089687-00c447a1322d?w=500",
      rating: 4.5,
      reviews: 234,
      badge: "hot" as const,
    },
    {
      id: 14,
      title: "Wireless Mouse",
      price: 15.99,
      originalPrice: 35.99,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      rating: 4.7,
      reviews: 567,
      badge: "sale" as const,
    },
    {
      id: 15,
      title: "USB Hub 7-Port",
      price: 19.99,
      originalPrice: 44.99,
      image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
      rating: 4.6,
      reviews: 189,
      badge: "new" as const,
    },
    {
      id: 16,
      title: "Phone Stand Holder",
      price: 8.99,
      originalPrice: 19.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
      rating: 4.4,
      reviews: 423,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-foreground">Wishlist</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">My Wishlist</h1>
                <p className="text-xs md:text-sm text-muted-foreground">{items.length} items saved</p>
              </div>
            </div>

            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Clear All</span>
              </Button>
            )}
          </div>

          {/* Wishlist Items */}
          {items.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                <Heart className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Save your favorite items to buy them later
              </p>
              <Link to="/">
                <Button size="lg">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 mb-8">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  rating={item.rating}
                  reviews={item.reviews}
                />
              ))}
            </div>
          )}

          {/* Recommended Products */}
          {items.length > 0 && (
            <div className="mt-8 md:mt-12">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">You might also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
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

export default Wishlist;
