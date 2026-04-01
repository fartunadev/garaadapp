-- Migration: Add profile_type to profiles and update auth stored procedures
-- Created: 2026-03-26

USE [Taano];
GO
BEGIN TRANSACTION;

-- 1) Add profile_type column if it doesn't exist
IF COL_LENGTH('dbo.profiles', 'profile_type') IS NULL
BEGIN
    ALTER TABLE dbo.profiles ADD profile_type NVARCHAR(20) NULL;
    UPDATE dbo.profiles SET profile_type = 'customer' WHERE profile_type IS NULL;
    ALTER TABLE dbo.profiles ALTER COLUMN profile_type NVARCHAR(20) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        WHERE dc.parent_object_id = OBJECT_ID('dbo.profiles')
          AND dc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.profiles'), 'profile_type', 'ColumnId')
    )
    BEGIN
        ALTER TABLE dbo.profiles ADD CONSTRAINT DF_profiles_profile_type DEFAULT('customer') FOR profile_type;
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.profiles') AND name = 'IX_profiles_profile_type')
    BEGIN
        CREATE INDEX IX_profiles_profile_type ON dbo.profiles(profile_type);
    END
END
GO

-- 2) Update RegisterUser (int-based) to insert profile_type and return it
CREATE OR ALTER PROCEDURE dbo.sp_RegisterUser
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

-- 3) Update LoginUser to select profile_type
CREATE OR ALTER PROCEDURE dbo.sp_LoginUser
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

-- 4) Update GetUserById to include profile_type
CREATE OR ALTER PROCEDURE dbo.sp_GetUserById
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

-- 5) Update GetUserByEmail to include profile_type
CREATE OR ALTER PROCEDURE dbo.sp_GetUserByEmail
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

-- 6) Update UpdateUserProfile (returning GetUserById will now include profile_type)
CREATE OR ALTER PROCEDURE dbo.sp_UpdateUserProfile
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

-- 7) Update ValidateRefreshToken to return profile_type
CREATE OR ALTER PROCEDURE dbo.sp_ValidateRefreshToken
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

-- 8) Update RegisterSeller to set profiles.profile_type = 'seller' when creating a seller
CREATE OR ALTER PROCEDURE dbo.sp_RegisterSeller
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

        IF EXISTS (SELECT 1 FROM dbo.sellers WHERE user_id = @UserId)
        BEGIN
            RAISERROR('User is already registered as a seller', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.sellers (
            user_id, store_name, store_description, email, phone,
            address, city, country, is_active, is_verified
        )
        VALUES (
            @UserId, @StoreName, @StoreDescription, @Email, @Phone,
            @Address, @City, @Country, 0, 0
        );

        IF NOT EXISTS (SELECT 1 FROM dbo.user_roles WHERE user_id = @UserId AND role = 'seller')
        BEGIN
            INSERT INTO dbo.user_roles (user_id, role)
            VALUES (@UserId, 'seller');
        END

        -- ensure profile_type updated
        UPDATE dbo.profiles SET profile_type = 'seller' WHERE user_id = @UserId;

        COMMIT TRANSACTION;

        SELECT * FROM dbo.sellers WHERE user_id = @UserId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

COMMIT TRANSACTION;
GO

PRINT 'Migration 20260326_add_profile_type applied (file only).';
GO
