import { Router } from 'express';
import reviewsController from './reviews.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /reviews/restaurant/{restaurantId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a restaurant
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/restaurant/:restaurantId', asyncHandler(reviewsController.listForRestaurant));

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Post a review for a completed order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', authenticate, asyncHandler(reviewsController.create));

export default router;
