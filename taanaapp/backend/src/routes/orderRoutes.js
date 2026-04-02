import { Router } from 'express';
import orderController from '../controllers/orderController.js';
import { authenticate, authorize, authorizePage } from '../middleware/auth.js';
import { validate, orderSchemas } from '../validators/index.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', validate(orderSchemas.create), orderController.create);
router.get('/my-orders', orderController.getMyOrders);
router.get('/stats', authorizePage('orders', 'can_view'), orderController.getStats);
router.get('/:id', orderController.getById);
router.post('/:id/cancel', orderController.cancel);

// Admin/Seller routes (permission-checked per-page/action)
router.get('/', authorizePage('orders', 'can_view'), orderController.getAll);
router.patch(
  '/:id/status',
  authorizePage('orders', 'can_edit'),
  validate(orderSchemas.updateStatus),
  orderController.updateStatus
);

export default router;
