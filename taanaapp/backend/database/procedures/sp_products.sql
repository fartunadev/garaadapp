-- =============================================
-- Products Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Create Product
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateProduct
    @SellerId UNIQUEIDENTIFIER = NULL,
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @SubcategoryId UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Price DECIMAL(18, 2),
    @OriginalPrice DECIMAL(18, 2) = NULL,
    @DiscountPercent DECIMAL(5, 2) = 0,
    @Stock INT = 0,
    @SKU NVARCHAR(100) = NULL,
    @ImageUrl NVARCHAR(500) = NULL,
    @Colors NVARCHAR(500) = NULL,
    @Sizes NVARCHAR(500) = NULL,
    @IsFlashDeal BIT = 0,
    @IsTrending BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @ProductId UNIQUEIDENTIFIER = NEWID();
        DECLARE @Slug NVARCHAR(255);

        -- Generate slug from name
        SET @Slug = LOWER(REPLACE(REPLACE(REPLACE(@Name, ' ', '-'), '''', ''), '.', ''));
        SET @Slug = @Slug + '-' + LEFT(CAST(@ProductId AS NVARCHAR(36)), 8);

        INSERT INTO dbo.products (
            id, seller_id, category_id, subcategory_id, name, slug, description,
            price, original_price, discount_percent, stock, sku, image_url,
            colors, sizes, is_flash_deal, is_trending
        )
        VALUES (
            @ProductId, @SellerId, @CategoryId, @SubcategoryId, @Name, @Slug, @Description,
            @Price, @OriginalPrice, @DiscountPercent, @Stock, @SKU, @ImageUrl,
            @Colors, @Sizes, @IsFlashDeal, @IsTrending
        );

        -- Update seller product count
        IF @SellerId IS NOT NULL
        BEGIN
            UPDATE dbo.sellers
            SET total_products = total_products + 1
            WHERE id = @SellerId;
        END

        -- Return created product
        EXEC sp_GetProductById @ProductId;

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- =============================================
-- Get Product By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetProductById
    @ProductId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        sc.name AS subcategory_name,
        sc.slug AS subcategory_slug,
        s.store_name AS seller_name,
        s.logo_url AS seller_logo
    FROM dbo.products p
    LEFT JOIN dbo.categories c ON p.category_id = c.id
    LEFT JOIN dbo.subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN dbo.sellers s ON p.seller_id = s.id
    WHERE p.id = @ProductId;

    -- Get product images
    SELECT * FROM dbo.product_images
    WHERE product_id = @ProductId
    ORDER BY sort_order;

    -- Get product variants
    SELECT * FROM dbo.product_variants
    WHERE product_id = @ProductId;
END
GO

-- =============================================
-- Get Product By Slug
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetProductBySlug
    @Slug NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId UNIQUEIDENTIFIER;
    SELECT @ProductId = id FROM dbo.products WHERE slug = @Slug;

    IF @ProductId IS NOT NULL
        EXEC sp_GetProductById @ProductId;
END
GO

-- =============================================
-- Get Products with Pagination
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetProducts
    @Page INT = 1,
    @Limit INT = 10,
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @SubcategoryId UNIQUEIDENTIFIER = NULL,
    @SellerId UNIQUEIDENTIFIER = NULL,
    @Search NVARCHAR(255) = NULL,
    @MinPrice DECIMAL(18, 2) = NULL,
    @MaxPrice DECIMAL(18, 2) = NULL,
    @IsFlashDeal BIT = NULL,
    @IsTrending BIT = NULL,
    @SortBy NVARCHAR(50) = 'created_at',
    @SortOrder NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    -- Get total count
    SELECT @TotalCount = COUNT(*)
    FROM dbo.products p
    WHERE p.is_active = 1
      AND (@CategoryId IS NULL OR p.category_id = @CategoryId)
      AND (@SubcategoryId IS NULL OR p.subcategory_id = @SubcategoryId)
      AND (@SellerId IS NULL OR p.seller_id = @SellerId)
      AND (@Search IS NULL OR p.name LIKE '%' + @Search + '%' OR p.description LIKE '%' + @Search + '%')
      AND (@MinPrice IS NULL OR p.price >= @MinPrice)
      AND (@MaxPrice IS NULL OR p.price <= @MaxPrice)
      AND (@IsFlashDeal IS NULL OR p.is_flash_deal = @IsFlashDeal)
      AND (@IsTrending IS NULL OR p.is_trending = @IsTrending);

    -- Get paginated results
    SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        sc.name AS subcategory_name,
        s.store_name AS seller_name
    FROM dbo.products p
    LEFT JOIN dbo.categories c ON p.category_id = c.id
    LEFT JOIN dbo.subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN dbo.sellers s ON p.seller_id = s.id
    WHERE p.is_active = 1
      AND (@CategoryId IS NULL OR p.category_id = @CategoryId)
      AND (@SubcategoryId IS NULL OR p.subcategory_id = @SubcategoryId)
      AND (@SellerId IS NULL OR p.seller_id = @SellerId)
      AND (@Search IS NULL OR p.name LIKE '%' + @Search + '%' OR p.description LIKE '%' + @Search + '%')
      AND (@MinPrice IS NULL OR p.price >= @MinPrice)
      AND (@MaxPrice IS NULL OR p.price <= @MaxPrice)
      AND (@IsFlashDeal IS NULL OR p.is_flash_deal = @IsFlashDeal)
      AND (@IsTrending IS NULL OR p.is_trending = @IsTrending)
    ORDER BY
        CASE WHEN @SortBy = 'price' AND @SortOrder = 'ASC' THEN p.price END ASC,
        CASE WHEN @SortBy = 'price' AND @SortOrder = 'DESC' THEN p.price END DESC,
        CASE WHEN @SortBy = 'name' AND @SortOrder = 'ASC' THEN p.name END ASC,
        CASE WHEN @SortBy = 'name' AND @SortOrder = 'DESC' THEN p.name END DESC,
        CASE WHEN @SortBy = 'rating' AND @SortOrder = 'DESC' THEN p.rating END DESC,
        CASE WHEN @SortBy = 'created_at' AND @SortOrder = 'DESC' THEN p.created_at END DESC,
        p.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO

-- =============================================
-- Update Product
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @ProductId UNIQUEIDENTIFIER,
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @SubcategoryId UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Price DECIMAL(18, 2) = NULL,
    @OriginalPrice DECIMAL(18, 2) = NULL,
    @DiscountPercent DECIMAL(5, 2) = NULL,
    @Stock INT = NULL,
    @SKU NVARCHAR(100) = NULL,
    @ImageUrl NVARCHAR(500) = NULL,
    @Colors NVARCHAR(500) = NULL,
    @Sizes NVARCHAR(500) = NULL,
    @IsFlashDeal BIT = NULL,
    @IsTrending BIT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.products
    SET
        category_id = COALESCE(@CategoryId, category_id),
        subcategory_id = COALESCE(@SubcategoryId, subcategory_id),
        name = COALESCE(@Name, name),
        description = COALESCE(@Description, description),
        price = COALESCE(@Price, price),
        original_price = COALESCE(@OriginalPrice, original_price),
        discount_percent = COALESCE(@DiscountPercent, discount_percent),
        stock = COALESCE(@Stock, stock),
        sku = COALESCE(@SKU, sku),
        image_url = COALESCE(@ImageUrl, image_url),
        colors = COALESCE(@Colors, colors),
        sizes = COALESCE(@Sizes, sizes),
        is_flash_deal = COALESCE(@IsFlashDeal, is_flash_deal),
        is_trending = COALESCE(@IsTrending, is_trending),
        is_active = COALESCE(@IsActive, is_active)
    WHERE id = @ProductId;

    EXEC sp_GetProductById @ProductId;
END
GO

-- =============================================
-- Delete Product (Soft Delete)
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteProduct
    @ProductId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SellerId UNIQUEIDENTIFIER;
    SELECT @SellerId = seller_id FROM dbo.products WHERE id = @ProductId;

    UPDATE dbo.products
    SET is_active = 0
    WHERE id = @ProductId;

    -- Update seller product count
    IF @SellerId IS NOT NULL
    BEGIN
        UPDATE dbo.sellers
        SET total_products = total_products - 1
        WHERE id = @SellerId AND total_products > 0;
    END

    SELECT @@ROWCOUNT AS affected_rows;
END
GO

-- =============================================
-- Update Product Stock
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateProductStock
    @ProductId UNIQUEIDENTIFIER,
    @Quantity INT,
    @Operation NVARCHAR(10) = 'decrease' -- 'increase' or 'decrease'
AS
BEGIN
    SET NOCOUNT ON;

    IF @Operation = 'decrease'
    BEGIN
        UPDATE dbo.products
        SET stock = CASE WHEN stock - @Quantity < 0 THEN 0 ELSE stock - @Quantity END
        WHERE id = @ProductId;
    END
    ELSE
    BEGIN
        UPDATE dbo.products
        SET stock = stock + @Quantity
        WHERE id = @ProductId;
    END

    SELECT stock FROM dbo.products WHERE id = @ProductId;
END
GO

-- =============================================
-- Get Flash Deal Products
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetFlashDeals
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Limit)
        p.*,
        c.name AS category_name,
        s.store_name AS seller_name
    FROM dbo.products p
    LEFT JOIN dbo.categories c ON p.category_id = c.id
    LEFT JOIN dbo.sellers s ON p.seller_id = s.id
    WHERE p.is_active = 1 AND p.is_flash_deal = 1
    ORDER BY p.discount_percent DESC, p.created_at DESC;
END
GO

-- =============================================
-- Get Trending Products
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetTrendingProducts
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Limit)
        p.*,
        c.name AS category_name,
        s.store_name AS seller_name
    FROM dbo.products p
    LEFT JOIN dbo.categories c ON p.category_id = c.id
    LEFT JOIN dbo.sellers s ON p.seller_id = s.id
    WHERE p.is_active = 1 AND p.is_trending = 1
    ORDER BY p.rating DESC, p.reviews_count DESC, p.created_at DESC;
END
GO

-- =============================================
-- Add Product Image
-- =============================================
CREATE OR ALTER PROCEDURE sp_AddProductImage
    @ProductId UNIQUEIDENTIFIER,
    @ImageUrl NVARCHAR(500),
    @SortOrder INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.product_images (product_id, image_url, sort_order)
    VALUES (@ProductId, @ImageUrl, @SortOrder);

    SELECT * FROM dbo.product_images WHERE product_id = @ProductId ORDER BY sort_order;
END
GO

-- =============================================
-- Delete Product Image
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteProductImage
    @ImageId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.product_images WHERE id = @ImageId;
    SELECT @@ROWCOUNT AS affected_rows;
END
GO

-- =============================================
-- Create Product Variant
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateProductVariant
    @ProductId UNIQUEIDENTIFIER,
    @SKU NVARCHAR(100) = NULL,
    @Size NVARCHAR(50) = NULL,
    @Color NVARCHAR(50) = NULL,
    @PriceModifier DECIMAL(18, 2) = 0,
    @Stock INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.product_variants (product_id, sku, size, color, price_modifier, stock)
    VALUES (@ProductId, @SKU, @Size, @Color, @PriceModifier, @Stock);

    SELECT * FROM dbo.product_variants WHERE product_id = @ProductId;
END
GO

-- =============================================
-- Update Product Variant
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateProductVariant
    @VariantId UNIQUEIDENTIFIER,
    @SKU NVARCHAR(100) = NULL,
    @Size NVARCHAR(50) = NULL,
    @Color NVARCHAR(50) = NULL,
    @PriceModifier DECIMAL(18, 2) = NULL,
    @Stock INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.product_variants
    SET
        sku = COALESCE(@SKU, sku),
        size = COALESCE(@Size, size),
        color = COALESCE(@Color, color),
        price_modifier = COALESCE(@PriceModifier, price_modifier),
        stock = COALESCE(@Stock, stock)
    WHERE id = @VariantId;

    SELECT * FROM dbo.product_variants WHERE id = @VariantId;
END
GO

-- =============================================
-- Delete Product Variant
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteProductVariant
    @VariantId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.product_variants WHERE id = @VariantId;
    SELECT @@ROWCOUNT AS affected_rows;
END
GO

-- =============================================
-- Update Product Rating
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateProductRating
    @ProductId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AvgRating DECIMAL(3, 2);
    DECLARE @ReviewsCount INT;

    SELECT
        @AvgRating = AVG(CAST(rating AS DECIMAL(3, 2))),
        @ReviewsCount = COUNT(*)
    FROM dbo.reviews
    WHERE product_id = @ProductId AND is_approved = 1;

    UPDATE dbo.products
    SET
        rating = @AvgRating,
        reviews_count = @ReviewsCount
    WHERE id = @ProductId;
END
GO

PRINT 'Products Stored Procedures Created Successfully!';
GO
