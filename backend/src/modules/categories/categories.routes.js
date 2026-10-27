import { Router } from 'express';
import categoriesController from './categories.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all food categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', asyncHandler(categoriesController.list));

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create food category (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(categoriesController.create)
);

export default router;
