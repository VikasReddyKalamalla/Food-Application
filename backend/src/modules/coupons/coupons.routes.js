import { Router } from 'express';
import couponsController from './coupons.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: List active promotional coupons
 *     responses:
 *       200:
 *         description: Active coupons
 */
router.get('/', asyncHandler(couponsController.list));

/**
 * @openapi
 * /coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate coupon code against subtotal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               subtotal: { type: number }
 *     responses:
 *       200:
 *         description: Coupon validity and discount rules
 */
router.post('/validate', asyncHandler(couponsController.validate));

/**
 * @openapi
 * /coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: Create new promotional coupon (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coupon created
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(couponsController.create)
);

export default router;
