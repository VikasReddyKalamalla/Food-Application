import { Router } from 'express';
import notificationsController from './notifications.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get in-app notifications for authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/', asyncHandler(notificationsController.list));

export default router;
