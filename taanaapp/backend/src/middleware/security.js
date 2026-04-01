import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Helmet security headers
 */

export const corsConfig = cors({
  origin: (origin, callback) => {
    // In development, allow everything to avoid white screens
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }

    const allowedOrigins = config.cors.origin ? config.cors.origin.split(',') : [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400,
});
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Added unsafe-eval for Vite
      imgSrc: ["'self'", 'data:', 'https:'],
      // Allow connection to your local backend
      connectSrc: ["'self'", "http://localhost:3001", "ws://localhost:8080"], 
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});
/**
 * HTTP Parameter Pollution protection
 */
export const hppConfig = hpp({
  whitelist: ['sort', 'filter', 'fields', 'page', 'limit'],
});

/**
 * Rate limiter configuration
 */

// Find the rateLimiter export and change max:
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { status: 'error', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// export const rateLimiter = rateLimit({
//   windowMs: config.rateLimit.windowMs,
//   max: config.rateLimit.maxRequests,
//   message: {
//     status: 'error',
//     message: 'Too many requests, please try again later',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res, next, options) => {
//     logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
//     res.status(options.statusCode).json(options.message);
//   },
//   skip: (req) => {
//     // Skip rate limiting for health checks
//     return req.path === '/health' || req.path === '/api/health';
//   },
// });

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 5 attempts
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API rate limiter for sensitive operations
 */
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts
  message: {
    status: 'error',
    message: 'Rate limit exceeded for sensitive operation',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * XSS sanitization middleware
 */
export const xssSanitize = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

/**
 * Recursive sanitization helper
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    // Note: '/' is NOT encoded — it is safe in data context and encoding it
    // corrupts URL paths like /uploads/products/file.jpg stored in the database.
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }

  return input;
};

/**
 * Request ID middleware
 */
export const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

export default {
  helmetConfig,
  corsConfig,
  hppConfig,
  rateLimiter,
  authRateLimiter,
  sensitiveRateLimiter,
  xssSanitize,
  requestId,
};
