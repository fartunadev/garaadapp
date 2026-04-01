import sellerService from '../services/sellerService.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @route   POST /api/v1/sellers/register
 * @desc    Register as a seller
 * @access  Private
 */
export const register = asyncHandler(async (req, res) => {
  // Admin can pass userId in body to create a seller profile for another user
  const userId = (req.user.role === 'admin' && req.body.userId) ? req.body.userId : req.user.id;
  const result = await sellerService.register(userId, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Seller registration submitted. Awaiting approval.',
    data: result,
  });
});

/**
 * @route   GET /api/v1/sellers/me
 * @desc    Get current seller profile
 * @access  Private (Seller)
 */
export const getMe = asyncHandler(async (req, res) => {
  const result = await sellerService.getByUserId(req.user.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/sellers/:id
 * @desc    Get seller by ID
 * @access  Public
 */
export const getById = asyncHandler(async (req, res) => {
  const result = await sellerService.getById(req.params.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/sellers
 * @desc    Get all sellers (admin)
 * @access  Private (Admin)
 */
export const getAll = asyncHandler(async (req, res) => {
  const result = await sellerService.getAll(req.query);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   PUT /api/v1/sellers/:id
 * @desc    Update seller profile
 * @access  Private (Seller/Admin)
 */
export const update = asyncHandler(async (req, res) => {
  const userId = req.user.role === 'admin' ? null : req.user.id;
  const result = await sellerService.update(req.params.id, req.body, userId);

  res.json({
    status: 'success',
    message: 'Seller profile updated successfully',
    data: result,
  });
});

/**
 * @route   POST /api/v1/sellers/:id/approve
 * @desc    Approve seller (admin)
 * @access  Private (Admin)
 */
export const approve = asyncHandler(async (req, res) => {
  const result = await sellerService.approve(req.params.id);

  res.json({
    status: 'success',
    message: 'Seller approved successfully',
    data: result,
  });
});

/**
 * @route   POST /api/v1/sellers/:id/verify
 * @desc    Verify seller (admin)
 * @access  Private (Admin)
 */
export const verify = asyncHandler(async (req, res) => {
  const result = await sellerService.verify(req.params.id);

  res.json({
    status: 'success',
    message: 'Seller verified successfully',
    data: result,
  });
});

/**
 * @route   POST /api/v1/sellers/:id/deactivate
 * @desc    Deactivate seller (admin)
 * @access  Private (Admin)
 */
export const deactivate = asyncHandler(async (req, res) => {
  const result = await sellerService.deactivate(req.params.id);

  res.json({
    status: 'success',
    message: 'Seller deactivated successfully',
    data: result,
  });
});

/**
 * @route   DELETE /api/v1/sellers/:id
 * @desc    Delete seller (admin)
 * @access  Private (Admin)
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await sellerService.remove(req.params.id);

  res.json({
    status: 'success',
    message: 'Seller deleted successfully',
    data: result,
  });
});

/**
 * @route   GET /api/v1/sellers/dashboard/stats
 * @desc    Get seller dashboard stats
 * @access  Private (Seller)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const seller = await sellerService.getByUserId(req.user.id);
  const result = await sellerService.getDashboardStats(seller.id);

  res.json({
    status: 'success',
    data: result,
  });
});

export default {
  register,
  getMe,
  getById,
  getAll,
  update,
  approve,
  verify,
  deactivate,
  remove,
  getDashboardStats,
};
