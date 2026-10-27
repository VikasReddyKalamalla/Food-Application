import { Router } from 'express';
import restaurantsController from './restaurants.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /restaurants:
 *   get:
 *     tags: [Restaurants]
 *     summary: List restaurants with pagination and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated restaurants
 */
router.get('/', asyncHandler(restaurantsController.list));

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     tags: [Restaurants]
 *     summary: Get restaurant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restaurant details
 */
router.get('/:id', asyncHandler(restaurantsController.getById));

/**
 * @openapi
 * /restaurants:
 *   post:
 *     tags: [Restaurants]
 *     summary: Create a new restaurant (Owner/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant registered
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(restaurantsController.create)
);

/**
 * @openapi
 * /restaurants/{id}/operating-hours:
 *   patch:
 *     tags: [Restaurants]
 *     summary: Update restaurant operating hours
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hours updated
 */
router.patch(
  '/:id/operating-hours',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(restaurantsController.updateOperatingHours)
);

export default router;
