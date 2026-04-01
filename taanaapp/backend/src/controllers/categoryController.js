import categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
export const getAll = asyncHandler(async (req, res) => {
  const result = await categoryService.getAll();

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
export const getById = asyncHandler(async (req, res) => {
  const result = await categoryService.getById(req.params.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
export const getBySlug = asyncHandler(async (req, res) => {
  const result = await categoryService.getBySlug(req.params.slug);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private (Admin)
 */
export const create = asyncHandler(async (req, res) => {
  const result = await categoryService.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Category created successfully',
    data: result,
  });
});

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
export const update = asyncHandler(async (req, res) => {
  const result = await categoryService.update(req.params.id, req.body);

  res.json({
    status: 'success',
    message: 'Category updated successfully',
    data: result,
  });
});

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await categoryService.delete(req.params.id);

  res.json({
    status: 'success',
    ...result,
  });
});

/**
 * @route   GET /api/v1/categories/:id/subcategories
 * @desc    Get subcategories for a category
 * @access  Public
 */
export const getSubcategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getSubcategories(req.params.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   POST /api/v1/categories/:id/subcategories
 * @desc    Create a subcategory
 * @access  Private (Admin)
 */
export const createSubcategory = asyncHandler(async (req, res) => {
  const result = await categoryService.createSubcategory(req.params.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Subcategory created successfully',
    data: result,
  });
});

/**
 * @route   PUT /api/v1/subcategories/:id
 * @desc    Update subcategory
 * @access  Private (Admin)
 */
export const updateSubcategory = asyncHandler(async (req, res) => {
  const result = await categoryService.updateSubcategory(req.params.id, req.body);

  res.json({
    status: 'success',
    message: 'Subcategory updated successfully',
    data: result,
  });
});

/**
 * @route   DELETE /api/v1/subcategories/:id
 * @desc    Delete subcategory
 * @access  Private (Admin)
 */
export const deleteSubcategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteSubcategory(req.params.id);

  res.json({
    status: 'success',
    ...result,
  });
});

export default {
  getAll,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
