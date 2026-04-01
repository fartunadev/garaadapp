import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/security.js';
import { validate, authSchemas, userSchemas } from '../validators/index.js';

const router = Router();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validate(authSchemas.register),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(authSchemas.login),
  authController.login
);

router.post(
  '/refresh',
  validate(authSchemas.refreshToken),
  authController.refreshToken
);
// Add this to authRoutes.js
router.get('/', (req, res) => {
  res.json({ message: 'Auth endpoint is active' });
});
// Protected routes (attach `authenticate` per-route to avoid running it for unmatched public paths)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(userSchemas.updateProfile), authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);

// Admin: user management
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.get('/users/:id', authenticate, authorize('admin'), authController.getUserById);
router.put('/users/:id/role', authenticate, authorize('admin'), authController.updateUserRole);
router.put('/users/:id/status', authenticate, authorize('admin'), authController.toggleUserStatus);

// Addresses (authenticated user)
router.get('/addresses', authenticate, authController.getAddresses);
router.post('/addresses', authenticate, authController.addAddress);
router.put('/addresses/:id', authenticate, authController.updateAddress);
router.delete('/addresses/:id', authenticate, authController.deleteAddress);

export default router;
