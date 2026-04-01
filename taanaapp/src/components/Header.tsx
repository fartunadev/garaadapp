import { useState } from "react";
import { ShoppingCart, Menu, User, Heart, Star, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { categoriesData } from "@/data/categories";
import SearchBar from "@/components/SearchBar";
import { useSettings } from "@/hooks/useSettings";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

const Header = () => {
  const { totalItems, cartAnimating } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useSettings();
  const { user, signOut, isAuthenticated } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      {/* Top Banner - Dynamic from settings */}
      {settings?.bannerEnabled !== false && (
        <div className="bg-gradient-to-r from-[#005f73] to-[#48cae4] text-primary-foreground py-2 text-center text-sm font-medium">
          🎉 {settings?.bannerText || "Free shipping on orders over $10 • 90-day returns • Price match guarantee"}
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between gap-2 md:gap-4 py-2 md:py-3">
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-1 md:gap-2">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#005f73] to-[#48cae4] text-base md:text-xl font-bold text-white shadow-md">
                {settings?.siteName?.charAt(0) || 'T'}
              </div>
              <span className="text-base md:text-xl font-bold text-[#0a9396]">{settings?.siteName || 'Taano'}</span>
            </Link>
          </div>

          <SearchBar className="hidden md:flex flex-1 max-w-2xl" />

          <div className="flex items-center gap-1 md:gap-2">
            {!roleLoading && isAdmin && (
              <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 md:h-10 md:w-10" onClick={() => navigate('/admin')} title="Admin Dashboard">
                <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
            <Link to="/account">
              <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 md:h-10 md:w-10"><User className="h-4 w-4 md:h-5 md:w-5" /></Button>
            </Link>
            {/* Settings removed from header - access via Account page */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {wishlistItems.length > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[9px] md:text-[10px] bg-primary">{wishlistItems.length}</Badge>}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className={`relative h-9 w-9 md:h-10 md:w-10 transition-transform ${cartAnimating ? 'scale-125' : ''}`}>
                <ShoppingCart className={`h-4 w-4 md:h-5 md:w-5 transition-all ${cartAnimating ? 'text-primary animate-bounce' : ''}`} />
                {totalItems > 0 && (
                  <Badge className={`absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[9px] md:text-[10px] bg-primary transition-transform ${cartAnimating ? 'scale-125 animate-pulse' : ''}`}>
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:hidden pb-2">
          <SearchBar className="w-full" isMobile />
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0 bg-background">
          <SheetHeader className="p-4 border-b"><SheetTitle className="text-left">Menu</SheetTitle></SheetHeader>
          <div className="overflow-y-auto h-full pb-20">
            <div className="p-4">
              <Link to="/reviews" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-4" onClick={() => setMobileMenuOpen(false)}>
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Customer Reviews</span>
              </Link>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Categories</h3>
              <div className="space-y-3">
                {categoriesData.map((cat) => (
                  <div key={cat.slug} className="space-y-2">
                    <Link to={`/category/${cat.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </Link>
                    <div className="pl-6 space-y-1">
                      {cat.subcategories.slice(0, 3).map((sub) => (
                        <Link key={sub.slug} to={`/category/${cat.slug}/${sub.slug}`} className="block text-xs text-muted-foreground hover:text-primary py-1" onClick={() => setMobileMenuOpen(false)}>{sub.name}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                {!roleLoading && isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-3" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                )}

                {/* logout available on Account page */}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
