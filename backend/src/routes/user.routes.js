import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

// Admin-only user management
router.get('/', authorizeRoles(ROLES.ADMIN), UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.patch('/:id/status', authorizeRoles(ROLES.ADMIN), UserController.updateUserStatus);

export default router;

