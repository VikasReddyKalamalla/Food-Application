import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import env from './env.js';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Food Delivery Platform API',
    version: '1.0.0',
    description: `
# Production Food Delivery Platform API
Enterprise-ready REST API foundation with AI integration, real-time tracking, role-based authorization, and strict invariants.

### Authentication
- **Access Token**: Short-lived JWT Bearer token passed in the \`Authorization: Bearer <token>\` header.
- **Refresh Token**: Stored in a secure, HttpOnly cookie or transmitted via the refresh endpoint.

### Role Model
- \`CUSTOMER\`: Browse menus, order food, track deliveries, submit reviews.
- \`RESTAURANT_OWNER\`: Manage restaurant info, categories, menu items, incoming orders.
- \`DELIVERY_PARTNER\`: Accept deliveries, update real-time delivery status and location.
- \`ADMIN\`: Platform-wide governance, dispute resolution, analytics, user management.
    `,
    contact: {
      name: 'Backend Architecture Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'Local Development Server (/api/v1)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token as `Bearer <token>`',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly cookie for token refresh rotation',
      },
    },
    schemas: {
      StandardSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 100 },
              totalPages: { type: 'integer', example: 5 },
            },
          },
        },
      },
      StandardErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Descriptive, safe error message' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'healthy' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', example: 120.45 },
          environment: { type: 'string', example: 'development' },
        },
      },
      ReadyResponse: {
        type: 'object',
        properties: {
          ready: { type: 'boolean', example: true },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'connected' },
              isHealthy: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'System', description: 'Health and readiness probes' },
    { name: 'Auth', description: 'Authentication, registration, and token rotation' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Addresses', description: 'Customer delivery addresses' },
    { name: 'Restaurants', description: 'Restaurant discovery and management' },
    { name: 'Categories', description: 'Food categories' },
    { name: 'Menu Items', description: 'Dishes, pricing, and availability' },
    { name: 'Carts', description: 'Shopping cart and checkout pricing calculation' },
    { name: 'Coupons', description: 'Promotions, validation, and discounts' },
    { name: 'Orders', description: 'Order lifecycle, invariants, and tracking' },
    { name: 'Payments', description: 'Payment processing, webhooks, and refunds' },
    { name: 'Delivery', description: 'Delivery partner assignment and telemetry' },
    { name: 'Reviews', description: 'Customer ratings and feedback' },
    { name: 'Notifications', description: 'In-app and push notifications' },
    { name: 'AI', description: 'AI recommendations, natural language search, ordering assistant' },
    { name: 'Analytics', description: 'Business metrics and performance analytics' },
    { name: 'Admin', description: 'Platform administration and governance' },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.js', './src/app.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'Food Delivery Platform API Docs',
    })
  );
};

export default setupSwagger;
