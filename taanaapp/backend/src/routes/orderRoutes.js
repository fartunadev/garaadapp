import { Router } from 'express';
import orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, orderSchemas } from '../validators/index.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', validate(orderSchemas.create), orderController.create);
router.get('/my-orders', orderController.getMyOrders);
router.get('/stats', authorize('admin', 'seller'), orderController.getStats);
router.get('/:id', orderController.getById);
router.post('/:id/cancel', orderController.cancel);

// Admin/Seller routes
router.get('/', authorize('admin', 'seller'), orderController.getAll);
router.patch(
  '/:id/status',
  authorize('admin', 'seller'),
  validate(orderSchemas.updateStatus),
  orderController.updateStatus
);

export default router;
