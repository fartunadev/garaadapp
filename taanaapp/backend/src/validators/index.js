import { z } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Zod validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw ApiError.badRequest('Validation failed', errors);
      }

      // Replace with validated data
      req.body = result.data.body || req.body;
      req.query = result.data.query || req.query;
      req.params = result.data.params || req.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Auth schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      phone: z.string().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),
};

// Product schemas
export const productSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().nullable().optional(),
      price: z.number().positive('Price must be positive'),
      originalPrice: z.number().positive().nullable().optional(),
      stock: z.number().int().min(0).default(0),
      categoryId: z.string().optional(),
      subcategoryId: z.string().optional(),
      imageUrl: z.string().optional(),
      colors: z.array(z.string()).optional(),
      sizes: z.array(z.string()).optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      isFlashDeal: z.boolean().default(false),
      isTrending: z.boolean().default(false),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().min(2).optional(),
      description: z.string().nullable().optional(),
      price: z.number().positive().optional(),
      originalPrice: z.number().positive().nullable().optional(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.string().nullable().optional(),
      subcategoryId: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      colors: z.array(z.string()).optional(),
      sizes: z.array(z.string()).optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      isFlashDeal: z.boolean().optional(),
      isTrending: z.boolean().optional(),
    }),
  }),

  getById: z.object({
    params: z.object({
      id: z.string(),
    }),
  }),
};

// Order schemas
export const orderSchemas = {
  create: z.object({
    body: z.object({
      items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        variantId: z.string().uuid().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
      })).min(1, 'At least one item is required'),
      shippingAddress: z.string().min(5),
      shippingCity: z.string().min(2),
      shippingCountry: z.string().min(2),
      shippingPhone: z.string().min(5),
      paymentMethod: z.enum(['cash', 'card', 'bank_transfer']),
      notes: z.string().optional(),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      id: uuidSchema,
    }),
    body: z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
      notes: z.string().optional(),
    }),
  }),
};

// Category schemas
export const categorySchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
      imageUrl: z.string().nullable().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().min(2).optional(),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
      imageUrl: z.string().nullable().optional(),
    }),
  }),
};

// Review schemas
export const reviewSchemas = {
  create: z.object({
    body: z.object({
      productId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      title: z.string().min(3).max(100).optional(),
      comment: z.string().min(10).max(1000).optional(),
      orderId: z.string().uuid().optional(),
    }),
  }),
};

// User/Profile schemas
export const userSchemas = {
  updateProfile: z.object({
    body: z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      avatarUrl: z.string().url().optional(),
    }),
  }),
};

// Seller schemas
export const sellerSchemas = {
  register: z.object({
    body: z.object({
      storeName: z.string().min(3, 'Store name must be at least 3 characters'),
      storeDescription: z.string().optional(),
      phone: z.string().min(5),
      email: z.string().email(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: uuidSchema,
    }),
    body: z.object({
      storeName: z.string().min(3).optional(),
      storeDescription: z.string().optional(),
      phone: z.string().min(5).optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      logoUrl: z.string().url().optional(),
      bannerUrl: z.string().url().optional(),
    }),
  }),
};

// Slides schemas
export const slideSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(1).optional(),
      subtitle: z.string().optional(),
      image_url: z.string().url().optional(),
      cta_text: z.string().optional(),
      cta_link: z.string().optional(),
      slide_order: z.coerce.number().int().optional(),
      is_active: z.boolean().optional(),
      animation_type: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      image_url: z.string().url().optional(),
      cta_text: z.string().optional(),
      cta_link: z.string().optional(),
      slide_order: z.coerce.number().int().optional(),
      is_active: z.boolean().optional(),
      animation_type: z.string().optional(),
    }),
  }),
};

// Address schemas
export const addressSchemas = {
  create: z.object({
    body: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(5),
      addressLine1: z.string().min(5),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(2),
      label: z.enum(['home', 'work', 'other']).optional(),
      isDefault: z.boolean().default(false),
    }),
  }),

  update: z.object({
    params: z.object({
      id: uuidSchema,
    }),
    body: z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().min(5).optional(),
      addressLine1: z.string().min(5).optional(),
      addressLine2: z.string().optional(),
      city: z.string().min(2).optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(2).optional(),
      label: z.enum(['home', 'work', 'other']).optional(),
      isDefault: z.boolean().optional(),
    }),
  }),
};

export default {
  validate,
  authSchemas,
  productSchemas,
  orderSchemas,
  categorySchemas,
  reviewSchemas,
  userSchemas,
  sellerSchemas,
  slideSchemas,
  addressSchemas,
  paginationSchema,
};
