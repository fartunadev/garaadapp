-- =============================================
-- Orders Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Generate Order Number
-- =============================================
CREATE OR ALTER FUNCTION fn_GenerateOrderNumber()
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @OrderNumber NVARCHAR(50);
    SET @OrderNumber = 'TC-' + FORMAT(GETUTCDATE(), 'yyyyMMdd') + '-' +
                       UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 6));
    RETURN @OrderNumber;
END
GO

-- =============================================
-- Create Order
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateOrder
    @UserId UNIQUEIDENTIFIER,
    @SellerId UNIQUEIDENTIFIER = NULL,
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

        DECLARE @OrderId UNIQUEIDENTIFIER = NEWID();
        DECLARE @OrderNumber NVARCHAR(50) = dbo.fn_GenerateOrderNumber();

        -- Create order
        INSERT INTO dbo.orders (
            id, user_id, seller_id, order_number, subtotal, shipping_cost,
            tax, discount, total, shipping_address, shipping_city,
            shipping_country, shipping_phone, payment_method, notes
        )
        VALUES (
            @OrderId, @UserId, @SellerId, @OrderNumber, @Subtotal, @ShippingCost,
            @Tax, @Discount, @Total, @ShippingAddress, @ShippingCity,
            @ShippingCountry, @ShippingPhone, @PaymentMethod, @Notes
        );

        -- Add initial status history
        INSERT INTO dbo.order_status_history (order_id, status, notes, created_by)
        VALUES (@OrderId, 'pending', 'Order placed', @UserId);

        COMMIT TRANSACTION;

        -- Return order ID and number
        SELECT @OrderId AS order_id, @OrderNumber AS order_number;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- Add Order Item
-- =============================================
CREATE OR ALTER PROCEDURE sp_AddOrderItem
    @OrderId UNIQUEIDENTIFIER,
    @ProductId UNIQUEIDENTIFIER,
    @VariantId UNIQUEIDENTIFIER = NULL,
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

-- =============================================
-- Get Order By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetOrderById
    @OrderId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER = NULL
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

-- =============================================
-- Get Order By Order Number
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetOrderByNumber
    @OrderNumber NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OrderId UNIQUEIDENTIFIER;
    SELECT @OrderId = id FROM dbo.orders WHERE order_number = @OrderNumber;

    IF @OrderId IS NOT NULL
        EXEC sp_GetOrderById @OrderId;
END
GO

-- =============================================
-- Get User Orders
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUserOrders
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Get All Orders (Admin/Seller)
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetAllOrders
    @Page INT = 1,
    @Limit INT = 10,
    @Status NVARCHAR(20) = NULL,
    @SellerId UNIQUEIDENTIFIER = NULL,
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

-- =============================================
-- Update Order Status
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateOrderStatus
    @OrderId UNIQUEIDENTIFIER,
    @Status NVARCHAR(20),
    @Notes NVARCHAR(500) = NULL,
    @UpdatedBy UNIQUEIDENTIFIER = NULL
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

-- =============================================
-- Update Payment Status
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdatePaymentStatus
    @OrderId UNIQUEIDENTIFIER,
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

-- =============================================
-- Cancel Order
-- =============================================
CREATE OR ALTER PROCEDURE sp_CancelOrder
    @OrderId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @Reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Verify ownership and status
        DECLARE @CurrentStatus NVARCHAR(20);
        DECLARE @OrderUserId UNIQUEIDENTIFIER;

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
        DECLARE @ProductId UNIQUEIDENTIFIER, @Quantity INT;
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

-- =============================================
-- Get Order Statistics
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetOrderStats
    @SellerId UNIQUEIDENTIFIER = NULL,
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

-- =============================================
-- Get Recent Orders
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetRecentOrders
    @Limit INT = 10,
    @SellerId UNIQUEIDENTIFIER = NULL
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

-- =============================================
-- Create Payment
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreatePayment
    @OrderId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Update Payment
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdatePayment
    @PaymentId UNIQUEIDENTIFIER,
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
        DECLARE @OrderId UNIQUEIDENTIFIER;
        SELECT @OrderId = order_id FROM dbo.payments WHERE id = @PaymentId;

        UPDATE dbo.orders SET payment_status = 'paid' WHERE id = @OrderId;
    END

    SELECT * FROM dbo.payments WHERE id = @PaymentId;
END
GO

PRINT 'Orders Stored Procedures Created Successfully!';
GO
