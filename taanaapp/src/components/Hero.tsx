import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp } from "lucide-react";
import ProductCard from "./ProductCard";

const Hero = () => {
  const featuredProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      title: "Premium Wireless Headphones - Noise Cancelling",
      price: 24.99,
      originalPrice: 89.99,
      rating: 4.8,
      reviews: 2456,
      sold: 12453,
      badge: "hot" as const,
      discount: 72,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      title: "Smart Watch Series 8 - Fitness Tracker",
      price: 39.99,
      originalPrice: 149.99,
      rating: 4.7,
      reviews: 8932,
      sold: 25631,
      badge: "sale" as const,
      discount: 73,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
      title: "Designer Sunglasses - UV Protection",
      price: 12.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 3421,
      sold: 15234,
      badge: "new" as const,
      discount: 78,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80",
      title: "Bluetooth Speaker - Waterproof, 24H",
      price: 18.99,
      originalPrice: 69.99,
      rating: 4.9,
      reviews: 5621,
      sold: 18765,
      badge: "hot" as const,
      discount: 73,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80",
      title: "Running Shoes - Comfortable & Stylish",
      price: 34.99,
      originalPrice: 99.99,
      rating: 4.5,
      reviews: 4123,
      sold: 9876,
      badge: "sale" as const,
      discount: 65,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=500&q=80",
      title: "Mechanical Keyboard RGB - Gaming",
      price: 45.99,
      originalPrice: 129.99,
      rating: 4.8,
      reviews: 7654,
      sold: 11234,
      badge: "hot" as const,
      discount: 65,
    },
  ];

  return (
    <section className="bg-[#005f73]-to-b from-[#005f73] to-background">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Top Banner */}
        <div className="mb-6 md:mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#005f73]/10 text-[#48cae4] text-xs md:text-sm font-medium">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            Limited Time Offer - Up to 80% OFF
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Shop Smart, <span className="text-[#005f73]">Save More</span>
          </h1>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Discover incredible deals on millions of products at unbeatable prices.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="cta" size="lg" className="gap-2 text-sm">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-sm">
              View All Deals
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8 mt-6 md:mt-8 border-t">
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">10M+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Products</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">500K+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Daily Deals</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">50M+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
