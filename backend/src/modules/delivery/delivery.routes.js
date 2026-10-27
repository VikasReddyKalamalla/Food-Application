import { Router } from 'express';
import deliveryController from './delivery.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /delivery/{orderId}/assign:
 *   post:
 *     tags: [Delivery]
 *     summary: Assign delivery partner to order (Admin / Dispatcher)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner assigned
 */
router.post(
  '/:orderId/assign',
  authorize(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  asyncHandler(deliveryController.assign)
);

/**
 * @openapi
 * /delivery/{orderId}/location:
 *   patch:
 *     tags: [Delivery]
 *     summary: Update delivery driver real-time GPS location
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Location broadcasted
 */
router.patch(
  '/:orderId/location',
  authorize(ROLES.DELIVERY_PARTNER),
  asyncHandler(deliveryController.updateLocation)
);

/**
 * @openapi
 * /delivery/{orderId}/status:
 *   patch:
 *     tags: [Delivery]
 *     summary: Update delivery progress status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:orderId/status',
  authorize(ROLES.DELIVERY_PARTNER),
  asyncHandler(deliveryController.updateStatus)
);

export default router;
