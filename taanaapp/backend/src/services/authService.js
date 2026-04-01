import bcrypt from 'bcrypt';
import { executeStoredProcedure } from '../config/database.js';
import { generateTokens } from '../middleware/auth.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import sellerService from './sellerService.js';

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, password, fullName, phone }) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

    try {
      const result = await executeStoredProcedure('sp_RegisterUser', {
        Email: email,
        PasswordHash: passwordHash,
        FullName: fullName,
        Phone: phone || null,
      });

      if (!result.recordset || result.recordset.length === 0) {
        throw ApiError.internal('Failed to create user account');
      }

      const user = result.recordset[0];

      // Generate tokens
      const tokens = generateTokens(user.id, user.role);

      logger.info(`New user registered: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          profileType: user.profile_type || 'customer',
          avatarUrl: user.avatar_url,
        },
        ...tokens,
      };
    } catch (error) {
      if (error.message.includes('Email already exists')) {
        throw ApiError.conflict('Email already registered');
      }
      logger.error('Registration error:', error);
      throw ApiError.internal('Failed to create user account');
    }

  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Get user by email
    const result = await executeStoredProcedure('sp_LoginUser', {
      Email: email,
    });

    if (!result.recordset || result.recordset.length === 0) {
      logger.warn(`Failed login attempt for: ${email}`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    const user = result.recordset[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || user.PasswordHash);
    if (!isValidPassword) {
      logger.warn(`Failed login attempt for: ${email}`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Update last login
    await executeStoredProcedure('sp_UpdateLastLogin', {
      UserId: user.id,
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Save refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);
    await executeStoredProcedure('sp_SaveRefreshToken', {
      UserId: user.id,
      Token: tokens.refreshToken,
      ExpiresAt: refreshExpiry,
    });

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        profileType: user.profile_type || 'customer',
        avatarUrl: user.avatar_url,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    // Validate refresh token in database
    const result = await executeStoredProcedure('sp_ValidateRefreshToken', {
      Token: refreshToken,
    });

    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenData = result.recordset[0];

    if (!tokenData.is_active) {
      throw ApiError.unauthorized('User account is deactivated');
    }

    // Generate new tokens
    const tokens = generateTokens(tokenData.user_id, tokenData.role);

    // Save new refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);
    await executeStoredProcedure('sp_SaveRefreshToken', {
      UserId: tokenData.user_id,
      Token: tokens.refreshToken,
      ExpiresAt: refreshExpiry,
    });

    // Revoke old refresh token
    await executeStoredProcedure('sp_RevokeRefreshToken', {
      Token: refreshToken,
    });

    return tokens;
  }

  /**
   * Logout user
   */
  async logout(userId, refreshToken) {
    // Revoke refresh token if provided
    if (refreshToken) {
      await executeStoredProcedure('sp_RevokeRefreshToken', {
        Token: refreshToken,
      });
    } else {
      // Revoke all tokens for user
      await executeStoredProcedure('sp_RevokeAllUserTokens', {
        UserId: userId,
      });
    }

    logger.info(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const result = await executeStoredProcedure('sp_GetUserById', {
      UserId: userId,
    });

    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.notFound('User not found');
    }

    const user = result.recordset[0];

    const profile = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      profileType: user.profile_type || 'customer',
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      avatarUrl: user.avatar_url,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };

    if (user.role === 'seller') {
      try {
        const sellerProfile = await sellerService.getByUserId(userId);
        profile.seller = sellerProfile;
      } catch (err) {
        logger.warn(`Seller profile not found for user ${userId}`);
      }
    }

    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const result = await executeStoredProcedure('sp_UpdateUserProfile', {
      UserId: userId,
      FullName: data.fullName,
      Phone: data.phone,
      AvatarUrl: data.avatarUrl,
      Address: data.address,
      City: data.city,
      Country: data.country,
    });

    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.internal('Failed to update profile');
    }

    const user = result.recordset[0];

    logger.info(`Profile updated for user: ${userId}`);

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      profileType: user.profile_type || 'customer',
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      avatarUrl: user.avatar_url,
      role: user.role,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    // Get user with current password hash
    const userResult = await executeStoredProcedure('sp_GetUserById', {
      UserId: userId,
    });

    if (!userResult.recordset || userResult.recordset.length === 0) {
      throw ApiError.notFound('User not found');
    }

    // Get password hash
    const emailResult = await executeStoredProcedure('sp_GetUserByEmail', {
      Email: userResult.recordset[0].email,
    });

    if (!emailResult.recordset || emailResult.recordset.length === 0) {
      throw ApiError.notFound('User not found');
    }

    const user = emailResult.recordset[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

    // Update password
    await executeStoredProcedure('sp_UpdatePassword', {
      UserId: userId,
      NewPasswordHash: newPasswordHash,
    });

    // Revoke all refresh tokens
    await executeStoredProcedure('sp_RevokeAllUserTokens', {
      UserId: userId,
    });

    logger.info(`Password changed for user: ${userId}`);
    return { message: 'Password changed successfully' };
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId, role) {
    const result = await executeStoredProcedure('sp_HasRole', {
      UserId: userId,
      Role: role,
    });

    return result.recordset[0]?.has_role === 1;
  }

  /**
   * Get all users (admin)
   */
  async getAllUsers({ page = 1, limit = 20, search, role, isActive } = {}) {
    const { executeQuery } = await import('../config/database.js');
    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Math.min(Number.parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = { Limit: limitNum, Offset: offset };

    if (search) {
      whereClause += ` AND (u.email LIKE '%' + @Search + '%' OR p.full_name LIKE '%' + @Search + '%')`;
      params.Search = search;
    }
    if (role) {
      whereClause += ` AND ur.role = @Role`;
      params.Role = role;
    }
    if (isActive !== undefined) {
      whereClause += ` AND u.is_active = @IsActive`;
      params.IsActive = isActive ? 1 : 0;
    }

    const usersResult = await executeQuery(`
      WITH ranked AS (
         SELECT u.id, u.email, u.is_active, u.created_at, u.last_login,
           p.full_name, p.profile_type, p.phone, p.avatar_url, p.city, p.country,
               ISNULL(ur.role, 'user') AS role,
               ROW_NUMBER() OVER (
                 PARTITION BY u.id
                 ORDER BY CASE ISNULL(ur.role,'user')
                   WHEN 'admin' THEN 1 WHEN 'moderator' THEN 2
                   WHEN 'seller' THEN 3 ELSE 4 END
               ) AS rn
        FROM dbo.users u
        LEFT JOIN dbo.profiles p ON u.id = p.user_id
        LEFT JOIN dbo.user_roles ur ON u.id = ur.user_id
        ${whereClause}
      )
            SELECT id, email, is_active, created_at, last_login,
              full_name, profile_type, phone, avatar_url, city, country, role
      FROM ranked
      WHERE rn = 1
      ORDER BY created_at DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `, params);

    const countResult = await executeQuery(`
      SELECT COUNT(DISTINCT u.id) AS total
      FROM dbo.users u
      LEFT JOIN dbo.profiles p ON u.id = p.user_id
      LEFT JOIN dbo.user_roles ur ON u.id = ur.user_id
      ${whereClause}
    `, search ? { Search: search } : (role ? { Role: role } : {}));

    return {
      data: usersResult.recordset || [],
      meta: {
        total: countResult.recordset[0]?.total || 0,
        page,
        limit,
      },
    };
  }

  /**
   * Get single user by ID (admin)
   */
  async getUserById(userId) {
    const { executeQuery } = await import('../config/database.js');
    const result = await executeQuery(`
            SELECT u.id, u.email, u.is_active, u.created_at, u.last_login,
              p.full_name, p.profile_type, p.phone, p.avatar_url, p.address, p.city, p.country,
              ISNULL(ur.role, 'user') AS role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = @UserId
    `, { UserId: userId });

    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.notFound('User not found');
    }
    return result.recordset[0];
  }

  /**
   * Update user role (admin)
   */
  async updateUserRole(userId, role) {
    const { executeQuery } = await import('../config/database.js');
    // Add the role for the user if it doesn't already exist. Do NOT overwrite other roles.
    await executeQuery(`
      IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = @UserId AND role = @Role)
        INSERT INTO user_roles (user_id, role, created_at) VALUES (@UserId, @Role, GETUTCDATE())
    `, { UserId: userId, Role: role });

    // If role added is 'seller', ensure a seller profile exists (idempotent)
    if (role === 'seller') {
      try {
        await sellerService.register(userId, {});
      } catch (err) {
        // Log but don't fail role update if seller profile creation has an issue
        logger.warn(`Failed to create seller profile for user ${userId}: ${err.message}`);
      }
    }

    return { message: 'Role updated successfully' };
  }

  /**
   * Toggle user active status (admin)
   */
  async toggleUserStatus(userId, isActive) {
    const { executeQuery } = await import('../config/database.js');
    await executeQuery(`
      UPDATE users SET is_active = @IsActive WHERE id = @UserId
    `, { UserId: userId, IsActive: isActive ? 1 : 0 });

    return { message: `User ${isActive ? 'activated' : 'suspended'} successfully` };
  }

  /**
   * Get user addresses
   */
  async getAddresses(userId) {
    const { executeQuery } = await import('../config/database.js');
    const result = await executeQuery(`
      SELECT * FROM addresses WHERE user_id = @UserId ORDER BY is_default DESC, created_at DESC
    `, { UserId: userId });
    return result.recordset || [];
  }

  /**
   * Add address
   */
  async addAddress(userId, data) {
    const { executeQuery } = await import('../config/database.js');
    // If is_default, unset existing defaults
    if (data.isDefault) {
      await executeQuery(`UPDATE addresses SET is_default = 0 WHERE user_id = @UserId`, { UserId: userId });
    }
    const result = await executeQuery(`
      INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, label, is_default)
      OUTPUT inserted.*
      VALUES (@UserId, @FullName, @Phone, @AddressLine1, @AddressLine2, @City, @State, @PostalCode, @Country, @Label, @IsDefault)
    `, {
      UserId: userId,
      FullName: data.fullName || null,
      Phone: data.phone || null,
      AddressLine1: data.addressLine1,
      AddressLine2: data.addressLine2 || null,
      City: data.city,
      State: data.state || null,
      PostalCode: data.postalCode || null,
      Country: data.country,
      Label: data.label || 'home',
      IsDefault: data.isDefault ? 1 : 0,
    });
    return result.recordset[0];
  }

  /**
   * Update address
   */
  async updateAddress(addressId, userId, data) {
    const { executeQuery } = await import('../config/database.js');
    if (data.isDefault) {
      await executeQuery(`UPDATE addresses SET is_default = 0 WHERE user_id = @UserId`, { UserId: userId });
    }
    const result = await executeQuery(`
      UPDATE addresses SET
        full_name = ISNULL(@FullName, full_name),
        phone = ISNULL(@Phone, phone),
        address_line1 = ISNULL(@AddressLine1, address_line1),
        address_line2 = @AddressLine2,
        city = ISNULL(@City, city),
        state = @State,
        postal_code = @PostalCode,
        country = ISNULL(@Country, country),
        label = ISNULL(@Label, label),
        is_default = ISNULL(@IsDefault, is_default),
        updated_at = GETUTCDATE()
      OUTPUT inserted.*
      WHERE id = @AddressId AND user_id = @UserId
    `, {
      AddressId: addressId,
      UserId: userId,
      FullName: data.fullName || null,
      Phone: data.phone || null,
      AddressLine1: data.addressLine1 || null,
      AddressLine2: data.addressLine2 || null,
      City: data.city || null,
      State: data.state || null,
      PostalCode: data.postalCode || null,
      Country: data.country || null,
      Label: data.label || null,
      IsDefault: data.isDefault !== undefined ? (data.isDefault ? 1 : 0) : null,
    });
    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.notFound('Address not found');
    }
    return result.recordset[0];
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId, userId) {
    const { executeQuery } = await import('../config/database.js');
    await executeQuery(`
      DELETE FROM addresses WHERE id = @AddressId AND user_id = @UserId
    `, { AddressId: addressId, UserId: userId });
    return { message: 'Address deleted successfully' };
  }
}

export default new AuthService();
