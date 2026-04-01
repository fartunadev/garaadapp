export interface Subcategory {
  name: string;
  image: string;
  slug: string;
}

export interface Category {
  name: string;
  image: string;
  slug: string;
  subcategories: Subcategory[];
}

export const categoriesData: Category[] = [
  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80",
    subcategories: [
      { name: "Women's Two Piece Sets", slug: "two-piece-sets", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&q=80" },
      { name: "Women's Traditional & Cultural Wear", slug: "traditional-wear", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80" },
      { name: "Women's T-Shirt", slug: "t-shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80" },
      { name: "Women's Sweaters", slug: "sweaters", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&q=80" },
      { name: "Women's Dresses", slug: "dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80" },
      { name: "Women's Coats & Jackets", slug: "coats-jackets", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&q=80" },
      { name: "Women's Sweatshirts", slug: "sweatshirts", image: "https://images.unsplash.com/photo-1578342976795-062a1b744f37?w=200&q=80" },
      { name: "Women's Pants", slug: "pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&q=80" },
      { name: "Women's Jeans", slug: "jeans", image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=200&q=80" },
      { name: "Women's Blouses & Shirts", slug: "blouses-shirts", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&q=80" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80",
    subcategories: [
      { name: "Smartphones", slug: "smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" },
      { name: "Laptops", slug: "laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80" },
      { name: "Headphones", slug: "headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
      { name: "Smart Watches", slug: "smart-watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" },
      { name: "Cameras", slug: "cameras", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80" },
      { name: "Speakers", slug: "speakers", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&q=80" },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&q=80",
    subcategories: [
      { name: "Furniture", slug: "furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&q=80" },
      { name: "Bedding", slug: "bedding", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80" },
      { name: "Home Decor", slug: "home-decor", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80" },
      { name: "Cookware", slug: "cookware", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&q=80" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=200&q=80" },
      { name: "Women's Shoes", slug: "womens-shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&q=80" },
      { name: "Men's Shoes", slug: "mens-shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" },
      { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&q=80" },
      { name: "Bags & Luggage", slug: "bags-luggage", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80" },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
    subcategories: [
      { name: "Skincare", slug: "skincare", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80" },
      { name: "Makeup", slug: "makeup", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80" },
      { name: "Hair Care", slug: "hair-care", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80" },
      { name: "Fragrances", slug: "fragrances", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=80",
    subcategories: [
      { name: "Gym Equipment", slug: "gym-equipment", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80" },
      { name: "Sportswear", slug: "sportswear", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80" },
      { name: "Outdoor Gear", slug: "outdoor-gear", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&q=80" },
      { name: "Yoga & Fitness", slug: "yoga-fitness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80" },
    ],
  },
];
