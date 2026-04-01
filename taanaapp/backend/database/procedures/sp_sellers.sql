-- =============================================
-- Sellers Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Register Seller
-- =============================================
CREATE OR ALTER PROCEDURE sp_RegisterSeller
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

-- =============================================
-- Get Seller By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSellerById
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

-- =============================================
-- Get Seller By User ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSellerByUserId
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

-- =============================================
-- Get All Sellers
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetAllSellers
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

-- =============================================
-- Update Seller
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateSeller
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

-- =============================================
-- Approve Seller
-- =============================================
CREATE OR ALTER PROCEDURE sp_ApproveSeller
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

-- =============================================
-- Verify Seller
-- =============================================
CREATE OR ALTER PROCEDURE sp_VerifySeller
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

-- =============================================
-- Deactivate Seller
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeactivateSeller
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

-- =============================================
-- Update Seller Stats
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateSellerStats
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

-- =============================================
-- Get Seller Dashboard Stats
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSellerDashboardStats
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

-- =============================================
-- Create Payout Request
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreatePayoutRequest
    @SellerId UNIQUEIDENTIFIER,
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

-- =============================================
-- Get Seller Payouts
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSellerPayouts
    @SellerId UNIQUEIDENTIFIER,
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

-- =============================================
-- Process Payout (Admin)
-- =============================================
CREATE OR ALTER PROCEDURE sp_ProcessPayout
    @PayoutId UNIQUEIDENTIFIER,
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

PRINT 'Sellers Stored Procedures Created Successfully!';
GO
