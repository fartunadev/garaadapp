import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Convert non-ApiError errors to ApiError
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  // Handle Supabase errors
  if (err.code && err.message) {
    switch (err.code) {
      case '23505': // Unique violation
        return ApiError.conflict('Resource already exists');
      case '23503': // Foreign key violation
        return ApiError.badRequest('Referenced resource not found');
      case '22P02': // Invalid input syntax
        return ApiError.badRequest('Invalid input format');
      case 'PGRST116': // No rows found
        return ApiError.notFound('Resource not found');
      default:
        return ApiError.internal(err.message);
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return ApiError.badRequest('Validation failed', err.errors);
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400) {
    return ApiError.badRequest('Invalid JSON');
  }

  return ApiError.internal(err.message || 'An unexpected error occurred');
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  // Log error
  if (error.statusCode >= 500) {
    logger.error('Server error:', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      error: error.message,
      stack: config.nodeEnv === 'development' ? err.stack : undefined,
    });
  } else {
    logger.warn('Client error:', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      error: error.message,
    });
  }

  // Send error response
  const response = {
    status: error.status,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      requestId: req.requestId,
    }),
  };

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
