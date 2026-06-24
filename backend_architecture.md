# Hotel Management System Backend Architecture

## 1. Architecture Summary

The backend should be built as a modular monolith using Clean Architecture, with well-defined module boundaries and shared infrastructure services. This fits the current hotel domain well because it keeps operational complexity manageable while still allowing scale through horizontal application replication, Redis-backed coordination, and PostgreSQL-first persistence.

The architecture should center on:

- Express.js as the HTTP delivery layer
- Service layer use cases as the business boundary
- Repository pattern for all database access
- Dependency injection for testability and isolation
- PostgreSQL as the system of record
- Redis for cache, rate limiting, token/session support, and background coordination
- JWT authentication with short-lived access tokens and rotated refresh tokens
- Winston for structured logging
- Swagger/OpenAPI for contract-first documentation
- Jest for unit, integration, and API testing
- Docker for local consistency and production packaging

This design is aligned to the database schema in `hotel_management_schema.sql`, which already models core entities such as `hotels`, `app_users`, `roles`, `permissions`, `user_roles`, `staff_profiles`, `customer_profiles`, `room_types`, `rooms`, `bookings`, `booking_rooms`, `payments`, `invoices`, `housekeeping_tasks`, `food_orders`, `notifications`, `audit_logs`, and `import_export_jobs`.

## 2. Complete Backend Folder Structure

```text
backend/
  src/
    app.ts
    server.ts
    bootstrap/
      container.ts
      env.ts
      logger.ts
      swagger.ts
      redis.ts
      database.ts
    config/
      env.schema.ts
      constants.ts
      permissions.ts
      rateLimits.ts
    common/
      errors/
        AppError.ts
        BadRequestError.ts
        UnauthorizedError.ts
        ForbiddenError.ts
        NotFoundError.ts
        ConflictError.ts
        ValidationError.ts
      http/
        asyncHandler.ts
        pagination.ts
        response.ts
      utils/
        date.ts
        crypto.ts
        id.ts
        money.ts
      types/
        express.d.ts
        pagination.ts
    infrastructure/
      database/
        pgPool.ts
        transactionManager.ts
        migrations/
        seeds/
        repositories/
      cache/
        redisClient.ts
        cacheKeys.ts
      logging/
        winston.ts
        auditLogger.ts
      queue/
        queueClient.ts
        workers/
      security/
        jwt.ts
        passwordHasher.ts
        tokenStore.ts
        rateLimiter.ts
      storage/
        fileStorage.ts
        localStorage.ts
        s3Storage.ts
      mail/
        mailer.ts
        templates/
      observability/
        metrics.ts
        health.ts
    modules/
      auth/
        domain/
        application/
        infrastructure/
        presentation/
      rbac/
        domain/
        application/
        infrastructure/
        presentation/
      users/
      hotels/
      rooms/
      room-types/
      bookings/
      stay/
      billing/
      payments/
      customers/
      staff/
      housekeeping/
      food-ordering/
      notifications/
      audit/
      imports-exports/
    jobs/
      import-export/
      notifications/
      housekeeping/
      billing/
    middlewares/
      auth.middleware.ts
      rbac.middleware.ts
      validate.middleware.ts
      rateLimit.middleware.ts
      requestContext.middleware.ts
      tenant.middleware.ts
      errorHandler.middleware.ts
      notFound.middleware.ts
    validators/
      auth.validators.ts
      booking.validators.ts
      billing.validators.ts
      room.validators.ts
      ...
    docs/
      openapi/
        openapi.yaml
        components.yaml
    tests/
      unit/
      integration/
      contract/
      e2e/
  docker/
    Dockerfile
    Dockerfile.test
    entrypoint.sh
  docker-compose.yml
  docker-compose.override.yml
  .env.example
  package.json
  tsconfig.json
```

If the team prefers TypeScript, this structure should be implemented in TypeScript even though the request only requires architecture. That gives stronger boundaries, safer refactors, and better DI ergonomics.

## 3. Module-Wise Architecture

### Auth Module

Responsibilities:

- Login and logout
- Access token issuance
- Refresh token rotation
- Password reset and password change
- MFA readiness if added later
- Session revocation

Key schema touchpoints:

- `app_users`
- `user_sessions`
- `password_reset_tokens`

### RBAC Module

Responsibilities:

- Resolve user roles
- Resolve permission sets
- Enforce module-level and action-level permissions
- Cache role-permission mappings in Redis

Key schema touchpoints:

- `roles`
- `permissions`
- `role_permissions`
- `user_roles`

### Users Module

Responsibilities:

- User lifecycle
- Profile visibility
- Status transitions
- Soft-delete-aware user lookup

Key schema touchpoints:

- `app_users`

### Hotels Module

Responsibilities:

- Hotel master records
- Tenant context resolution
- Hotel-level configuration boundaries

Key schema touchpoints:

- `hotels`

### Rooms and Room Types Modules

Responsibilities:

- Room type management
- Room inventory lifecycle
- Room status transitions
- Rate and amenity management

Key schema touchpoints:

- `room_types`
- `room_type_rates`
- `room_amenities`
- `room_type_amenities`
- `rooms`
- `room_status_history`
- `room_blocks`

### Bookings and Stay Modules

Responsibilities:

- Quote, hold, confirm, cancel booking flows
- Room allocation
- Check-in and check-out orchestration
- Guest occupancy management
- Availability validation

Key schema touchpoints:

- `bookings`
- `booking_rooms`
- `booking_guests`
- `checkin_records`
- `checkout_records`

### Billing and Payments Modules

Responsibilities:

- Invoice generation
- Folio-style line aggregation if needed at service level
- Payment capture and allocation
- Refund processing
- Balance reconciliation

Key schema touchpoints:

- `invoices`
- `invoice_items`
- `payments`
- `payment_allocations`
- `refunds`

### Customers and Staff Modules

Responsibilities:

- Profile extension data
- Document and contact data
- Operational identity mapping

Key schema touchpoints:

- `customer_profiles`
- `staff_profiles`

### Housekeeping Module

Responsibilities:

- Task assignment
- Room cleaning and maintenance workflow
- Task queueing and escalation

Key schema touchpoints:

- `housekeeping_tasks`

### Food Ordering Module

Responsibilities:

- Menu catalog
- Food order lifecycle
- Kitchen queue support

Key schema touchpoints:

- `food_categories`
- `menu_items`
- `food_orders`
- `food_order_items`

### Notifications Module

Responsibilities:

- In-app and outbound notifications
- Delivery tracking
- Read/unread lifecycle

Key schema touchpoints:

- `notifications`

### Audit Module

Responsibilities:

- Immutable audit events
- Request and entity traceability
- Compliance and incident investigation support

Key schema touchpoints:

- `audit_logs`

### Import/Export Module

Responsibilities:

- Excel import jobs
- Excel export jobs
- Validation feedback
- Error artifact tracking

Key schema touchpoints:

- `import_export_jobs`

## 4. Authentication Flow

Recommended approach:

1. User submits credentials over TLS.
2. Auth service validates user status, password hash, and account eligibility.
3. Access token is issued with short TTL, typically 10 to 15 minutes.
4. Refresh token is rotated and stored hashed in `user_sessions`.
5. Session metadata captures device, IP, and user agent for risk analysis.
6. Redis stores ephemeral session and token revocation state for fast checks.
7. Password change, account lock, or logout revokes all active sessions.

Security rules:

- Password hashes must use a modern adaptive algorithm such as Argon2id or bcrypt with strong cost settings.
- Access tokens should contain only minimal claims: `sub`, `sid`, `roles`, `tenant` or `hotel_id`, and token version.
- Refresh tokens should never be stored in plaintext.
- Token rotation must be enforced on every refresh request.
- Compromised refresh token reuse should invalidate the full session family.

## 5. Authorization Flow

Use centralized RBAC with permission checks at middleware and service boundaries.

Flow:

1. JWT is verified.
2. Request context is populated with `user_id`, roles, and hotel scope.
3. Middleware resolves effective permissions, preferably from Redis cache.
4. The route or service declares required permissions.
5. Authorization middleware denies the request if the effective permission set does not match.

Recommended permission model:

- `module:action` naming, such as `bookings:create`, `rooms:update`, `payments:refund`, `audit:read`
- Role-to-permission mapping stored in PostgreSQL, cached in Redis
- Optional hotel-scoped permission resolution for multi-property operations

## 6. Middleware Architecture

Order matters. The request pipeline should be:

1. Correlation ID middleware
2. Request context middleware
3. Security headers middleware
4. Rate limiting middleware
5. Body parsing middleware
6. JWT authentication middleware
7. RBAC authorization middleware
8. Request validation middleware
9. Route handler
10. Global error handler

Recommended middleware set:

- `requestContext` for correlation IDs, tenant/hotel context, and actor details
- `tenant` or hotel context middleware to resolve the active hotel scope
- `auth` to parse and verify JWTs
- `rbac` to enforce permissions
- `validate` to run schema validation with a strict allowlist
- `rateLimit` to defend login, password reset, and expensive write flows
- `errorHandler` to translate errors into safe API responses

## 7. Repository Layer Design

Repositories should be persistence-only and never contain business workflows.

Responsibilities:

- CRUD and targeted query methods
- Transaction-aware reads and writes
- Soft-delete filtering by default
- Pagination and sorting support
- Hotel-scoped lookups

Design rules:

- One repository per aggregate or closely related table cluster
- Methods should return domain-friendly objects, not raw SQL blobs
- Repositories should accept a transaction context when used inside a unit of work
- Complex joins are allowed in repositories, but only to satisfy a specific query contract

Suggested repository split:

- AuthRepository
- UserRepository
- RoleRepository
- PermissionRepository
- RoomRepository
- RoomTypeRepository
- BookingRepository
- BookingRoomRepository
- InvoiceRepository
- PaymentRepository
- RefundRepository
- HousekeepingRepository
- FoodOrderRepository
- NotificationRepository
- AuditLogRepository
- ImportExportJobRepository

## 8. Service Layer Responsibilities

Services are the application boundary and should orchestrate business rules.

Responsibilities:

- Validate domain rules beyond simple schema checks
- Coordinate multiple repositories inside transactions
- Publish domain events after successful commits
- Enforce state transitions
- Apply pricing, allocation, and cancellation rules
- Trigger notifications and background jobs

Examples of service responsibilities:

- Booking service checks inventory, date validity, and room availability
- Billing service generates invoices and reconciles balances
- Payment service allocates payments and processes refunds
- Housekeeping service assigns, escalates, and completes tasks
- Import/export service manages file lifecycle and row-level validation results

## 9. Controller Responsibilities

Controllers should be thin transport adapters.

Responsibilities:

- Parse request input
- Pass normalized data to services
- Return standardized HTTP responses
- Never contain business logic
- Never talk directly to repositories

Controllers should also:

- Respect API versioning
- Emit minimal response payloads
- Hide internal identifiers or audit internals unless explicitly required

## 10. Validation Strategy

Validation must happen in layers.

Layer 1: transport validation

- JSON schema or a library such as Zod, Joi, or express-validator
- Reject unknown fields
- Validate format, length, enumeration values, and required combinations

Layer 2: application validation

- Check cross-field rules
- Verify state transitions
- Confirm hotel scoping
- Confirm entity existence and soft-delete status

Layer 3: database constraints

- Foreign keys
- Unique constraints
- Exclusion constraints
- Check constraints

Recommended validation rules:

- `booking.check_out_date > booking.check_in_date`
- Payment and refund amounts cannot exceed allowed balances
- Room assignments must stay inside the booking window
- Hotel IDs must match across dependent entities
- Request bodies must be strict and version-aware

## 11. Logging Strategy

Use Winston for structured JSON logging.

Log levels:

- `error` for failures requiring intervention
- `warn` for risky or unusual but handled states
- `info` for business milestones
- `debug` only in non-production environments

Every log entry should include:

- Timestamp
- Correlation ID
- Request ID
- User ID if known
- Hotel ID if known
- Route or job name
- Latency
- Outcome

Security rules:

- Never log passwords, tokens, OTPs, card data, or document numbers in raw form
- Mask PII where practical
- Separate audit logs from application logs

Audit strategy:

- Write business-level audit events for create/update/delete/state-change operations
- Keep audit records immutable
- Prefer append-only semantics

## 12. Redis Caching Strategy

Redis should be used as a supporting system, not a second source of truth.

Primary cache targets:

- Role-permission mappings
- User session metadata
- Rate limit counters
- Hot hotel configuration
- Room availability snapshots for short-lived queries
- Reference data such as room amenities or food categories

Cache patterns:

- Cache-aside for read-heavy reference data
- Write-through invalidation after role changes, permission updates, or room status changes
- Short TTLs for availability and pricing data
- Per-hotel cache keys to avoid cross-tenant leakage

Key naming convention:

- `hotel:{hotelId}:rbac:permissions`
- `hotel:{hotelId}:rooms:availability:{date}`
- `user:{userId}:session:{sessionId}`
- `rate_limit:{scope}:{identifier}`

Anti-patterns to avoid:

- Storing durable business truth only in Redis
- Large unbounded hash sets without TTLs
- Cross-tenant shared keys without namespacing

## 13. Background Jobs Architecture

Background jobs should handle slow, retryable, or scheduled work.

Recommended job categories:

- Notification delivery
- Excel import processing
- Excel export file generation
- Housekeeping reminders and escalations
- Invoice PDF generation if introduced later
- Session cleanup
- Cache invalidation fan-out

Implementation approach:

- Use a queue system backed by Redis
- Distinguish high-priority and low-priority queues
- Make workers stateless and horizontally scalable
- Use idempotency keys for retry-safe execution

Operational rules:

- Jobs must record start, success, failure, and retry metadata
- A failed job should preserve error context for support review
- Long-running imports should chunk rows and save partial progress

## 14. API Versioning Strategy

Use URI versioning:

- `/api/v1/...`

Why this works here:

- It is explicit
- It is easy to document
- It is easy to support multiple clients during migration

Versioning rules:

- Keep v1 stable for existing consumers
- Add new fields as backward-compatible enhancements
- Avoid changing meaning or type of existing fields within a version
- Deprecate old versions with a published migration timeline

Swagger/OpenAPI should publish separate tagged sections by version and module.

## 15. File Upload Architecture

Uploads should be treated as untrusted input.

Supported upload domains:

- Excel import files
- Staff documents if required later
- Guest identity documents if the business permits it
- Images or attachments for future extensions

Recommended design:

- Upload request hits the API
- File is validated for size, MIME type, extension, and magic bytes
- File is streamed to object storage or an isolated local staging area
- Metadata is persisted in the job table or a dedicated upload record
- Background worker performs parsing and validation

Security rules:

- Never execute uploaded files
- Never trust file extension alone
- Generate new server-side filenames
- Scan files if your deployment includes malware scanning
- Store only references in the database, not binary blobs, unless there is a specific reason

## 16. Security Architecture

Core controls:

- TLS everywhere
- JWT access tokens with short expiry
- Refresh token rotation
- Strong password hashing
- RBAC with least privilege
- Input validation and output encoding
- Security headers
- Rate limiting on login, reset, and write-heavy endpoints
- CSRF protection if cookies are used for browser auth
- CORS allowlist, not wildcard

Operational controls:

- Login attempt throttling
- Account lockout or step-up verification after suspicious activity
- Audit trails for privileged operations
- Secret storage outside the codebase
- Environment-specific keys and rotation policy

Data controls:

- Soft deletes on user-facing records
- Database constraints for referential integrity
- Hotel-scoped access checks everywhere
- No direct client access to Redis or PostgreSQL

## 17. Docker Architecture

Recommended container set:

- `api` for the Express application
- `worker` for queue processors
- `postgres` for local development only
- `redis` for local development and optional self-hosted deployments
- `migrate` for running schema migrations during release

Docker principles:

- Use multi-stage builds
- Keep the runtime image minimal
- Run as a non-root user
- Externalize configuration through environment variables
- Keep health checks on API and worker containers

Local development:

- `docker-compose` should bring up API, PostgreSQL, Redis, and any local observability support
- Mount source code only for dev containers

Production:

- Prefer separate containers for API and workers
- Scale workers independently from the web tier

## 18. Deployment Architecture

Recommended deployment model:

- Stateless Node.js API containers behind a load balancer
- Separate worker deployment for queue consumers
- Managed PostgreSQL and managed Redis where possible
- Object storage for files and exports
- Centralized log aggregation

Release strategy:

1. Apply backward-compatible database migrations
2. Deploy new application version
3. Run background verification or smoke checks
4. Enable new features gradually if feature flags are used

Operational safeguards:

- Blue-green or rolling deployments
- Health checks for liveness and readiness
- Automatic rollback on failed smoke tests
- Database migration discipline with forward-only changes

## 19. Database Migration Strategy

Use migration files, never manual schema edits in production.

Rules:

- Migrations are forward-only
- Every migration is reviewed
- Every migration is reversible where practical
- Data migrations are separated from schema migrations when large
- Index creation for large tables should be planned carefully

Migration sequence:

1. Create or alter tables
2. Backfill data
3. Add constraints where safe
4. Add indexes, ideally concurrently when supported in production workflow
5. Flip application behavior after validation

Recommended discipline:

- Maintain an explicit migration ledger table
- Tie each deployment to a migration version
- Verify migrations in a staging environment that mirrors production scale

## 20. Testing Architecture

Testing should cover each architectural layer.

Unit tests:

- Pure domain rules
- Service methods with mocked repositories
- Validation rules
- Token and permission helpers

Integration tests:

- Repository queries against a real PostgreSQL instance
- Transaction behavior
- Constraint behavior
- Cache invalidation flows

API tests:

- Authentication and authorization
- Booking lifecycle
- Billing and payment scenarios
- Housekeeping task workflows
- Import/export job initiation

Contract tests:

- Swagger/OpenAPI response consistency
- Request validation schema alignment

End-to-end tests:

- Critical user journeys from login to booking to checkout to payment

Testing environment guidance:

- Use isolated test databases
- Seed only required reference data
- Reset state between tests
- Prefer deterministic clocks for time-sensitive flows

## 21. Scalability Recommendations

Application scaling:

- Keep API stateless
- Run multiple API replicas behind a load balancer
- Scale workers separately based on queue depth

Database scaling:

- Use read replicas for reporting and non-critical read-heavy workloads
- Index for the exact access patterns used by bookings, rooms, and billing
- Partition large append-only tables later if growth justifies it, especially audit logs or notification history

Caching scaling:

- Cache permission sets and hotel reference data aggressively
- Use short TTLs for volatile availability and rate data

Workflow scaling:

- Convert expensive synchronous tasks into jobs
- Chunk Excel imports and large exports
- Avoid locking hot tables longer than necessary

Domain-specific guidance:

- Use hotel-scoped data boundaries to keep multi-property expansion clean
- Preserve soft-delete semantics everywhere the database supports them
- Keep pricing and availability rules centralized in services, not scattered across controllers

## 22. Recommended Operational Principles

- Keep business logic inside services
- Keep persistence logic inside repositories
- Keep controllers thin
- Keep config externalized
- Keep logs structured
- Keep security default-deny
- Keep Redis ephemeral
- Keep PostgreSQL authoritative
- Keep jobs idempotent
- Keep architecture modular but not over-fragmented

## 23. Final Architecture Position

For this hotel platform, the best fit is a modular monolith with strong internal boundaries and a clean path to service extraction later if needed. That gives you production-grade maintainability now, without paying the complexity tax of premature microservices.

The schema already points in that direction: it is normalized, hotel-scoped, UUID-based, and designed around auditability and soft deletes. The backend should mirror those strengths with strict RBAC, transactionally safe services, cache-aware reads, and worker-based processing for slow operations.

