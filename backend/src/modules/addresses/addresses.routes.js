import { Router } from 'express';
import addressesController from './addresses.controller.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List customer delivery addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved addresses
 */
router.get('/', asyncHandler(addressesController.list));

/**
 * @openapi
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Add a new delivery address
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Address created
 */
router.post('/', asyncHandler(addressesController.create));

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete a saved address
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address removed
 */
router.delete('/:id', asyncHandler(addressesController.remove));

export default router;
