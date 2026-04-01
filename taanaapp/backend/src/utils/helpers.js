import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TC-${timestamp}-${random}`;
};

/**
 * Generate a unique SKU
 */
export const generateSKU = (prefix = 'SKU') => {
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Sanitize object by removing undefined/null values
 */
export const sanitizeObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  );
};

/**
 * Paginate results
 */
export const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: Math.min(limit, 100) };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Async handler wrapper for controllers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate discount
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return originalPrice;
  return originalPrice - (originalPrice * discountPercent) / 100;
};

/**
 * Slugify string
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default {
  generateOrderNumber,
  generateSKU,
  sanitizeObject,
  paginate,
  buildPaginationMeta,
  asyncHandler,
  formatCurrency,
  calculateDiscount,
  slugify,
};
