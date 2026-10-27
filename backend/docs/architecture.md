# Architecture Design Document

## 1. Modular Monolith Architecture
This backend is designed as a production-grade modular monolith. It balances enterprise separation of concerns with low cognitive and operational overhead.

```
src/
├── config/             # Strict validated environment, DB connection, logging, CORS, Swagger
├── common/             # Cross-cutting constants, AppErrors, middlewares, validators, utilities
├── infrastructure/     # External integrations (Socket.IO, Gemini AI, Razorpay, SMTP, Maps, Storage)
├── modules/            # Domain business modules (Auth, Users, Restaurants, Orders, etc.)
└── jobs/               # Asynchronous cron and cleanup routines
```

## 2. Invariant Rules
- **Server-Authoritative Pricing**: All item prices, taxes, discounts, delivery fees, and grand totals are calculated by `calculateOrderTotals()` on the server. Clients cannot dictate authoritative monetary figures.
- **Idempotency**: Critical state mutations (e.g. `POST /api/v1/orders`) support the `Idempotency-Key` UUID header to prevent duplicate charges or orders during network retries.
- **State Machine Separation**:
  - `OrderStatus`: PENDING -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED (or CANCELLED).
  - `PaymentStatus`: PENDING -> AUTHORIZED / CAPTURED / FAILED -> REFUNDED.
  - The payment state machine operates independently from order fulfillment.
- **AI Safety Boundary**:
  - The AI layer NEVER receives passwords, raw credit card numbers, or authorization tokens.
  - AI only generates structured query parameters or suggestions; it NEVER executes arbitrary database queries or direct financial transactions without explicit user confirmation.

## 3. Real-Time Event Architecture (Socket.IO)
- Sockets authenticate via Bearer JWT tokens during handshake.
- Scoped rooms:
  - `user:<userId>`: Private notifications and order alerts.
  - `order:<orderId>`: Live order status and driver GPS telemetry.
  - `admin:notifications`: Platform-wide alerts.
