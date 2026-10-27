import { Router } from 'express';
import adminController from './admin.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all platform users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', asyncHandler(adminController.listUsers));

/**
 * @openapi
 * /admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user account status (e.g. SUSPENDED)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/users/:id/status', asyncHandler(adminController.updateUserStatus));

/**
 * @openapi
 * /admin/system:
 *   get:
 *     tags: [Admin]
 *     summary: Get system diagnostic statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnostic stats
 */
router.get('/system', asyncHandler(adminController.getSystemStats));

export default router;
