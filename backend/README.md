# Student Nest Backend (NestJS + PostgreSQL + Prisma)

Modern, production-grade backend rebuild for **Student Nest** (student housing marketplace), architected according to the Part C technical decisions.

---

## 🏗️ Architecture & Highlights

- **Framework**: NestJS 12 + TypeScript strict mode (`ES2023`, NodeNext modules).
- **Database**: PostgreSQL with Prisma ORM.
- **Config**: Strict runtime validation using Zod (`@nestjs/config`) — no raw `process.env` access.
- **Error & Response Envelope**:
  - Global `AllExceptionsFilter` formatting all exceptions into a consistent error contract.
  - Global `TransformInterceptor` wrapping successful endpoints in `{ success: true, data: T, error: null }`.
  - Global `LoggingInterceptor` capturing per-request duration and status.
- **Search**: Typesense integration skeleton for geo-radius room queries near universities.
- **Domain Modules**:
  - `auth`: JWT access + refresh token authentication, role guards (`STUDENT`, `OWNER`, `ADMIN`).
  - `users`: User entity and student roommate-matching compatibility profiles.
  - `listings`: PG & room properties with verification workflow.
  - `bookings`: Finite state machine for booking lifecycle (`PENDING` -> `COMPLETED`).
  - `payments`: Razorpay transaction state tracking.
  - `reviews`: Verified post-stay ratings and reviews.
  - `notifications`: Unified notification interface (email/SMS/push).
  - `admin`: Platform verification queue and analytics stats.
  - `search`: Typesense indexing and geo-search adapter.
  - `health`: System and database connectivity check.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional, for local postgres/redis/typesense)

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Spin Up Infrastructure (PostgreSQL, Redis, Typesense)
```bash
docker compose up postgres redis typesense -d
```

### 4. Install Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### 5. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 6. Start the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:4000/api/v1`
Health check: `http://localhost:4000/api/v1/health`

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E integration tests
npm run test:e2e
```

---

## 📡 API Conventions

### Success Envelope
Every successful response is formatted as:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "student-nest-backend",
    "uptime": 12.4
  },
  "error": null,
  "timestamp": "2026-09-15T16:00:00.000Z",
  "path": "/api/v1/health"
}
```

### Error Envelope
Every error (4xx / 5xx) produces:
```json
{
  "success": false,
  "data": null,
  "error": {
    "statusCode": 404,
    "message": "Resource not found",
    "errorName": "NotFoundException",
    "timestamp": "2026-09-15T16:00:00.000Z",
    "path": "/api/v1/listings/invalid-id"
  }
}
```

---

## 🗄️ Database Tools (Prisma)

```bash
# Open interactive Prisma Studio web UI
npx prisma studio

# Apply changes to schema without generating migrations (prototyping)
npx prisma db push
```
