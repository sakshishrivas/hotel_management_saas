# Hotel Management System Backend Project Blueprint

## 1. Purpose

This document is the final backend blueprint for the Hotel Management System. It consolidates the database model, backend architecture, and API contract into a single implementation guide for the engineering team.

It is intentionally code-free. It defines structure, responsibilities, dependency flow, operational boundaries, and delivery standards before implementation begins.

Primary goals:

- Keep the system modular without turning it into microservice sprawl
- Keep business logic testable and isolated from transport and persistence
- Keep hotel-scoped data boundaries explicit
- Keep security, auditability, and operational reliability as first-class concerns
- Keep the codebase easy to extend by multiple teams

## 2. Architectural Position

Recommended architecture: Modular Monolith with Clean Architecture principles.

Why this is the right fit:

- The domain is broad but still tightly related
- Bookings, billing, rooms, and guest operations share many transactional boundaries
- PostgreSQL and Redis are enough for the first production-grade release
- The design can later split into services if scale demands it

Core layers:

- Presentation layer: HTTP, middleware, request/response shaping
- Application layer: use cases, orchestration, transaction boundaries
- Domain layer: business rules, invariants, policy objects, domain events
- Infrastructure layer: database, cache, logging, queue, file storage, external integrations

Dependency rule:

- Outer layers may depend on inner layers
- Inner layers must never depend on outer layers
- Domain must not depend on Express, PostgreSQL, Redis, or transport details

## 3. Complete Folder Structure

```text
backend/
  src/
    app/
      app.ts
      server.ts
      bootstrap.ts
    config/
      env/
        env.schema.ts
        env.ts
        env.example.md
      constants/
        index.ts
        roles.ts
        permissions.ts
        status.ts
      limits/
        rate-limits.ts
        pagination.ts
      swagger/
        openapi.ts
        tags.ts
    shared/
      domain/
        errors/
        events/
        value-objects/
        entities/
      application/
        dtos/
        mappers/
        interfaces/
        use-cases/
      infrastructure/
        database/
        cache/
        logging/
        queue/
        storage/
        security/
      presentation/
        http/
        middleware/
        validators/
        serializers/
      utils/
      types/
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
        domain/
        application/
        infrastructure/
        presentation/
      hotels/
        domain/
        application/
        infrastructure/
        presentation/
      customers/
        domain/
        application/
        infrastructure/
        presentation/
      staff/
        domain/
        application/
        infrastructure/
        presentation/
      room-types/
        domain/
        application/
        infrastructure/
        presentation/
      amenities/
        domain/
        application/
        infrastructure/
        presentation/
      rooms/
        domain/
        application/
        infrastructure/
        presentation/
      room-rates/
        domain/
        application/
        infrastructure/
        presentation/
      bookings/
        domain/
        application/
        infrastructure/
        presentation/
      booking-guests/
        domain/
        application/
        infrastructure/
        presentation/
      check-in/
        domain/
        application/
        infrastructure/
        presentation/
      check-out/
        domain/
        application/
        infrastructure/
        presentation/
      folios/
        domain/
        application/
        infrastructure/
        presentation/
      billing/
        domain/
        application/
        infrastructure/
        presentation/
      invoices/
        domain/
        application/
        infrastructure/
        presentation/
      payments/
        domain/
        application/
        infrastructure/
        presentation/
      refunds/
        domain/
        application/
        infrastructure/
        presentation/
      housekeeping/
        domain/
        application/
        infrastructure/
        presentation/
      maintenance/
        domain/
        application/
        infrastructure/
        presentation/
      food-ordering/
        domain/
        application/
        infrastructure/
        presentation/
      notifications/
        domain/
        application/
        infrastructure/
        presentation/
      reports/
        domain/
        application/
        infrastructure/
        presentation/
      imports-exports/
        domain/
        application/
        infrastructure/
        presentation/
      audit/
        domain/
        application/
        infrastructure/
        presentation/
    jobs/
      workers/
      queues/
      processors/
      schedulers/
    infrastructure/
      database/
        pool/
        migrations/
        seeds/
        repositories/
        transactions/
      cache/
        redis-client/
        cache-keys/
        cache-policies/
      logging/
        winston/
        audit-logger/
      security/
        jwt/
        password-hashing/
        token-store/
        rate-limiter/
      storage/
        local/
        s3/
        temp/
      email/
        templates/
        transport/
      observability/
        health/
        metrics/
      queue/
        clients/
        publishers/
    presentation/
      middlewares/
      validators/
      serializers/
      docs/
      routes/
      error-handlers/
    tests/
      unit/
      integration/
      contract/
      e2e/
      fixtures/
      factories/
      helpers/
    scripts/
      build/
      db/
      seed/
      test/
      deploy/
  docker/
    api/
    worker/
    db/
    redis/
  docs/
    architecture/
    api/
    ops/
  .github/
    workflows/
  .editorconfig
  .env.example
  .eslintignore
  .eslintrc
  .prettierignore
  .prettierrc
  Dockerfile
  Dockerfile.dev
  Dockerfile.test
  docker-compose.yml
  docker-compose.override.yml
  package.json
  package-lock.json
  tsconfig.json
  jest.config.ts
  README.md
```

## 4. Folder Responsibilities

### `src/app`

- Application bootstrap
- Express application creation
- Middleware and route registration
- Server startup orchestration

### `src/config`

- Environment schema and config loading
- Feature flags and runtime constants
- Permission and rate-limit configuration
- OpenAPI metadata and tags

### `src/shared`

- Reusable domain primitives
- Shared DTOs and interfaces
- Common application abstractions
- Infrastructure adapters used by multiple modules
- Shared presentation helpers

### `src/modules`

- Business-domain modules
- Each module owns its own domain rules, application use cases, infrastructure adapters, and HTTP presentation boundary

### `src/jobs`

- Background job processors
- Queue consumers
- Scheduled maintenance tasks

### `src/infrastructure`

- Cross-cutting external systems
- PostgreSQL access
- Redis access
- Logging
- Security primitives
- Storage adapters
- Email transport

### `src/presentation`

- HTTP middleware
- Validation rules
- Route definitions
- Response serializers
- API documentation helpers

### `tests`

- Automated verification at unit, integration, contract, and end-to-end layers

### `scripts`

- DevOps and operational utilities
- Build helpers
- Database commands
- Seed and deployment helpers

## 5. File Responsibility Map

### App bootstrap

- `src/app/app.ts`: Create and configure the Express application
- `src/app/server.ts`: Start the HTTP server
- `src/app/bootstrap.ts`: Orchestrate dependency initialization

### Config

- `src/config/env/env.schema.ts`: Define environment variable requirements
- `src/config/env/env.ts`: Load and normalize configuration
- `src/config/constants/index.ts`: Central constants export
- `src/config/constants/roles.ts`: System role identifiers
- `src/config/constants/permissions.ts`: Permission catalog keys
- `src/config/limits/rate-limits.ts`: Rate limiting policies
- `src/config/swagger/openapi.ts`: OpenAPI base metadata

### Shared domain

- `src/shared/domain/errors/*`: Base error types and application exceptions
- `src/shared/domain/events/*`: Domain event contracts
- `src/shared/domain/value-objects/*`: Strong domain primitives such as money, date range, email, and identifiers
- `src/shared/domain/entities/*`: Base entity primitives with audit fields and soft-delete awareness

### Shared application

- `src/shared/application/dtos/*`: Cross-module DTO contracts
- `src/shared/application/mappers/*`: Cross-layer mapping helpers
- `src/shared/application/interfaces/*`: Common interfaces such as repositories, clock, logger, cache, job publisher
- `src/shared/application/use-cases/*`: Shared use cases such as health checks or shared lookup operations

### Shared infrastructure

- `src/shared/infrastructure/database/*`: Pool management, transaction boundary helpers, SQL utilities
- `src/shared/infrastructure/cache/*`: Redis abstractions and cache key helpers
- `src/shared/infrastructure/logging/*`: Winston setup and structured logger contract
- `src/shared/infrastructure/queue/*`: Queue client abstraction and publisher API
- `src/shared/infrastructure/security/*`: JWT, token hashing, password hashing, rate-limiting utilities
- `src/shared/infrastructure/storage/*`: File storage abstraction

### Module folders

Each module folder contains:

- `domain`: Entities, policies, invariants, events
- `application`: Use cases, commands, queries, DTOs, ports
- `infrastructure`: Repository implementations, cache adapters, external integrations
- `presentation`: Request validation, controller adapters, route mapping, serialization

### Jobs

- `src/jobs/workers/*`: Worker process definitions
- `src/jobs/queues/*`: Queue names and configurations
- `src/jobs/processors/*`: Job handlers
- `src/jobs/schedulers/*`: Scheduled triggers and cron registration

### Tests

- `tests/unit/*`: Isolated domain and application tests
- `tests/integration/*`: Database, cache, and queue integration tests
- `tests/contract/*`: API contract and OpenAPI validation tests
- `tests/e2e/*`: End-to-end user-flow tests
- `tests/fixtures/*`: Reusable seed payloads
- `tests/factories/*`: Test data factories

## 6. Module Boundaries

Each module must own its behavior and should not directly depend on another module’s internals.

Allowed dependencies:

- `bookings` may depend on `rooms`, `room-types`, `customers`, and `payments` through application interfaces
- `billing` may depend on `bookings`, `invoices`, `payments`, and `refunds`
- `housekeeping` may depend on `rooms` and `users`
- `food-ordering` may depend on `bookings`, `booking-guests`, `customers`, and `billing`
- `notifications` may depend on events emitted by any module
- `audit` may subscribe to cross-module events

Disallowed dependencies:

- Controllers calling repositories directly
- One module importing another module’s repository implementation
- Domain logic importing Express, Redis, or SQL adapters
- Cross-module writes that bypass use cases

## 7. Dependency Flow

Recommended flow:

1. HTTP request enters Express
2. Middleware builds request context and validates auth
3. Controller adapter parses request into a command or query DTO
4. Application use case executes business workflow
5. Use case calls repository interfaces and infrastructure ports
6. Repository implementation talks to PostgreSQL
7. Cache, queue, email, or file storage adapters are invoked through ports
8. Use case returns result DTO
9. Controller serializes response
10. Global error handler normalizes failures

Direction of dependencies:

- Presentation depends on application
- Application depends on domain and shared interfaces
- Infrastructure depends on application interfaces and domain models
- Domain depends on nothing else

## 8. Request Lifecycle

For every request:

1. Correlation ID is created or propagated
2. Request metadata is attached to the request context
3. Security headers and rate limit checks are applied
4. JWT is verified if the route is protected
5. RBAC permissions are resolved
6. Validation runs on path, query, and body inputs
7. Controller converts input into a use-case call
8. Service or use case executes inside a transaction if needed
9. Repository queries and writes occur
10. Audit log event is emitted for sensitive mutations
11. Cache is updated or invalidated
12. Response is serialized
13. Structured logs are written
14. Errors are transformed by the global error handler if anything fails

## 9. Authentication Architecture

Use JWT access tokens plus refresh tokens.

Recommended flow:

1. User submits credentials over HTTPS
2. Auth use case validates email, status, password hash, and tenant scope
3. Access token is issued with a short TTL
4. Refresh token is hashed, persisted, and rotated
5. Session metadata is recorded in PostgreSQL and mirrored in Redis for fast revocation checks
6. Refresh token reuse triggers session family invalidation

Security rules:

- Access tokens should be short-lived
- Refresh tokens must never be stored in plaintext
- Session revocation must be possible without waiting for access token expiry
- Password reset and password change must revoke existing sessions

## 10. Authorization Architecture

RBAC model:

- Roles are assigned to users
- Permissions are assigned to roles
- Each request resolves the effective permissions for the user
- Authorization checks happen before the use case or at the service boundary

Recommended practice:

- Use permission strings such as `bookings:create` or `payments:refund`
- Cache role-permission mappings in Redis
- Invalidate permission caches when role mappings change
- Enforce hotel scope together with RBAC

Authorization decision order:

1. Is the user authenticated?
2. Is the user active and not suspended?
3. Does the user have the required permission?
4. Is the request scoped to the correct hotel?
5. Is the resource state compatible with the requested action?

## 11. Error Handling Architecture

Error model:

- Base application errors should carry `code`, `message`, `statusCode`, and optional `details`
- Domain rule violations should become predictable application errors
- Infrastructure failures should be wrapped without leaking internals

Global handler responsibilities:

- Convert exceptions into a standard error envelope
- Map validation failures to `422`
- Map auth failures to `401`
- Map authorization failures to `403`
- Map missing resources to `404`
- Map conflicts to `409`
- Log full stack traces internally only

Operational rules:

- Never leak stack traces to clients
- Never expose raw SQL errors
- Never expose secrets or token values

## 12. Logging Architecture

Use Winston with structured JSON logs.

Log categories:

- Application logs
- Audit logs
- Security logs
- Job logs
- Integration logs

Log fields:

- Timestamp
- Level
- Correlation ID
- Request ID
- User ID
- Hotel ID
- Module
- Operation
- Latency
- Outcome
- Error code if present

Logging rules:

- Log one business event per significant state change
- Mask PII and secrets
- Separate audit logging from diagnostic logging
- Keep logs machine-readable and query-friendly

Audit logging rules:

- Create immutable audit records for create, update, delete, cancel, refund, approval, and status transition events
- Record before and after payload snapshots only where safe and necessary
- Keep audit writes asynchronous only if durability is not compromised

## 13. Validation Architecture

Validation should happen in three layers:

1. Request layer validation
2. Application layer business validation
3. Database constraint validation

Request layer:

- Enforce types, formats, required fields, and unknown-field rejection
- Validate query string contracts
- Validate pagination and sorting parameters

Application layer:

- Validate workflow state transitions
- Validate hotel scoping
- Validate entity existence and soft-delete status
- Validate inventory availability and payment constraints

Database layer:

- Foreign keys
- Unique constraints
- Exclusion constraints
- Check constraints

Rules to preserve:

- Booking date ranges must be valid
- Room assignments cannot overlap
- Payment allocations cannot exceed source payment
- Refunds cannot exceed refundable amount
- Hotel IDs must match across related entities

## 14. Database Access Architecture

PostgreSQL is the system of record.

Database access rules:

- All data access goes through repositories
- Repositories receive transaction context when needed
- Reads should default to soft-delete-aware filters
- Writes should be wrapped in explicit transactions for multi-step workflows

Recommended SQL patterns:

- Parameterized queries only
- Explicit projections instead of `SELECT *`
- Hotel-scoped predicates in every query
- Stable ordering for pagination
- Locking only where necessary and as narrowly as possible

Transaction rules:

- Use a transaction for booking creation, payment capture, invoice generation, check-in, check-out, and cancellation workflows
- Keep transaction scope short
- Never do external network calls inside a database transaction if it can be avoided

## 15. Repository Layer Design

Repository responsibilities:

- Persist and retrieve aggregates
- Provide query methods tailored to use cases
- Hide SQL and database layout details from application services
- Convert database records into domain or DTO-friendly shapes

Repository design principles:

- One repository per aggregate or coherent table group
- Repositories should not implement business workflows
- Repositories should not know about HTTP or JWT
- Repositories should support transactions explicitly

Recommended repository groups:

- Auth repository
- User repository
- Role and permission repositories
- Hotel repository
- Customer repository
- Staff repository
- Room type repository
- Amenity repository
- Room repository
- Room rate repository
- Booking repository
- Booking guest repository
- Check-in repository
- Check-out repository
- Folio and billing repository
- Invoice repository
- Payment repository
- Refund repository
- Housekeeping repository
- Maintenance repository
- Food ordering repository
- Notification repository
- Audit log repository
- Import/export job repository

## 16. Service Layer Design

Service responsibilities:

- Enforce business rules
- Coordinate repositories
- Open and commit transactions
- Publish events after successful commits
- Trigger cache invalidation and jobs
- Apply policies and calculations

Service design principles:

- Services should represent use cases, not tables
- Services should be small enough to test in isolation
- Services should return application DTOs or domain results
- Services should expose explicit commands and queries

High-value service groups:

- Authentication service
- RBAC service
- Booking service
- Availability service
- Billing service
- Payment service
- Refund service
- Housekeeping service
- Food ordering service
- Notification service
- Reporting service
- Import/export orchestration service

## 17. Controller Layer Design

Controller responsibilities:

- Parse request input
- Invoke a single use case or service method
- Return standardized responses
- Map transport concerns only

Controller rules:

- Controllers must remain thin
- Controllers must not contain business logic
- Controllers must not access the database directly
- Controllers must not cache data directly
- Controllers must not format domain policies inline

## 18. Middleware Architecture

Recommended middleware order:

1. Correlation ID
2. Request context enrichment
3. Security headers
4. CORS
5. Rate limiting
6. Body parsing
7. Auth verification
8. RBAC enforcement
9. Validation
10. Controller execution
11. Error handling

Core middleware responsibilities:

- Correlation ID middleware: trace requests across logs and jobs
- Request context middleware: store user, hotel, and tenant information
- Auth middleware: verify JWT and session state
- RBAC middleware: enforce permissions
- Validation middleware: reject invalid input early
- Rate limit middleware: protect sensitive and high-cost routes
- Error middleware: convert exceptions into API-safe responses

## 19. Redis Caching Architecture

Redis should support performance and coordination, not replace PostgreSQL.

Cache use cases:

- Role-permission lookup
- User session revocation state
- Rate limiting counters
- Availability snapshots
- Reference data
- Short-lived report filters

Cache strategies:

- Cache-aside for read-heavy reference data
- Write-through invalidation for role changes, booking updates, and room status changes
- Short TTLs for availability and pricing snapshots
- Per-hotel key prefixes to avoid tenant leakage

Key patterns:

- `hotel:{hotelId}:permissions`
- `hotel:{hotelId}:rooms:availability:{date}`
- `user:{userId}:session:{sessionId}`
- `ratelimit:{scope}:{identifier}`

Redis rules:

- Never treat Redis as authoritative state
- Never store long-lived business truth only in Redis
- Keep values serializable and versioned

## 20. Background Jobs Architecture

Use background jobs for work that is slow, retryable, or periodic.

Job categories:

- Notification delivery
- Excel import processing
- Excel export generation
- Scheduled reminders
- Cache refresh jobs
- Cleanup jobs
- Report materialization if needed later

Job design rules:

- Jobs must be idempotent
- Jobs must be retry-safe
- Jobs must record progress and failure state
- Jobs should be horizontally scalable
- Worker code must be stateless

Queue separation:

- High-priority operational queue
- Low-priority batch queue
- Scheduled maintenance queue

## 21. File Upload Architecture

File uploads must be untrusted by default.

Supported upload types:

- Excel files for import/export
- Documents if the business later requires them
- Images or attachments if needed later

Upload flow:

1. Validate request and metadata
2. Inspect file type and size
3. Store in temporary or object storage
4. Create a job record
5. Process file in background
6. Persist structured results and errors

Security rules:

- Validate by content, not just extension
- Rename files server-side
- Limit file size and MIME types
- Never execute uploaded files
- Keep downloadable artifacts access-controlled

## 22. Docker Architecture

Recommended containers:

- `api`: Express application
- `worker`: background job processor
- `postgres`: local development only
- `redis`: local development and optional self-hosted deployment
- `migrate`: one-shot migration runner

Docker principles:

- Multi-stage builds
- Minimal runtime image
- Non-root container user
- Environment-driven configuration
- Separate API and worker containers in production

Local development:

- `docker-compose` brings up API, PostgreSQL, Redis, and optional observability tools
- Volumes should be used only where needed

Production:

- Run API and workers independently
- Use health checks and restart policies
- Use secrets injection rather than baked-in credentials

## 23. Environment Configuration Strategy

Configuration rules:

- All runtime config comes from environment variables
- `.env.example` must document every required setting
- Production secrets must never live in source control

Environment groups:

- App settings
- Database settings
- Redis settings
- JWT settings
- Logging settings
- Storage settings
- Mail settings
- Queue settings
- Rate limit settings
- Feature flags

Validation:

- Validate environment on startup
- Fail fast if mandatory settings are missing
- Use typed config normalization

## 24. Migration Strategy

Migration principles:

- Forward-only migrations are preferred
- Migrations must be versioned and reviewed
- Schema changes and data backfills should be separated when practical
- Large index operations should be planned carefully

Migration flow:

1. Apply schema change
2. Backfill or transform data
3. Add or tighten constraints
4. Update application code
5. Verify with smoke tests

Operational guidance:

- Keep a migration ledger
- Never alter production schema manually
- Keep rollback plans for release coordination even if actual down migrations are rare

## 25. Testing Strategy

Testing layers:

- Unit tests for domain and application logic
- Integration tests for database and cache behavior
- Contract tests for API and OpenAPI alignment
- End-to-end tests for critical guest and staff workflows

High-value test scenarios:

- Successful and failed login
- Role enforcement
- Booking creation and cancellation
- Room overlap rejection
- Payment allocation and refund validation
- Check-in/check-out state transitions
- Housekeeping task progression
- Import job failure handling

Test environment rules:

- Use a dedicated test database
- Reset state between tests
- Use factories and fixtures
- Make time-dependent tests deterministic

## 26. CI/CD Preparation Strategy

Pipeline stages:

1. Install dependencies
2. Lint
3. Format check
4. Unit tests
5. Integration tests
6. Contract validation
7. Build Docker images
8. Run migration checks
9. Publish artifacts
10. Deploy to staging
11. Run smoke tests
12. Promote to production

Pipeline rules:

- Fail fast on lint or test failures
- Treat OpenAPI drift as a build issue
- Treat migration failures as release blockers
- Keep deployment artifacts immutable

## 27. Production Deployment Architecture

Recommended production layout:

- Load balancer in front of stateless API instances
- Separate worker deployment for jobs
- Managed PostgreSQL with backups and point-in-time recovery
- Managed Redis or highly available Redis cluster
- Object storage for uploaded and generated files
- Centralized logging and metrics

Deployment strategy:

- Rolling deployment or blue-green deployment
- Health checks for readiness and liveness
- Automatic rollback on failed smoke tests
- Zero-downtime migrations only where feasible and safe

Operational safeguards:

- Backups
- Monitoring
- Alerting
- SLOs
- Runbooks

## 28. Recommended npm Packages

Core runtime:

- `express`
- `pg`
- `redis`
- `jsonwebtoken`
- `winston`
- `dotenv`
- `helmet`
- `cors`
- `express-rate-limit`
- `pino-http` is optional, but if Winston is the standard, keep logging unified

Validation and contracts:

- `zod` or `joi`
- `swagger-ui-express`
- `yaml`
- `openapi-types`

Security and utilities:

- `bcrypt` or `argon2`
- `uuid`
- `nanoid` if short identifiers are needed
- `multer` for controlled uploads
- `sharp` if image processing is ever needed

Testing:

- `jest`
- `supertest`
- `ts-jest` if using TypeScript
- `testcontainers` for real integration tests

Tooling:

- `eslint`
- `prettier`
- `husky`
- `lint-staged`
- `cross-env`
- `nodemon` or a comparable dev runner

Queue and jobs:

- `bullmq`

Optional observability:

- `prom-client`

## 29. Recommended Coding Standards

- Prefer TypeScript for production maintainability
- Use strict type checking
- Keep functions small and explicit
- Prefer composition over inheritance
- Keep side effects isolated
- Use dependency injection for all infrastructure access
- Avoid premature abstraction
- Treat every module as an independently testable boundary
- Keep request and response DTOs explicit
- Avoid leaking persistence models into the HTTP layer
- Keep SQL parameterized and reviewed
- Keep logs structured
- Keep naming consistent and predictable

Formatting and linting rules:

- ESLint for code quality
- Prettier for formatting
- One import style across the project
- No dead code
- No circular dependencies

## 30. Naming Conventions

Folder naming:

- Use lowercase and hyphenated names for modules
- Use singular or plural consistently within a category

File naming:

- Use descriptive names aligned to responsibility
- Use suffixes for layer intent where useful, such as `*.service`, `*.repository`, `*.controller`, `*.validator`

Class and type naming:

- PascalCase for classes, interfaces, DTOs, and types
- `I` prefix is optional and should not be mixed inconsistently

Database naming alignment:

- Match schema table intent in code names
- Keep entity names aligned to database concepts
- Use `hotelId`, `bookingId`, `roomTypeId`, not ambiguous abbreviations

API naming:

- Lowercase plural resource names
- Hyphenated multi-word routes
- Stable version prefix `/api/v1`

## 31. Module Creation Guidelines

When creating a new module:

1. Define the business boundary first
2. Decide whether it truly belongs as a separate module
3. Add domain concepts before transport concerns
4. Define application use cases
5. Define repository interfaces
6. Implement infrastructure adapters
7. Add validators and presentation adapters
8. Add tests before broadening the surface

Module creation rules:

- Do not place unrelated workflows in the same module
- Do not create a module solely because a table exists
- Create a module only when there is a distinct business responsibility
- Keep shared abstractions in `shared`, not copied across modules

## 32. Scalability Roadmap

Phase 1: Launch-ready

- Modular monolith
- PostgreSQL primary
- Redis cache and rate limits
- Queue-based background jobs
- Strong observability and audit logging

Phase 2: Growth

- Read replicas for reporting
- Cache optimization
- Job queue segmentation
- Partitioning of high-volume append-only tables if needed

Phase 3: Multi-property expansion

- Stronger tenant-level configuration
- Hotel-specific capacity and pricing strategies
- Cross-hotel reporting and federation support
- Service extraction only where operational pain clearly justifies it

Phase 4: Service decomposition, only if necessary

- Extract queue-heavy or operationally isolated domains first
- Keep the booking and billing core cohesive as long as practical

## 33. Final Guidance

The best implementation path is disciplined and boring in the best possible way: keep the core modular monolith tight, keep the boundaries explicit, keep data ownership clear, and keep the operational surface observable.

That will give the team a backend that is maintainable now and still capable of scaling into a real enterprise hotel platform later.

