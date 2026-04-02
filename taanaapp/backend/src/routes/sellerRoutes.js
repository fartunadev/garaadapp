import { Router } from 'express';
import sellerController from '../controllers/sellerController.js';
import { authenticate, authorize, authorizePage } from '../middleware/auth.js';
import { validate, sellerSchemas } from '../validators/index.js';

const router = Router();

// Protected routes (must be before /:id wildcard to avoid route conflicts with /me, /dashboard/stats)
router.post('/register', authenticate, validate(sellerSchemas.register), sellerController.register);
router.get('/me', authenticate, authorize('seller'), sellerController.getMe);
router.get('/dashboard/stats', authenticate, authorize('seller'), sellerController.getDashboardStats);
router.get('/', authenticate, authorize('admin'), sellerController.getAll);
router.put('/:id', authenticate, authorizePage('sellers', 'can_edit'), validate(sellerSchemas.update), sellerController.update);
router.post('/:id/approve', authenticate, authorize('admin'), sellerController.approve);
router.post('/:id/verify', authenticate, authorize('admin'), sellerController.verify);
router.post('/:id/deactivate', authenticate, authorize('admin'), sellerController.deactivate);
router.delete('/:id', authenticate, authorize('admin'), sellerController.remove);

// Public route — must be LAST so named routes above take precedence
router.get('/:id', sellerController.getById);

export default router;
