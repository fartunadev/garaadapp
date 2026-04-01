import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      {/* Compact Newsletter Section */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-foreground">Get Exclusive Deals</h3>
              <p className="text-xs text-muted-foreground">Subscribe for new products and offers</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto max-w-sm">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-9 bg-background text-sm"
              />
              <Button variant="cta" size="sm" className="px-4">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Main Footer */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Social */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(14_100%_57%)] text-sm font-bold text-white shadow-sm">
                T
              </div>
              <span className="text-sm font-bold text-primary">TanaShop</span>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="rounded-full h-7 w-7">
                <Facebook className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-7 w-7">
                <Twitter className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-7 w-7">
                <Instagram className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-7 w-7">
                <Youtube className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Help</a>
            <a href="#" className="hover:text-primary transition-colors">Returns</a>
            <a href="#" className="hover:text-primary transition-colors">Shipping</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">We accept:</span>
            <div className="flex gap-1">
              <div className="h-5 w-8 rounded bg-muted flex items-center justify-center text-[8px] font-semibold">
                VISA
              </div>
              <div className="h-5 w-8 rounded bg-muted flex items-center justify-center text-[8px] font-semibold">
                MC
              </div>
              <div className="h-5 w-8 rounded bg-muted flex items-center justify-center text-[8px] font-semibold">
                AMEX
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-2">
          <p className="text-[10px] text-muted-foreground text-center">
            © 2024 TanaShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
