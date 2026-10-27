import { Router } from 'express';
import ordersController from './orders.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new food delivery order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Order placed
 */
router.post('/', asyncHandler(ordersController.create));

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List customer orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User order history
 */
router.get('/', asyncHandler(ordersController.listMyOrders));

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order details by ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', asyncHandler(ordersController.getById));

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (Owner, Partner, Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authorize(ROLES.RESTAURANT_OWNER, ROLES.DELIVERY_PARTNER, ROLES.ADMIN),
  asyncHandler(ordersController.updateStatus)
);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an existing order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post('/:id/cancel', asyncHandler(ordersController.cancel));

export default router;
