import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import corsOptions from './config/cors.js';
import env from './config/env.js';
import { setupSwagger } from './config/swagger.js';
import { getDatabaseHealth } from './config/database.js';

import { requestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { httpLogger } from './common/middleware/logging.middleware.js';
import { apiRateLimiter } from './common/middleware/rate-limiter.middleware.js';
import { notFoundMiddleware } from './common/middleware/not-found.middleware.js';
import { errorHandlerMiddleware } from './common/middleware/error-handler.middleware.js';

// Module Routers
import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js';
import addressesRouter from './modules/addresses/addresses.routes.js';
import restaurantsRouter from './modules/restaurants/restaurants.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import menuItemsRouter from './modules/menu-items/menu-items.routes.js';
import cartsRouter from './modules/carts/carts.routes.js';
import couponsRouter from './modules/coupons/coupons.routes.js';
import ordersRouter from './modules/orders/orders.routes.js';
import paymentsRouter from './modules/payments/payments.routes.js';
import deliveryRouter from './modules/delivery/delivery.routes.js';
import reviewsRouter from './modules/reviews/reviews.routes.js';
import notificationsRouter from './modules/notifications/notifications.routes.js';
import aiRouter from './modules/ai/ai.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import adminRouter from './modules/admin/admin.routes.js';

export const createApp = () => {
  const app = express();

  // 1. Request ID Tracing (must run before logger)
  app.use(requestIdMiddleware);

  // 2. Structured Request Logging
  app.use(httpLogger);

  // 3. HTTP Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 4. Strict CORS
  app.use(cors(corsOptions));

  // 5. Response Compression
  app.use(compression());

  // 6. Cookie Parser
  app.use(cookieParser());

  // 7. Body Parsing with strict size limits
  app.use(
    express.json({
      limit: '10kb',
      verify: (req, res, buf) => {
        // Retain raw body for webhook HMAC signature verification
        if (req.originalUrl.includes('/webhook')) {
          req.rawBody = buf.toString();
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 8. Global API Rate Limiter
  app.use(apiRateLimiter);

  // 9. API Documentation
  setupSwagger(app);

  // 10. System Health & Readiness Probes
  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [System]
   *     summary: Liveness probe
   *     responses:
   *       200:
   *         description: Service is alive
   */
  app.get('/health', (req, res) => {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });

  /**
   * @openapi
   * /ready:
   *   get:
   *     tags: [System]
   *     summary: Readiness probe - verifies database connectivity
   *     responses:
   *       200:
   *         description: Service and dependencies are ready
   *       503:
   *         description: Dependency unavailable
   */
  app.get('/ready', (req, res) => {
    const dbHealth = getDatabaseHealth();

    if (!dbHealth.isHealthy) {
      return res.status(503).json({
        ready: false,
        message: 'Database is not connected or ready',
        database: dbHealth,
      });
    }

    return res.status(200).json({
      ready: true,
      message: 'All system dependencies are healthy and ready',
      database: dbHealth,
    });
  });

  // 11. Versioned REST API Routes (/api/v1)
  const apiV1Router = express.Router();
  apiV1Router.use('/auth', authRouter);
  apiV1Router.use('/users', usersRouter);
  apiV1Router.use('/addresses', addressesRouter);
  apiV1Router.use('/restaurants', restaurantsRouter);
  apiV1Router.use('/categories', categoriesRouter);
  apiV1Router.use('/menu-items', menuItemsRouter);
  apiV1Router.use('/carts', cartsRouter);
  apiV1Router.use('/coupons', couponsRouter);
  apiV1Router.use('/orders', ordersRouter);
  apiV1Router.use('/payments', paymentsRouter);
  apiV1Router.use('/delivery', deliveryRouter);
  apiV1Router.use('/reviews', reviewsRouter);
  apiV1Router.use('/notifications', notificationsRouter);
  apiV1Router.use('/ai', aiRouter);
  apiV1Router.use('/analytics', analyticsRouter);
  apiV1Router.use('/admin', adminRouter);

  app.use('/api/v1', apiV1Router);

  // 12. Catch-all 404 handler
  app.use(notFoundMiddleware);

  // 13. Centralized Error Handler (must be the final middleware)
  app.use(errorHandlerMiddleware);

  return app;
};

export const app = createApp();
export default app;
