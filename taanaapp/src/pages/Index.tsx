import { useState } from "react";
import Header from "@/components/Header";
import FlashDeals from "@/components/FlashDeals";
import Categories from "@/components/Categories";
import SubcategoryScroll from "@/components/SubcategoryScroll";
import AllProducts from "@/components/AllProducts";
import RecentlyViewed from "@/components/RecentlyViewed";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingCartAlert from "@/components/FloatingCartAlert";
import { Shield } from "lucide-react";
import BannerSlideshow from "@/components/BannerSlideshow";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main>
        {/* Why Choose Banner - Green Bar */}
    {/* Banner Slideshow */}
        <BannerSlideshow />

        {/* Categories */}
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <SubcategoryScroll selectedCategory={selectedCategory} />

        {/* Lightning Deals / Flash Deals */}
        <FlashDeals />

        {/* All Products Section */}
        <AllProducts selectedCategory={selectedCategory} />

        <RecentlyViewed />
      </main>
      <Footer />
      <BottomNav />

      {/* -style Floating Cart Alert */}
      <FloatingCartAlert />
    </div>
  );
};

export default Index;
