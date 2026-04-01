import { Router } from 'express';
import rolesController from '../controllers/rolesController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', rolesController.getPermissions);
router.post('/', rolesController.upsertPermission);
router.get('/users', rolesController.getRoleUsers);

export default router;
