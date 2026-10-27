import { Router } from 'express';
import paymentsController from './payments.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Payment gateway webhook endpoint
 *     responses:
 *       200:
 *         description: Webhook acknowledged
 */
router.post('/webhook', asyncHandler(paymentsController.webhook));

/**
 * @openapi
 * /payments/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate payment transaction for an order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payment order initiated
 */
router.post('/initiate', authenticate, asyncHandler(paymentsController.initiate));

/**
 * @openapi
 * /payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Issue payment refund (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Refund initiated
 */
router.post(
  '/:id/refund',
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(paymentsController.refund)
);

export default router;
