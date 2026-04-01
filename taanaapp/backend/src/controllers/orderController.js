import orderService from '../services/orderService.js';
import { asyncHandler } from '../utils/helpers.js';
import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';

// Helper: get seller id for a user
const getSellerIdForUser = async (userId) => {
  const res = await executeQuery('SELECT id FROM sellers WHERE user_id = @UserId', { UserId: userId });
  return res.recordset?.[0]?.id || null;
};

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 */
export const create = asyncHandler(async (req, res) => {
  const result = await orderService.create(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: result,
  });
});

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
export const getById = asyncHandler(async (req, res) => {
  const userId = req.user.role === 'admin' ? null : req.user.id;
  // If seller, allow fetching only if order belongs to their seller_id
  if (req.user.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const order = await orderService.getById(req.params.id, null);
    if (!order || order.seller_id !== sellerId) throw ApiError.forbidden('Access denied');
    return res.json({ status: 'success', data: order });
  }

  const result = await orderService.getById(req.params.id, userId);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/orders/my-orders
 * @desc    Get current user's orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders (admin)
 * @access  Private (Admin)
 */
export const getAll = asyncHandler(async (req, res) => {
  const options = { ...req.query };
  if (req.user.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    options.sellerId = sellerId;
  }
  const result = await orderService.getAll(options);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin/Seller)
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  // If seller, ensure order belongs to them
  if (req.user.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const order = await orderService.getById(req.params.id, null);
    if (!order || order.seller_id !== sellerId) throw ApiError.forbidden('Access denied');
  }

  const result = await orderService.updateStatus(req.params.id, status, notes);

  res.json({
    status: 'success',
    message: 'Order status updated successfully',
    data: result,
  });
});

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
export const cancel = asyncHandler(async (req, res) => {
  // Users can only cancel their own orders
  if (req.user.role !== 'admin') {
    const order = await orderService.getById(req.params.id, req.user.id);
    if (order.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'Only pending orders can be cancelled',
      });
    }
  }

  const result = await orderService.updateStatus(
    req.params.id,
    'cancelled',
    req.body.reason || 'Cancelled by user'
  );

  res.json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: result,
  });
});

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private (Admin/Seller)
 */
export const getStats = asyncHandler(async (req, res) => {
  let sellerId = null;
  if (req.user.role === 'seller') {
    sellerId = await getSellerIdForUser(req.user.id);
  }
  const result = await orderService.getStats(sellerId);

  res.json({
    status: 'success',
    data: result,
  });
});

export default {
  create,
  getById,
  getMyOrders,
  getAll,
  updateStatus,
  cancel,
  getStats,
};
