import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import payoutRoutes from './payoutRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import messageRoutes from './messageRoutes.js';
import marketingRoutes from './marketingRoutes.js';
import rolesRoutes from './rolesRoutes.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/sellers', sellerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/payouts', payoutRoutes);
router.use('/settings', settingsRoutes);
router.use('/messages', messageRoutes);
router.use('/marketing', marketingRoutes);
router.use('/roles', rolesRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'TanaCargo API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      categories: '/api/v1/categories',
      sellers: '/api/v1/sellers',
      reviews: '/api/v1/reviews',
      payments: '/api/v1/payments',
      payouts: '/api/v1/payouts',
      settings: '/api/v1/settings',
      messages: '/api/v1/messages',
      marketing: '/api/v1/marketing',
      roles: '/api/v1/roles',
    },
  });
});

export default router;
