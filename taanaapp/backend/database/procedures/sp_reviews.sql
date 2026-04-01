-- =============================================
-- Reviews Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Create Review
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateReview
    @ProductId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @OrderId UNIQUEIDENTIFIER = NULL,
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

-- =============================================
-- Get Reviews By Product ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetReviewsByProductId
    @ProductId UNIQUEIDENTIFIER,
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

-- =============================================
-- Get Product Review Stats
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetProductReviewStats
    @ProductId UNIQUEIDENTIFIER
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

-- =============================================
-- Get User Reviews
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUserReviews
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Get All Reviews (Admin)
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetAllReviews
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

-- =============================================
-- Update Review
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateReview
    @ReviewId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
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

    DECLARE @ProductId UNIQUEIDENTIFIER;
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

-- =============================================
-- Delete Review
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteReview
    @ReviewId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER = NULL,
    @IsAdmin BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId UNIQUEIDENTIFIER;
    DECLARE @ReviewUserId UNIQUEIDENTIFIER;

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

-- =============================================
-- Approve Review (Admin)
-- =============================================
CREATE OR ALTER PROCEDURE sp_ApproveReview
    @ReviewId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId UNIQUEIDENTIFIER;
    SELECT @ProductId = product_id FROM dbo.reviews WHERE id = @ReviewId;

    UPDATE dbo.reviews
    SET is_approved = 1
    WHERE id = @ReviewId;

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    SELECT * FROM dbo.reviews WHERE id = @ReviewId;
END
GO

-- =============================================
-- Reject Review (Admin)
-- =============================================
CREATE OR ALTER PROCEDURE sp_RejectReview
    @ReviewId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProductId UNIQUEIDENTIFIER;
    SELECT @ProductId = product_id FROM dbo.reviews WHERE id = @ReviewId;

    UPDATE dbo.reviews
    SET is_approved = 0
    WHERE id = @ReviewId;

    -- Update product rating
    EXEC sp_UpdateProductRating @ProductId;

    SELECT * FROM dbo.reviews WHERE id = @ReviewId;
END
GO

-- =============================================
-- Check If User Can Review Product
-- =============================================
CREATE OR ALTER PROCEDURE sp_CanUserReviewProduct
    @ProductId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER
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

PRINT 'Reviews Stored Procedures Created Successfully!';
GO
