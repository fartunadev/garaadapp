USE [Taano]
GO
/****** Object:  StoredProcedure [dbo].[sp_AddOrderItem]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Add Order Item
-- =============================================
CREATE PROCEDURE [dbo].[sp_AddOrderItem]
    @OrderId int,
    @ProductId int,
    @VariantId int = NULL,
    @ProductName NVARCHAR(255),
    @ProductImage NVARCHAR(500) = NULL,
    @Price DECIMAL(18, 2),
    @Quantity INT,
    @Size NVARCHAR(50) = NULL,
    @Color NVARCHAR(50) = NULL,
    @Total DECIMAL(18, 2)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.order_items (
        order_id, product_id, variant_id, product_name, product_image,
        price, quantity, size, color, total
    )
    VALUES (
        @OrderId, @ProductId, @VariantId, @ProductName, @ProductImage,
        @Price, @Quantity, @Size, @Color, @Total
    );

    SELECT SCOPE_IDENTITY() AS item_id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_AddProductImage]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Add Product Image
-- =============================================
CREATE PROCEDURE [dbo].[sp_AddProductImage]
    @ProductId int,
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
/****** Object:  StoredProcedure [dbo].[sp_AddUserRole]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Add User Role
-- =============================================
CREATE PROCEDURE [dbo].[sp_AddUserRole]
    @UserId int,
    @Role NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.user_roles WHERE user_id = @UserId AND role = @Role)
    BEGIN
        INSERT INTO dbo.user_roles (user_id, role)
        VALUES (@UserId, @Role);
    END

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_ApproveReview]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Approve Review (Admin)
-- =============================================
CREATE PROCEDURE [dbo].[sp_ApproveReview]
    @ReviewId int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId int;
    SELECT @ProductId = product_id FROM dbo.reviews WHERE id = @ReviewId;

    UPDATE dbo.reviews
    SET is_approved = 1
    WHERE id = @ReviewId;

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    SELECT * FROM dbo.reviews WHERE id = @ReviewId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_ApproveSeller]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_ApproveSeller]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.sellers
    SET is_active = 1
    WHERE id = @SellerId;

    EXEC sp_GetSellerById @SellerId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CancelOrder]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Cancel Order
-- =============================================
CREATE PROCEDURE [dbo].[sp_CancelOrder]
    @OrderId int,
    @UserId int,
    @Reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Verify ownership and status
        DECLARE @CurrentStatus NVARCHAR(20);
        DECLARE @OrderUserId int;

        SELECT @CurrentStatus = status, @OrderUserId = user_id
        FROM dbo.orders
        WHERE id = @OrderId;

        IF @OrderUserId <> @UserId
        BEGIN
            RAISERROR('Access denied', 16, 1);
            RETURN;
        END

        IF @CurrentStatus NOT IN ('pending', 'confirmed')
        BEGIN
            RAISERROR('Order cannot be cancelled', 16, 1);
            RETURN;
        END

        -- Update order status
        UPDATE dbo.orders
        SET status = 'cancelled'
        WHERE id = @OrderId;

        -- Add status history
        INSERT INTO dbo.order_status_history (order_id, status, notes, created_by)
        VALUES (@OrderId, 'cancelled', @Reason, @UserId);

        -- Restore product stock
        DECLARE @ProductId int, @Quantity INT;
        DECLARE item_cursor CURSOR FOR
            SELECT product_id, quantity FROM dbo.order_items WHERE order_id = @OrderId;

        OPEN item_cursor;
        FETCH NEXT FROM item_cursor INTO @ProductId, @Quantity;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @ProductId IS NOT NULL
            BEGIN
                UPDATE dbo.products
                SET stock = stock + @Quantity
                WHERE id = @ProductId;
            END
            FETCH NEXT FROM item_cursor INTO @ProductId, @Quantity;
        END

        CLOSE item_cursor;
        DEALLOCATE item_cursor;

        COMMIT TRANSACTION;

        SELECT 'Order cancelled successfully' AS message;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CanUserReviewProduct]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Check If User Can Review Product
-- =============================================
CREATE PROCEDURE [dbo].[sp_CanUserReviewProduct]
    @ProductId int,
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AlreadyReviewed BIT = 0;
    DECLARE @HasPurchased BIT = 0;

    IF EXISTS (SELECT 1 FROM dbo.reviews WHERE product_id = @ProductId AND user_id = @UserId)
        SET @AlreadyReviewed = 1;

    IF EXISTS (
        SELECT 1
        FROM dbo.order_items oi
        INNER JOIN dbo.orders o ON oi.order_id = o.id
        WHERE oi.product_id = @ProductId
          AND o.user_id = @UserId
          AND o.status = 'delivered'
    )
        SET @HasPurchased = 1;

    SELECT
        CASE WHEN @AlreadyReviewed = 0 THEN 1 ELSE 0 END AS can_review,
        @AlreadyReviewed AS already_reviewed,
        @HasPurchased AS has_purchased;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateCategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_CreateCategory]
    @Name NVARCHAR(100),
    @Slug NVARCHAR(100),
    @ImageUrl NVARCHAR(500) = NULL,
    @SortOrder INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if slug already exists
    IF EXISTS (SELECT 1 FROM dbo.categories WHERE slug = @Slug)
    BEGIN
        RAISERROR('Category slug already exists', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.categories (name, slug, image_url, sort_order)
    VALUES (@Name, @Slug, @ImageUrl, @SortOrder);

    SELECT * FROM dbo.categories WHERE slug = @Slug;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateOrder]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--CREATE FUNCTION fn_GenerateOrderNumber()
--RETURNS NVARCHAR(50)
--AS
--BEGIN
--    DECLARE @OrderNumber NVARCHAR(50);

--    SET @OrderNumber =
--        'TC-' + FORMAT(GETUTCDATE(), 'yyyyMMdd') + '-' +
--        RIGHT(CONVERT(NVARCHAR(20), ABS(CHECKSUM(NEWID()))), 6);

--    RETURN @OrderNumber;
--END
--GO
CREATE PROCEDURE [dbo].[sp_CreateOrder]
    @UserId INT,
    @SellerId INT = NULL,
    @Subtotal DECIMAL(18, 2),
    @ShippingCost DECIMAL(18, 2) = 0,
    @Tax DECIMAL(18, 2) = 0,
    @Discount DECIMAL(18, 2) = 0,
    @Total DECIMAL(18, 2),
    @ShippingAddress NVARCHAR(500),
    @ShippingCity NVARCHAR(100),
    @ShippingCountry NVARCHAR(100),
    @ShippingPhone NVARCHAR(50),
    @PaymentMethod NVARCHAR(50),
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @OrderId INT;
        DECLARE @OrderNumber NVARCHAR(50);

        -- Generate Order Number inside procedure
        SET @OrderNumber =
            'TC-' + FORMAT(GETUTCDATE(), 'yyyyMMdd') + '-' +
            RIGHT(CONVERT(NVARCHAR(20), ABS(CHECKSUM(NEWID()))), 6);

        -- Insert order (NO id column)
        INSERT INTO dbo.orders (
            user_id, seller_id, order_number, subtotal, shipping_cost,
            tax, discount, total, shipping_address, shipping_city,
            shipping_country, shipping_phone, payment_method, notes
        )
        VALUES (
            @UserId, @SellerId, @OrderNumber, @Subtotal, @ShippingCost,
            @Tax, @Discount, @Total, @ShippingAddress, @ShippingCity,
            @ShippingCountry, @ShippingPhone, @PaymentMethod, @Notes
        );

        -- Get new OrderId
        SET @OrderId = SCOPE_IDENTITY();

        -- Add initial status history
        INSERT INTO dbo.order_status_history (order_id, status, notes, created_by)
        VALUES (@OrderId, 'pending', 'Order placed', @UserId);

        COMMIT TRANSACTION;

        -- Return order info
        SELECT @OrderId AS order_id, @OrderNumber AS order_number;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreatePayment]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Create Payment
-- =============================================
CREATE PROCEDURE [dbo].[sp_CreatePayment]
    @OrderId int,
    @UserId int,
    @Amount DECIMAL(18, 2),
    @PaymentMethod NVARCHAR(50),
    @TransactionId NVARCHAR(255) = NULL,
    @Status NVARCHAR(20) = 'pending'
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.payments (order_id, user_id, amount, payment_method, transaction_id, status)
    VALUES (@OrderId, @UserId, @Amount, @PaymentMethod, @TransactionId, @Status);

    SELECT * FROM dbo.payments WHERE order_id = @OrderId ORDER BY created_at DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreatePayoutRequest]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Create Payout Request
-- =============================================
CREATE PROCEDURE [dbo].[sp_CreatePayoutRequest]
    @SellerId int,
    @Amount DECIMAL(18, 2),
    @PaymentMethod NVARCHAR(50) = NULL,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.payouts (seller_id, amount, payment_method, notes, status)
    VALUES (@SellerId, @Amount, @PaymentMethod, @Notes, 'pending');

    SELECT * FROM dbo.payouts WHERE seller_id = @SellerId ORDER BY created_at DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateProduct]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_CreateProduct]
    @SellerId int = NULL,
    @CategoryId int = NULL,
    @SubcategoryId int = NULL,
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
        DECLARE @ProductId int;
        DECLARE @Slug NVARCHAR(255);

        SET @Slug = LOWER(REPLACE(REPLACE(REPLACE(@Name, ' ', '-'), '''', ''), '.', ''));

        INSERT INTO dbo.products (
            seller_id, category_id, subcategory_id, name, slug, description,
            price, original_price, discount_percent, stock, sku, image_url,
            colors, sizes, is_flash_deal, is_trending
        )
        VALUES (
            @SellerId, @CategoryId, @SubcategoryId, @Name, @Slug, @Description,
            @Price, @OriginalPrice, @DiscountPercent, @Stock, @SKU, @ImageUrl,
            @Colors, @Sizes, @IsFlashDeal, @IsTrending
        );

        SET @ProductId = SCOPE_IDENTITY();

        SET @Slug = @Slug + '-' + CAST(@ProductId AS NVARCHAR(20));
        UPDATE dbo.products SET slug = @Slug WHERE id = @ProductId;

        IF @SellerId IS NOT NULL
        BEGIN
            UPDATE dbo.sellers
            SET total_products = total_products + 1
            WHERE id = @SellerId;
        END

        EXEC sp_GetProductById @ProductId;

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
--ALTER PROCEDURE [dbo].[sp_CreateProduct]
--    @SellerId int = NULL,
--    @CategoryId int = NULL,
--    @SubcategoryId int = NULL,
--    @Name NVARCHAR(255),
--    @Description NVARCHAR(MAX) = NULL,
--    @Price DECIMAL(18, 2),
--    @OriginalPrice DECIMAL(18, 2) = NULL,
--    @DiscountPercent DECIMAL(5, 2) = 0,
--    @Stock INT = 0,
--    @SKU NVARCHAR(100) = NULL,
--    @ImageUrl NVARCHAR(500) = NULL,
--    @Colors NVARCHAR(500) = NULL,
--    @Sizes NVARCHAR(500) = NULL,
--    @IsFlashDeal BIT = 0,
--    @IsTrending BIT = 0
--AS
--BEGIN
--    SET NOCOUNT ON;

--    BEGIN TRY
--        DECLARE @ProductId int;
--        DECLARE @Slug NVARCHAR(255);

--        -- Generate slug from name
--        SET @Slug = LOWER(REPLACE(REPLACE(REPLACE(@Name, ' ', '-'), '''', ''), '.', ''));
--        SET @Slug = @Slug + '-' + LEFT(CAST(@ProductId AS NVARCHAR(36)), 8);

--        INSERT INTO dbo.products (
--            id, seller_id, category_id, subcategory_id, name, slug, description,
--            price, original_price, discount_percent, stock, sku, image_url,
--            colors, sizes, is_flash_deal, is_trending
--        )
--        VALUES (
--            @ProductId, @SellerId, @CategoryId, @SubcategoryId, @Name, @Slug, @Description,
--            @Price, @OriginalPrice, @DiscountPercent, @Stock, @SKU, @ImageUrl,
--            @Colors, @Sizes, @IsFlashDeal, @IsTrending
--        );

--        -- Update seller product count
--        IF @SellerId IS NOT NULL
--        BEGIN
--            UPDATE dbo.sellers
--            SET total_products = total_products + 1
--            WHERE id = @SellerId;
--        END

--        -- Return created product
--        EXEC sp_GetProductById @ProductId;

--    END TRY
--    BEGIN CATCH
--        THROW;
--    END CATCH
--END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateProductVariant]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Create Product Variant
-- =============================================
CREATE PROCEDURE [dbo].[sp_CreateProductVariant]
    @ProductId int,
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
/****** Object:  StoredProcedure [dbo].[sp_CreateReview]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Create Review
-- =============================================
CREATE PROCEDURE [dbo].[sp_CreateReview]
    @ProductId int,
    @UserId int,
    @OrderId int = NULL,
    @Rating INT,
    @Title NVARCHAR(200) = NULL,
    @Comment NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if user already reviewed this product
    IF EXISTS (SELECT 1 FROM dbo.reviews WHERE product_id = @ProductId AND user_id = @UserId)
    BEGIN
        RAISERROR('You have already reviewed this product', 16, 1);
        RETURN;
    END

    -- Check if it's a verified purchase
    DECLARE @IsVerified BIT = 0;
    IF @OrderId IS NOT NULL
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM dbo.order_items oi
            INNER JOIN dbo.orders o ON oi.order_id = o.id
            WHERE oi.product_id = @ProductId
              AND o.user_id = @UserId
              AND o.status = 'delivered'
        )
        BEGIN
            SET @IsVerified = 1;
        END
    END

    INSERT INTO dbo.reviews (product_id, user_id, order_id, rating, title, comment, is_verified, is_approved)
    VALUES (@ProductId, @UserId, @OrderId, @Rating, @Title, @Comment, @IsVerified, 1);

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    -- Return the created review
    SELECT
        r.*,
        p.full_name AS user_name,
        pr.avatar_url AS user_avatar
    FROM dbo.reviews r
    LEFT JOIN dbo.users u ON r.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    LEFT JOIN dbo.profiles pr ON u.id = pr.user_id
    WHERE r.product_id = @ProductId AND r.user_id = @UserId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateSubcategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Create Subcategory
-- =============================================
CREATE  PROCEDURE [dbo].[sp_CreateSubcategory]
    @CategoryId int,
    @Name NVARCHAR(100),
    @Slug NVARCHAR(100),
    @ImageUrl NVARCHAR(500) = NULL,
    @SortOrder INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if category exists
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE id = @CategoryId)
    BEGIN
        RAISERROR('Category not found', 16, 1);
        RETURN;
    END

    -- Check if slug already exists in this category
    IF EXISTS (SELECT 1 FROM dbo.subcategories WHERE category_id = @CategoryId AND slug = @Slug)
    BEGIN
        RAISERROR('Subcategory slug already exists in this category', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.subcategories (category_id, name, slug, image_url, sort_order)
    VALUES (@CategoryId, @Name, @Slug, @ImageUrl, @SortOrder);

    SELECT * FROM dbo.subcategories WHERE category_id = @CategoryId AND slug = @Slug;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeactivateSeller]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_DeactivateSeller]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.sellers
    SET is_active = 0
    WHERE id = @SellerId;

    -- Also deactivate all seller's products
    UPDATE dbo.products
    SET is_active = 0
    WHERE seller_id = @SellerId;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteCategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Delete Category
-- =============================================
CREATE  PROCEDURE [dbo].[sp_DeleteCategory]
    @CategoryId int
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if category has products
    IF EXISTS (SELECT 1 FROM dbo.products WHERE category_id = @CategoryId)
    BEGIN
        -- Soft delete
        UPDATE dbo.categories SET is_active = 0 WHERE id = @CategoryId;
    END
    ELSE
    BEGIN
        -- Hard delete
        DELETE FROM dbo.categories WHERE id = @CategoryId;
    END

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteProduct]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Delete Product (Soft Delete)
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteProduct]
    @ProductId int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SellerId int;
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
/****** Object:  StoredProcedure [dbo].[sp_DeleteProductImage]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Delete Product Image
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteProductImage]
    @ImageId int
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.product_images WHERE id = @ImageId;
    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteProductVariant]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Delete Product Variant
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteProductVariant]
    @VariantId int
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.product_variants WHERE id = @VariantId;
    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteReview]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Delete Review
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteReview]
    @ReviewId int,
    @UserId int = NULL,
    @IsAdmin BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId int;
    DECLARE @ReviewUserId int;

    SELECT @ProductId = product_id, @ReviewUserId = user_id
    FROM dbo.reviews
    WHERE id = @ReviewId;

    -- Check ownership if not admin
    IF @IsAdmin = 0 AND @ReviewUserId <> @UserId
    BEGIN
        RAISERROR('Access denied', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.reviews WHERE id = @ReviewId;

    -- Update product rating
    IF @ProductId IS NOT NULL
        EXEC sp_UpdateProductRating @ProductId;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteSubcategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Delete Subcategory
-- =============================================
CREATE  PROCEDURE [dbo].[sp_DeleteSubcategory]
    @SubcategoryId int
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if subcategory has products
    IF EXISTS (SELECT 1 FROM dbo.products WHERE subcategory_id = @SubcategoryId)
    BEGIN
        -- Soft delete
        UPDATE dbo.subcategories SET is_active = 0 WHERE id = @SubcategoryId;
    END
    ELSE
    BEGIN
        -- Hard delete
        DELETE FROM dbo.subcategories WHERE id = @SubcategoryId;
    END

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllCategories]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get All Categories
-- =============================================
CREATE  PROCEDURE [dbo].[sp_GetAllCategories]
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.*,
        (SELECT COUNT(*) FROM dbo.subcategories WHERE category_id = c.id) AS subcategory_count,
        (SELECT COUNT(*) FROM dbo.products WHERE category_id = c.id AND is_active = 1) AS product_count
    FROM dbo.categories c
    WHERE @IncludeInactive = 1 OR c.is_active = 1
    ORDER BY c.sort_order, c.name;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllOrders]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get All Orders (Admin/Seller)
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetAllOrders]
    @Page INT = 1,
    @Limit INT = 10,
    @Status NVARCHAR(20) = NULL,
    @SellerId int = NULL,
    @Search NVARCHAR(100) = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    -- Get total count
    SELECT @TotalCount = COUNT(*)
    FROM dbo.orders o
    WHERE (@Status IS NULL OR o.status = @Status)
      AND (@SellerId IS NULL OR o.seller_id = @SellerId)
      AND (@Search IS NULL OR o.order_number LIKE '%' + @Search + '%' OR o.shipping_phone LIKE '%' + @Search + '%')
      AND (@DateFrom IS NULL OR o.created_at >= @DateFrom)
      AND (@DateTo IS NULL OR o.created_at <= @DateTo);

    -- Get orders
    SELECT
        o.*,
        p.full_name AS customer_name,
        u.email AS customer_email,
        s.store_name AS seller_name,
        (SELECT COUNT(*) FROM dbo.order_items WHERE order_id = o.id) AS items_count
    FROM dbo.orders o
    LEFT JOIN dbo.users u ON o.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    LEFT JOIN dbo.sellers s ON o.seller_id = s.id
    WHERE (@Status IS NULL OR o.status = @Status)
      AND (@SellerId IS NULL OR o.seller_id = @SellerId)
      AND (@Search IS NULL OR o.order_number LIKE '%' + @Search + '%' OR o.shipping_phone LIKE '%' + @Search + '%')
      AND (@DateFrom IS NULL OR o.created_at >= @DateFrom)
      AND (@DateTo IS NULL OR o.created_at <= @DateTo)
    ORDER BY o.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllReviews]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get All Reviews (Admin)
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetAllReviews]
    @Page INT = 1,
    @Limit INT = 10,
    @IsApproved BIT = NULL,
    @Rating INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    SELECT @TotalCount = COUNT(*)
    FROM dbo.reviews
    WHERE (@IsApproved IS NULL OR is_approved = @IsApproved)
      AND (@Rating IS NULL OR rating = @Rating);

    SELECT
        r.*,
        p.name AS product_name,
        p.image_url AS product_image,
        pr.full_name AS user_name,
        u.email AS user_email
    FROM dbo.reviews r
    INNER JOIN dbo.products p ON r.product_id = p.id
    LEFT JOIN dbo.users u ON r.user_id = u.id
    LEFT JOIN dbo.profiles pr ON u.id = pr.user_id
    WHERE (@IsApproved IS NULL OR r.is_approved = @IsApproved)
      AND (@Rating IS NULL OR r.rating = @Rating)
    ORDER BY r.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllSellers]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetAllSellers]
    @Page INT = 1,
    @Limit INT = 10,
    @IsActive BIT = NULL,
    @IsVerified BIT = NULL,
    @Search NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    -- Get total count
    SELECT @TotalCount = COUNT(*)
    FROM dbo.sellers s
    WHERE (@IsActive IS NULL OR s.is_active = @IsActive)
      AND (@IsVerified IS NULL OR s.is_verified = @IsVerified)
      AND (@Search IS NULL OR s.store_name LIKE '%' + @Search + '%' OR s.email LIKE '%' + @Search + '%');

    -- Get sellers
    SELECT
        s.*,
        u.email AS user_email,
        p.full_name AS owner_name,
        (SELECT COUNT(*) FROM dbo.products WHERE seller_id = s.id AND is_active = 1) AS active_products,
        (SELECT COUNT(*) FROM dbo.orders WHERE seller_id = s.id) AS total_orders
    FROM dbo.sellers s
    INNER JOIN dbo.users u ON s.user_id = u.id
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    WHERE (@IsActive IS NULL OR s.is_active = @IsActive)
      AND (@IsVerified IS NULL OR s.is_verified = @IsVerified)
      AND (@Search IS NULL OR s.store_name LIKE '%' + @Search + '%' OR s.email LIKE '%' + @Search + '%')
    ORDER BY s.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCategoriesWithSubcategories]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get Categories with Subcategories
-- =============================================
CREATE  PROCEDURE [dbo].[sp_GetCategoriesWithSubcategories]
AS
BEGIN
    SET NOCOUNT ON;

    -- Get categories
    SELECT
        c.*,
        (SELECT COUNT(*) FROM dbo.products WHERE category_id = c.id AND is_active = 1) AS product_count
    FROM dbo.categories c
    WHERE c.is_active = 1
    ORDER BY c.sort_order, c.name;

    -- Get all subcategories
    SELECT
        sc.*,
        (SELECT COUNT(*) FROM dbo.products WHERE subcategory_id = sc.id AND is_active = 1) AS product_count
    FROM dbo.subcategories sc
    INNER JOIN dbo.categories c ON sc.category_id = c.id
    WHERE sc.is_active = 1 AND c.is_active = 1
    ORDER BY sc.sort_order, sc.name;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCategoryById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get Category By ID
-- =============================================
CREATE  PROCEDURE [dbo].[sp_GetCategoryById]
    @CategoryId int
AS
BEGIN
    SET NOCOUNT ON;

    -- Get category
    SELECT
        c.*,
        (SELECT COUNT(*) FROM dbo.products WHERE category_id = c.id AND is_active = 1) AS product_count
    FROM dbo.categories c
    WHERE c.id = @CategoryId;

    -- Get subcategories
    SELECT * FROM dbo.subcategories
    WHERE category_id = @CategoryId AND is_active = 1
    ORDER BY sort_order, name;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCategoryBySlug]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get Category By Slug
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetCategoryBySlug]
    @Slug NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId int;
    SELECT @CategoryId = id FROM dbo.categories WHERE slug = @Slug;

    IF @CategoryId IS NOT NULL
        EXEC sp_GetCategoryById @CategoryId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetFlashDeals]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Flash Deal Products
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetFlashDeals]
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
/****** Object:  StoredProcedure [dbo].[sp_GetOrderById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Order By ID
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetOrderById]
    @OrderId int,
    @UserId int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Get order
    SELECT
        o.*,
        p.full_name AS customer_name,
        p.phone AS customer_phone,
        u.email AS customer_email,
        s.store_name AS seller_name
    FROM dbo.orders o
    LEFT JOIN dbo.users u ON o.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    LEFT JOIN dbo.sellers s ON o.seller_id = s.id
    WHERE o.id = @OrderId
      AND (@UserId IS NULL OR o.user_id = @UserId);

    -- Get order items
    SELECT
        oi.*,
        prd.slug AS product_slug
    FROM dbo.order_items oi
    LEFT JOIN dbo.products prd ON oi.product_id = prd.id
    WHERE oi.order_id = @OrderId;

    -- Get status history
    SELECT
        osh.*,
        prof.full_name AS created_by_name
    FROM dbo.order_status_history osh
    LEFT JOIN dbo.users usr ON osh.created_by = usr.id
    LEFT JOIN dbo.profiles prof ON usr.id = prof.user_id
    WHERE osh.order_id = @OrderId
    ORDER BY osh.created_at DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetOrderByNumber]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Order By Order Number
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetOrderByNumber]
    @OrderNumber NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OrderId int;
    SELECT @OrderId = id FROM dbo.orders WHERE order_number = @OrderNumber;

    IF @OrderId IS NOT NULL
        EXEC sp_GetOrderById @OrderId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetOrderStats]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Order Statistics
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetOrderStats]
    @SellerId int = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status <> 'cancelled' THEN total ELSE 0 END) AS total_revenue,
        AVG(CASE WHEN status <> 'cancelled' THEN total ELSE NULL END) AS avg_order_value
    FROM dbo.orders
    WHERE (@SellerId IS NULL OR seller_id = @SellerId)
      AND (@DateFrom IS NULL OR created_at >= @DateFrom)
      AND (@DateTo IS NULL OR created_at <= @DateTo);
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetProductById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Product By ID
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetProductById]
    @ProductId int
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
/****** Object:  StoredProcedure [dbo].[sp_GetProductBySlug]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Product By Slug
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetProductBySlug]
    @Slug NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId int;
    SELECT @ProductId = id FROM dbo.products WHERE slug = @Slug;

    IF @ProductId IS NOT NULL
        EXEC sp_GetProductById @ProductId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetProductReviewStats]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Product Review Stats
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetProductReviewStats]
    @ProductId int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ISNULL(AVG(CAST(rating AS DECIMAL(3, 2))), 0) AS average_rating,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) AS verified_purchases
    FROM dbo.reviews
    WHERE product_id = @ProductId AND is_approved = 1;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetProducts]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Products with Pagination
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetProducts]
    @Page INT = 1,
    @Limit INT = 10,
    @CategoryId int = NULL,
    @SubcategoryId int = NULL,
    @SellerId int = NULL,
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
/****** Object:  StoredProcedure [dbo].[sp_GetRecentOrders]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Recent Orders
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetRecentOrders]
    @Limit INT = 10,
    @SellerId int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Limit)
        o.*,
        p.full_name AS customer_name,
        (SELECT COUNT(*) FROM dbo.order_items WHERE order_id = o.id) AS items_count
    FROM dbo.orders o
    LEFT JOIN dbo.users u ON o.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    WHERE (@SellerId IS NULL OR o.seller_id = @SellerId)
    ORDER BY o.created_at DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetReviewsByProductId]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Reviews By Product ID
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetReviewsByProductId]
    @ProductId int,
    @Page INT = 1,
    @Limit INT = 10,
    @SortBy NVARCHAR(20) = 'created_at'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    -- Get total count
    SELECT @TotalCount = COUNT(*)
    FROM dbo.reviews
    WHERE product_id = @ProductId AND is_approved = 1;

    -- Get reviews
    SELECT
        r.*,
        p.full_name AS user_name,
        pr.avatar_url AS user_avatar
    FROM dbo.reviews r
    LEFT JOIN dbo.users u ON r.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    LEFT JOIN dbo.profiles pr ON u.id = pr.user_id
    WHERE r.product_id = @ProductId AND r.is_approved = 1
    ORDER BY
        CASE WHEN @SortBy = 'rating' THEN r.rating END DESC,
        CASE WHEN @SortBy = 'created_at' THEN r.created_at END DESC,
        r.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetRolePermissions]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetRolePermissions]
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, role, page, can_view, can_create, can_edit, can_delete, created_at, updated_at
  FROM dbo.role_permissions
  ORDER BY role, page;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSellerById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetSellerById]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.*,
        u.email AS user_email,
        p.full_name AS owner_name,
        (SELECT COUNT(*) FROM dbo.products WHERE seller_id = s.id AND is_active = 1) AS active_products,
        (SELECT COUNT(*) FROM dbo.orders WHERE seller_id = s.id) AS total_orders
    FROM dbo.sellers s
    INNER JOIN dbo.users u ON s.user_id = u.id
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    WHERE s.id = @SellerId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSellerByUserId]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetSellerByUserId]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SellerId INT;
    SELECT @SellerId = id FROM dbo.sellers WHERE user_id = @UserId;

    IF @SellerId IS NOT NULL
        EXEC sp_GetSellerById @SellerId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSellerDashboardStats]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetSellerDashboardStats]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Basic stats
    SELECT
        s.total_products,
        s.total_sales,
        s.rating,
        (SELECT COUNT(*) FROM dbo.orders WHERE seller_id = @SellerId AND status = 'pending') AS pending_orders,
        (SELECT COUNT(*) FROM dbo.orders WHERE seller_id = @SellerId AND status = 'processing') AS processing_orders,
        (SELECT COUNT(*) FROM dbo.orders WHERE seller_id = @SellerId AND created_at >= DATEADD(DAY, -30, GETUTCDATE())) AS orders_last_30_days,
        (SELECT ISNULL(SUM(total), 0) FROM dbo.orders WHERE seller_id = @SellerId AND status = 'delivered' AND created_at >= DATEADD(DAY, -30, GETUTCDATE())) AS revenue_last_30_days
    FROM dbo.sellers s
    WHERE s.id = @SellerId;

    -- Recent orders
    SELECT TOP 5
        o.*,
        p.full_name AS customer_name
    FROM dbo.orders o
    LEFT JOIN dbo.users u ON o.user_id = u.id
    LEFT JOIN dbo.profiles p ON u.id = p.user_id
    WHERE o.seller_id = @SellerId
    ORDER BY o.created_at DESC;

    -- Low stock products
    SELECT TOP 10
        id, name, stock, image_url
    FROM dbo.products
    WHERE seller_id = @SellerId AND is_active = 1 AND stock <= 10
    ORDER BY stock ASC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSellerPayouts]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Seller Payouts
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetSellerPayouts]
    @SellerId int,
    @Page INT = 1,
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    SELECT @TotalCount = COUNT(*) FROM dbo.payouts WHERE seller_id = @SellerId;

    SELECT *
    FROM dbo.payouts
    WHERE seller_id = @SellerId
    ORDER BY created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSubcategoriesByCategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get Subcategories By Category
-- =============================================
CREATE  PROCEDURE [dbo].[sp_GetSubcategoriesByCategory]
    @CategoryId int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sc.*,
        c.name AS category_name,
        c.slug AS category_slug,
        (SELECT COUNT(*) FROM dbo.products WHERE subcategory_id = sc.id AND is_active = 1) AS product_count
    FROM dbo.subcategories sc
    INNER JOIN dbo.categories c ON sc.category_id = c.id
    WHERE sc.category_id = @CategoryId AND sc.is_active = 1
    ORDER BY sc.sort_order, sc.name;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetSubcategoryById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Get Subcategory By ID
-- =============================================
CREATE  PROCEDURE [dbo].[sp_GetSubcategoryById]
    @SubcategoryId int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sc.*,
        c.name AS category_name,
        c.slug AS category_slug,
        (SELECT COUNT(*) FROM dbo.products WHERE subcategory_id = sc.id AND is_active = 1) AS product_count
    FROM dbo.subcategories sc
    INNER JOIN dbo.categories c ON sc.category_id = c.id
    WHERE sc.id = @SubcategoryId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetTrendingProducts]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get Trending Products
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetTrendingProducts]
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
/****** Object:  StoredProcedure [dbo].[sp_GetUserByEmail]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetUserByEmail]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id,
        u.email,
        u.password_hash,
        u.is_active,
        u.email_verified,
        p.full_name,
        p.profile_type,
        p.phone,
        p.avatar_url,
        r.role
    FROM dbo.users u
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    INNER JOIN dbo.user_roles r ON u.id = r.user_id
    WHERE u.email = @Email;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetUserById]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_GetUserById]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id,
        u.email,
        u.is_active,
        u.email_verified,
        u.last_login,
        u.created_at,
        p.full_name,
        p.profile_type,
        p.phone,
        p.avatar_url,
        p.address,
        p.city,
        p.country,
        r.role
    FROM dbo.users u
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    INNER JOIN dbo.user_roles r ON u.id = r.user_id
    WHERE u.id = @UserId AND u.is_active = 1;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetUserOrders]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get User Orders
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetUserOrders]
    @UserId int,
    @Page INT = 1,
    @Limit INT = 10,
    @Status NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    -- Get total count
    SELECT @TotalCount = COUNT(*)
    FROM dbo.orders
    WHERE user_id = @UserId
      AND (@Status IS NULL OR status = @Status);

    -- Get orders
    SELECT
        o.*,
        (SELECT COUNT(*) FROM dbo.order_items WHERE order_id = o.id) AS items_count
    FROM dbo.orders o
    WHERE o.user_id = @UserId
      AND (@Status IS NULL OR o.status = @Status)
    ORDER BY o.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetUserReviews]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Get User Reviews
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetUserReviews]
    @UserId int,
    @Page INT = 1,
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @TotalCount INT;

    SELECT @TotalCount = COUNT(*) FROM dbo.reviews WHERE user_id = @UserId;

    SELECT
        r.*,
        p.name AS product_name,
        p.image_url AS product_image,
        p.slug AS product_slug
    FROM dbo.reviews r
    INNER JOIN dbo.products p ON r.product_id = p.id
    WHERE r.user_id = @UserId
    ORDER BY r.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    -- Return pagination meta
    SELECT
        @TotalCount AS total,
        @Page AS page,
        @Limit AS [limit],
        CEILING(CAST(@TotalCount AS FLOAT) / @Limit) AS total_pages;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_HasRole]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Check User Role
-- =============================================
CREATE  PROCEDURE [dbo].[sp_HasRole]
    @UserId int,
    @Role NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM dbo.user_roles
            WHERE user_id = @UserId AND role = @Role
        ) THEN 1 ELSE 0
    END AS has_role;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_LoginUser]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_LoginUser]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id,
        u.email,
        u.password_hash,
        u.is_active,
        u.email_verified,
        p.full_name,
        p.profile_type,
        p.phone,
        p.avatar_url,
        r.role
    FROM dbo.users u
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    INNER JOIN dbo.user_roles r ON u.id = r.user_id
    WHERE u.email = @Email;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_ProcessPayout]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Process Payout (Admin)
-- =============================================
CREATE PROCEDURE [dbo].[sp_ProcessPayout]
    @PayoutId int,
    @Status NVARCHAR(20),
    @TransactionId NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.payouts
    SET
        status = @Status,
        transaction_id = @TransactionId,
        payout_date = CASE WHEN @Status = 'completed' THEN GETUTCDATE() ELSE payout_date END
    WHERE id = @PayoutId;

    SELECT * FROM dbo.payouts WHERE id = @PayoutId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RegisterSeller]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[sp_RegisterSeller]
    @UserId INT,
    @StoreName NVARCHAR(255),
    @StoreDescription NVARCHAR(MAX) = NULL,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @Country NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if user is already a seller
        IF EXISTS (SELECT 1 FROM dbo.sellers WHERE user_id = @UserId)
        BEGIN
            RAISERROR('User is already registered as a seller', 16, 1);
            RETURN;
        END

        -- Create seller
        INSERT INTO dbo.sellers (
            user_id, store_name, store_description, email, phone,
            address, city, country, is_active, is_verified
        )
        VALUES (
            @UserId, @StoreName, @StoreDescription, @Email, @Phone,
            @Address, @City, @Country, 0, 0
        );

        -- Add seller role to user
        IF NOT EXISTS (SELECT 1 FROM dbo.user_roles WHERE user_id = @UserId AND role = 'seller')
        BEGIN
            INSERT INTO dbo.user_roles (user_id, role)
            VALUES (@UserId, 'seller');
        END

        -- Update profile_type to 'seller' so user is marked as seller (if profiles table exists)
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.profiles') AND name = 'profile_type')
        BEGIN
            UPDATE dbo.profiles
            SET profile_type = 'seller'
            WHERE user_id = @UserId;
        END

        COMMIT TRANSACTION;

        -- Return seller data
        SELECT * FROM dbo.sellers WHERE user_id = @UserId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RegisterUser]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[sp_RegisterUser]
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM dbo.users WHERE email = @Email)
        BEGIN
            RAISERROR('Email already exists', 16, 1);
            RETURN;
        END

        DECLARE @UserId INT;

        INSERT INTO dbo.users (email, password_hash)
        VALUES (@Email, @PasswordHash);

        SET @UserId = SCOPE_IDENTITY();

        INSERT INTO dbo.profiles (user_id, full_name, phone, profile_type)
        VALUES (@UserId, @FullName, @Phone, 'customer');

        INSERT INTO dbo.user_roles (user_id, role)
        VALUES (@UserId, 'user');

        COMMIT TRANSACTION;

        SELECT
            u.id,
            u.email,
            u.is_active,
            u.created_at,
            p.full_name,
            p.profile_type,
            p.phone,
            p.avatar_url,
            r.role
        FROM dbo.users u
        INNER JOIN dbo.profiles p ON u.id = p.user_id
        INNER JOIN dbo.user_roles r ON u.id = r.user_id
        WHERE u.id = @UserId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RejectReview]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Reject Review (Admin)
-- =============================================
CREATE PROCEDURE [dbo].[sp_RejectReview]
    @ReviewId int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId int;
    SELECT @ProductId = product_id FROM dbo.reviews WHERE id = @ReviewId;

    UPDATE dbo.reviews
    SET is_approved = 0
    WHERE id = @ReviewId;

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    SELECT * FROM dbo.reviews WHERE id = @ReviewId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RevokeAllUserTokens]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Revoke All User Tokens
-- =============================================
CREATE  PROCEDURE [dbo].[sp_RevokeAllUserTokens]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.refresh_tokens
    SET is_revoked = 1
    WHERE user_id = @UserId AND is_revoked = 0;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RevokeRefreshToken]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Revoke Refresh Token
-- =============================================
CREATE PROCEDURE [dbo].[sp_RevokeRefreshToken]
    @Token NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.refresh_tokens
    SET is_revoked = 1
    WHERE token = @Token;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_SaveRefreshToken]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Save Refresh Token
-- =============================================
CREATE  PROCEDURE [dbo].[sp_SaveRefreshToken]
    @UserId int,
    @Token NVARCHAR(500),
    @ExpiresAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    -- Revoke existing tokens for user
    UPDATE dbo.refresh_tokens
    SET is_revoked = 1
    WHERE user_id = @UserId AND is_revoked = 0;

    -- Insert new token
    INSERT INTO dbo.refresh_tokens (user_id, token, expires_at)
    VALUES (@UserId, @Token, @ExpiresAt);
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateCategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Update Category
-- =============================================
CREATE  PROCEDURE [dbo].[sp_UpdateCategory]
    @CategoryId int,
    @Name NVARCHAR(100) = NULL,
    @Slug NVARCHAR(100) = NULL,
    @ImageUrl NVARCHAR(500) = NULL,
    @SortOrder INT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if new slug already exists
    IF @Slug IS NOT NULL AND EXISTS (
        SELECT 1 FROM dbo.categories WHERE slug = @Slug AND id <> @CategoryId
    )
    BEGIN
        RAISERROR('Category slug already exists', 16, 1);
        RETURN;
    END

    UPDATE dbo.categories
    SET
        name = COALESCE(@Name, name),
        slug = COALESCE(@Slug, slug),
        image_url = COALESCE(@ImageUrl, image_url),
        sort_order = COALESCE(@SortOrder, sort_order),
        is_active = COALESCE(@IsActive, is_active)
    WHERE id = @CategoryId;

    EXEC sp_GetCategoryById @CategoryId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateLastLogin]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Update Last Login
-- =============================================
CREATE  PROCEDURE [dbo].[sp_UpdateLastLogin]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.users
    SET last_login = GETUTCDATE()
    WHERE id = @UserId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateOrderStatus]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Order Status
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateOrderStatus]
    @OrderId int,
    @Status NVARCHAR(20),
    @Notes NVARCHAR(500) = NULL,
    @UpdatedBy int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Update order status
        UPDATE dbo.orders
        SET status = @Status
        WHERE id = @OrderId;

        -- Add status history
        INSERT INTO dbo.order_status_history (order_id, status, notes, created_by)
        VALUES (@OrderId, @Status, @Notes, @UpdatedBy);

        COMMIT TRANSACTION;

        -- Return updated order
        EXEC sp_GetOrderById @OrderId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdatePassword]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Update User Password
-- =============================================
CREATE  PROCEDURE [dbo].[sp_UpdatePassword]
    @UserId int,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.users
    SET password_hash = @NewPasswordHash
    WHERE id = @UserId;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdatePayment]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Payment
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdatePayment]
    @PaymentId int,
    @Status NVARCHAR(20),
    @TransactionId NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.payments
    SET
        status = @Status,
        transaction_id = COALESCE(@TransactionId, transaction_id),
        payment_date = CASE WHEN @Status = 'completed' THEN GETUTCDATE() ELSE payment_date END
    WHERE id = @PaymentId;

    -- If payment completed, update order payment status
    IF @Status = 'completed'
    BEGIN
        DECLARE @OrderId int;
        SELECT @OrderId = order_id FROM dbo.payments WHERE id = @PaymentId;

        UPDATE dbo.orders SET payment_status = 'paid' WHERE id = @OrderId;
    END

    SELECT * FROM dbo.payments WHERE id = @PaymentId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdatePaymentStatus]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Payment Status
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdatePaymentStatus]
    @OrderId int,
    @PaymentStatus NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.orders
    SET payment_status = @PaymentStatus
    WHERE id = @OrderId;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateProduct]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Product
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateProduct]
    @ProductId int,
    @CategoryId int = NULL,
    @SubcategoryId int = NULL,
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
/****** Object:  StoredProcedure [dbo].[sp_UpdateProductRating]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Product Rating
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateProductRating]
    @ProductId int
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
/****** Object:  StoredProcedure [dbo].[sp_UpdateProductStock]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Product Stock
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateProductStock]
    @ProductId int,
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
/****** Object:  StoredProcedure [dbo].[sp_UpdateProductVariant]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Product Variant
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateProductVariant]
    @VariantId int,
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
/****** Object:  StoredProcedure [dbo].[sp_UpdateReview]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Update Review
-- =============================================
CREATE PROCEDURE [dbo].[sp_UpdateReview]
    @ReviewId int,
    @UserId int,
    @Rating INT = NULL,
    @Title NVARCHAR(200) = NULL,
    @Comment NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify ownership
    IF NOT EXISTS (SELECT 1 FROM dbo.reviews WHERE id = @ReviewId AND user_id = @UserId)
    BEGIN
        RAISERROR('Review not found or access denied', 16, 1);
        RETURN;
    END

    DECLARE @ProductId int;
    SELECT @ProductId = product_id FROM dbo.reviews WHERE id = @ReviewId;

    UPDATE dbo.reviews
    SET
        rating = COALESCE(@Rating, rating),
        title = COALESCE(@Title, title),
        comment = COALESCE(@Comment, comment)
    WHERE id = @ReviewId;

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    SELECT * FROM dbo.reviews WHERE id = @ReviewId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateSeller]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[sp_UpdateSeller]
    @SellerId INT,
    @StoreName NVARCHAR(255) = NULL,
    @StoreDescription NVARCHAR(MAX) = NULL,
    @LogoUrl NVARCHAR(500) = NULL,
    @BannerUrl NVARCHAR(500) = NULL,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @Country NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.sellers
    SET
        store_name = COALESCE(@StoreName, store_name),
        store_description = COALESCE(@StoreDescription, store_description),
        logo_url = COALESCE(@LogoUrl, logo_url),
        banner_url = COALESCE(@BannerUrl, banner_url),
        email = COALESCE(@Email, email),
        phone = COALESCE(@Phone, phone),
        address = COALESCE(@Address, address),
        city = COALESCE(@City, city),
        country = COALESCE(@Country, country)
    WHERE id = @SellerId;

    EXEC sp_GetSellerById @SellerId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateSellerStats]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_UpdateSellerStats]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalProducts INT;
    DECLARE @TotalSales DECIMAL(18, 2);
    DECLARE @AvgRating DECIMAL(3, 2);

    -- Count products
    SELECT @TotalProducts = COUNT(*)
    FROM dbo.products
    WHERE seller_id = @SellerId AND is_active = 1;

    -- Sum sales from delivered orders
    SELECT @TotalSales = ISNULL(SUM(o.total), 0)
    FROM dbo.orders o
    WHERE o.seller_id = @SellerId AND o.status = 'delivered';

    -- Calculate average rating from product reviews
    SELECT @AvgRating = AVG(CAST(r.rating AS DECIMAL(3, 2)))
    FROM dbo.reviews r
    INNER JOIN dbo.products p ON r.product_id = p.id
    WHERE p.seller_id = @SellerId AND r.is_approved = 1;

    UPDATE dbo.sellers
    SET
        total_products = @TotalProducts,
        total_sales = @TotalSales,
        rating = @AvgRating
    WHERE id = @SellerId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateSubcategory]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Update Subcategory
-- =============================================
CREATE  PROCEDURE [dbo].[sp_UpdateSubcategory]
    @SubcategoryId int,
    @Name NVARCHAR(100) = NULL,
    @Slug NVARCHAR(100) = NULL,
    @ImageUrl NVARCHAR(500) = NULL,
    @SortOrder INT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId int;
    SELECT @CategoryId = category_id FROM dbo.subcategories WHERE id = @SubcategoryId;

    -- Check if new slug already exists in category
    IF @Slug IS NOT NULL AND EXISTS (
        SELECT 1 FROM dbo.subcategories
        WHERE category_id = @CategoryId AND slug = @Slug AND id <> @SubcategoryId
    )
    BEGIN
        RAISERROR('Subcategory slug already exists in this category', 16, 1);
        RETURN;
    END

    UPDATE dbo.subcategories
    SET
        name = COALESCE(@Name, name),
        slug = COALESCE(@Slug, slug),
        image_url = COALESCE(@ImageUrl, image_url),
        sort_order = COALESCE(@SortOrder, sort_order),
        is_active = COALESCE(@IsActive, is_active)
    WHERE id = @SubcategoryId;

    EXEC sp_GetSubcategoryById @SubcategoryId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateUserProfile]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[sp_UpdateUserProfile]
    @UserId INT,
    @FullName NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @AvatarUrl NVARCHAR(500) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @Country NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.profiles
    SET
        full_name = COALESCE(@FullName, full_name),
        phone = COALESCE(@Phone, phone),
        avatar_url = COALESCE(@AvatarUrl, avatar_url),
        address = COALESCE(@Address, address),
        city = COALESCE(@City, city),
        country = COALESCE(@Country, country)
    WHERE user_id = @UserId;

    EXEC dbo.sp_GetUserById @UserId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpsertRolePermission]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[sp_UpsertRolePermission]
  @Role NVARCHAR(20),
  @Page NVARCHAR(50),
  @CanView BIT,
  @CanCreate BIT,
  @CanEdit BIT,
  @CanDelete BIT
AS
BEGIN
  SET NOCOUNT ON;
  MERGE dbo.role_permissions AS target
  USING (SELECT @Role AS role, @Page AS page) AS source ON target.role = source.role AND target.page = source.page
  WHEN MATCHED THEN
    UPDATE SET can_view = @CanView, can_create = @CanCreate, can_edit = @CanEdit, can_delete = @CanDelete, updated_at = GETUTCDATE()
  WHEN NOT MATCHED THEN
    INSERT (role, page, can_view, can_create, can_edit, can_delete)
    VALUES (@Role, @Page, @CanView, @CanCreate, @CanEdit, @CanDelete);

  SELECT * FROM dbo.role_permissions WHERE role = @Role AND page = @Page;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_ValidateRefreshToken]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_ValidateRefreshToken]
    @Token NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rt.id,
        rt.user_id,
        rt.token,
        rt.expires_at,
        u.email,
        u.is_active,
        r.role,
        p.profile_type
    FROM dbo.refresh_tokens rt
    INNER JOIN dbo.users u ON rt.user_id = u.id
    INNER JOIN dbo.user_roles r ON u.id = r.user_id
    INNER JOIN dbo.profiles p ON u.id = p.user_id
    WHERE rt.token = @Token
      AND rt.is_revoked = 0
      AND rt.expires_at > GETUTCDATE()
      AND u.is_active = 1;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_VerifySeller]    Script Date: 3/30/2026 4:48:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_VerifySeller]
    @SellerId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.sellers
    SET is_verified = 1
    WHERE id = @SellerId;

    EXEC sp_GetSellerById @SellerId;
END
GO
