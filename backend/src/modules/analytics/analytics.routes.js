import { Router } from 'express';
import analyticsController from './analytics.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /analytics/restaurant/{restaurantId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve restaurant analytics metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics data
 */
router.get(
  '/restaurant/:restaurantId',
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(analyticsController.getRestaurantMetrics)
);

/**
 * @openapi
 * /analytics/platform:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve platform wide analytics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform metrics
 */
router.get(
  '/platform',
  authorize(ROLES.ADMIN),
  asyncHandler(analyticsController.getPlatformMetrics)
);

export default router;
