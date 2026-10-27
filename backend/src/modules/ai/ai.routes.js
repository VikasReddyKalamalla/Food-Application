import { Router } from 'express';
import aiController from './ai.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/authenticate.middleware.js';
import { authorize } from '../../common/middleware/authorize.middleware.js';
import { ROLES } from '../../common/constants/roles.js';
import { asyncHandler } from '../../common/utils/async-handler.util.js';
import {
  aiSearchSchema,
  aiChatSchema,
  aiFaqSchema,
  aiRecommendationsSchema,
} from './ai.validation.js';

const router = Router();

/**
 * @openapi
 * /ai/search:
 *   post:
 *     tags: [AI]
 *     summary: Natural-language food and cuisine intent search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: 'Spicy vegan pizza under 20 dollars' }
 *     responses:
 *       200:
 *         description: Parsed search intent and matched restaurants
 */
router.post(
  '/search',
  validate({ body: aiSearchSchema }),
  asyncHandler(aiController.search)
);

/**
 * @openapi
 * /ai/recommendations:
 *   post:
 *     tags: [AI]
 *     summary: Generate personalized food recommendations
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuisine: { type: string }
 *     responses:
 *       200:
 *         description: Recommended dishes
 */
router.post(
  '/recommendations',
  validate({ body: aiRecommendationsSchema }),
  asyncHandler(aiController.recommendations)
);

/**
 * @openapi
 * /ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: Conversational food ordering assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messages]
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant, system] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: Assistant reply and optional confirmation proposal
 */
router.post(
  '/chat',
  validate({ body: aiChatSchema }),
  asyncHandler(aiController.chat)
);

/**
 * @openapi
 * /ai/faq:
 *   post:
 *     tags: [AI]
 *     summary: Ask order-related FAQ question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question: { type: string, example: 'How do I cancel an order?' }
 *     responses:
 *       200:
 *         description: Verified FAQ answer
 */
router.post(
  '/faq',
  validate({ body: aiFaqSchema }),
  asyncHandler(aiController.faq)
);

/**
 * @openapi
 * /ai/insights/{restaurantId}:
 *   get:
 *     tags: [AI]
 *     summary: Get AI business analytics and insights (Owner/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business optimization insights
 */
router.get(
  '/insights/:restaurantId',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  asyncHandler(aiController.insights)
);

export default router;
