-- =============================================
-- Authentication Stored Procedures
-- =============================================
USE TanaCargo;
GO

-- =============================================
-- Register User
-- =============================================
CREATE OR ALTER PROCEDURE sp_RegisterUser
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM dbo.users WHERE email = @Email)
        BEGIN
            RAISERROR('Email already exists', 16, 1);
            RETURN;
        END

        DECLARE @UserId UNIQUEIDENTIFIER = NEWID();

        -- Insert user
        INSERT INTO dbo.users (id, email, password_hash, created_at, updated_at)
        VALUES (@UserId, @Email, @PasswordHash, GETUTCDATE(), GETUTCDATE());

        -- Insert profile (default profile_type = 'customer')
        INSERT INTO dbo.profiles (user_id, full_name, profile_type, phone)
        VALUES (@UserId, @FullName, 'customer', @Phone);

        -- Assign default role
        INSERT INTO dbo.user_roles (user_id, role)
        VALUES (@UserId, 'user');

        COMMIT TRANSACTION;

        -- Return user data
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

-- =============================================
-- Login User
-- =============================================
CREATE OR ALTER PROCEDURE sp_LoginUser
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Get user with password hash for verification
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

-- =============================================
-- Update Last Login
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateLastLogin
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.users
    SET last_login = GETUTCDATE()
    WHERE id = @UserId;
END
GO

-- =============================================
-- Get User By ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUserById
    @UserId UNIQUEIDENTIFIER
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

-- =============================================
-- Get User By Email
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUserByEmail
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

-- =============================================
-- Update User Profile
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateUserProfile
    @UserId UNIQUEIDENTIFIER,
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

    -- Return updated profile
    EXEC sp_GetUserById @UserId;
END
GO

-- =============================================
-- Update User Password
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdatePassword
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Save Refresh Token
-- =============================================
CREATE OR ALTER PROCEDURE sp_SaveRefreshToken
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Validate Refresh Token
-- =============================================
CREATE OR ALTER PROCEDURE sp_ValidateRefreshToken
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

-- =============================================
-- Revoke Refresh Token
-- =============================================
CREATE OR ALTER PROCEDURE sp_RevokeRefreshToken
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

-- =============================================
-- Revoke All User Tokens
-- =============================================
CREATE OR ALTER PROCEDURE sp_RevokeAllUserTokens
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.refresh_tokens
    SET is_revoked = 1
    WHERE user_id = @UserId AND is_revoked = 0;

    SELECT @@ROWCOUNT AS affected_rows;
END
GO

-- =============================================
-- Check User Role
-- =============================================
CREATE OR ALTER PROCEDURE sp_HasRole
    @UserId UNIQUEIDENTIFIER,
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

-- =============================================
-- Add User Role
-- =============================================
CREATE OR ALTER PROCEDURE sp_AddUserRole
    @UserId UNIQUEIDENTIFIER,
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

PRINT 'Authentication Stored Procedures Created Successfully!';
GO
