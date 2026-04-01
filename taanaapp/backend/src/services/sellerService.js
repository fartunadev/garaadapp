import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import logger from '../utils/logger.js';

class SellerService {
  /**
   * Register as a seller
   */
  async register(userId, data) {
    // Check if user is already a seller - return existing seller (idempotent)
    const existsRes = await executeQuery(
      'SELECT id FROM sellers WHERE user_id = @userId',
      { userId }
    );

    if (existsRes.recordset && existsRes.recordset.length > 0) {
      // return full seller profile
      return this.getByUserId(userId);
    }

    // Create seller profile
    const insertRes = await executeQuery(
      `INSERT INTO sellers (user_id, store_name, store_description, email, phone,
        address, city, country, is_active, is_verified, commission_rate, created_at, updated_at)
       OUTPUT inserted.*
       VALUES (@userId, @storeName, @storeDescription, @email, @phone,
        @address, @city, @country, 0, 0, 10, GETUTCDATE(), GETUTCDATE())`,
      {
        userId,
        storeName: data.storeName,
        storeDescription: data.storeDescription || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
      }
    );

    const seller = insertRes.recordset && insertRes.recordset[0];
    if (!seller) {
      throw ApiError.internal('Failed to register as seller');
    }

    // Add seller role to user (idempotent)
    await executeQuery(
      `IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = @userId AND role = 'seller')
         INSERT INTO user_roles (user_id, role, created_at)
         VALUES (@userId, 'seller', GETUTCDATE())`,
      { userId }
    );

    // Update profile_type to 'seller' so frontend can distinguish seller profiles
    await executeQuery(
      `UPDATE profiles SET profile_type = 'seller' WHERE user_id = @userId`,
      { userId }
    );
    // Keep existing roles (user/admin) — do not remove 'user' role so accounts can be multi-role.

    logger.info(`New seller registered: ${seller.id}`);
    return seller;
  }

  /**
   * Get seller by ID
   */
  async getById(id) {
    const res = await executeQuery('SELECT * FROM sellers WHERE id = @id', { id });
    const seller = res.recordset && res.recordset[0];

    if (!seller) {
      throw ApiError.notFound('Seller not found');
    }

    return seller;
  }

  /**
   * Get seller by user ID
   */
  async getByUserId(userId) {
    const res = await executeQuery('SELECT * FROM sellers WHERE user_id = @userId', { userId });
    const seller = res.recordset && res.recordset[0];

    if (!seller) {
      throw ApiError.notFound('Seller profile not found');
    }

    return seller;
  }

  /**
   * Get all sellers (admin)
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, isActive, isVerified, search } = options;
    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Math.min(Number.parseInt(limit, 10) || 10, 100);
    const { offset, limit: pageLimit } = paginate(pageNum, limitNum);

    let sql = 'SELECT * FROM sellers WHERE 1=1';
    const params = {};

    if (isActive !== undefined) {
      sql += ' AND is_active = @isActive';
      params.isActive = isActive ? 1 : 0;
    }

    if (isVerified !== undefined) {
      sql += ' AND is_verified = @isVerified';
      params.isVerified = isVerified ? 1 : 0;
    }

    if (search) {
      sql += ' AND (store_name LIKE @search OR email LIKE @search)';
      params.search = `%${search}%`;
    }

    let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS total');
    const countRes = await executeQuery(countSql, params);
    const count = countRes.recordset[0]?.total || 0;

    sql += ' ORDER BY created_at DESC';
    sql += ` OFFSET ${offset} ROWS FETCH NEXT ${pageLimit} ROWS ONLY`;

    const res = await executeQuery(sql, params);

    return {
      data: res.recordset || [],
      meta: buildPaginationMeta(count, page, pageLimit),
    };
  }

  /**
   * Update seller profile
   */
  async update(id, data, userId = null) {
    if (userId) {
      const checkRes = await executeQuery(
        'SELECT user_id FROM sellers WHERE id = @id',
        { id }
      );
      const seller = checkRes.recordset && checkRes.recordset[0];

      if (!seller || seller.user_id !== userId) {
        throw ApiError.forbidden('Access denied');
      }
    }

    const setClauses = [];
    const params = { id };

    if (data.storeName !== undefined) { setClauses.push('store_name = @storeName'); params.storeName = data.storeName; }
    if (data.storeDescription !== undefined) { setClauses.push('store_description = @storeDescription'); params.storeDescription = data.storeDescription; }
    if (data.email !== undefined) { setClauses.push('email = @email'); params.email = data.email; }
    if (data.phone !== undefined) { setClauses.push('phone = @phone'); params.phone = data.phone; }
    if (data.address !== undefined) { setClauses.push('address = @address'); params.address = data.address; }
    if (data.city !== undefined) { setClauses.push('city = @city'); params.city = data.city; }
    if (data.country !== undefined) { setClauses.push('country = @country'); params.country = data.country; }
    if (data.logoUrl !== undefined) { setClauses.push('logo_url = @logoUrl'); params.logoUrl = data.logoUrl; }
    if (data.bannerUrl !== undefined) { setClauses.push('banner_url = @bannerUrl'); params.bannerUrl = data.bannerUrl; }

    if (setClauses.length === 0) {
      return this.getById(id);
    }

    setClauses.push('updated_at = GETUTCDATE()');

    const res = await executeQuery(
      `UPDATE sellers SET ${setClauses.join(', ')} OUTPUT inserted.* WHERE id = @id`,
      params
    );

    const seller = res.recordset && res.recordset[0];
    if (!seller) {
      throw ApiError.internal('Failed to update seller');
    }

    logger.info(`Seller updated: ${id}`);
    return seller;
  }

  /**
   * Approve/activate seller (admin)
   */
  async approve(id) {
    const res = await executeQuery(
      `UPDATE sellers SET is_active = 1, updated_at = GETUTCDATE()
       OUTPUT inserted.*
       WHERE id = @id`,
      { id }
    );

    const seller = res.recordset && res.recordset[0];
    if (!seller) {
      throw ApiError.internal('Failed to approve seller');
    }

    logger.info(`Seller approved: ${id}`);
    return seller;
  }

  /**
   * Verify seller (admin)
   */
  async verify(id) {
    const res = await executeQuery(
      `UPDATE sellers SET is_verified = 1, updated_at = GETUTCDATE()
       OUTPUT inserted.*
       WHERE id = @id`,
      { id }
    );

    const seller = res.recordset && res.recordset[0];
    if (!seller) {
      throw ApiError.internal('Failed to verify seller');
    }

    logger.info(`Seller verified: ${id}`);
    return seller;
  }

  /**
   * Deactivate seller (admin)
   */
  async deactivate(id) {
    const res = await executeQuery(
      `UPDATE sellers SET is_active = 0, updated_at = GETUTCDATE()
       OUTPUT inserted.*
       WHERE id = @id`,
      { id }
    );

    const seller = res.recordset && res.recordset[0];
    if (!seller) {
      throw ApiError.internal('Failed to deactivate seller');
    }

    logger.info(`Seller deactivated: ${id}`);
    return seller;
  }

  /**
   * Delete seller (admin)
   */
  async remove(id) {
    const res = await executeQuery(
      'DELETE FROM sellers OUTPUT deleted.* WHERE id = @id',
      { id }
    );
    const seller = res.recordset && res.recordset[0];
    if (!seller) {
      throw ApiError.notFound('Seller not found');
    }
    logger.info(`Seller deleted: ${id}`);
    return seller;
  }

  /**
   * Get seller dashboard stats
   */
  async getDashboardStats(sellerId) {
    const sellerRes = await executeQuery(
      'SELECT total_products, total_sales, rating FROM sellers WHERE id = @sellerId',
      { sellerId }
    );
    const seller = sellerRes.recordset && sellerRes.recordset[0];

    const ordersRes = await executeQuery(
      'SELECT status, total FROM orders WHERE seller_id = @sellerId',
      { sellerId }
    );
    const orders = ordersRes.recordset || [];

    const stats = {
      totalProducts: seller?.total_products || 0,
      totalSales: seller?.total_sales || 0,
      rating: seller?.rating || 0,
      orders: {
        total: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        processing: orders.filter((o) => o.status === 'processing').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
      },
      revenue: orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0),
    };

    return stats;
  }

  /**
   * Update seller stats
   */
  async updateStats(sellerId) {
    const countRes = await executeQuery(
      'SELECT COUNT(*) AS total FROM products WHERE seller_id = @sellerId',
      { sellerId }
    );
    const productCount = countRes.recordset[0]?.total || 0;

    const salesRes = await executeQuery(
      `SELECT SUM(total) AS totalSales FROM orders
       WHERE seller_id = @sellerId AND status = 'delivered'`,
      { sellerId }
    );
    const totalSales = salesRes.recordset[0]?.totalSales || 0;

    await executeQuery(
      `UPDATE sellers SET total_products = @productCount, total_sales = @totalSales,
       updated_at = GETUTCDATE()
       WHERE id = @sellerId`,
      { sellerId, productCount, totalSales }
    );
  }
}

export default new SellerService();
