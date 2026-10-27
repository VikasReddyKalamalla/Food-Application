# Food Delivery Platform — Backend Foundation

Production-grade Node.js/Express backend architecture for an enterprise Food Delivery Application with AI capabilities, real-time WebSocket events, role-based authorization, and strict financial invariants.

---

## 1. Architecture Highlights

- **Modular Monolith**: High cohesion, decoupled domain modules with dedicated routes, controllers, and services.
- **Separation of Concerns**: Thin controllers delegating exclusively to services.
- **Strict Invariants**:
  - Server-authoritative price calculation (clients cannot set prices, taxes, or discounts).
  - Explicit finite state machines for `OrderStatus` and `PaymentStatus`.
  - Idempotency support for order placement via `Idempotency-Key` UUID header.
- **Security First**:
  - Helmet HTTP security headers.
  - Strict CORS allowlist with credentials support.
  - Rate limiting (general API limit + stricter authentication limiter).
  - Zod request and environment validation failing fast at startup.
  - Structured request logging with automatic credential redaction (passwords, tokens, cookies, card numbers).
  - Cryptographic password hashing with bcrypt (12 rounds).
  - JWT access tokens + rotating refresh tokens with SHA-256 hash persistence.
- **Real-Time Layer**: Authenticated Socket.IO with room-based privacy (`user:<id>`, `order:<id>`, `admin`).
- **Extensible AI Architecture**: Abstract provider interface with Gemini implementation and deterministic mock fallback. Enforces prompt sanitization and explicit user confirmation guards.

---

## 2. Prerequisites

- **Node.js**: LTS `v18.0.0` or higher (verified on Node `v22.20.0`).
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI.

---

## 3. Installation & Local Setup

```bash
# Navigate to the backend directory
cd backend

# Install production and development dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

---

## 4. Environment Configuration

Edit `.env` as required:

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | Yes | `5050` | Port for Express & Socket.IO server |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/food_delivery_db` | MongoDB connection URI |
| `CLIENT_URL` | Yes | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS allowed origins |
| `JWT_ACCESS_SECRET` | Yes | *Min 32 characters* | Cryptographic secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | *Min 32 characters* | Cryptographic secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifespan |
| `COOKIE_SECURE` | No | `false` | Set `true` in production with HTTPS |
| `COOKIE_SAME_SITE` | No | `lax` | Cookie SameSite policy (`lax`, `strict`, `none`) |
| `LOG_LEVEL` | No | `info` | Structured logging verbosity |
| `AI_PROVIDER` | No | `mock` | Active provider (`mock`, `gemini`, `openai`) |
| `AI_API_KEY` | Optional | `""` | Gemini or OpenAI API Key |
| `RAZORPAY_KEY_ID` | Optional | `""` | Razorpay Merchant Key ID |
| `RAZORPAY_KEY_SECRET` | Optional | `""` | Razorpay Merchant Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `""` | Razorpay Webhook HMAC secret |
| `SMTP_HOST` | Optional | `""` | SMTP mail server |
| `MAPS_API_KEY` | Optional | `""` | Geolocation / Distance Matrix API key |
| `CLOUDINARY_CLOUD_NAME` | Optional | `""` | Cloud image storage identifier |

> [!NOTE]
> Optional integrations (AI, Razorpay, SMTP, Cloudinary) remain dormant when unconfigured and **do not** block server startup.

---

## 5. Execution Commands

```bash
# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start

# Run complete Vitest automated test suite
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 6. Available API Endpoints (/api/v1)

### System Probes & Documentation
- `GET /health`: Liveness probe.
- `GET /ready`: Readiness probe (verifies MongoDB connectivity).
- `GET /api-docs`: Interactive Swagger/OpenAPI 3.0 documentation.

### Authentication & Sessions (`/api/v1/auth`)
- `POST /register`: Account registration (`CUSTOMER`, `RESTAURANT_OWNER`, `DELIVERY_PARTNER`).
- `POST /login`: Credential authentication returning JWT and HttpOnly cookie.
- `POST /refresh`: Refresh token rotation.
- `POST /logout`: Invalidate session and clear cookies.
- `GET /me`: Authenticated profile (`Bearer` token required).
- `POST /forgot-password`: Password reset request.
- `POST /reset-password`: Complete password reset with secure token.

### User Profiles (`/api/v1/users`)
- `GET /profile`: Get logged-in user profile.
- `PATCH /profile`: Update profile info.

### Addresses (`/api/v1/addresses`)
- `GET /`: List saved delivery addresses.
- `POST /`: Add new delivery address.
- `DELETE /:id`: Remove address.

### Restaurants & Menus (`/api/v1/restaurants`, `/api/v1/menu-items`)
- `GET /restaurants`: List restaurants with pagination & search.
- `GET /restaurants/:id`: Restaurant details.
- `POST /restaurants`: Register restaurant (`RESTAURANT_OWNER`, `ADMIN`).
- `PATCH /restaurants/:id/operating-hours`: Update business hours.
- `GET /menu-items/restaurant/:restaurantId`: Dishes for a restaurant.
- `POST /menu-items`: Create menu item (`RESTAURANT_OWNER`, `ADMIN`).
- `PATCH /menu-items/:id/availability`: Toggle dish availability.

### Categories (`/api/v1/categories`)
- `GET /`: List categories.
- `POST /`: Create category (`ADMIN`).

### Carts & Coupons (`/api/v1/carts`, `/api/v1/coupons`)
- `GET /carts`: Retrieve cart with server-computed totals.
- `POST /carts/items`: Add dish to cart.
- `DELETE /carts/items/:menuItemId`: Remove dish from cart.
- `DELETE /carts`: Clear cart.
- `GET /coupons`: List active coupons.
- `POST /coupons/validate`: Validate coupon against cart.

### Orders (`/api/v1/orders`)
- `POST /`: Place order (supports `Idempotency-Key` header).
- `GET /`: Customer order history.
- `GET /:id`: Order details.
- `PATCH /:id/status`: Update status enforcing state machine.
- `POST /:id/cancel`: Cancel order.

### Payments (`/api/v1/payments`)
- `POST /initiate`: Create payment transaction.
- `POST /webhook`: Razorpay signed webhook listener.
- `POST /:id/refund`: Issue refund (`ADMIN`).

### Delivery Telemetry (`/api/v1/delivery`)
- `POST /:orderId/assign`: Assign delivery driver.
- `PATCH /:orderId/location`: Broadcast GPS coordinate to order room.
- `PATCH /:orderId/status`: Update delivery status (`PICKED_UP`, `DELIVERED`).

### AI Operations (`/api/v1/ai`)
- `POST /search`: Natural-language food and cuisine intent search.
- `POST /recommendations`: Structured food recommendations.
- `POST /chat`: Conversational ordering assistant with confirmation guards.
- `POST /faq`: Order-related FAQ answers.
- `GET /insights/:restaurantId`: Restaurant business performance insights.

### Governance & Analytics (`/api/v1/admin`, `/api/v1/analytics`)
- `GET /admin/users`: User management.
- `PATCH /admin/users/:id/status`: Suspend or activate accounts.
- `GET /admin/system`: System health diagnostic metrics.
- `GET /analytics/restaurant/:restaurantId`: Restaurant metrics.
- `GET /analytics/platform`: Platform-level aggregate metrics.

---

## 7. Next Steps: Phase 2 (Database Schema Phase)

With the backend foundation, middleware, routing, testing, and invariant layers fully established and verified, the project is ready for **Phase 2**:
- Define canonical Mongoose schemas with indexes, validation, and references (`User`, `Restaurant`, `MenuItem`, `Order`, `Payment`, `Review`, `Address`, `Coupon`).
- Implement MongoDB multi-document transactions for order checkout and coupon redemption.
- Wire database models into the existing service boundaries.
