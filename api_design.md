# Hotel Management System REST API Specification

## 1. API Overview

Base URL: `/api/v1`

Style:

- RESTful resource design
- JWT authentication
- RBAC authorization
- Soft-delete aware reads and writes
- Hotel-scoped access control
- Standard response envelope
- Standard error envelope
- Cursor or page-based pagination
- Rate limiting on all public and sensitive routes
- Idempotency for payment and refund operations
- OpenAPI/Swagger compatible

This specification is aligned to the database schema in `hotel_management_schema.sql` and the backend architecture in `backend_architecture.md`.

## 2. Global API Standards

### 2.1 Standard Success Response

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601",
    "pagination": {}
  }
}
```

### 2.2 Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": []
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}
```

### 2.3 Pagination Standard

- Offset pagination for simple lists
- Cursor pagination for high-churn resources such as bookings, payments, notifications, audit logs, and jobs
- Default page size: 20
- Maximum page size: 100
- Cursor should be opaque and signed or encoded

Query parameters:

- Page mode: `page`, `limit`
- Cursor mode: `cursor`, `limit`
- Sorting: `sortBy`, `sortOrder`
- Filtering: resource-specific query parameters

### 2.4 Authentication Standard

- Access token via `Authorization: Bearer <token>`
- Refresh token kept out of regular resource calls
- Token claims should include `sub`, `roles`, `hotelId` or hotel scope, `sid`, and token version
- All mutating operations require authentication unless explicitly public

### 2.5 RBAC Standard

Permission naming convention:

- `module:action`
- Examples: `bookings:create`, `rooms:update`, `payments:refund`, `audit:read`

Role model:

- `admin`
- `receptionist`
- `staff`
- `customer`

### 2.6 Rate Limiting Standard

- Authentication endpoints: strict per-IP and per-account throttles
- Password reset and OTP-like flows: stricter limits
- Write-heavy endpoints: moderate burst protection
- Report and export endpoints: queue-based throttling plus per-user limits

### 2.7 Idempotency Standard

- Payments, refunds, import jobs, and export jobs must accept `Idempotency-Key`
- Replayed requests with the same key must return the original result if the prior request succeeded
- Key TTL should be long enough for operational retries, typically 24 to 72 hours

### 2.8 Audit Logging Standard

Audit logs should record:

- Who acted
- What changed
- When it changed
- Which hotel context applied
- Request ID and IP/user agent when available

## 3. Complete API Module Structure

```text
/api/v1
  /auth
  /users
  /roles
  /permissions
  /hotels
  /customers
  /staff
  /room-types
  /amenities
  /rooms
  /room-rates
  /bookings
  /booking-guests
  /check-in
  /check-out
  /folios
  /invoices
  /payments
  /refunds
  /housekeeping
  /maintenance
  /food-categories
  /food-menu-items
  /food-orders
  /notifications
  /reports
  /import-export-jobs
  /audit-logs
```

## 4. Request and Response Contract Patterns

### 4.1 Resource Representation

Common resource fields:

- `id`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `hotelId` when hotel-scoped
- `status` when lifecycle-managed

### 4.2 List Response Pattern

```json
{
  "success": true,
  "message": "OK",
  "data": [],
  "meta": {
    "pagination": {
      "mode": "cursor",
      "limit": 20,
      "nextCursor": "opaque",
      "hasMore": true
    }
  }
}
```

### 4.3 Single Resource Response Pattern

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## 5. Security Model

Authentication:

- JWT access tokens
- Rotated refresh tokens
- Optional session revocation by token family

Authorization:

- Route guards for coarse checks
- Service-level permission checks for sensitive workflows
- Hotel scope validation on every hotel-bound resource

Transport security:

- TLS required in all non-local environments
- Secure headers and strict CORS policy

Data security:

- Soft delete by default
- Audit writes for sensitive create/update/delete operations
- Mask or exclude PII from public responses

## 6. API Naming Conventions

- Use lowercase plural nouns for collections
- Use singular nouns only for actions that represent workflows, such as `/auth/login`
- Use hyphenated resource names only when they improve readability
- Keep URL paths stable and versioned
- Avoid verbs in resource URLs except for non-CRUD workflows such as `check-in`, `check-out`, `refunds/:id/void`

## 7. Error Handling Standards

### 7.1 Common HTTP Errors

- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Validation Error
- `429` Too Many Requests
- `500` Internal Server Error

### 7.2 Common Error Codes

- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `AUTH_TOKEN_REVOKED`
- `RBAC_FORBIDDEN`
- `VALIDATION_FAILED`
- `RESOURCE_NOT_FOUND`
- `RESOURCE_CONFLICT`
- `RATE_LIMITED`
- `IDEMPOTENCY_CONFLICT`
- `BOOKING_DATE_CONFLICT`
- `ROOM_NOT_AVAILABLE`
- `PAYMENT_ALREADY_APPLIED`
- `REFUND_LIMIT_EXCEEDED`
- `IMPORT_FILE_INVALID`
- `IMPORT_JOB_FAILED`

### 7.3 Error Response Rules

- Never leak stack traces to clients
- Validation errors should include field-level detail
- Forbidden responses must not reveal privileged resource existence unnecessarily

## 8. Filtering, Sorting, Search, and Pagination Standards

### 8.1 Query Convention

- `page` and `limit` for offset mode
- `cursor` and `limit` for cursor mode
- `sortBy` and `sortOrder`
- `q` for global search where applicable
- Resource-specific filters should use explicit names

### 8.2 Sorting Convention

- Default sort should be stable and deterministic
- Common sort directions: `asc`, `desc`
- For cursor pagination, order by a unique monotonic column or a stable compound key

### 8.3 Search Convention

- Search should be limited to indexed or operationally necessary fields
- Use prefix or partial search only where supported and justified
- Search terms should not bypass hotel boundaries

## 9. Endpoint Catalog

### 9.1 Authentication

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Login | POST | `/auth/login` | Authenticate user and issue tokens | `email`, `password`, `hotelId?` | - | - | access token, refresh token, user profile, roles | email format, password required, inactive user blocked | No | Public | No | No | No | No | 400, 401, 429 |
| Refresh | POST | `/auth/refresh` | Rotate refresh token and issue new access token | `refreshToken` | - | - | new tokens | token required, replay detection | No | Public | No | No | No | No | 401, 409 |
| Logout | POST | `/auth/logout` | Revoke current session | `refreshToken?` | - | - | success flag | token optional if session from header | Yes | Any authenticated | No | No | No | No | 401 |
| Change Password | POST | `/auth/change-password` | Update password for current user | `currentPassword`, `newPassword` | - | - | success flag | strong password policy | Yes | Any authenticated | No | No | No | No | 400, 401, 422 |
| Forgot Password | POST | `/auth/forgot-password` | Start password reset | `email` | - | - | success flag | rate limited, email must exist only if policy allows | No | Public | No | No | No | No | 202, 429 |
| Reset Password | POST | `/auth/reset-password` | Complete password reset | `token`, `newPassword` | - | - | success flag | token validity, password policy | No | Public | No | No | No | No | 400, 401, 422 |
| Me | GET | `/auth/me` | Return current session identity | - | - | - | user, roles, permissions, hotel scope | JWT required | Yes | Any authenticated | No | No | No | No | 401 |

### 9.2 Users

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Users | GET | `/users` | List users | - | `page`, `limit`, `cursor`, `status`, `role`, `hotelId`, `q` | - | user list | filter values valid | Yes | `users:read` | Yes | status, role, hotel | createdAt, email | name/email | 401, 403 |
| Get User | GET | `/users/{userId}` | Fetch user detail | - | - | `userId` | user detail | UUID required | Yes | `users:read` | No | - | - | - | 401, 404 |
| Create User | POST | `/users` | Create internal user | `email`, `password`, `displayName`, `phone?`, `roleIds`, `hotelId?` | - | - | created user | unique email, strong password, role ids valid | Yes | `users:create` | No | - | - | - | 400, 409 |
| Update User | PATCH | `/users/{userId}` | Update user profile/status | partial user fields | - | `userId` | updated user | allowed fields only | Yes | `users:update` | No | - | - | - | 400, 404, 409 |
| Disable User | DELETE | `/users/{userId}` | Soft delete or deactivate user | - | - | `userId` | success flag | cannot self-delete if policy blocks it | Yes | `users:delete` | No | - | - | - | 403, 404 |

### 9.3 Roles

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Roles | GET | `/roles` | List roles | - | `page`, `limit`, `q` | - | roles | - | Yes | `roles:read` | Yes | code | name | name | 401, 403 |
| Get Role | GET | `/roles/{roleId}` | Role detail | - | - | `roleId` | role with permissions | UUID | Yes | `roles:read` | No | - | - | - | 404 |
| Create Role | POST | `/roles` | Create role | `code`, `name`, `description?` | - | - | role | unique code | Yes | `roles:create` | No | - | - | - | 409 |
| Update Role | PATCH | `/roles/{roleId}` | Update role | partial role fields | - | `roleId` | role | code immutability optional | Yes | `roles:update` | No | - | - | - | 404, 409 |
| Delete Role | DELETE | `/roles/{roleId}` | Soft delete role | - | - | `roleId` | success flag | system roles protected | Yes | `roles:delete` | No | - | - | - | 403, 404 |

### 9.4 Permissions

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Permissions | GET | `/permissions` | List permission catalog | - | `page`, `limit`, `module`, `q` | - | permissions | - | Yes | `permissions:read` | Yes | module | code | name/module | 401, 403 |
| Create Permission | POST | `/permissions` | Define permission | `code`, `moduleName`, `name`, `description?` | - | - | permission | unique code, module required | Yes | `permissions:create` | No | - | - | - | 409 |
| Update Permission | PATCH | `/permissions/{permissionId}` | Update permission | partial fields | - | `permissionId` | permission | - | Yes | `permissions:update` | No | - | - | - | 404 |
| Delete Permission | DELETE | `/permissions/{permissionId}` | Soft delete permission | - | - | `permissionId` | success flag | system protection recommended | Yes | `permissions:delete` | No | - | - | - | 403, 404 |
| Update Role Permissions | PUT | `/roles/{roleId}/permissions` | Replace role permission set | `permissionIds[]` | - | `roleId` | role permissions | all ids valid | Yes | `roles:update` | No | - | - | - | 400, 404 |

### 9.5 Hotels

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Hotels | GET | `/hotels` | List hotel tenants | `page`, `limit`, `status`, `q` | - | - | hotel list | - | Yes | `hotels:read` | Yes | active | name | name | 401, 403 |
| Get Hotel | GET | `/hotels/{hotelId}` | Hotel detail | - | - | `hotelId` | hotel detail | UUID | Yes | `hotels:read` | No | - | - | - | 404 |
| Create Hotel | POST | `/hotels` | Register hotel | `hotelCode`, `name`, `currencyCode`, `timezone`, address fields | - | - | hotel | unique code, codes format | Yes | `hotels:create` | No | - | - | - | 409 |
| Update Hotel | PATCH | `/hotels/{hotelId}` | Update hotel profile | partial hotel fields | - | `hotelId` | hotel | immutable codes if policy | Yes | `hotels:update` | No | - | - | - | 404 |
| Disable Hotel | DELETE | `/hotels/{hotelId}` | Soft delete hotel | - | - | `hotelId` | success flag | may require cascade policy review | Yes | `hotels:delete` | No | - | - | - | 403, 404 |

### 9.6 Customers

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Customers | GET | `/customers` | Customer profiles | `page`, `limit`, `status`, `hotelId`, `q` | - | - | customers | - | Yes | `customers:read` | Yes | hotel, active | name | name, phone, email | 401, 403 |
| Get Customer | GET | `/customers/{customerId}` | Customer detail | - | - | `customerId` | customer detail | UUID | Yes | `customers:read` | No | - | - | - | 404 |
| Create Customer | POST | `/customers` | Create customer profile | profile fields | - | - | customer | unique per hotel/user rules | Yes | `customers:create` | No | - | - | - | 409 |
| Update Customer | PATCH | `/customers/{customerId}` | Update customer profile | partial fields | - | `customerId` | customer | - | Yes | `customers:update` | No | - | - | - | 404 |

### 9.7 Staff

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Staff | GET | `/staff` | Staff profiles | `page`, `limit`, `hotelId`, `department`, `q` | - | - | staff list | - | Yes | `staff:read` | Yes | hotel, department | name | name/employeeNo | 401, 403 |
| Get Staff | GET | `/staff/{staffId}` | Staff detail | - | - | `staffId` | staff detail | UUID | Yes | `staff:read` | No | - | - | - | 404 |
| Create Staff | POST | `/staff` | Create staff profile | staff profile fields | - | - | staff | user and hotel valid | Yes | `staff:create` | No | - | - | - | 409 |
| Update Staff | PATCH | `/staff/{staffId}` | Update staff profile | partial fields | - | `staffId` | staff | - | Yes | `staff:update` | No | - | - | - | 404 |

### 9.8 Room Types

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Room Types | GET | `/room-types` | List room categories | `page`, `limit`, `hotelId`, `activeOnly`, `q` | - | - | room types | - | Yes | `roomTypes:read` | Yes | hotel, active | name | code/name | 401, 403 |
| Get Room Type | GET | `/room-types/{roomTypeId}` | Room type detail | - | - | `roomTypeId` | room type detail | UUID | Yes | `roomTypes:read` | No | - | - | - | 404 |
| Create Room Type | POST | `/room-types` | Create room type | type fields | - | - | room type | occupancy and rate rules | Yes | `roomTypes:create` | No | - | - | - | 400, 409 |
| Update Room Type | PATCH | `/room-types/{roomTypeId}` | Update room type | partial fields | - | `roomTypeId` | room type | - | Yes | `roomTypes:update` | No | - | - | - | 404 |

### 9.9 Amenities

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Amenities | GET | `/amenities` | Room amenity master list | `page`, `limit`, `category`, `q` | - | - | amenities | - | Yes | `amenities:read` | Yes | category | name | name/code | 401, 403 |
| Create Amenity | POST | `/amenities` | Create amenity | `code`, `name`, `category?`, `description?` | - | - | amenity | unique code | Yes | `amenities:create` | No | - | - | - | 409 |
| Update Amenity | PATCH | `/amenities/{amenityId}` | Update amenity | partial fields | - | `amenityId` | amenity | - | Yes | `amenities:update` | No | - | - | - | 404 |
| Delete Amenity | DELETE | `/amenities/{amenityId}` | Soft delete amenity | - | - | `amenityId` | success flag | in-use protection recommended | Yes | `amenities:delete` | No | - | - | - | 409 |

### 9.10 Rooms

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Rooms | GET | `/rooms` | List rooms | `page`, `limit`, `hotelId`, `roomTypeId`, `status`, `q` | - | - | rooms | - | Yes | `rooms:read` | Yes | hotel, type, status | room number | room number | 401, 403 |
| Get Room | GET | `/rooms/{roomId}` | Room detail | - | - | `roomId` | room detail | UUID | Yes | `rooms:read` | No | - | - | - | 404 |
| Create Room | POST | `/rooms` | Create room inventory record | room fields | - | - | room | room number unique per hotel | Yes | `rooms:create` | No | - | - | - | 409 |
| Update Room | PATCH | `/rooms/{roomId}` | Update room | partial fields | - | `roomId` | room | - | Yes | `rooms:update` | No | - | - | - | 404 |
| Update Room Status | PATCH | `/rooms/{roomId}/status` | Change room status | `status`, `reason?` | - | `roomId` | room status | valid lifecycle transition | Yes | `rooms:update` or `housekeeping:update` | No | - | - | - | 400, 409 |
| Room Availability | GET | `/rooms/availability` | Check availability by date range | - | `hotelId`, `roomTypeId`, `checkInDate`, `checkOutDate`, `guestCount` | - | available rooms | date range required | Yes | `rooms:read` | No | hotel, type | - | - | 400 |

### 9.11 Room Rates

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Rates | GET | `/room-rates` | List room rate plans | `roomTypeId`, `activeOnly`, `date`, `page`, `limit` | - | - | rates | - | Yes | `roomRates:read` | Yes | roomType, active | validFrom | rate name | 401, 403 |
| Create Rate | POST | `/room-rates` | Create rate plan | rate fields | - | - | rate | date window, positive amount | Yes | `roomRates:create` | No | - | - | - | 400, 409 |
| Update Rate | PATCH | `/room-rates/{rateId}` | Update rate | partial fields | - | `rateId` | rate | overlap protection | Yes | `roomRates:update` | No | - | - | - | 404, 409 |
| Delete Rate | DELETE | `/room-rates/{rateId}` | Soft delete rate | - | - | `rateId` | success flag | protected if active booking references exist | Yes | `roomRates:delete` | No | - | - | - | 409 |

### 9.12 Bookings

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Bookings | GET | `/bookings` | Booking list | `page`, `limit`, `cursor`, `hotelId`, `status`, `dateFrom`, `dateTo`, `customerId`, `q` | - | - | bookings | - | Yes | `bookings:read` | Yes | hotel, status, dates, customer | createdAt, checkInDate | booking ref, customer | 401, 403 |
| Get Booking | GET | `/bookings/{bookingId}` | Booking detail | - | - | `bookingId` | booking detail with rooms, guests, payments summary | UUID | Yes | `bookings:read` | No | - | - | - | 404 |
| Create Booking | POST | `/bookings` | Create booking header and rooms | booking header, room lines, guests | - | - | created booking | date validity, room availability, hotel scope | Yes | `bookings:create` | No | - | - | - | 400, 409 |
| Update Booking | PATCH | `/bookings/{bookingId}` | Update booking before stay begins | partial booking fields | - | `bookingId` | booking | state rules enforced | Yes | `bookings:update` | No | - | - | - | 400, 409 |
| Cancel Booking | POST | `/bookings/{bookingId}/cancel` | Cancel reservation | `reason` | - | `bookingId` | booking status | cannot cancel after restricted states without policy | Yes | `bookings:cancel` | No | - | - | - | 409 |
| Booking Summary | GET | `/bookings/{bookingId}/summary` | Compact operational summary | - | - | `bookingId` | summary object | booking must exist | Yes | `bookings:read` | No | - | - | - | 404 |

### 9.13 Booking Guests

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Booking Guests | GET | `/booking-guests` | Guests attached to booking rooms | `bookingId`, `bookingRoomId` | - | - | guests | - | Yes | `bookings:read` | No | booking | - | name/doc | 401, 403 |
| Add Booking Guest | POST | `/booking-guests` | Add guest to booking | guest fields | - | - | guest | primary guest rule, hotel scope | Yes | `bookings:update` | No | - | - | - | 400, 409 |
| Update Booking Guest | PATCH | `/booking-guests/{guestId}` | Update guest data | partial fields | - | `guestId` | guest | - | Yes | `bookings:update` | No | - | - | - | 404 |
| Remove Booking Guest | DELETE | `/booking-guests/{guestId}` | Soft delete guest | - | - | `guestId` | success flag | preserve auditability | Yes | `bookings:update` | No | - | - | - | 404 |

### 9.14 Check-In

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Check-In Booking | POST | `/check-in` | Create check-in record | `bookingId`, `checkedInAt?`, `depositAmount?`, `remarks?` | - | - | check-in record, updated booking state | booking must be confirmed and eligible | Yes | `checkIn:create` | No | - | - | - | 400, 409 |
| Get Check-In | GET | `/check-in/{bookingId}` | Fetch check-in record | - | - | `bookingId` | record | booking id required | Yes | `checkIn:read` | No | - | - | - | 404 |

### 9.15 Check-Out

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Check-Out Booking | POST | `/check-out` | Create check-out record | `bookingId`, `checkedOutAt?`, `finalInspectionStatus?`, `remarks?` | - | - | check-out record, settlement summary | booking must be checked in | Yes | `checkOut:create` | No | - | - | - | 400, 409 |
| Get Check-Out | GET | `/check-out/{bookingId}` | Fetch check-out record | - | - | `bookingId` | record | booking id required | Yes | `checkOut:read` | No | - | - | - | 404 |

### 9.16 Folios

If folios are implemented as a service abstraction above invoices and payments, the API can expose operational running-bill endpoints even though the current schema centers on invoices and invoice items.

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Get Folio Summary | GET | `/folios/{bookingId}` | Running bill summary for booking | - | - | `bookingId` | summary object | booking required | Yes | `folios:read` | No | - | - | - | 404 |
| Add Folio Item | POST | `/folios/{bookingId}/items` | Add charge line to folio | item fields | - | `bookingId` | item or invoice item | amount, type, source rules | Yes | `folios:update` | No | - | - | - | 400, 409 |

### 9.17 Invoices

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Invoices | GET | `/invoices` | Invoice list | `page`, `limit`, `cursor`, `hotelId`, `status`, `dateFrom`, `dateTo`, `bookingId`, `q` | - | - | invoices | - | Yes | `invoices:read` | Yes | hotel, status, dates | invoiceDate | invoice number | 401, 403 |
| Get Invoice | GET | `/invoices/{invoiceId}` | Invoice detail | - | - | `invoiceId` | invoice with items and payment summary | UUID | Yes | `invoices:read` | No | - | - | - | 404 |
| Generate Invoice | POST | `/invoices` | Create invoice from booking/final stay | `bookingId`, `issuedByUserId?` | - | - | invoice | booking must be billable | Yes | `invoices:create` | No | - | - | - | 400, 409 |
| Update Invoice | PATCH | `/invoices/{invoiceId}` | Adjust draft invoice | partial invoice fields | - | `invoiceId` | invoice | only allowed before lock/finalization | Yes | `invoices:update` | No | - | - | - | 409, 404 |
| Void Invoice | POST | `/invoices/{invoiceId}/void` | Void issued invoice | `reason` | - | `invoiceId` | invoice status | immutable once settled unless policy permits | Yes | `invoices:void` | No | - | - | - | 409 |

### 9.18 Payments

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Payments | GET | `/payments` | Payment list | `page`, `limit`, `cursor`, `hotelId`, `status`, `method`, `bookingId`, `invoiceId`, `dateFrom`, `dateTo` | - | - | payments | - | Yes | `payments:read` | Yes | hotel, status, method, dates | paidAt | payment ref | 401, 403 |
| Get Payment | GET | `/payments/{paymentId}` | Payment detail | - | - | `paymentId` | payment detail and allocations | UUID | Yes | `payments:read` | No | - | - | - | 404 |
| Create Payment | POST | `/payments` | Record payment | payment fields + `Idempotency-Key` | - | - | payment | amount positive, booking or invoice valid | Yes | `payments:create` | No | - | - | - | 400, 409 |
| Allocate Payment | POST | `/payments/{paymentId}/allocate` | Allocate payment to invoices | `allocations[]` | - | `paymentId` | allocation summary | allocation sum cannot exceed payment amount | Yes | `payments:allocate` | No | - | - | - | 400, 409 |
| Capture Payment | POST | `/payments/{paymentId}/capture` | Mark authorized payment captured | `gatewayTransactionId?` | - | `paymentId` | payment status | capture transition only | Yes | `payments:update` | No | - | - | - | 409 |
| Void Payment | POST | `/payments/{paymentId}/void` | Void pending payment | `reason` | - | `paymentId` | payment status | only if allowed by status | Yes | `payments:void` | No | - | - | - | 409 |

### 9.19 Refunds

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Refunds | GET | `/refunds` | Refund list | `page`, `limit`, `hotelId`, `paymentId`, `status`, `dateFrom`, `dateTo` | - | - | refunds | - | Yes | `refunds:read` | Yes | hotel, status, dates | refundedAt | refund ref | 401, 403 |
| Get Refund | GET | `/refunds/{refundId}` | Refund detail | - | - | `refundId` | refund | UUID | Yes | `refunds:read` | No | - | - | - | 404 |
| Create Refund | POST | `/refunds` | Create refund | refund fields + `Idempotency-Key` | - | - | refund | amount <= refundable balance | Yes | `refunds:create` | No | - | - | - | 400, 409 |
| Approve Refund | POST | `/refunds/{refundId}/approve` | Approve operational refund | `approvedByUserId?` | - | `refundId` | refund | workflow dependent | Yes | `refunds:approve` | No | - | - | - | 409 |
| Void Refund | POST | `/refunds/{refundId}/void` | Void refund request | `reason` | - | `refundId` | refund status | status transition only | Yes | `refunds:void` | No | - | - | - | 409 |

### 9.20 Housekeeping

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Tasks | GET | `/housekeeping/tasks` | Task queue | `page`, `limit`, `hotelId`, `status`, `priority`, `roomId`, `assignedToUserId` | - | - | tasks | - | Yes | `housekeeping:read` | Yes | hotel, status, priority | createdAt | room number | 401, 403 |
| Create Task | POST | `/housekeeping/tasks` | Create housekeeping task | task fields | - | - | task | hotel and room scope valid | Yes | `housekeeping:create` | No | - | - | - | 400, 409 |
| Update Task | PATCH | `/housekeeping/tasks/{taskId}` | Update task | partial task fields | - | `taskId` | task | lifecycle rules | Yes | `housekeeping:update` | No | - | - | - | 404, 409 |
| Complete Task | POST | `/housekeeping/tasks/{taskId}/complete` | Mark complete | `completedAt?`, `notes?` | - | `taskId` | task | task must be in progress | Yes | `housekeeping:update` | No | - | - | - | 409 |

### 9.21 Maintenance

Maintenance can be modeled through housekeeping tasks with `taskType=maintenance` and optionally surfaced by filtered endpoints.

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Maintenance Tasks | GET | `/maintenance/tasks` | Filtered maintenance view | `page`, `limit`, `hotelId`, `status`, `priority`, `roomId` | - | - | tasks | task type fixed to maintenance | Yes | `maintenance:read` | Yes | hotel, room, status | createdAt | room number | 401, 403 |
| Report Maintenance Issue | POST | `/maintenance/tasks` | Create maintenance ticket | issue fields | - | - | task | maps to housekeeping task type maintenance | Yes | `maintenance:create` | No | - | - | - | 400 |

### 9.22 Food Categories

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Categories | GET | `/food-categories` | Food category list | `page`, `limit`, `hotelId`, `activeOnly`, `q` | - | - | categories | - | Yes | `food:read` | Yes | hotel, active | name | name/code | 401, 403 |
| Create Category | POST | `/food-categories` | Create food category | category fields | - | - | category | unique hotel code | Yes | `food:create` | No | - | - | - | 409 |
| Update Category | PATCH | `/food-categories/{categoryId}` | Update category | partial fields | - | `categoryId` | category | - | Yes | `food:update` | No | - | - | - | 404 |

### 9.23 Food Menu Items

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Menu Items | GET | `/food-menu-items` | Menu item catalog | `page`, `limit`, `hotelId`, `categoryId`, `availableOnly`, `q` | - | - | menu items | - | Yes | `food:read` | Yes | hotel, category, available | name | name/code | 401, 403 |
| Create Menu Item | POST | `/food-menu-items` | Create menu item | item fields | - | - | item | price and tax rules | Yes | `food:create` | No | - | - | - | 400, 409 |
| Update Menu Item | PATCH | `/food-menu-items/{menuItemId}` | Update item | partial fields | - | `menuItemId` | item | - | Yes | `food:update` | No | - | - | - | 404 |
| Delete Menu Item | DELETE | `/food-menu-items/{menuItemId}` | Soft delete item | - | - | `menuItemId` | success flag | in-use protection recommended | Yes | `food:delete` | No | - | - | - | 409 |

### 9.24 Food Orders

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Food Orders | GET | `/food-orders` | Kitchen/order list | `page`, `limit`, `hotelId`, `status`, `bookingId`, `bookingRoomId`, `dateFrom`, `dateTo` | - | - | orders | - | Yes | `food:read` | Yes | hotel, status, dates | orderedAt | order number | 401, 403 |
| Get Food Order | GET | `/food-orders/{orderId}` | Food order detail | - | - | `orderId` | order with items | UUID | Yes | `food:read` | No | - | - | - | 404 |
| Create Food Order | POST | `/food-orders` | Place food order | order header and items + `Idempotency-Key` | - | - | order | booking or customer source valid | Yes | `food:create` | No | - | - | - | 400, 409 |
| Update Food Order Status | PATCH | `/food-orders/{orderId}/status` | Advance kitchen workflow | `status` | - | `orderId` | order | valid order status transition | Yes | `food:update` | No | - | - | - | 409 |
| Add Food Order Item | POST | `/food-orders/{orderId}/items` | Add line item | item fields | - | `orderId` | item | item belongs to same hotel/order | Yes | `food:update` | No | - | - | - | 400, 409 |

### 9.25 Notifications

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Notifications | GET | `/notifications` | User notification inbox | `page`, `limit`, `status`, `channel`, `q` | - | - | notifications | tenant and recipient scoped | Yes | `notifications:read` | Yes | status, channel | createdAt | title/body | 401, 403 |
| Get Notification | GET | `/notifications/{notificationId}` | Notification detail | - | - | `notificationId` | notification | recipient scope enforced | Yes | `notifications:read` | No | - | - | - | 404 |
| Mark Read | POST | `/notifications/{notificationId}/read` | Mark as read | - | - | `notificationId` | success flag | recipient only | Yes | `notifications:update` | No | - | - | - | 404 |
| Send Notification | POST | `/notifications` | Create outbound notification record | notification fields | - | - | notification | hotel and recipient valid | Yes | `notifications:create` | No | - | - | - | 400, 404 |

### 9.26 Reports

Reports should be generated from read-optimized queries or background jobs depending on cost.

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Occupancy Report | GET | `/reports/occupancy` | Occupancy and utilization | - | `hotelId`, `dateFrom`, `dateTo`, `roomTypeId?` | - | report object | date range required | Yes | `reports:read` | No | hotel, room type, dates | - | - | 400, 403 |
| Revenue Report | GET | `/reports/revenue` | Revenue summary | - | `hotelId`, `dateFrom`, `dateTo`, `groupBy?` | - | report object | date range required | Yes | `reports:read` | No | hotel, dates | - | - | 400, 403 |
| Booking Report | GET | `/reports/bookings` | Booking metrics | - | `hotelId`, `dateFrom`, `dateTo`, `status?` | - | report object | - | Yes | `reports:read` | No | hotel, status | - | - | 400, 403 |
| Food Sales Report | GET | `/reports/food-sales` | Food revenue summary | - | `hotelId`, `dateFrom`, `dateTo`, `categoryId?` | - | report object | - | Yes | `reports:read` | No | hotel, category, dates | - | - | 400, 403 |
| Audit Report | GET | `/reports/audit` | Audit summary | - | `hotelId`, `dateFrom`, `dateTo`, `actorUserId?` | - | report object | date range required | Yes | `reports:read` | No | actor, hotel, date | - | - | 400, 403 |

### 9.27 Import/Export Jobs

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Jobs | GET | `/import-export-jobs` | List import/export jobs | `page`, `limit`, `hotelId`, `jobKind`, `status`, `entityName` | - | - | jobs | - | Yes | `jobs:read` | Yes | hotel, kind, status | createdAt | file/entity | 401, 403 |
| Get Job | GET | `/import-export-jobs/{jobId}` | Job detail | - | - | `jobId` | job detail | UUID | Yes | `jobs:read` | No | - | - | - | 404 |
| Start Import | POST | `/import-export-jobs/import` | Create import job | file metadata and mapping info | - | - | job | file validation, hotel scope | Yes | `jobs:create` | No | - | - | - | 400, 409 |
| Start Export | POST | `/import-export-jobs/export` | Create export job | export parameters | - | - | job | queueable job only | Yes | `jobs:create` | No | - | - | - | 400, 409 |
| Download Artifact | GET | `/import-export-jobs/{jobId}/download` | Download generated file | - | - | `jobId` | file stream or signed URL | job completed | Yes | `jobs:read` | No | - | - | - | 404, 409 |

### 9.28 Audit Logs

| Endpoint | Method | URL Pattern | Purpose | Request Body | Query | Path | Response | Validation | Auth | RBAC | Pagination | Filtering | Sorting | Search | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| List Audit Logs | GET | `/audit-logs` | Audit trail query | `cursor`, `limit`, `hotelId`, `entityTable`, `entityId`, `actorUserId`, `dateFrom`, `dateTo`, `action` | - | - | audit logs | date range recommended | Yes | `audit:read` | Yes | hotel, entity, actor, action, date | occurredAt | action/entity/id | 401, 403 |
| Get Audit Log | GET | `/audit-logs/{auditLogId}` | Audit detail | - | - | `auditLogId` | audit record | UUID | Yes | `audit:read` | No | - | - | - | 404 |

## 10. Module-Specific Contract Notes

### Authentication

- Login must be rate limited
- Refresh token reuse should revoke the session family
- Password reset should not reveal whether a user exists unless the product intentionally allows that

### Users, Staff, Customers

- Staff and customer profiles should be hotel-scoped
- Soft-deleted profiles should not appear in default queries
- Public self-service endpoints should be separated from administrative user management

### Rooms, Room Types, Room Rates, Amenities

- Room availability and rate queries should prefer cached snapshots only for short TTLs
- Rate overlap must be prevented by application validation and database constraints
- Hotel context must always be explicit

### Bookings, Check-In, Check-Out

- Booking creation must validate room availability before persistence
- Check-in and check-out should be workflow actions, not generic updates
- Booking state transitions should be protected from invalid regressions

### Payments, Refunds, Invoices

- Payment and refund endpoints must be idempotent
- All payment-related writes must be audited
- Payment allocation must never exceed payment amount
- Refund total must never exceed refundable balance

### Housekeeping and Maintenance

- Maintenance is a specialized task flow and can be represented as housekeeping tasks with a fixed task type
- Task assignment should emit notifications and audit events

### Food Ordering

- Orders should support booking-linked and customer-linked creation
- Order status transitions should reflect kitchen workflow
- Menu items should be hotel-scoped

### Notifications

- In-app notification records are source-of-truth for the inbox
- Delivery to email/SMS/push should happen through background workers

### Reports

- Reports should be read-only
- Heavy reports should be asynchronous when the time window or dataset is large

### Import/Export Jobs

- All file processing should happen asynchronously
- Job progress should be persisted and queryable
- Artifact downloads should be secured by job ownership and hotel scope

### Audit Logs

- Audit logs are immutable
- Write paths should be service-owned and captured automatically
- Sensitive value masking must be enforced

## 11. OpenAPI and Documentation Standards

The OpenAPI document should:

- Use `openapi: 3.1.x`
- Define reusable schemas for response envelopes and errors
- Tag each module separately
- Mark security schemes for JWT bearer auth
- Document rate limits on sensitive routes
- Document idempotency headers on payment and refund routes
- Include request/response examples for create, update, and workflow actions

Recommended reusable components:

- `SuccessResponse`
- `ErrorResponse`
- `PaginationMeta`
- `AuthTokens`
- `UserSummary`
- `BookingSummary`
- `InvoiceSummary`
- `PaymentSummary`
- `AuditLogEntry`

## 12. Best Practices Summary

- Keep routes resource-oriented and versioned
- Keep every hotel-scoped request explicitly scoped
- Keep destructive operations soft-delete based unless business rules require hard deletion
- Keep payments and refunds idempotent
- Keep reporting read-only
- Keep audit trails immutable
- Keep request validation strict
- Keep authorization layered
- Keep controllers thin
- Keep the public contract stable and well documented

