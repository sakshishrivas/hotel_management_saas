# Hotel Management System — Part 2: Sections 5–7

---

## 5. Database Design Overview

### 5.1 Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | All system users | id, email, password_hash, role, first_name, last_name, phone, is_active, is_locked, created_at |
| `roles` | Role definitions | id, name, description |
| `permissions` | Permission definitions | id, module, action, description |
| `role_permissions` | Role-permission mapping | role_id, permission_id |
| `refresh_tokens` | JWT refresh tokens | id, user_id, token_hash, expires_at, revoked_at, ip_address |

### 5.2 Room Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `room_types` | Room category definitions | id, name, base_price, max_occupancy, description, amenities (JSONB) |
| `rooms` | Individual rooms | id, room_number, room_type_id, floor, status, is_active, notes |
| `room_images` | Room gallery | id, room_id, image_url, is_primary, sort_order |
| `room_amenities` | Amenity master list | id, name, icon, category |
| `room_type_amenities` | Type-amenity mapping | room_type_id, amenity_id |

### 5.3 Booking Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `bookings` | Reservations | id, booking_ref, guest_id, room_id, check_in_date, check_out_date, status, adults, children, special_requests, created_by, total_amount |
| `group_bookings` | Group reservation header | id, group_ref, primary_guest_id, discount_percent, total_amount |
| `group_booking_rooms` | Rooms in group booking | group_booking_id, booking_id |
| `check_ins` | Check-in records | id, booking_id, actual_arrival, id_verified, verified_by, notes |
| `check_outs` | Check-out records | id, booking_id, actual_departure, final_amount, processed_by |

### 5.4 Billing Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `folios` | Guest running bill | id, booking_id, guest_id, status (open/closed), total_amount |
| `folio_items` | Line items on folio | id, folio_id, item_type (room/food/service), description, amount, tax_amount, date |
| `payments` | Payment transactions | id, folio_id, booking_id, method (cash/card/upi), amount, reference_number, status, processed_by |
| `invoices` | Generated invoices | id, folio_id, invoice_number, pdf_url, issued_at, due_date |
| `refunds` | Refund records | id, payment_id, amount, reason, status, processed_by |
| `tax_configs` | Tax rate configuration | id, name, rate_percent, applicable_to, is_active |

### 5.5 Guest & Staff Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `guests` | Guest profiles (extends users) | id, user_id (nullable), first_name, last_name, email, phone, id_type, id_number_encrypted, nationality, address, is_vip |
| `staff_profiles` | Staff details (extends users) | id, user_id, department_id, employee_code, hire_date, shift_id |
| `departments` | Department master | id, name, description |
| `shifts` | Shift definitions | id, name, start_time, end_time |
| `staff_attendance` | Daily attendance | id, staff_id, date, clock_in, clock_out, status |

### 5.6 Housekeeping Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `housekeeping_tasks` | Cleaning/maintenance tasks | id, room_id, task_type, priority, status, assigned_to, created_by, due_at, completed_at, notes |
| `room_inspections` | Inspection results | id, task_id, inspector_id, result (pass/fail), notes, inspected_at |
| `maintenance_requests` | Maintenance issues | id, room_id, category, description, priority, status, assigned_to, resolved_at |
| `housekeeping_inventory` | Cleaning supplies | id, item_name, quantity, min_threshold, unit |

### 5.7 Food Ordering Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `menu_categories` | Menu sections | id, name, sort_order, is_active |
| `menu_items` | Individual dishes | id, category_id, name, description, price, image_url, is_available |
| `food_orders` | Order header | id, order_number, booking_id, room_id, guest_id, status, total_amount, ordered_at |
| `food_order_items` | Order line items | id, order_id, menu_item_id, quantity, unit_price, notes |

### 5.8 System Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `notifications` | In-app notifications | id, user_id, type, title, message, is_read, data (JSONB), created_at |
| `notification_preferences` | User notification settings | id, user_id, channel, event_type, is_enabled |
| `audit_logs` | System audit trail | id, user_id, action, entity_type, entity_id, old_values (JSONB), new_values (JSONB), ip_address, user_agent, created_at |
| `system_configs` | App configuration | id, key, value, description, updated_by |

### 5.9 Indexing Strategy

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| idx_bookings_dates | bookings | check_in_date, check_out_date | Availability queries |
| idx_bookings_status | bookings | status | Status filtering |
| idx_bookings_guest | bookings | guest_id | Guest history |
| idx_rooms_status | rooms | status, is_active | Room availability |
| idx_audit_entity | audit_logs | entity_type, entity_id | Entity history |
| idx_audit_user_date | audit_logs | user_id, created_at | User activity |
| idx_payments_folio | payments | folio_id | Payment lookup |
| idx_hk_tasks_status | housekeeping_tasks | status, assigned_to | Task queue |
| idx_food_orders_room | food_orders | room_id, status | Kitchen queue |
| idx_notifications_user | notifications | user_id, is_read | Notification bell |

---

## 6. ER Diagram (Text Format)

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│    roles     │──1:N──│    users      │──1:1──│  staff_profiles  │
│             │       │              │       │                  │
│ id          │       │ id           │       │ id               │
│ name        │       │ email        │       │ user_id (FK)     │
│ description │       │ password_hash│       │ department_id(FK)│
└──────┬──────┘       │ role (FK)    │       │ shift_id (FK)    │
       │              │ is_active    │       └────────┬─────────┘
       │              │ is_locked    │                │
┌──────┴──────┐       └──────┬───────┘       ┌───────┴─────────┐
│role_permissions│            │               │  departments    │
│             │            │               │                 │
│ role_id(FK) │       ┌────┴────┐          │ id              │
│ perm_id(FK) │       │         │          │ name            │
└──────┬──────┘       │         │          └─────────────────┘
       │         ┌────┴───┐ ┌───┴────────┐
┌──────┴──────┐  │ guests │ │refresh_tokens│
│ permissions │  │        │ │            │
│             │  │ id     │ │ id         │
│ id          │  │ user_id│ │ user_id(FK)│
│ module      │  │ email  │ │ token_hash │
│ action      │  │ phone  │ │ expires_at │
└─────────────┘  │ is_vip │ └────────────┘
                 └───┬────┘
                     │
        ┌────────────┼──────────────┐
        │            │              │
   ┌────┴────┐  ┌────┴─────┐  ┌────┴──────┐
   │bookings │  │food_orders│  │notifications│
   │         │  │          │  │           │
   │ id      │  │ id       │  │ id        │
   │ guest_id│  │ guest_id │  │ user_id   │
   │ room_id │  │ room_id  │  │ type      │
   │ status  │  │ status   │  │ is_read   │
   └────┬────┘  └────┬─────┘  └───────────┘
        │            │
   ┌────┴────┐  ┌────┴──────────┐
   │ folios  │  │food_order_items│
   │         │  │               │
   │ id      │  │ order_id (FK) │
   │ booking │  │ menu_item(FK) │
   │ guest_id│  │ quantity      │
   └────┬────┘  └───────────────┘
        │
   ┌────┴──────┐
   │folio_items │     ┌───────────┐
   │           │     │  payments  │
   │ folio_id  │     │           │
   │ item_type │     │ folio_id  │
   │ amount    │     │ method    │
   └───────────┘     │ amount    │
                     │ status    │
                     └─────┬─────┘
                           │
                     ┌─────┴─────┐     ┌──────────┐
                     │ invoices  │     │ refunds  │
                     │           │     │          │
                     │ folio_id  │     │payment_id│
                     │ pdf_url   │     │ amount   │
                     └───────────┘     │ status   │
                                       └──────────┘

   ┌───────────┐       ┌──────────────┐
   │  rooms    │──N:1──│  room_types   │
   │           │       │              │
   │ id        │       │ id           │
   │ room_no   │       │ name         │
   │ type_id   │       │ base_price   │
   │ floor     │       │ max_occupancy│
   │ status    │       └──────────────┘
   └─────┬─────┘
         │
    ┌────┴──────────────┐
    │                   │
┌───┴──────────┐  ┌─────┴───────────┐
│housekeeping  │  │ room_images     │
│_tasks        │  │                 │
│              │  │ room_id (FK)    │
│ room_id (FK) │  │ image_url       │
│ assigned_to  │  │ is_primary      │
│ status       │  └─────────────────┘
│ priority     │
└──────┬───────┘
       │
┌──────┴────────┐
│room_inspections│
│               │
│ task_id (FK)  │
│ inspector_id  │
│ result        │
└───────────────┘

   ┌──────────────┐
   │ audit_logs   │
   │              │
   │ id           │
   │ user_id      │
   │ action       │
   │ entity_type  │
   │ entity_id    │
   │ old_values   │
   │ new_values   │
   │ ip_address   │
   │ created_at   │
   └──────────────┘
```

### Key Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| users → roles | N:1 | Each user has one role |
| roles → role_permissions → permissions | M:N | Roles have many permissions |
| users → staff_profiles | 1:1 | Staff users have extended profile |
| users → guests | 1:1 (optional) | Registered customers link to guest profile |
| rooms → room_types | N:1 | Each room belongs to a type |
| bookings → guests | N:1 | Each booking belongs to a guest |
| bookings → rooms | N:1 | Each booking is for one room |
| bookings → folios | 1:1 | Each booking has one folio |
| folios → folio_items | 1:N | Folio has many line items |
| folios → payments | 1:N | Folio can have multiple payments |
| payments → refunds | 1:N | A payment can have partial refunds |
| folios → invoices | 1:N | Folio can generate multiple invoices |
| rooms → housekeeping_tasks | 1:N | Room has many housekeeping tasks |
| housekeeping_tasks → room_inspections | 1:1 | Task may have inspection |
| food_orders → food_order_items | 1:N | Order has many items |
| food_order_items → menu_items | N:1 | Each line references a menu item |
| menu_items → menu_categories | N:1 | Items belong to category |
| staff_profiles → departments | N:1 | Staff belongs to department |
| staff_profiles → shifts | N:1 | Staff assigned to shift |

---

## 7. API Catalogue

### 7.1 Authentication APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/auth/register` | Customer self-registration | Public | — |
| POST | `/api/v1/auth/login` | Login, returns JWT tokens | Public | — |
| POST | `/api/v1/auth/logout` | Revoke refresh token | Bearer | All |
| POST | `/api/v1/auth/refresh-token` | Get new access token | Refresh Token | All |
| POST | `/api/v1/auth/forgot-password` | Send password reset email | Public | — |
| POST | `/api/v1/auth/reset-password` | Reset password with token | Public | — |
| PUT | `/api/v1/auth/change-password` | Change own password | Bearer | All |
| GET | `/api/v1/auth/me` | Get current user profile | Bearer | All |

### 7.2 User Management APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/users` | List all users (paginated) | Bearer | Admin |
| POST | `/api/v1/users` | Create staff/receptionist user | Bearer | Admin |
| GET | `/api/v1/users/:id` | Get user details | Bearer | Admin |
| PUT | `/api/v1/users/:id` | Update user | Bearer | Admin |
| DELETE | `/api/v1/users/:id` | Deactivate user | Bearer | Admin |
| PUT | `/api/v1/users/:id/role` | Change user role | Bearer | Admin |
| PUT | `/api/v1/users/:id/lock` | Lock/unlock account | Bearer | Admin |

### 7.3 Room Management APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/rooms` | List rooms (filtered, paginated) | Bearer | All |
| POST | `/api/v1/rooms` | Create room | Bearer | Admin |
| GET | `/api/v1/rooms/:id` | Get room details | Bearer | All |
| PUT | `/api/v1/rooms/:id` | Update room | Bearer | Admin |
| DELETE | `/api/v1/rooms/:id` | Soft-delete room | Bearer | Admin |
| PATCH | `/api/v1/rooms/:id/status` | Update room status | Bearer | Admin, Receptionist |
| GET | `/api/v1/rooms/availability` | Check availability by dates | Bearer | All |
| POST | `/api/v1/rooms/:id/images` | Upload room images | Bearer | Admin |
| DELETE | `/api/v1/rooms/:id/images/:imageId` | Remove room image | Bearer | Admin |
| GET | `/api/v1/room-types` | List room types | Bearer | All |
| POST | `/api/v1/room-types` | Create room type | Bearer | Admin |
| PUT | `/api/v1/room-types/:id` | Update room type | Bearer | Admin |
| DELETE | `/api/v1/room-types/:id` | Delete room type | Bearer | Admin |

### 7.4 Booking APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/bookings` | List bookings (filtered) | Bearer | Admin, Receptionist |
| POST | `/api/v1/bookings` | Create booking | Bearer | Admin, Receptionist, Customer |
| GET | `/api/v1/bookings/:id` | Get booking details | Bearer | Admin, Receptionist, Owner |
| PUT | `/api/v1/bookings/:id` | Modify booking | Bearer | Admin, Receptionist, Owner |
| POST | `/api/v1/bookings/:id/cancel` | Cancel booking | Bearer | Admin, Receptionist, Owner |
| POST | `/api/v1/bookings/:id/check-in` | Process check-in | Bearer | Admin, Receptionist |
| POST | `/api/v1/bookings/:id/check-out` | Process check-out | Bearer | Admin, Receptionist |
| GET | `/api/v1/bookings/my` | Customer's own bookings | Bearer | Customer |
| POST | `/api/v1/bookings/group` | Create group booking | Bearer | Admin, Receptionist |

### 7.5 Billing & Payment APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/folios/:bookingId` | Get folio for booking | Bearer | Admin, Receptionist, Owner |
| POST | `/api/v1/folios/:id/items` | Add item to folio | Bearer | Admin, Receptionist |
| DELETE | `/api/v1/folios/:id/items/:itemId` | Remove folio item | Bearer | Admin |
| POST | `/api/v1/payments` | Process payment | Bearer | Admin, Receptionist |
| GET | `/api/v1/payments` | List payments (filtered) | Bearer | Admin |
| GET | `/api/v1/payments/:id` | Get payment details | Bearer | Admin, Receptionist |
| POST | `/api/v1/refunds` | Process refund | Bearer | Admin |
| POST | `/api/v1/invoices/:folioId/generate` | Generate invoice PDF | Bearer | Admin, Receptionist |
| GET | `/api/v1/invoices/:id` | Get invoice | Bearer | Admin, Receptionist, Owner |
| GET | `/api/v1/invoices/:id/download` | Download invoice PDF | Bearer | Admin, Receptionist, Owner |

### 7.6 Guest Management APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/guests` | List guests (paginated) | Bearer | Admin, Receptionist |
| POST | `/api/v1/guests` | Create guest profile | Bearer | Admin, Receptionist |
| GET | `/api/v1/guests/:id` | Get guest details | Bearer | Admin, Receptionist |
| PUT | `/api/v1/guests/:id` | Update guest | Bearer | Admin, Receptionist |
| PATCH | `/api/v1/guests/:id/vip` | Toggle VIP status | Bearer | Admin, Receptionist |
| GET | `/api/v1/guests/:id/history` | Get stay history | Bearer | Admin, Receptionist |
| GET | `/api/v1/guests/search` | Search guests | Bearer | Admin, Receptionist |

### 7.7 Staff Management APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/staff` | List staff | Bearer | Admin |
| POST | `/api/v1/staff` | Create staff profile | Bearer | Admin |
| GET | `/api/v1/staff/:id` | Get staff details | Bearer | Admin |
| PUT | `/api/v1/staff/:id` | Update staff | Bearer | Admin |
| DELETE | `/api/v1/staff/:id` | Deactivate staff | Bearer | Admin |
| GET | `/api/v1/departments` | List departments | Bearer | Admin |
| POST | `/api/v1/departments` | Create department | Bearer | Admin |
| GET | `/api/v1/shifts` | List shifts | Bearer | Admin |
| POST | `/api/v1/shifts` | Create shift | Bearer | Admin |
| POST | `/api/v1/staff/:id/attendance` | Record attendance | Bearer | Admin, Self |
| GET | `/api/v1/staff/:id/attendance` | Get attendance | Bearer | Admin, Self |

### 7.8 Housekeeping APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/housekeeping/tasks` | List tasks (filtered) | Bearer | Admin, Receptionist, Staff |
| POST | `/api/v1/housekeeping/tasks` | Create task | Bearer | Admin, Receptionist |
| PATCH | `/api/v1/housekeeping/tasks/:id/status` | Update task status | Bearer | Admin, Receptionist, Assigned Staff |
| PATCH | `/api/v1/housekeeping/tasks/:id/assign` | Assign task | Bearer | Admin, Receptionist |
| POST | `/api/v1/housekeeping/tasks/:id/inspect` | Submit inspection | Bearer | Admin, Receptionist |
| GET | `/api/v1/housekeeping/inventory` | List supplies | Bearer | Admin, Staff |
| PUT | `/api/v1/housekeeping/inventory/:id` | Update supply quantity | Bearer | Admin, Staff |
| POST | `/api/v1/maintenance` | Create maintenance request | Bearer | Admin, Receptionist, Staff |
| PATCH | `/api/v1/maintenance/:id/status` | Update maintenance status | Bearer | Admin, Staff |

### 7.9 Food Ordering APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/menu/categories` | List menu categories | Bearer | All |
| POST | `/api/v1/menu/categories` | Create category | Bearer | Admin |
| GET | `/api/v1/menu/items` | List menu items | Bearer | All |
| POST | `/api/v1/menu/items` | Create menu item | Bearer | Admin |
| PUT | `/api/v1/menu/items/:id` | Update menu item | Bearer | Admin |
| PATCH | `/api/v1/menu/items/:id/availability` | Toggle availability | Bearer | Admin |
| POST | `/api/v1/food-orders` | Place food order | Bearer | Admin, Receptionist, Customer |
| GET | `/api/v1/food-orders` | List orders | Bearer | Admin, Receptionist, Kitchen Staff |
| PATCH | `/api/v1/food-orders/:id/status` | Update order status | Bearer | Admin, Kitchen Staff |
| GET | `/api/v1/food-orders/kitchen` | Kitchen queue (active orders) | Bearer | Admin, Kitchen Staff |
| GET | `/api/v1/food-orders/my` | Customer's own orders | Bearer | Customer |

### 7.10 Dashboard & Analytics APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/dashboard/occupancy` | Occupancy stats | Bearer | Admin, Receptionist |
| GET | `/api/v1/dashboard/revenue` | Revenue summary | Bearer | Admin |
| GET | `/api/v1/dashboard/bookings` | Booking analytics | Bearer | Admin, Receptionist |
| GET | `/api/v1/dashboard/housekeeping` | Housekeeping stats | Bearer | Admin, Receptionist |
| GET | `/api/v1/dashboard/food` | Food order stats | Bearer | Admin |
| GET | `/api/v1/dashboard/overview` | Role-based overview | Bearer | All |

### 7.11 Notification APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/notifications` | List user notifications | Bearer | All |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | Bearer | All |
| POST | `/api/v1/notifications/read-all` | Mark all as read | Bearer | All |
| GET | `/api/v1/notifications/unread-count` | Get unread count | Bearer | All |
| GET | `/api/v1/notifications/preferences` | Get preferences | Bearer | All |
| PUT | `/api/v1/notifications/preferences` | Update preferences | Bearer | All |

### 7.12 Import/Export APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/import/rooms` | Import rooms from Excel | Bearer | Admin |
| GET | `/api/v1/export/guests` | Export guest list | Bearer | Admin |
| GET | `/api/v1/export/bookings` | Export bookings | Bearer | Admin, Receptionist |
| GET | `/api/v1/export/revenue` | Export revenue report | Bearer | Admin |
| GET | `/api/v1/export/staff` | Export staff list | Bearer | Admin |
| GET | `/api/v1/import/templates/:type` | Download import template | Bearer | Admin |

### 7.13 Audit Log APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/audit-logs` | List audit logs (filtered) | Bearer | Admin |
| GET | `/api/v1/audit-logs/:id` | Get log details | Bearer | Admin |
| GET | `/api/v1/audit-logs/entity/:type/:id` | Logs for specific entity | Bearer | Admin |
| GET | `/api/v1/audit-logs/export` | Export audit logs | Bearer | Admin |

### 7.14 System APIs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/health` | Health check | Public | — |
| GET | `/api/v1/health/detailed` | Detailed health (DB, Redis, etc.) | Bearer | Admin |
| GET | `/api/v1/system/configs` | Get system configs | Bearer | Admin |
| PUT | `/api/v1/system/configs/:key` | Update config | Bearer | Admin |
