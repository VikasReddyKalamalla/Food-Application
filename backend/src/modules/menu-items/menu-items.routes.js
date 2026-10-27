import { Router } from 'express';
import menuItemsController from './menu-items.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /menu-items/restaurant/{restaurantId}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get menu items for a specific restaurant
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of restaurant dishes
 */
router.get('/restaurant/:restaurantId', asyncHandler(menuItemsController.listByRestaurant));

/**
 * @openapi
 * /menu-items/{id}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get single menu item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dish details
 */
router.get('/:id', asyncHandler(menuItemsController.getById));

/**
 * @openapi
 * /menu-items:
 *   post:
 *     tags: [Menu Items]
 *     summary: Create menu item (Restaurant Owner/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Dish created
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(menuItemsController.create)
);

/**
 * @openapi
 * /menu-items/{id}/availability:
 *   patch:
 *     tags: [Menu Items]
 *     summary: Toggle dish availability
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.patch(
  '/:id/availability',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(menuItemsController.updateAvailability)
);

export default router;
