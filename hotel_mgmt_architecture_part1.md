# Hotel Management System — Solution Architecture Document

**Version:** 1.0  
**Date:** 2026-06-22  
**Author:** Solution Architecture Team  
**Status:** Draft for Review  

---

# Part 1: Sections 1–4

---

## 1. Functional Requirements

### 1.1 Authentication & Authorization

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-AUTH-001 | User Registration | Customers can self-register. Admin can create Staff/Receptionist accounts. |
| FR-AUTH-002 | Login | Email/password login with JWT access + refresh tokens. |
| FR-AUTH-003 | Logout | Invalidate refresh token; clear client-side tokens. |
| FR-AUTH-004 | Forgot Password | Send time-limited reset link via email. |
| FR-AUTH-005 | Reset Password | Token-verified password reset with complexity enforcement. |
| FR-AUTH-006 | Role-Based Access | Enforce permissions per role (Admin, Receptionist, Staff, Customer). |
| FR-AUTH-007 | Session Management | Access token (15 min), refresh token (7 days), concurrent session limit. |
| FR-AUTH-008 | Account Lock | Lock account after 5 failed login attempts for 30 minutes. |

### 1.2 Room Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-ROOM-001 | Add Room | Admin adds rooms with number, type, floor, price, amenities, images. |
| FR-ROOM-002 | Update Room | Admin/Receptionist updates room details and pricing. |
| FR-ROOM-003 | Delete Room | Soft-delete only. Room marked inactive, historical data preserved. |
| FR-ROOM-004 | Room Status | Track status: Available, Occupied, Reserved, Under Maintenance, Cleaning. |
| FR-ROOM-005 | Room Types | Manage types: Single, Double, Deluxe, Suite, Presidential. Custom types supported. |
| FR-ROOM-006 | Room Search | Filter by date range, type, price range, amenities, floor, capacity. |
| FR-ROOM-007 | Bulk Upload | Import rooms via Excel/CSV with validation and error reporting. |
| FR-ROOM-008 | Room Gallery | Multiple images per room with primary image selection. |

### 1.3 Booking Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-BOOK-001 | Search Availability | Real-time availability check by date range, room type, guest count. |
| FR-BOOK-002 | Create Booking | Book with guest details, dates, room selection, special requests. |
| FR-BOOK-003 | Cancel Booking | Cancel with configurable cancellation policy and refund rules. |
| FR-BOOK-004 | Modify Booking | Change dates, room type, or guest count (subject to availability). |
| FR-BOOK-005 | Check-In | Record actual arrival, verify ID, assign room, collect advance payment. |
| FR-BOOK-006 | Check-Out | Calculate final bill, process payment, release room, trigger housekeeping. |
| FR-BOOK-007 | Booking Status | Track: Confirmed, Checked-In, Checked-Out, Cancelled, No-Show. |
| FR-BOOK-008 | Walk-In Booking | Receptionist creates instant booking for walk-in guests. |
| FR-BOOK-009 | Group Booking | Book multiple rooms under one reservation with group discount. |
| FR-BOOK-010 | Booking History | Full history per customer with filters and search. |

### 1.4 Billing & Payment

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-PAY-001 | Invoice Generation | Auto-generate invoice at check-out with itemized charges. |
| FR-PAY-002 | Payment Methods | Accept Cash, Card, UPI. Record method and transaction reference. |
| FR-PAY-003 | Partial Payment | Allow split payments across multiple methods. |
| FR-PAY-004 | Advance Payment | Collect and track advance/deposit at booking or check-in. |
| FR-PAY-005 | Refund Processing | Process refunds for cancellations per policy; track refund status. |
| FR-PAY-006 | Tax Calculation | Apply configurable GST/tax rates per room type and service. |
| FR-PAY-007 | Folio Management | Running bill per guest stay — room charges, food, services. |
| FR-PAY-008 | Payment Receipt | Generate and email PDF receipt. |
| FR-PAY-009 | Outstanding Tracking | Dashboard of pending payments and overdue invoices. |

### 1.5 Customer Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-CUST-001 | Guest Profile | Name, email, phone, ID proof, address, nationality, preferences. |
| FR-CUST-002 | Stay History | Complete history of all stays, payments, and feedback. |
| FR-CUST-003 | ID Verification | Store ID type and number; mark as verified by Receptionist. |
| FR-CUST-004 | Guest Search | Search by name, email, phone, booking ID. |
| FR-CUST-005 | VIP Tagging | Mark guests as VIP for special treatment and alerts. |
| FR-CUST-006 | Communication Log | Track all emails/notifications sent to guest. |

### 1.6 Staff Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-STAFF-001 | Staff Profiles | Name, role, department, contact, shift, hire date, status. |
| FR-STAFF-002 | Shift Management | Define and assign shifts (Morning, Afternoon, Night). |
| FR-STAFF-003 | Task Assignment | Assign housekeeping/maintenance tasks to staff. |
| FR-STAFF-004 | Performance Tracking | Track task completion rate, average time, ratings. |
| FR-STAFF-005 | Attendance | Record daily attendance with clock-in/clock-out. |
| FR-STAFF-006 | Department Mgmt | Manage departments: Front Desk, Housekeeping, Kitchen, Maintenance. |

### 1.7 Housekeeping Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-HK-001 | Task Creation | Auto-create cleaning task on check-out; manual task creation. |
| FR-HK-002 | Task Assignment | Assign to available housekeeping staff based on floor/shift. |
| FR-HK-003 | Status Tracking | Track: Pending, In Progress, Completed, Inspected. |
| FR-HK-004 | Room Inspection | Supervisor inspects and marks room as ready or re-clean needed. |
| FR-HK-005 | Priority Levels | Urgent, High, Normal, Low — with SLA timers. |
| FR-HK-006 | Inventory Tracking | Track cleaning supplies and amenity restocking. |
| FR-HK-007 | Maintenance Requests | Log and track maintenance issues (plumbing, electrical, etc.). |

### 1.8 Food Ordering System

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-FOOD-001 | Menu Management | Admin manages menu items: name, category, price, availability, image. |
| FR-FOOD-002 | Room Service Order | Guest or Receptionist places order linked to room/booking. |
| FR-FOOD-003 | Order Status | Track: Placed, Preparing, Ready, Delivered, Cancelled. |
| FR-FOOD-004 | Bill to Room | Charges added to guest folio automatically. |
| FR-FOOD-005 | Kitchen Dashboard | Real-time order queue for kitchen staff. |
| FR-FOOD-006 | Menu Categories | Breakfast, Lunch, Dinner, Snacks, Beverages, Special Diet. |
| FR-FOOD-007 | Order History | Full order history per guest/room with filters. |

### 1.9 Dashboard & Analytics

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-DASH-001 | Occupancy Dashboard | Real-time occupancy rate, available/occupied room counts. |
| FR-DASH-002 | Revenue Analytics | Daily/weekly/monthly revenue with breakdown by source. |
| FR-DASH-003 | Booking Analytics | Booking trends, cancellation rates, average stay duration. |
| FR-DASH-004 | Housekeeping Dashboard | Task completion rates, pending tasks, staff performance. |
| FR-DASH-005 | Food Order Analytics | Popular items, order volume, revenue from food services. |
| FR-DASH-006 | Customer Analytics | Repeat guests, VIP stats, guest satisfaction trends. |
| FR-DASH-007 | Financial Summary | Revenue, expenses, outstanding payments, refund summary. |
| FR-DASH-008 | Role-Based Views | Each role sees only relevant dashboard widgets. |

### 1.10 Notifications

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-NOTIF-001 | Email Notifications | Booking confirmation, check-in/out, invoice, password reset. |
| FR-NOTIF-002 | In-App Notifications | Real-time bell icon notifications for all roles. |
| FR-NOTIF-003 | Task Alerts | Housekeeping/staff task assignments and reminders. |
| FR-NOTIF-004 | Payment Alerts | Payment received, overdue, refund processed. |
| FR-NOTIF-005 | System Alerts | Admin alerts for system events (low inventory, maintenance due). |
| FR-NOTIF-006 | Notification Preferences | Users configure which notifications they receive. |

### 1.11 Excel Import/Export

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-EXCEL-001 | Room Import | Bulk import rooms from Excel with validation report. |
| FR-EXCEL-002 | Guest Export | Export guest list with filters (date range, VIP, nationality). |
| FR-EXCEL-003 | Booking Export | Export booking data with status filters and date range. |
| FR-EXCEL-004 | Revenue Report | Export revenue reports by period. |
| FR-EXCEL-005 | Staff Export | Export staff list with department and shift details. |
| FR-EXCEL-006 | Template Download | Downloadable templates for each import type. |

### 1.12 Audit Logs

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-AUDIT-001 | Action Logging | Log every create, update, delete action with actor, timestamp, IP. |
| FR-AUDIT-002 | Login Audit | Track all login attempts (success/failure) with IP and device. |
| FR-AUDIT-003 | Change History | Before/after snapshots for critical data changes. |
| FR-AUDIT-004 | Log Search | Search/filter audit logs by user, action, entity, date range. |
| FR-AUDIT-005 | Log Retention | Configurable retention period (default: 1 year). |
| FR-AUDIT-006 | Export Logs | Export audit logs in CSV/Excel format. |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | API Response Time | < 200ms for 95th percentile; < 500ms for 99th. |
| NFR-PERF-002 | Page Load Time | < 2 seconds initial load; < 500ms subsequent navigation. |
| NFR-PERF-003 | Concurrent Users | Support 500 concurrent users without degradation. |
| NFR-PERF-004 | Database Queries | No query exceeding 100ms under normal load. |
| NFR-PERF-005 | Report Generation | Dashboard loads within 3 seconds. Excel exports < 10s for 10K rows. |

### 2.2 Reliability & Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-001 | Uptime | 99.9% availability (< 8.76 hours downtime/year). |
| NFR-REL-002 | Data Backup | Automated daily backups with 30-day retention. |
| NFR-REL-003 | Disaster Recovery | RTO: 4 hours, RPO: 1 hour. |
| NFR-REL-004 | Graceful Degradation | Non-critical features degrade without affecting core booking flow. |
| NFR-REL-005 | Health Monitoring | Application health endpoint with dependency checks. |

### 2.3 Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC-001 | Data Encryption | TLS 1.3 in transit; AES-256 at rest for sensitive fields. |
| NFR-SEC-002 | Password Policy | Min 8 chars, 1 uppercase, 1 number, 1 special char; bcrypt hashing (12 rounds). |
| NFR-SEC-003 | Input Validation | Server-side validation on all endpoints; parameterized queries. |
| NFR-SEC-004 | Rate Limiting | 100 req/min per IP for APIs; 5 req/min for auth endpoints. |
| NFR-SEC-005 | CORS | Whitelist-based CORS configuration. |
| NFR-SEC-006 | OWASP Compliance | Address OWASP Top 10 vulnerabilities. |
| NFR-SEC-007 | PII Protection | Mask sensitive data in logs; encrypt stored ID numbers. |

### 2.4 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-001 | Horizontal Scaling | Stateless API servers behind load balancer. |
| NFR-SCALE-002 | Database Scaling | Read replicas; connection pooling (PgBouncer). |
| NFR-SCALE-003 | Caching | Redis for sessions, frequently-accessed data, rate limiting. |
| NFR-SCALE-004 | Background Jobs | Queue-based processing for emails, reports, bulk operations. |

### 2.5 Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-MAINT-001 | Code Quality | ESLint + Prettier; minimum 80% test coverage on business logic. |
| NFR-MAINT-002 | API Documentation | OpenAPI 3.0 spec auto-generated; Swagger UI available. |
| NFR-MAINT-003 | Logging | Structured JSON logs (Winston); correlation IDs across requests. |
| NFR-MAINT-004 | Environment Config | All config via environment variables; no hardcoded secrets. |
| NFR-MAINT-005 | Database Migrations | Versioned migrations via Knex.js or Prisma Migrate. |

### 2.6 Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-USE-001 | Responsive Design | Full functionality on desktop, tablet, and mobile. |
| NFR-USE-002 | Accessibility | WCAG 2.1 AA compliance. |
| NFR-USE-003 | Internationalization | Support for multiple languages and date/currency formats. |
| NFR-USE-004 | Browser Support | Chrome, Firefox, Safari, Edge (latest 2 versions). |

---

## 3. User Roles and Permissions Matrix

### 3.1 Role Definitions

| Role | Description | Creation Method |
|------|-------------|-----------------|
| **Admin** | Full system access. Manages all configuration, users, reports. | Seeded / Super Admin creates |
| **Receptionist** | Front desk operations: bookings, check-in/out, guest management. | Admin creates |
| **Staff** | Operational tasks: housekeeping, kitchen, maintenance. | Admin creates |
| **Customer** | Self-service: view bookings, order food, view invoices. | Self-registration |

### 3.2 Permissions Matrix

| Module / Action | Admin | Receptionist | Staff | Customer |
|-----------------|:-----:|:------------:|:-----:|:--------:|
| **Authentication** | | | | |
| Register new users | ✅ | ❌ | ❌ | Self only |
| Manage roles | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ | ❌ |
| **Room Management** | | | | |
| Add/Edit/Delete room | ✅ | ❌ | ❌ | ❌ |
| View rooms | ✅ | ✅ | ✅ | ✅ |
| Update room status | ✅ | ✅ | Own tasks | ❌ |
| Manage room types | ✅ | ❌ | ❌ | ❌ |
| **Booking Management** | | | | |
| Create booking | ✅ | ✅ | ❌ | Self only |
| Modify booking | ✅ | ✅ | ❌ | Own only |
| Cancel booking | ✅ | ✅ | ❌ | Own only |
| View all bookings | ✅ | ✅ | ❌ | ❌ |
| View own bookings | ✅ | ✅ | ❌ | ✅ |
| Check-In | ✅ | ✅ | ❌ | ❌ |
| Check-Out | ✅ | ✅ | ❌ | ❌ |
| Group booking | ✅ | ✅ | ❌ | ❌ |
| **Billing & Payment** | | | | |
| Generate invoice | ✅ | ✅ | ❌ | ❌ |
| Process payment | ✅ | ✅ | ❌ | ❌ |
| Process refund | ✅ | ❌ | ❌ | ❌ |
| View own invoices | ✅ | ✅ | ❌ | ✅ |
| View all financials | ✅ | ❌ | ❌ | ❌ |
| **Customer Management** | | | | |
| View all guests | ✅ | ✅ | ❌ | ❌ |
| Edit guest profile | ✅ | ✅ | ❌ | Own only |
| VIP tagging | ✅ | ✅ | ❌ | ❌ |
| Delete guest | ✅ | ❌ | ❌ | ❌ |
| **Staff Management** | | | | |
| Add/Edit/Remove staff | ✅ | ❌ | ❌ | ❌ |
| View staff list | ✅ | ✅ | ❌ | ❌ |
| Manage shifts | ✅ | ❌ | ❌ | ❌ |
| View own schedule | ✅ | ✅ | ✅ | ❌ |
| **Housekeeping** | | | | |
| Create task | ✅ | ✅ | ❌ | ❌ |
| Assign task | ✅ | ✅ | ❌ | ❌ |
| Update task status | ✅ | ✅ | Own tasks | ❌ |
| Inspect room | ✅ | ✅ | ❌ | ❌ |
| View all tasks | ✅ | ✅ | Own tasks | ❌ |
| **Food Ordering** | | | | |
| Manage menu | ✅ | ❌ | ❌ | ❌ |
| Place order (on behalf) | ✅ | ✅ | ❌ | ❌ |
| Place own order | ❌ | ❌ | ❌ | ✅ |
| Update order status | ✅ | ❌ | Kitchen staff | ❌ |
| View kitchen dashboard | ✅ | ❌ | Kitchen staff | ❌ |
| **Dashboard & Analytics** | | | | |
| Full dashboard | ✅ | ❌ | ❌ | ❌ |
| Front desk dashboard | ✅ | ✅ | ❌ | ❌ |
| Staff dashboard | ✅ | ❌ | ✅ | ❌ |
| Customer dashboard | ❌ | ❌ | ❌ | ✅ |
| **Reports & Export** | | | | |
| Export all reports | ✅ | ❌ | ❌ | ❌ |
| Export booking reports | ✅ | ✅ | ❌ | ❌ |
| Import data (Excel) | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | | | | |
| View all audit logs | ✅ | ❌ | ❌ | ❌ |
| Export audit logs | ✅ | ❌ | ❌ | ❌ |
| **Notifications** | | | | |
| Configure system notifs | ✅ | ❌ | ❌ | ❌ |
| Receive role-based notifs | ✅ | ✅ | ✅ | ✅ |
| Manage own preferences | ✅ | ✅ | ✅ | ✅ |

---

## 4. Complete Module Breakdown

### Module 1: Authentication & Authorization

| Component | Description |
|-----------|-------------|
| Registration Service | Validates input, hashes password, creates user, sends welcome email. |
| Login Service | Validates credentials, issues JWT access + refresh tokens. |
| Token Service | Issues, refreshes, and revokes JWT tokens. Access: 15 min, Refresh: 7 days. |
| Password Service | Handles forgot/reset flow with time-limited tokens (1 hour expiry). |
| RBAC Middleware | Express middleware that validates JWT and checks role permissions per route. |
| Session Manager | Tracks active sessions, enforces concurrent session limits. |
| Account Security | Handles account locking, failed attempt tracking, IP-based alerts. |

### Module 2: Room Management

| Component | Description |
|-----------|-------------|
| Room CRUD Service | Create, read, update, soft-delete rooms. |
| Room Type Service | Manage room types with base pricing and amenity templates. |
| Room Status Engine | State machine for room status transitions with validation rules. |
| Room Search Service | Full-text and filter-based room search with availability integration. |
| Room Media Service | Upload, store, and serve room images via cloud storage (S3). |
| Room Import Service | Parse Excel/CSV, validate rows, batch insert with error reporting. |

### Module 3: Booking Management

| Component | Description |
|-----------|-------------|
| Availability Engine | Real-time availability calculation considering bookings, blocks, maintenance. |
| Booking Service | Create, modify, cancel bookings with concurrency control (optimistic locking). |
| Check-In Service | Validates booking, records arrival, updates room status, creates folio. |
| Check-Out Service | Finalizes folio, triggers payment, releases room, creates housekeeping task. |
| Cancellation Engine | Applies cancellation policy, calculates refund, updates booking status. |
| Group Booking Service | Multi-room reservation with shared billing and group discount logic. |

### Module 4: Billing & Payment

| Component | Description |
|-----------|-------------|
| Folio Service | Running bill per stay — accumulates room, food, service charges. |
| Invoice Generator | Creates itemized PDF invoices with tax breakdown. Uses PDFKit or Puppeteer. |
| Payment Processor | Records payment transactions with method, amount, reference, status. |
| Tax Engine | Configurable tax rules per room type and service category. |
| Refund Service | Processes refunds, updates payment records, notifies customer. |
| Receipt Service | Generates and emails payment receipts. |

### Module 5: Customer Management

| Component | Description |
|-----------|-------------|
| Guest Profile Service | CRUD for guest profiles with preferences and special requests. |
| ID Verification Service | Stores ID type/number, marks verified status. Encrypted storage. |
| Stay History Service | Aggregates all stays, payments, feedback per guest. |
| VIP Service | Tags VIP guests, triggers alerts for staff on VIP check-in. |
| Guest Search Service | Multi-field search with pagination and filters. |

### Module 6: Staff Management

| Component | Description |
|-----------|-------------|
| Staff CRUD Service | Manage staff profiles, departments, roles. |
| Shift Service | Define shift templates; assign staff to shifts. |
| Task Service | Create, assign, and track task completion for staff. |
| Attendance Service | Clock-in/out tracking with daily summaries. |
| Performance Service | Aggregate task metrics for performance dashboards. |

### Module 7: Housekeeping Management

| Component | Description |
|-----------|-------------|
| Task Generator | Auto-creates tasks on check-out; manual creation for ad-hoc cleaning. |
| Assignment Engine | Assigns tasks based on staff availability, floor, and workload. |
| Status Tracker | Tracks task lifecycle: Pending → In Progress → Completed → Inspected. |
| Inspection Service | Supervisor review with pass/fail and notes. |
| Maintenance Logger | Log and track maintenance issues with priority and resolution. |
| Inventory Service | Track cleaning supply levels with low-stock alerts. |

### Module 8: Food Ordering System

| Component | Description |
|-----------|-------------|
| Menu Service | CRUD for menu items with categories, pricing, availability toggling. |
| Order Service | Place orders linked to room/booking; manage order lifecycle. |
| Kitchen Queue | Real-time order queue with status updates for kitchen staff. |
| Billing Integration | Auto-adds food charges to guest folio. |
| Order History Service | Query past orders by guest, room, date. |

### Module 9: Dashboard & Analytics

| Component | Description |
|-----------|-------------|
| Occupancy Widget | Real-time room status overview with floor map visualization. |
| Revenue Widget | Revenue charts with period comparison and source breakdown. |
| Booking Widget | Booking trends, cancellation rates, forecast. |
| Housekeeping Widget | Task queue, completion rate, staff utilization. |
| Food Widget | Order volume, popular items, kitchen efficiency. |
| Report Generator | Generates exportable reports per module. |

### Module 10: Notification System

| Component | Description |
|-----------|-------------|
| Email Service | Transactional emails via SendGrid/SES with templates. |
| In-App Service | WebSocket-based real-time notifications with bell icon and badge count. |
| Notification Queue | Bull/BullMQ queue for reliable, asynchronous notification delivery. |
| Template Engine | Handlebars templates for email and in-app notification content. |
| Preference Service | User-configurable notification channel preferences. |

### Module 11: Excel Import/Export

| Component | Description |
|-----------|-------------|
| Import Engine | Parse uploaded Excel (xlsx) using SheetJS; validate; batch process. |
| Export Engine | Generate Excel files from query results using ExcelJS. |
| Template Service | Serve downloadable import templates with headers and sample data. |
| Validation Reporter | Generate per-row validation error reports for failed imports. |

### Module 12: Audit Log System

| Component | Description |
|-----------|-------------|
| Logger Middleware | Express middleware capturing actor, action, entity, timestamp, IP, user-agent. |
| Change Tracker | Stores before/after JSON snapshots for update operations. |
| Query Service | Filterable, paginated audit log retrieval. |
| Retention Service | Scheduled job to archive/purge logs beyond retention period. |
| Export Service | Export filtered audit logs to CSV/Excel. |
