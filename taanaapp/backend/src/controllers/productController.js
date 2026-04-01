import productService from '../services/productService.js';
import { executeQuery } from '../config/database.js';
import { asyncHandler } from '../utils/helpers.js';
import ApiError from '../utils/ApiError.js';

// Helper: get seller record ID from user ID
const getSellerIdForUser = async (userId) => {
  const result = await executeQuery(
    `SELECT id FROM sellers WHERE user_id = @UserId`,
    { UserId: userId }
  );
  return result.recordset?.[0]?.id || null;
};

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters
 * @access  Public
 */
export const getAll = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  // Sellers only see their own products
  if (req.user?.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    if (sellerId) query.sellerId = sellerId;
  }
  const result = await productService.getAll(query);

  res.set('X-Total-Count', result.meta.total);
  res.set('X-Page', result.meta.page);
  res.set('X-Limit', result.meta.limit);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
export const getById = asyncHandler(async (req, res) => {
  const result = await productService.getById(req.params.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin/Seller)
 */
export const create = asyncHandler(async (req, res) => {
  let sellerId = null;
  if (req.user.role === 'seller') {
    sellerId = await getSellerIdForUser(req.user.id);
  }
  const result = await productService.create(req.body, sellerId);

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: result,
  });
});

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Admin/Seller)
 */
export const update = asyncHandler(async (req, res) => {
  // If seller, ensure they own the product
  if (req.user?.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const product = await productService.getById(req.params.id);
    if (!product || product.seller_id !== sellerId) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const result = await productService.update(req.params.id, req.body);

  res.json({
    status: 'success',
    message: 'Product updated successfully',
    data: result,
  });
});

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
export const remove = asyncHandler(async (req, res) => {
  // Admins can delete any product. Sellers may delete only their own products.
  if (req.user?.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const product = await productService.getById(req.params.id);
    if (!product || product.seller_id !== sellerId) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const result = await productService.delete(req.params.id);

  res.json({
    status: 'success',
    ...result,
  });
});

/**
 * @route   GET /api/v1/products/flash-deals
 * @desc    Get flash deal products
 * @access  Public
 */
export const getFlashDeals = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const result = await productService.getFlashDeals(limit);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/products/trending
 * @desc    Get trending products
 * @access  Public
 */
export const getTrending = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const result = await productService.getTrending(limit);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products
 * @access  Public
 */
export const search = asyncHandler(async (req, res) => {
  const { q, ...options } = req.query;
  const result = await productService.search(q, options);

  res.json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @route   PATCH /api/v1/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Admin/Seller)
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation, stock } = req.body;
  // When stock is provided directly, use it as absolute set
  if (stock !== undefined) {
    // Only admin may set absolute stock; sellers must use relative update
    if (req.user?.role === 'seller') {
      throw ApiError.forbidden('Sellers cannot set absolute stock');
    }
    const result = await productService.updateStockAbsolute(req.params.id, stock);
    return res.json({ status: 'success', message: 'Stock updated successfully', data: result });
  }
  // Sellers may update stock only for their own products
  if (req.user?.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const product = await productService.getById(req.params.id);
    if (!product || product.seller_id !== sellerId) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const result = await productService.updateStock(req.params.id, quantity, operation);

  res.json({
    status: 'success',
    message: 'Stock updated successfully',
    data: result,
  });
});

export const getImages = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json({ status: 'success', data: product.product_images || [] });
});

export const addImage = asyncHandler(async (req, res) => {
  const { imageUrl, sortOrder = 0 } = req.body;
  if (!imageUrl) return res.status(400).json({ status: 'error', message: 'imageUrl is required' });
  const result = await productService.addImage(req.params.id, imageUrl, sortOrder);
  res.status(201).json({ status: 'success', data: result });
});

export const removeImage = asyncHandler(async (req, res) => {
  // Check ownership: find product_id for image
  const imageId = req.params.imageId;
  const imgRes = await executeQuery('SELECT product_id FROM product_images WHERE id = @ImageId', { ImageId: imageId });
  const productId = imgRes.recordset?.[0]?.product_id;
  if (req.user?.role === 'seller') {
    const sellerId = await getSellerIdForUser(req.user.id);
    const product = productId ? await productService.getById(productId) : null;
    if (!product || product.seller_id !== sellerId) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const result = await productService.deleteImage(req.params.imageId);
  res.json({ status: 'success', ...result });
});

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getFlashDeals,
  getTrending,
  search,
  updateStock,
  getImages,
  addImage,
  removeImage,
};
