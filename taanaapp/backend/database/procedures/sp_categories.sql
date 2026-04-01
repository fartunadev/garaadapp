-- =============================================
-- Categories Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Create Category
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateCategory
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

-- =============================================
-- Get All Categories
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetAllCategories
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

-- =============================================
-- Get Category By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetCategoryById
    @CategoryId UNIQUEIDENTIFIER
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

-- =============================================
-- Get Category By Slug
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetCategoryBySlug
    @Slug NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId UNIQUEIDENTIFIER;
    SELECT @CategoryId = id FROM dbo.categories WHERE slug = @Slug;

    IF @CategoryId IS NOT NULL
        EXEC sp_GetCategoryById @CategoryId;
END
GO

-- =============================================
-- Update Category
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateCategory
    @CategoryId UNIQUEIDENTIFIER,
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

-- =============================================
-- Delete Category
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteCategory
    @CategoryId UNIQUEIDENTIFIER
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

-- =============================================
-- Create Subcategory
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateSubcategory
    @CategoryId UNIQUEIDENTIFIER,
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

-- =============================================
-- Get Subcategories By Category
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSubcategoriesByCategory
    @CategoryId UNIQUEIDENTIFIER
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

-- =============================================
-- Get Subcategory By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetSubcategoryById
    @SubcategoryId UNIQUEIDENTIFIER
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

-- =============================================
-- Update Subcategory
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateSubcategory
    @SubcategoryId UNIQUEIDENTIFIER,
    @Name NVARCHAR(100) = NULL,
    @Slug NVARCHAR(100) = NULL,
    @ImageUrl NVARCHAR(500) = NULL,
    @SortOrder INT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId UNIQUEIDENTIFIER;
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

-- =============================================
-- Delete Subcategory
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteSubcategory
    @SubcategoryId UNIQUEIDENTIFIER
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

-- =============================================
-- Get Categories with Subcategories
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetCategoriesWithSubcategories
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

PRINT 'Categories Stored Procedures Created Successfully!';
GO
