import { Router } from 'express';
import reviewController from '../controllers/reviewController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, reviewSchemas } from '../validators/index.js';

const router = Router();

// Public routes
router.get('/product/:productId', optionalAuth, reviewController.getByProductId);
router.get('/product/:productId/stats', reviewController.getProductStats);

// Protected routes
router.use(authenticate);

// User routes
router.post('/', validate(reviewSchemas.create), reviewController.create);
router.get('/my-reviews', reviewController.getMyReviews);
router.put('/:id', reviewController.update);
router.delete('/:id', reviewController.remove);

// Admin routes
router.get('/', authorize('admin'), reviewController.getAll);
router.post('/:id/approve', authorize('admin'), reviewController.approve);
router.post('/:id/reject', authorize('admin'), reviewController.reject);

export default router;
