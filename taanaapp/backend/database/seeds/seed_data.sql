-- =============================================
-- TanaCargo Seed Data
-- Run this after creating the schema
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Clear existing data (in correct order)
-- =============================================
DELETE FROM dbo.order_status_history;
DELETE FROM dbo.order_items;
DELETE FROM dbo.payments;
DELETE FROM dbo.payouts;
DELETE FROM dbo.orders;
DELETE FROM dbo.reviews;
DELETE FROM dbo.product_images;
DELETE FROM dbo.product_variants;
DELETE FROM dbo.products;
DELETE FROM dbo.subcategories;
DELETE FROM dbo.categories;
DELETE FROM dbo.messages;
DELETE FROM dbo.addresses;
DELETE FROM dbo.marketing_campaigns;
DELETE FROM dbo.settings;
DELETE FROM dbo.refresh_tokens;
DELETE FROM dbo.user_roles;
DELETE FROM dbo.sellers;
DELETE FROM dbo.profiles;
DELETE FROM dbo.users;
GO

-- =============================================
-- Insert Admin User
-- Password: Admin@123 (hashed with bcrypt)
-- =============================================
DECLARE @AdminUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @SellerUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @CustomerUserId UNIQUEIDENTIFIER = NEWID();

-- Admin password hash for 'Admin@123'
DECLARE @AdminPasswordHash NVARCHAR(255) = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4P.u1POyVBB.qgmS';
-- User password hash for 'User@123'
DECLARE @UserPasswordHash NVARCHAR(255) = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4P.u1POyVBB.qgmS';

-- Insert Users
INSERT INTO dbo.users (id, email, password_hash, email_verified, is_active)
VALUES
    (@AdminUserId, 'admin@tanacargo.com', @AdminPasswordHash, 1, 1),
    (@SellerUserId, 'seller@tanacargo.com', @UserPasswordHash, 1, 1),
    (@CustomerUserId, 'customer@tanacargo.com', @UserPasswordHash, 1, 1);

-- Insert Profiles
INSERT INTO dbo.profiles (user_id, full_name, phone, city, country)
VALUES
    (@AdminUserId, 'System Administrator', '+1234567890', 'New York', 'USA'),
    (@SellerUserId, 'Best Electronics Store', '+1987654321', 'Los Angeles', 'USA'),
    (@CustomerUserId, 'John Customer', '+1555666777', 'Chicago', 'USA');

-- Insert User Roles
INSERT INTO dbo.user_roles (user_id, role)
VALUES
    (@AdminUserId, 'admin'),
    (@SellerUserId, 'seller'),
    (@SellerUserId, 'user'),
    (@CustomerUserId, 'user');

-- =============================================
-- Insert Seller
-- =============================================
DECLARE @SellerId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.sellers (id, user_id, store_name, store_description, email, phone, city, country, is_verified, is_active)
VALUES
    (@SellerId, @SellerUserId, 'Best Electronics', 'Your one-stop shop for all electronics', 'seller@tanacargo.com', '+1987654321', 'Los Angeles', 'USA', 1, 1);

-- =============================================
-- Insert Categories
-- =============================================
DECLARE @ElectronicsId UNIQUEIDENTIFIER = NEWID();
DECLARE @ClothingId UNIQUEIDENTIFIER = NEWID();
DECLARE @HomeId UNIQUEIDENTIFIER = NEWID();
DECLARE @SportsId UNIQUEIDENTIFIER = NEWID();
DECLARE @BooksId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.categories (id, name, slug, image_url, sort_order)
VALUES
    (@ElectronicsId, 'Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 1),
    (@ClothingId, 'Clothing', 'clothing', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 2),
    (@HomeId, 'Home & Garden', 'home-garden', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400', 3),
    (@SportsId, 'Sports & Outdoors', 'sports-outdoors', 'https://images.unsplash.com/photo-1461896836934- voices?w=400', 4),
    (@BooksId, 'Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 5);

-- =============================================
-- Insert Subcategories
-- =============================================
DECLARE @PhonesId UNIQUEIDENTIFIER = NEWID();
DECLARE @LaptopsId UNIQUEIDENTIFIER = NEWID();
DECLARE @MensClothingId UNIQUEIDENTIFIER = NEWID();
DECLARE @WomensClothingId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.subcategories (id, category_id, name, slug, sort_order)
VALUES
    (@PhonesId, @ElectronicsId, 'Smartphones', 'smartphones', 1),
    (@LaptopsId, @ElectronicsId, 'Laptops', 'laptops', 2),
    (NEWID(), @ElectronicsId, 'Tablets', 'tablets', 3),
    (NEWID(), @ElectronicsId, 'Accessories', 'accessories', 4),
    (@MensClothingId, @ClothingId, 'Men''s Clothing', 'mens-clothing', 1),
    (@WomensClothingId, @ClothingId, 'Women''s Clothing', 'womens-clothing', 2),
    (NEWID(), @ClothingId, 'Kids'' Clothing', 'kids-clothing', 3),
    (NEWID(), @HomeId, 'Furniture', 'furniture', 1),
    (NEWID(), @HomeId, 'Kitchen', 'kitchen', 2),
    (NEWID(), @SportsId, 'Fitness', 'fitness', 1),
    (NEWID(), @SportsId, 'Outdoor', 'outdoor', 2);

-- =============================================
-- Insert Products
-- =============================================
DECLARE @Product1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Product2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Product3Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Product4Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Product5Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.products (id, seller_id, category_id, subcategory_id, name, slug, description, price, original_price, discount_percent, stock, image_url, colors, sizes, rating, reviews_count, is_flash_deal, is_trending)
VALUES
    (@Product1Id, @SellerId, @ElectronicsId, @PhonesId, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.', 1199.00, 1299.00, 8, 50, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', '["Natural Titanium","Blue Titanium","White Titanium","Black Titanium"]', '["128GB","256GB","512GB","1TB"]', 4.8, 125, 1, 1),
    (@Product2Id, @SellerId, @ElectronicsId, @LaptopsId, 'MacBook Pro 14"', 'macbook-pro-14', 'Supercharged by M3 Pro or M3 Max chip for unprecedented performance and battery life.', 1999.00, 2199.00, 9, 30, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', '["Space Black","Silver"]', '["512GB","1TB","2TB"]', 4.9, 89, 1, 1),
    (@Product3Id, @SellerId, @ClothingId, @MensClothingId, 'Classic Denim Jacket', 'classic-denim-jacket', 'Timeless denim jacket with modern fit. Perfect for layering in any season.', 89.99, 119.99, 25, 100, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', '["Blue","Black","Light Blue"]', '["S","M","L","XL","XXL"]', 4.5, 67, 0, 1),
    (@Product4Id, @SellerId, @ClothingId, @WomensClothingId, 'Summer Floral Dress', 'summer-floral-dress', 'Beautiful floral print dress perfect for summer occasions.', 59.99, 79.99, 25, 75, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', '["Red","Blue","Pink","Yellow"]', '["XS","S","M","L","XL"]', 4.6, 43, 1, 0),
    (@Product5Id, @SellerId, @ElectronicsId, @PhonesId, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'The ultimate Galaxy experience with AI-powered features and S Pen.', 1299.00, 1399.00, 7, 40, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', '["Titanium Black","Titanium Gray","Titanium Violet","Titanium Yellow"]', '["256GB","512GB","1TB"]', 4.7, 98, 0, 1);

-- Add more products
INSERT INTO dbo.products (seller_id, category_id, subcategory_id, name, slug, description, price, original_price, discount_percent, stock, image_url, rating, reviews_count, is_flash_deal, is_trending)
VALUES
    (@SellerId, @ElectronicsId, @LaptopsId, 'Dell XPS 15', 'dell-xps-15', 'Premium laptop with InfinityEdge display and powerful performance.', 1499.00, 1699.00, 12, 25, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 4.6, 54, 0, 1),
    (@SellerId, @HomeId, NULL, 'Modern Coffee Table', 'modern-coffee-table', 'Sleek minimalist coffee table for your living room.', 299.00, 399.00, 25, 20, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400', 4.4, 32, 1, 0),
    (@SellerId, @SportsId, NULL, 'Yoga Mat Premium', 'yoga-mat-premium', 'Extra thick eco-friendly yoga mat with carrying strap.', 49.99, 69.99, 29, 150, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 4.8, 87, 1, 1),
    (@SellerId, @BooksId, NULL, 'The Art of Programming', 'the-art-of-programming', 'Comprehensive guide to modern software development.', 39.99, NULL, 0, 200, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 4.9, 156, 0, 0);

-- =============================================
-- Insert Product Variants
-- =============================================
INSERT INTO dbo.product_variants (product_id, sku, size, color, price_modifier, stock)
VALUES
    (@Product1Id, 'IPH15PM-NT-128', '128GB', 'Natural Titanium', 0, 15),
    (@Product1Id, 'IPH15PM-NT-256', '256GB', 'Natural Titanium', 100, 12),
    (@Product1Id, 'IPH15PM-BT-256', '256GB', 'Blue Titanium', 100, 10),
    (@Product2Id, 'MBP14-SB-512', '512GB', 'Space Black', 0, 10),
    (@Product2Id, 'MBP14-SV-1TB', '1TB', 'Silver', 200, 8),
    (@Product3Id, 'DJ-BL-M', 'M', 'Blue', 0, 25),
    (@Product3Id, 'DJ-BL-L', 'L', 'Blue', 0, 30),
    (@Product3Id, 'DJ-BK-M', 'M', 'Black', 0, 20);

-- =============================================
-- Insert Sample Reviews
-- =============================================
INSERT INTO dbo.reviews (product_id, user_id, rating, title, comment, is_verified, is_approved)
VALUES
    (@Product1Id, @CustomerUserId, 5, 'Amazing phone!', 'Best iPhone I have ever owned. The camera is incredible!', 1, 1),
    (@Product1Id, @CustomerUserId, 4, 'Great but expensive', 'Excellent phone but wish it was a bit more affordable.', 0, 1),
    (@Product2Id, @CustomerUserId, 5, 'Perfect for work', 'This MacBook handles everything I throw at it. Battery life is amazing!', 1, 1),
    (@Product3Id, @CustomerUserId, 4, 'Classic style', 'Love the fit and quality. Runs a bit small though.', 1, 1);

-- =============================================
-- Insert Customer Address
-- =============================================
INSERT INTO dbo.addresses (user_id, full_name, phone, address_line1, city, state, postal_code, country, label, is_default)
VALUES
    (@CustomerUserId, 'John Customer', '+1555666777', '123 Main Street', 'Chicago', 'IL', '60601', 'USA', 'home', 1),
    (@CustomerUserId, 'John Customer', '+1555666777', '456 Office Park', 'Chicago', 'IL', '60602', 'USA', 'work', 0);

-- =============================================
-- Insert Settings
-- =============================================
INSERT INTO dbo.settings ([key], value, description)
VALUES
    ('site_name', '"Taana"', 'Website name'),
    ('site_description', '"Your one-stop e-commerce destination"', 'Website description'),
    ('currency', '"USD"', 'Default currency'),
    ('tax_rate', '0.08', 'Default tax rate (8%)'),
    ('shipping_free_threshold', '100', 'Free shipping for orders above this amount'),
    ('default_shipping_cost', '9.99', 'Default shipping cost'),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
    ('allow_guest_checkout', 'true', 'Allow checkout without account');

-- =============================================
-- Insert Marketing Campaign
-- =============================================
INSERT INTO dbo.marketing_campaigns (name, description, type, discount_code, discount_percent, start_date, end_date, status)
VALUES
    ('New Year Sale', 'Celebrate the new year with amazing discounts!', 'discount', 'NEWYEAR2024', 20, DATEADD(DAY, -5, GETUTCDATE()), DATEADD(DAY, 25, GETUTCDATE()), 'active'),
    ('Flash Friday', 'One day only flash sale!', 'flash_sale', 'FLASH50', 50, GETUTCDATE(), DATEADD(DAY, 1, GETUTCDATE()), 'active');

-- =============================================
-- Update Seller Stats
-- =============================================
EXEC sp_UpdateSellerStats @SellerId;

PRINT 'Seed data inserted successfully!';
PRINT 'Admin login: admin@tanacargo.com / Admin@123';
PRINT 'Seller login: seller@tanacargo.com / User@123';
PRINT 'Customer login: customer@tanacargo.com / User@123';
GO
