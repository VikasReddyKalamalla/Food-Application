# 🍕 Modern Food Delivery Platform (MERN Stack + Extensible AI)

A production-oriented, scalable food delivery platform backend foundation engineered with Node.js, Express, MongoDB/Mongoose, Socket.IO, Zod, and extensible AI capabilities. Built with clean architecture, strict monetary invariants, role-based security, and automated tests.

---

## 🌟 Key Highlights

- **Modular Monolith Architecture**: High-cohesion domain modules (`auth`, `users`, `restaurants`, `menu-items`, `carts`, `coupons`, `orders`, `payments`, `delivery`, `reviews`, `notifications`, `ai`, `analytics`, `admin`).
- **Server-Authoritative Pricing & Safety Invariants**:
  - All dish prices, discounts, taxes (GST/VAT), delivery fees, and order totals are calculated exclusively by the server.
  - Zero-trust client pricing — clients cannot set prices, manipulate discounts, or override payment statuses.
  - Cart validation against live database availability and prices during checkout.
  - Idempotency support via `Idempotency-Key` UUID header to prevent duplicate charges or orders during retries.
  - Independent finite state machines for `OrderStatus` and `PaymentStatus`.
- **Enterprise Security & Defense-in-Depth**:
  - HTTP security headers with **Helmet**.
  - Strict **CORS** origin allowlisting with credential support.
  - Multi-tier **Rate Limiting** (general API throttling + strict brute-force protection on authentication).
  - Centralized **Zod** schema validation for all request parameters, query strings, headers, and bodies (mass-assignment protection).
  - High-performance structured logging (**Pino**) with automatic path redaction for passwords, tokens, cookies, and payment card details.
  - **Bcrypt** password hashing with 12 salt rounds.
  - Short-lived JWT access tokens + rotating refresh tokens with SHA-256 hash persistence.
- **Real-Time WebSocket Layer (Socket.IO)**:
  - Authenticated connections via Bearer JWT handshake.
  - Channel isolation by user (`user:<id>`) and order tracking (`order:<id>`).
  - Live order updates and delivery partner GPS telemetry broadcasts.
- **AI Service Abstraction (Gemini & Fallback Mock)**:
  - Natural-language food and cuisine intent search.
  - Dish and restaurant recommendations.
  - Conversational ordering assistant with explicit confirmation guards for consequential actions.
  - Prompt sanitization to prevent accidental credential leakage to third-party LLMs.
- **System Observability & Documentation**:
  - `/health`: Liveness probe.
  - `/ready`: Dependency readiness probe (verifies MongoDB connection).
  - `/api-docs`: Interactive OpenAPI 3.0 Swagger UI documentation.
- **Automated Test Suite**: Vitest and Supertest testing with 57/57 tests passing.

---

## 📂 Project Architecture

```
Food-Application/
├── backend/
│   ├── docs/
│   │   ├── api-contracts.md       # API payload specifications and error response formats
│   │   └── architecture.md        # Architecture overview, invariants, and state machines
│   ├── src/
│   │   ├── app.js                 # Central Express application factory
│   │   ├── server.js              # Startup, network port binding, and graceful shutdown
│   │   ├── config/
│   │   │   ├── cors.js            # CORS origin allowlist validation
│   │   │   ├── database.js        # MongoDB connection lifecycle & health monitoring
│   │   │   ├── env.js             # Zod environment variable validation
│   │   │   ├── logger.js          # Pino logger with credential redaction
│   │   │   └── swagger.js         # OpenAPI / Swagger specification & UI
│   │   ├── common/
│   │   │   ├── constants/         # Roles, order status, payment status, socket events
│   │   │   ├── errors/            # Operational AppError hierarchy
│   │   │   ├── middleware/        # Request ID, logging, validation, auth, rate limiters, 404, errors
│   │   │   ├── utils/             # Response, password, token, and async handler utilities
│   │   │   └── validators/        # Reusable pagination and identifier Zod schemas
│   │   ├── infrastructure/
│   │   │   ├── ai/                # AI provider interface, Gemini provider, and Mock provider
│   │   │   ├── email/             # Transactional email service with mock fallback
│   │   │   ├── maps/              # Geolocation, Haversine distance, and ETA calculations
│   │   │   ├── payments/          # Razorpay client & HMAC webhook signature verification
│   │   │   ├── realtime/          # Socket.IO connection & event emission engine
│   │   │   └── storage/           # Cloud asset storage interface
│   │   ├── jobs/
│   │   │   └── cleanup.job.js     # Expired session & token cleanup routine
│   │   └── modules/               # Domain business modules
│   │       ├── addresses/
│   │       ├── admin/
│   │       ├── ai/
│   │       ├── analytics/
│   │       ├── auth/
│   │       ├── carts/
│   │       ├── categories/
│   │       ├── coupons/
│   │       ├── delivery/
│   │       ├── menu-items/
│   │       ├── notifications/
│   │       ├── orders/
│   │       ├── payments/
│   │       ├── restaurants/
│   │       ├── reviews/
│   │       └── users/
│   ├── tests/
│   │   ├── setup.js               # Test environment configuration & store isolation
│   │   ├── integration/           # Integration tests (auth, RBAC, probes, CORS, errors, rate limits)
│   │   └── unit/                  # Unit tests (env, tokens, hashing, roles, AI sanitization, price engine)
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── vitest.config.js
├── .gitignore
└── README.md                      # Repository root guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (tested on LTS v22.20.0)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a MongoDB Atlas connection string.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/VikasReddyKalamalla/Food-Application.git
cd Food-Application/backend

# Install dependencies
npm install

# Setup local environment file
cp .env.example .env
```

### 3. Environment Variables
Configure `backend/.env` with your settings:

```env
# Application
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://localhost:27017/food_delivery_db
CLIENT_URL=http://localhost:3000,http://localhost:5173
LOG_LEVEL=info

# JWT Secrets (min 32 characters)
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_characters_long_example
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_characters_long_example
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Optional Integrations (Defaults to safe mock/dormant mode if blank)
AI_PROVIDER=mock
AI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
MAPS_API_KEY=
CLOUDINARY_CLOUD_NAME=
```

### 4. Running the Application
```bash
# Start in development mode (with auto-reload)
npm run dev

# Start in production mode
npm start
```

Once running:
- **API Documentation**: [http://localhost:5050/api-docs](http://localhost:5050/api-docs)
- **Health Liveness Probe**: [http://localhost:5050/health](http://localhost:5050/health)
- **Database Readiness Probe**: [http://localhost:5050/ready](http://localhost:5050/ready)

---

## 🧪 Testing

The platform includes a comprehensive test suite built with **Vitest** and **Supertest**:

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Results:**
- **16 Test Suites Passed**
- **57 Tests Passed (100%)**
- Coverage includes: Environment validation, password utilities, JWT signing/rotation, order monetary engine, state machines, AI sanitization, sensitive data redaction, liveness/readiness probes, 404 handler, centralized error responses, CORS allowlisting, RBAC security guards, and rate limiters.

---

## 📡 Core API Endpoints

### 🔐 Auth (`/api/v1/auth`)
- `POST /register`: Account registration (`CUSTOMER`, `RESTAURANT_OWNER`, `DELIVERY_PARTNER`).
- `POST /login`: Authenticate and receive JWT + HttpOnly refresh cookie.
- `POST /refresh`: Secure token rotation (invalidates previously used refresh token).
- `POST /logout`: Revoke session and clear cookies.
- `GET /me`: Get authenticated user profile (`Bearer` token required).
- `POST /forgot-password` & `POST /reset-password`: Cryptographic password reset workflow.

### 🍽️ Restaurants & Menus (`/api/v1/restaurants`, `/api/v1/menu-items`)
- `GET /restaurants`: Browse restaurants with pagination and cuisine filters.
- `GET /restaurants/:id`: Restaurant profile and operating hours.
- `POST /restaurants`: Create restaurant (Owner/Admin).
- `PATCH /restaurants/:id/operating-hours`: Update operating schedule.
- `GET /menu-items/restaurant/:restaurantId`: View restaurant menu dishes.
- `POST /menu-items`: Create menu item (Owner/Admin).
- `PATCH /menu-items/:id/availability`: Toggle dish availability.

### 🛒 Carts & Coupons (`/api/v1/carts`, `/api/v1/coupons`)
- `GET /carts`: Retrieve current user cart with server-computed subtotal, discount, taxes, and delivery fee.
- `POST /carts/items`: Add dish (enforces single-restaurant per cart constraint).
- `DELETE /carts/items/:menuItemId`: Remove dish from cart.
- `DELETE /carts`: Clear cart.
- `GET /coupons`: View active promotional coupons.
- `POST /coupons/validate`: Validate coupon code against current subtotal.

### 📦 Orders & Payments (`/api/v1/orders`, `/api/v1/payments`)
- `POST /orders`: Place order (supports `Idempotency-Key` header).
- `GET /orders`: View order history.
- `GET /orders/:id`: Detailed order breakdown.
- `PATCH /orders/:id/status`: Update status along state machine (`PENDING` -> `CONFIRMED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
- `POST /orders/:id/cancel`: Cancel order with validation.
- `POST /payments/initiate`: Initialize payment transaction.
- `POST /payments/webhook`: HMAC-SHA256 verified payment gateway webhook.
- `POST /payments/:id/refund`: Process administrative refund.

### 🚚 Delivery Telemetry (`/api/v1/delivery`)
- `POST /delivery/:orderId/assign`: Assign delivery driver.
- `PATCH /delivery/:orderId/location`: Broadcast driver GPS coordinates to authorized order room.
- `PATCH /delivery/:orderId/status`: Transition delivery status.

### 🤖 AI Capabilities (`/api/v1/ai`)
- `POST /ai/search`: Natural language food search (e.g. *"spicy vegan pizza under 20 dollars"*).
- `POST /ai/recommendations`: Contextual dish recommendations.
- `POST /ai/chat`: Interactive ordering assistant with confirmation guards.
- `POST /ai/faq`: Instant answers to delivery and ordering FAQs.
- `GET /ai/insights/:restaurantId`: AI-generated business insights for restaurant owners.

---

## 🛡️ Response Standards

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive, safe error message",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 🔮 Roadmap / Phase 2
- [ ] Define canonical Mongoose schemas with indexes, references, and validation rules.
- [ ] Implement multi-document MongoDB transactions for checkout and inventory.
- [ ] Connect production cloud integrations (Gemini AI, Razorpay, Cloudinary, Twilio/SMTP).
- [ ] Develop responsive frontend client using React, Vite, and TailwindCSS.

---

## 📄 License
ISC License. Built for production food delivery operations.
