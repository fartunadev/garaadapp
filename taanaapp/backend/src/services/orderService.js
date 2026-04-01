import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { generateOrderNumber, paginate, buildPaginationMeta } from '../utils/helpers.js';
import productService from './productService.js';
import logger from '../utils/logger.js';

class OrderService {
  /**
   * Create a new order
   */
  async create(userId, orderData) {
    const {
      items,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingPhone,
      paymentMethod,
      notes,
    } = orderData;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];
    const sellerIds = new Set();

    for (const item of items) {
      const product = await productService.getById(item.productId);

      if (!product) {
        throw ApiError.badRequest(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for: ${product.name}`);
      }

      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        price: itemPrice,
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
        total: itemTotal,
      });
      if (product.seller_id) sellerIds.add(product.seller_id);
    }

    const shippingCost = this.calculateShippingCost(subtotal, shippingCountry);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shippingCost + tax;
    const orderNumber = generateOrderNumber();

    // Determine seller_id for the order: set if all items belong to same seller
    const sellerId = sellerIds.size === 1 ? Array.from(sellerIds)[0] : null;

    // Create order
    const orderRes = await executeQuery(
      `INSERT INTO orders (user_id, seller_id, order_number, subtotal, shipping_cost, tax, total,
        shipping_address, shipping_city, shipping_country, shipping_phone,
        payment_method, payment_status, status, notes, created_at, updated_at)
       OUTPUT inserted.*
       VALUES (@userId, @SellerId, @orderNumber, @subtotal, @shippingCost, @tax, @total,
        @shippingAddress, @shippingCity, @shippingCountry, @shippingPhone,
        @paymentMethod, 'pending', 'pending', @notes, GETUTCDATE(), GETUTCDATE())`,
      {
        userId,
        SellerId: sellerId,
        orderNumber,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress: shippingAddress || null,
        shippingCity: shippingCity || null,
        shippingCountry: shippingCountry || null,
        shippingPhone: shippingPhone || null,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        notes: notes || null,
      }
    );

    const order = orderRes.recordset && orderRes.recordset[0];
    if (!order) {
      throw ApiError.internal('Failed to create order');
    }

    // Create order items
    for (const item of orderItems) {
      await executeQuery(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image,
          price, quantity, color, size, total, created_at)
         VALUES (@orderId, @productId, @productName, @productImage,
          @price, @quantity, @color, @size, @itemTotal, GETUTCDATE())`,
        {
          orderId: order.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image || null,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          itemTotal: item.total,
        }
      );
    }

    // Update product stock
    for (const item of items) {
      await productService.updateStock(item.productId, item.quantity, 'decrease');
    }

    // Create initial status history
    await this.addStatusHistory(order.id, 'pending', 'Order placed');

    logger.info(`Order created: ${order.order_number}`);

    return this.getById(order.id);
  }

  /**
   * Get order by ID
   */
  async getById(id, userId = null) {
    let sql = 'SELECT * FROM orders WHERE id = @id';
    const params = { id };

    if (userId) {
      sql += ' AND user_id = @userId';
      params.userId = userId;
    }

    const orderRes = await executeQuery(sql, params);
    const order = orderRes.recordset && orderRes.recordset[0];

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Attach order items
    const itemsRes = await executeQuery('SELECT * FROM order_items WHERE order_id = @id', { id });
    order.order_items = itemsRes.recordset || [];

    // Attach status history
    const historyRes = await executeQuery(
      'SELECT * FROM order_status_history WHERE order_id = @id ORDER BY created_at ASC',
      { id }
    );
    order.order_status_history = historyRes.recordset || [];

    return order;
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const { offset, limit: pageLimit } = paginate(page, limit);

    let sql = 'SELECT * FROM orders WHERE user_id = @userId';
    const params = { userId };

    if (status) {
      sql += ' AND status = @status';
      params.status = status;
    }

    sql += ' ORDER BY created_at DESC';
    sql += ` OFFSET ${offset} ROWS FETCH NEXT ${pageLimit} ROWS ONLY`;

    const res = await executeQuery(sql, params);
    const data = res.recordset || [];

    // Get total count
    let countSql = 'SELECT COUNT(*) AS total FROM orders WHERE user_id = @userId';
    if (status) countSql += ' AND status = @status';
    const countRes = await executeQuery(countSql, params);
    const count = countRes.recordset[0]?.total || 0;

    // Attach order items for each order
    for (const order of data) {
      const itemsRes = await executeQuery('SELECT * FROM order_items WHERE order_id = @id', { id: order.id });
      order.order_items = itemsRes.recordset || [];
    }

    return {
      data,
      meta: buildPaginationMeta(count, page, pageLimit),
    };
  }

  /**
   * Get all orders (admin)
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, status, search, sellerId } = options;
    const { offset, limit: pageLimit } = paginate(page, limit);

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = {};

    if (status) {
      sql += ' AND status = @status';
      params.status = status;
    }

    if (sellerId) {
      sql += ' AND seller_id = @sellerId';
      params.sellerId = sellerId;
    }

    if (search) {
      sql += ' AND (order_number LIKE @search OR shipping_phone LIKE @search)';
      params.search = `%${search}%`;
    }

    let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS total');
    const countRes = await executeQuery(countSql, params);
    const count = countRes.recordset[0]?.total || 0;

    sql += ' ORDER BY created_at DESC';
    sql += ` OFFSET ${offset} ROWS FETCH NEXT ${pageLimit} ROWS ONLY`;

    const res = await executeQuery(sql, params);
    const data = res.recordset || [];

    // Attach order items for each order
    for (const order of data) {
      const itemsRes = await executeQuery('SELECT * FROM order_items WHERE order_id = @id', { id: order.id });
      order.order_items = itemsRes.recordset || [];
    }

    return {
      data,
      meta: buildPaginationMeta(count, page, pageLimit),
    };
  }

  /**
   * Update order status
   */
  async updateStatus(id, status, notes = null) {
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest('Invalid order status');
    }

    const res = await executeQuery(
      `UPDATE orders SET status = @status, updated_at = GETUTCDATE()
       OUTPUT inserted.*
       WHERE id = @id`,
      { id, status }
    );

    const order = res.recordset && res.recordset[0];
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    await this.addStatusHistory(id, status, notes);

    if (status === 'cancelled') {
      await this.restoreOrderStock(id);
    }

    logger.info(`Order ${id} status updated to: ${status}`);

    return order;
  }

  /**
   * Add status history entry
   */
  async addStatusHistory(orderId, status, notes = null) {
    await executeQuery(
      `INSERT INTO order_status_history (order_id, status, notes, created_at)
       VALUES (@orderId, @status, @notes, GETUTCDATE())`,
      { orderId, status, notes }
    );
  }

  /**
   * Restore stock for cancelled order
   */
  async restoreOrderStock(orderId) {
    const res = await executeQuery(
      'SELECT product_id, quantity FROM order_items WHERE order_id = @orderId',
      { orderId }
    );
    const items = res.recordset || [];

    for (const item of items) {
      await productService.updateStock(item.product_id, item.quantity, 'increase');
    }
  }

  /**
   * Calculate shipping cost
   */
  calculateShippingCost(subtotal, country) {
    if (subtotal >= 100) return 0;

    const rates = {
      US: 5.99,
      CA: 9.99,
      UK: 12.99,
      EU: 14.99,
      default: 19.99,
    };

    return rates[country] || rates.default;
  }

  /**
   * Calculate tax
   */
  calculateTax(subtotal, rate = 0.08) {
    return Math.round(subtotal * rate * 100) / 100;
  }

  /**
   * Get order statistics
   */
  async getStats(sellerId = null) {
    let sql = 'SELECT status, total FROM orders WHERE 1=1';
    const params = {};

    if (sellerId) {
      sql += ' AND seller_id = @sellerId';
      params.sellerId = sellerId;
    }

    const res = await executeQuery(sql, params);
    const data = res.recordset || [];

    const stats = {
      total: data.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    data.forEach((order) => {
      if (stats[order.status] !== undefined) {
        stats[order.status]++;
      }
      if (order.status !== 'cancelled') {
        stats.totalRevenue += order.total;
      }
    });

    return stats;
  }
}

export default new OrderService();
