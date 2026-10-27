import { Router } from 'express';
import cartsController from './carts.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /carts:
 *   get:
 *     tags: [Carts]
 *     summary: Retrieve current user shopping cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details with server-computed totals
 */
router.get('/', asyncHandler(cartsController.getCart));

/**
 * @openapi
 * /carts/items:
 *   post:
 *     tags: [Carts]
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item added
 */
router.post('/items', asyncHandler(cartsController.addItem));

/**
 * @openapi
 * /carts/items/{menuItemId}:
 *   delete:
 *     tags: [Carts]
 *     summary: Remove item from cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/items/:menuItemId', asyncHandler(cartsController.removeItem));

/**
 * @openapi
 * /carts:
 *   delete:
 *     tags: [Carts]
 *     summary: Clear shopping cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/', asyncHandler(cartsController.clearCart));

export default router;
