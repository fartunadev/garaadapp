import reviewService from '../services/reviewService.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 * @access  Private
 */
export const create = asyncHandler(async (req, res) => {
  const result = await reviewService.create(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Review submitted successfully',
    data: result,
  });
});

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
export const getByProductId = asyncHandler(async (req, res) => {
  const result = await reviewService.getByProductId(req.params.productId, req.query);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   GET /api/v1/reviews/product/:productId/stats
 * @desc    Get review statistics for a product
 * @access  Public
 */
export const getProductStats = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductStats(req.params.productId);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getUserReviews(req.user.id, req.query);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews (admin)
 * @access  Private (Admin)
 */
export const getAll = asyncHandler(async (req, res) => {
  const result = await reviewService.getAll(req.query);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 * @access  Private
 */
export const update = asyncHandler(async (req, res) => {
  const result = await reviewService.update(req.params.id, req.user.id, req.body);

  res.json({
    status: 'success',
    message: 'Review updated successfully',
    data: result,
  });
});

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
export const remove = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const result = await reviewService.delete(req.params.id, req.user.id, isAdmin);

  res.json({
    status: 'success',
    ...result,
  });
});

/**
 * @route   POST /api/v1/reviews/:id/approve
 * @desc    Approve review (admin)
 * @access  Private (Admin)
 */
export const approve = asyncHandler(async (req, res) => {
  const result = await reviewService.approve(req.params.id);

  res.json({
    status: 'success',
    message: 'Review approved successfully',
    data: result,
  });
});

/**
 * @route   POST /api/v1/reviews/:id/reject
 * @desc    Reject review (admin)
 * @access  Private (Admin)
 */
export const reject = asyncHandler(async (req, res) => {
  const result = await reviewService.reject(req.params.id);

  res.json({
    status: 'success',
    message: 'Review rejected successfully',
    data: result,
  });
});

export default {
  create,
  getByProductId,
  getProductStats,
  getMyReviews,
  getAll,
  update,
  remove,
  approve,
  reject,
};
