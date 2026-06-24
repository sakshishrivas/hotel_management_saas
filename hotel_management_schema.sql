-- Hotel Management System - PostgreSQL 16 Schema
-- Production-oriented, normalized, UUID-based, soft-delete aware.

CREATE SCHEMA IF NOT EXISTS hotel;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

SET search_path TO hotel, public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE hotel.user_status AS ENUM ('active', 'inactive', 'suspended');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE hotel.booking_status AS ENUM ('draft', 'quoted', 'confirmed', 'cancelled', 'no_show', 'checked_in', 'checked_out', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
    CREATE TYPE hotel.room_status AS ENUM ('available', 'reserved', 'occupied', 'dirty', 'cleaning', 'out_of_service', 'maintenance');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE hotel.payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'voided', 'partially_refunded', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE hotel.invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'void', 'overdue');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE hotel.order_status AS ENUM ('draft', 'placed', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housekeeping_status') THEN
    CREATE TYPE hotel.housekeeping_status AS ENUM ('requested', 'assigned', 'in_progress', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housekeeping_priority') THEN
    CREATE TYPE hotel.housekeeping_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE hotel.notification_channel AS ENUM ('in_app', 'email', 'sms', 'push');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE hotel.notification_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_kind') THEN
    CREATE TYPE hotel.job_kind AS ENUM ('import', 'export');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE hotel.job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE hotel.payment_method AS ENUM ('cash', 'card', 'upi', 'bank_transfer', 'wallet', 'gateway', 'other');
  END IF;
END
$$;

CREATE SEQUENCE IF NOT EXISTS hotel.booking_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hotel.invoice_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hotel.food_order_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hotel.customer_no_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hotel.employee_no_seq START 1;

CREATE OR REPLACE FUNCTION hotel.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION hotel.prevent_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log rows are immutable';
END;
$$;

CREATE OR REPLACE FUNCTION hotel.validate_payment_allocation_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_payment_id uuid;
  v_invoice_id uuid;
  v_payment_hotel uuid;
  v_invoice_hotel uuid;
  v_payment_amount numeric(14,2);
  v_allocated numeric(14,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_payment_id := OLD.payment_id;
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_payment_id := NEW.payment_id;
    v_invoice_id := NEW.invoice_id;
  END IF;

  SELECT p.hotel_id, p.amount
    INTO v_payment_hotel, v_payment_amount
  FROM hotel.payments p
  WHERE p.id = v_payment_id
    AND p.deleted_at IS NULL;

  SELECT i.hotel_id
    INTO v_invoice_hotel
  FROM hotel.invoices i
  WHERE i.id = v_invoice_id
    AND i.deleted_at IS NULL;

  IF TG_OP <> 'DELETE' AND v_payment_hotel IS NOT NULL AND NEW.hotel_id <> v_payment_hotel THEN
    RAISE EXCEPTION 'payment allocation hotel does not match payment hotel';
  END IF;

  IF TG_OP <> 'DELETE' AND v_invoice_hotel IS NOT NULL AND NEW.hotel_id <> v_invoice_hotel THEN
    RAISE EXCEPTION 'payment allocation hotel does not match invoice hotel';
  END IF;

  SELECT COALESCE(SUM(pa.amount), 0)
    INTO v_allocated
  FROM hotel.payment_allocations pa
  WHERE pa.payment_id = v_payment_id
    AND pa.deleted_at IS NULL;

  IF v_payment_amount IS NOT NULL AND v_allocated > v_payment_amount THEN
    RAISE EXCEPTION 'payment allocations exceed payment amount';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION hotel.validate_refund_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_payment_id uuid;
  v_payment_hotel uuid;
  v_payment_amount numeric(14,2);
  v_refunded numeric(14,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_payment_id := OLD.payment_id;
  ELSE
    v_payment_id := NEW.payment_id;
  END IF;

  SELECT p.hotel_id, p.amount
    INTO v_payment_hotel, v_payment_amount
  FROM hotel.payments p
  WHERE p.id = v_payment_id
    AND p.deleted_at IS NULL;

  IF TG_OP <> 'DELETE' AND v_payment_hotel IS NOT NULL AND NEW.hotel_id <> v_payment_hotel THEN
    RAISE EXCEPTION 'refund hotel does not match payment hotel';
  END IF;

  SELECT COALESCE(SUM(r.amount), 0)
    INTO v_refunded
  FROM hotel.refunds r
  WHERE r.payment_id = v_payment_id
    AND r.deleted_at IS NULL;

  IF v_payment_amount IS NOT NULL AND v_refunded > v_payment_amount THEN
    RAISE EXCEPTION 'refunds exceed payment amount';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION hotel.validate_booking_room()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_hotel uuid;
  v_booking_start date;
  v_booking_end date;
  v_room_hotel uuid;
  v_room_type uuid;
BEGIN
  IF NEW.check_out_date <= NEW.check_in_date THEN
    RAISE EXCEPTION 'booking_room check_out_date must be after check_in_date';
  END IF;

  SELECT b.hotel_id, b.check_in_date, b.check_out_date
    INTO v_booking_hotel, v_booking_start, v_booking_end
  FROM hotel.bookings b
  WHERE b.id = NEW.booking_id
    AND b.deleted_at IS NULL;

  IF v_booking_hotel IS NULL THEN
    RAISE EXCEPTION 'booking does not exist or is deleted';
  END IF;

  IF NEW.hotel_id <> v_booking_hotel THEN
    RAISE EXCEPTION 'booking_room hotel does not match booking hotel';
  END IF;

  IF NEW.check_in_date < v_booking_start OR NEW.check_out_date > v_booking_end THEN
    RAISE EXCEPTION 'booking_room dates must fall within booking dates';
  END IF;

  IF NEW.room_id IS NOT NULL THEN
    SELECT r.hotel_id, r.room_type_id
      INTO v_room_hotel, v_room_type
    FROM hotel.rooms r
    WHERE r.id = NEW.room_id
      AND r.deleted_at IS NULL;

    IF v_room_hotel IS NULL THEN
      RAISE EXCEPTION 'assigned room does not exist or is deleted';
    END IF;

    IF v_room_hotel <> NEW.hotel_id THEN
      RAISE EXCEPTION 'assigned room hotel does not match booking hotel';
    END IF;

    IF v_room_type <> NEW.room_type_id THEN
      RAISE EXCEPTION 'assigned room type does not match booking room type';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE hotel.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_code text NOT NULL,
  name text NOT NULL,
  legal_name text,
  tax_registration_no text,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  phone text,
  email citext,
  website text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country_code char(2) NOT NULL DEFAULT 'US',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT hotels_currency_code_chk CHECK (currency_code ~ '^[A-Z]{3}$'),
  CONSTRAINT hotels_country_code_chk CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE UNIQUE INDEX ux_hotels_code_active ON hotel.hotels (hotel_code) WHERE deleted_at IS NULL;

CREATE TABLE hotel.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_roles_code_active ON hotel.roles (code) WHERE deleted_at IS NULL;

CREATE TABLE hotel.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  module_name text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_permissions_code_active ON hotel.permissions (code) WHERE deleted_at IS NULL;

CREATE TABLE hotel.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES hotel.roles(id) ON DELETE RESTRICT,
  permission_id uuid NOT NULL REFERENCES hotel.permissions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_role_permissions_active ON hotel.role_permissions (role_id, permission_id) WHERE deleted_at IS NULL;

CREATE TABLE hotel.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  phone text,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  status hotel.user_status NOT NULL DEFAULT 'active',
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  last_login_at timestamptz,
  password_changed_at timestamptz,
  locale text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'UTC',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_app_users_email_active ON hotel.app_users (email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_app_users_phone_active ON hotel.app_users (phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE hotel.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  role_id uuid NOT NULL REFERENCES hotel.roles(id) ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_user_roles_active ON hotel.user_roles (user_id, role_id) WHERE deleted_at IS NULL;

CREATE TABLE hotel.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  refresh_token_hash text NOT NULL,
  device_info text,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_user_sessions_refresh_token_active ON hotel.user_sessions (refresh_token_hash) WHERE deleted_at IS NULL;
CREATE INDEX ix_user_sessions_user_id ON hotel.user_sessions (user_id);

CREATE TABLE hotel.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_password_reset_tokens_hash_active ON hotel.password_reset_tokens (token_hash) WHERE deleted_at IS NULL;

CREATE TABLE hotel.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  employee_no text NOT NULL DEFAULT ('EMP-' || lpad(nextval('hotel.employee_no_seq')::text, 10, '0')),
  department text,
  designation text,
  employment_type text,
  hire_date date,
  termination_date date,
  emergency_contact_name text,
  emergency_contact_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_staff_profiles_employee_no_active ON hotel.staff_profiles (employee_no) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_staff_profiles_user_hotel_active ON hotel.staff_profiles (user_id, hotel_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_staff_profiles_hotel_id ON hotel.staff_profiles (hotel_id);

CREATE TABLE hotel.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  customer_no text NOT NULL DEFAULT ('CUST-' || lpad(nextval('hotel.customer_no_seq')::text, 10, '0')),
  first_name text,
  last_name text,
  date_of_birth date,
  gender text,
  nationality text,
  document_type text,
  document_no text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country_code char(2) DEFAULT 'US',
  loyalty_points integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT customer_profiles_loyalty_points_chk CHECK (loyalty_points >= 0),
  CONSTRAINT customer_profiles_country_code_chk CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE UNIQUE INDEX ux_customer_profiles_customer_no_active ON hotel.customer_profiles (customer_no) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_customer_profiles_user_hotel_active ON hotel.customer_profiles (user_id, hotel_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_customer_profiles_hotel_id ON hotel.customer_profiles (hotel_id);

CREATE TABLE hotel.room_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  category text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_room_amenities_code_active ON hotel.room_amenities (code) WHERE deleted_at IS NULL;

CREATE TABLE hotel.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  base_occupancy integer NOT NULL DEFAULT 1,
  max_occupancy integer NOT NULL DEFAULT 2,
  bed_type text,
  room_size_sqm numeric(8,2),
  base_rate numeric(14,2) NOT NULL DEFAULT 0,
  extra_bed_rate numeric(14,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT room_types_occupancy_chk CHECK (base_occupancy > 0 AND max_occupancy >= base_occupancy),
  CONSTRAINT room_types_rates_chk CHECK (base_rate >= 0 AND extra_bed_rate >= 0),
  CONSTRAINT room_types_size_chk CHECK (room_size_sqm IS NULL OR room_size_sqm > 0)
);

CREATE UNIQUE INDEX ux_room_types_code_hotel_active ON hotel.room_types (hotel_id, code) WHERE deleted_at IS NULL;
CREATE INDEX ix_room_types_hotel_id ON hotel.room_types (hotel_id);

CREATE TABLE hotel.room_type_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id uuid NOT NULL REFERENCES hotel.room_types(id) ON DELETE RESTRICT,
  rate_name text NOT NULL,
  valid_from date NOT NULL,
  valid_to date,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  rate_amount numeric(14,2) NOT NULL,
  min_stay_nights integer,
  max_stay_nights integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT room_type_rates_dates_chk CHECK (valid_to IS NULL OR valid_to > valid_from),
  CONSTRAINT room_type_rates_amount_chk CHECK (rate_amount >= 0),
  CONSTRAINT room_type_rates_stay_chk CHECK (min_stay_nights IS NULL OR min_stay_nights > 0),
  CONSTRAINT room_type_rates_stay_max_chk CHECK (max_stay_nights IS NULL OR max_stay_nights >= COALESCE(min_stay_nights, 1))
);

CREATE UNIQUE INDEX ux_room_type_rates_active ON hotel.room_type_rates (room_type_id, rate_name, valid_from) WHERE deleted_at IS NULL;
CREATE INDEX ix_room_type_rates_room_type_id ON hotel.room_type_rates (room_type_id);

CREATE TABLE hotel.room_type_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id uuid NOT NULL REFERENCES hotel.room_types(id) ON DELETE RESTRICT,
  amenity_id uuid NOT NULL REFERENCES hotel.room_amenities(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT room_type_amenities_quantity_chk CHECK (quantity > 0)
);

CREATE UNIQUE INDEX ux_room_type_amenities_active ON hotel.room_type_amenities (room_type_id, amenity_id) WHERE deleted_at IS NULL;

CREATE TABLE hotel.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  room_type_id uuid NOT NULL REFERENCES hotel.room_types(id) ON DELETE RESTRICT,
  room_number text NOT NULL,
  floor_no integer,
  wing text,
  status hotel.room_status NOT NULL DEFAULT 'available',
  is_smoking_allowed boolean NOT NULL DEFAULT false,
  is_accessible boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_rooms_room_number_hotel_active ON hotel.rooms (hotel_id, room_number) WHERE deleted_at IS NULL;
CREATE INDEX ix_rooms_hotel_id ON hotel.rooms (hotel_id);
CREATE INDEX ix_rooms_room_type_id ON hotel.rooms (room_type_id);
CREATE INDEX ix_rooms_status ON hotel.rooms (status) WHERE deleted_at IS NULL;

CREATE TABLE hotel.room_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  room_id uuid NOT NULL REFERENCES hotel.rooms(id) ON DELETE RESTRICT,
  old_status hotel.room_status,
  new_status hotel.room_status NOT NULL,
  changed_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX ix_room_status_history_room_id ON hotel.room_status_history (room_id, changed_at DESC);

CREATE TABLE hotel.room_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  room_id uuid NOT NULL REFERENCES hotel.rooms(id) ON DELETE RESTRICT,
  block_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT room_blocks_dates_chk CHECK (end_date > start_date)
);

CREATE INDEX ix_room_blocks_room_id ON hotel.room_blocks (room_id, start_date, end_date);

CREATE TABLE hotel.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_ref text NOT NULL DEFAULT ('BK-' || lpad(nextval('hotel.booking_ref_seq')::text, 10, '0')),
  customer_profile_id uuid REFERENCES hotel.customer_profiles(id) ON DELETE SET NULL,
  booked_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  source_channel text NOT NULL DEFAULT 'front_desk',
  status hotel.booking_status NOT NULL DEFAULT 'draft',
  booked_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  cancellation_reason text,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  subtotal_amount numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  amount_paid numeric(14,2) NOT NULL DEFAULT 0,
  balance_due numeric(14,2) NOT NULL DEFAULT 0,
  special_requests text,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT bookings_dates_chk CHECK (check_out_date > check_in_date),
  CONSTRAINT bookings_guest_counts_chk CHECK (adults > 0 AND children >= 0),
  CONSTRAINT bookings_money_chk CHECK (
    subtotal_amount >= 0
    AND tax_amount >= 0
    AND discount_amount >= 0
    AND total_amount >= 0
    AND amount_paid >= 0
    AND balance_due >= 0
  )
);

CREATE UNIQUE INDEX ux_bookings_booking_ref_active ON hotel.bookings (booking_ref) WHERE deleted_at IS NULL;
CREATE INDEX ix_bookings_hotel_id ON hotel.bookings (hotel_id, booked_at DESC);
CREATE INDEX ix_bookings_customer_profile_id ON hotel.bookings (customer_profile_id);
CREATE INDEX ix_bookings_status ON hotel.bookings (status) WHERE deleted_at IS NULL;

CREATE TABLE hotel.booking_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES hotel.bookings(id) ON DELETE RESTRICT,
  room_type_id uuid NOT NULL REFERENCES hotel.room_types(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES hotel.rooms(id) ON DELETE SET NULL,
  status hotel.booking_status NOT NULL DEFAULT 'confirmed',
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  nightly_rate numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  line_total numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT booking_rooms_dates_chk CHECK (check_out_date > check_in_date),
  CONSTRAINT booking_rooms_guest_counts_chk CHECK (adults > 0 AND children >= 0),
  CONSTRAINT booking_rooms_money_chk CHECK (
    nightly_rate >= 0
    AND tax_amount >= 0
    AND discount_amount >= 0
    AND line_total >= 0
  )
);

ALTER TABLE hotel.booking_rooms
  ADD CONSTRAINT booking_rooms_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
  )
  WHERE (deleted_at IS NULL AND room_id IS NOT NULL);

CREATE INDEX ix_booking_rooms_booking_id ON hotel.booking_rooms (booking_id);
CREATE INDEX ix_booking_rooms_room_id ON hotel.booking_rooms (room_id);
CREATE INDEX ix_booking_rooms_room_type_id ON hotel.booking_rooms (room_type_id);

CREATE TABLE hotel.booking_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_room_id uuid NOT NULL REFERENCES hotel.booking_rooms(id) ON DELETE CASCADE,
  guest_type text NOT NULL DEFAULT 'guest',
  full_name text NOT NULL,
  email citext,
  phone text,
  document_type text,
  document_no text,
  is_primary boolean NOT NULL DEFAULT false,
  date_of_birth date,
  nationality text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_booking_guests_primary_active
  ON hotel.booking_guests (booking_room_id)
  WHERE is_primary AND deleted_at IS NULL;
CREATE INDEX ix_booking_guests_booking_room_id ON hotel.booking_guests (booking_room_id);

CREATE TABLE hotel.checkin_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES hotel.bookings(id) ON DELETE RESTRICT,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  deposit_amount numeric(14,2) NOT NULL DEFAULT 0,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT checkin_records_deposit_chk CHECK (deposit_amount >= 0)
);

CREATE UNIQUE INDEX ux_checkin_records_booking_active ON hotel.checkin_records (booking_id) WHERE deleted_at IS NULL;

CREATE TABLE hotel.checkout_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES hotel.bookings(id) ON DELETE RESTRICT,
  checked_out_at timestamptz NOT NULL DEFAULT now(),
  checked_out_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  final_inspection_status text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_checkout_records_booking_active ON hotel.checkout_records (booking_id) WHERE deleted_at IS NULL;

CREATE TABLE hotel.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES hotel.bookings(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL DEFAULT ('INV-' || lpad(nextval('hotel.invoice_ref_seq')::text, 10, '0')),
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status hotel.invoice_status NOT NULL DEFAULT 'draft',
  currency_code char(3) NOT NULL DEFAULT 'USD',
  subtotal_amount numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  service_charge_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  balance_due numeric(14,2) NOT NULL DEFAULT 0,
  issued_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT invoices_money_chk CHECK (
    subtotal_amount >= 0
    AND tax_amount >= 0
    AND service_charge_amount >= 0
    AND discount_amount >= 0
    AND total_amount >= 0
    AND balance_due >= 0
  ),
  CONSTRAINT invoices_due_date_chk CHECK (due_date IS NULL OR due_date >= invoice_date)
);

CREATE UNIQUE INDEX ux_invoices_invoice_number_active ON hotel.invoices (invoice_number) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_invoices_booking_active ON hotel.invoices (booking_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_invoices_hotel_id ON hotel.invoices (hotel_id, invoice_date DESC);

CREATE TABLE hotel.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL REFERENCES hotel.invoices(id) ON DELETE CASCADE,
  line_no integer NOT NULL,
  item_type text NOT NULL,
  source_table text,
  source_id uuid,
  description text NOT NULL,
  quantity numeric(14,2) NOT NULL DEFAULT 1,
  unit_price numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  line_total numeric(14,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT invoice_items_quantity_chk CHECK (quantity > 0),
  CONSTRAINT invoice_items_money_chk CHECK (
    unit_price >= 0
    AND tax_amount >= 0
    AND discount_amount >= 0
    AND line_total >= 0
  )
);

CREATE UNIQUE INDEX ux_invoice_items_line_active ON hotel.invoice_items (invoice_id, line_no) WHERE deleted_at IS NULL;

CREATE TABLE hotel.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES hotel.bookings(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES hotel.invoices(id) ON DELETE SET NULL,
  payment_ref text NOT NULL DEFAULT ('PAY-' || replace(gen_random_uuid()::text, '-', '')),
  payment_method hotel.payment_method NOT NULL,
  status hotel.payment_status NOT NULL DEFAULT 'pending',
  amount numeric(14,2) NOT NULL,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  paid_at timestamptz,
  gateway_transaction_id text,
  received_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  payer_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT payments_amount_chk CHECK (amount > 0)
);

CREATE UNIQUE INDEX ux_payments_payment_ref_active ON hotel.payments (payment_ref) WHERE deleted_at IS NULL;
CREATE INDEX ix_payments_booking_id ON hotel.payments (booking_id);
CREATE INDEX ix_payments_invoice_id ON hotel.payments (invoice_id);
CREATE INDEX ix_payments_status ON hotel.payments (status) WHERE deleted_at IS NULL;

CREATE TABLE hotel.payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  payment_id uuid NOT NULL REFERENCES hotel.payments(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL REFERENCES hotel.invoices(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT payment_allocations_amount_chk CHECK (amount > 0)
);

CREATE UNIQUE INDEX ux_payment_allocations_active ON hotel.payment_allocations (payment_id, invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_payment_allocations_payment_id ON hotel.payment_allocations (payment_id);

CREATE TABLE hotel.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  payment_id uuid NOT NULL REFERENCES hotel.payments(id) ON DELETE RESTRICT,
  refund_ref text NOT NULL DEFAULT ('REF-' || replace(gen_random_uuid()::text, '-', '')),
  amount numeric(14,2) NOT NULL,
  reason text,
  status hotel.payment_status NOT NULL DEFAULT 'pending',
  refunded_at timestamptz,
  processed_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT refunds_amount_chk CHECK (amount > 0)
);

CREATE UNIQUE INDEX ux_refunds_refund_ref_active ON hotel.refunds (refund_ref) WHERE deleted_at IS NULL;
CREATE INDEX ix_refunds_payment_id ON hotel.refunds (payment_id);

CREATE TABLE hotel.housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES hotel.rooms(id) ON DELETE SET NULL,
  task_type text NOT NULL,
  priority hotel.housekeeping_priority NOT NULL DEFAULT 'medium',
  status hotel.housekeeping_status NOT NULL DEFAULT 'requested',
  requested_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  assigned_to_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT housekeeping_tasks_schedule_chk CHECK (scheduled_end_at IS NULL OR scheduled_start_at IS NULL OR scheduled_end_at >= scheduled_start_at),
  CONSTRAINT housekeeping_tasks_completion_chk CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX ix_housekeeping_tasks_room_id ON hotel.housekeeping_tasks (room_id);
CREATE INDEX ix_housekeeping_tasks_status ON hotel.housekeeping_tasks (status) WHERE deleted_at IS NULL;

CREATE TABLE hotel.food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_food_categories_code_hotel_active ON hotel.food_categories (hotel_id, code) WHERE deleted_at IS NULL;

CREATE TABLE hotel.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES hotel.food_categories(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(14,2) NOT NULL,
  tax_rate numeric(6,3) NOT NULL DEFAULT 0,
  prep_time_minutes integer,
  is_available boolean NOT NULL DEFAULT true,
  is_veg boolean,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT menu_items_price_chk CHECK (price >= 0),
  CONSTRAINT menu_items_tax_rate_chk CHECK (tax_rate >= 0)
);

CREATE UNIQUE INDEX ux_menu_items_code_hotel_active ON hotel.menu_items (hotel_id, code) WHERE deleted_at IS NULL;
CREATE INDEX ix_menu_items_category_id ON hotel.menu_items (category_id);

CREATE TABLE hotel.food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES hotel.bookings(id) ON DELETE SET NULL,
  booking_room_id uuid REFERENCES hotel.booking_rooms(id) ON DELETE SET NULL,
  customer_profile_id uuid REFERENCES hotel.customer_profiles(id) ON DELETE SET NULL,
  placed_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  order_number text NOT NULL DEFAULT ('FO-' || lpad(nextval('hotel.food_order_ref_seq')::text, 10, '0')),
  status hotel.order_status NOT NULL DEFAULT 'draft',
  ordered_at timestamptz NOT NULL DEFAULT now(),
  requested_delivery_at timestamptz,
  delivery_instructions text,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  subtotal_amount numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  service_charge_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT food_orders_money_chk CHECK (
    subtotal_amount >= 0
    AND tax_amount >= 0
    AND service_charge_amount >= 0
    AND discount_amount >= 0
    AND total_amount >= 0
  ),
  CONSTRAINT food_orders_source_chk CHECK (
    booking_id IS NOT NULL
    OR booking_room_id IS NOT NULL
    OR customer_profile_id IS NOT NULL
  )
);

CREATE UNIQUE INDEX ux_food_orders_order_number_active ON hotel.food_orders (order_number) WHERE deleted_at IS NULL;
CREATE INDEX ix_food_orders_hotel_id ON hotel.food_orders (hotel_id, ordered_at DESC);
CREATE INDEX ix_food_orders_booking_room_id ON hotel.food_orders (booking_room_id);

CREATE TABLE hotel.food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  food_order_id uuid NOT NULL REFERENCES hotel.food_orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES hotel.menu_items(id) ON DELETE RESTRICT,
  line_no integer NOT NULL,
  quantity numeric(14,2) NOT NULL DEFAULT 1,
  unit_price numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  line_total numeric(14,2) NOT NULL DEFAULT 0,
  special_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT food_order_items_quantity_chk CHECK (quantity > 0),
  CONSTRAINT food_order_items_money_chk CHECK (
    unit_price >= 0
    AND tax_amount >= 0
    AND discount_amount >= 0
    AND line_total >= 0
  )
);

CREATE UNIQUE INDEX ux_food_order_items_line_active ON hotel.food_order_items (food_order_id, line_no) WHERE deleted_at IS NULL;

CREATE TABLE hotel.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  recipient_user_id uuid NOT NULL REFERENCES hotel.app_users(id) ON DELETE RESTRICT,
  notification_type text NOT NULL,
  channel hotel.notification_channel NOT NULL DEFAULT 'in_app',
  status hotel.notification_status NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  body text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_entity_type text,
  related_entity_id uuid,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX ix_notifications_recipient_status ON hotel.notifications (recipient_user_id, status, created_at DESC);
CREATE INDEX ix_notifications_hotel_id ON hotel.notifications (hotel_id, created_at DESC);

CREATE TABLE hotel.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotel.hotels(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_table text NOT NULL,
  entity_id uuid,
  request_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX ix_audit_logs_entity_lookup ON hotel.audit_logs (entity_table, entity_id, occurred_at DESC);
CREATE INDEX ix_audit_logs_actor ON hotel.audit_logs (actor_user_id, occurred_at DESC);

CREATE TABLE hotel.import_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotel.hotels(id) ON DELETE RESTRICT,
  initiated_by_user_id uuid REFERENCES hotel.app_users(id) ON DELETE SET NULL,
  job_kind hotel.job_kind NOT NULL,
  entity_name text NOT NULL,
  file_name text,
  file_path text,
  file_format text NOT NULL DEFAULT 'xlsx',
  status hotel.job_status NOT NULL DEFAULT 'queued',
  total_rows integer NOT NULL DEFAULT 0,
  processed_rows integer NOT NULL DEFAULT 0,
  failed_rows integer NOT NULL DEFAULT 0,
  error_report_path text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT import_export_jobs_rows_chk CHECK (total_rows >= 0 AND processed_rows >= 0 AND failed_rows >= 0),
  CONSTRAINT import_export_jobs_complete_chk CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX ix_import_export_jobs_hotel_status ON hotel.import_export_jobs (hotel_id, status, created_at DESC);

ALTER TABLE hotel.room_blocks
  ADD CONSTRAINT room_blocks_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(start_date, end_date, '[)') WITH &&
  )
  WHERE (deleted_at IS NULL);

ALTER TABLE hotel.room_type_rates
  ADD CONSTRAINT room_type_rates_no_overlap
  EXCLUDE USING gist (
    room_type_id WITH =,
    daterange(valid_from, COALESCE(valid_to, 'infinity'::date), '[)') WITH &&
  )
  WHERE (deleted_at IS NULL);

CREATE INDEX ix_booking_guests_hotel_id ON hotel.booking_guests (hotel_id);
CREATE INDEX ix_booking_guests_booking_room_primary ON hotel.booking_guests (booking_room_id, is_primary) WHERE deleted_at IS NULL;
CREATE INDEX ix_invoice_items_invoice_id ON hotel.invoice_items (invoice_id);
CREATE INDEX ix_food_order_items_food_order_id ON hotel.food_order_items (food_order_id);
CREATE INDEX ix_room_type_amenities_amenity_id ON hotel.room_type_amenities (amenity_id);

CREATE OR REPLACE FUNCTION hotel.validate_booking_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_hotel uuid;
BEGIN
  IF NEW.check_out_date <= NEW.check_in_date THEN
    RAISE EXCEPTION 'booking dates are invalid';
  END IF;

  IF NEW.customer_profile_id IS NOT NULL THEN
    SELECT cp.hotel_id
      INTO v_customer_hotel
    FROM hotel.customer_profiles cp
    WHERE cp.id = NEW.customer_profile_id
      AND cp.deleted_at IS NULL;

    IF v_customer_hotel IS NULL THEN
      RAISE EXCEPTION 'customer profile does not exist or is deleted';
    END IF;

    IF v_customer_hotel <> NEW.hotel_id THEN
      RAISE EXCEPTION 'booking customer profile hotel does not match booking hotel';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'hotels',
    'roles',
    'permissions',
    'role_permissions',
    'app_users',
    'user_roles',
    'user_sessions',
    'password_reset_tokens',
    'staff_profiles',
    'customer_profiles',
    'room_amenities',
    'room_types',
    'room_type_rates',
    'room_type_amenities',
    'rooms',
    'room_status_history',
    'room_blocks',
    'bookings',
    'booking_rooms',
    'booking_guests',
    'checkin_records',
    'checkout_records',
    'invoices',
    'invoice_items',
    'payments',
    'payment_allocations',
    'refunds',
    'housekeeping_tasks',
    'food_categories',
    'menu_items',
    'food_orders',
    'food_order_items',
    'notifications',
    'import_export_jobs'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON hotel.%I', tbl);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON hotel.%I FOR EACH ROW EXECUTE FUNCTION hotel.set_updated_at()', tbl);
  END LOOP;
END
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_mutation ON hotel.audit_logs;
CREATE TRIGGER trg_prevent_audit_mutation
BEFORE UPDATE OR DELETE ON hotel.audit_logs
FOR EACH ROW EXECUTE FUNCTION hotel.prevent_audit_mutation();

DROP TRIGGER IF EXISTS trg_validate_booking_dates ON hotel.bookings;
CREATE TRIGGER trg_validate_booking_dates
BEFORE INSERT OR UPDATE ON hotel.bookings
FOR EACH ROW EXECUTE FUNCTION hotel.validate_booking_dates();

DROP TRIGGER IF EXISTS trg_validate_booking_room ON hotel.booking_rooms;
CREATE TRIGGER trg_validate_booking_room
BEFORE INSERT OR UPDATE ON hotel.booking_rooms
FOR EACH ROW EXECUTE FUNCTION hotel.validate_booking_room();

DROP TRIGGER IF EXISTS trg_validate_payment_allocation_balance ON hotel.payment_allocations;
CREATE TRIGGER trg_validate_payment_allocation_balance
AFTER INSERT OR UPDATE OR DELETE ON hotel.payment_allocations
FOR EACH ROW EXECUTE FUNCTION hotel.validate_payment_allocation_balance();

DROP TRIGGER IF EXISTS trg_validate_refund_balance ON hotel.refunds;
CREATE TRIGGER trg_validate_refund_balance
AFTER INSERT OR UPDATE OR DELETE ON hotel.refunds
FOR EACH ROW EXECUTE FUNCTION hotel.validate_refund_balance();

INSERT INTO hotel.roles (code, name, description, is_system)
VALUES
  ('admin', 'Admin', 'System administrator with full access', true),
  ('receptionist', 'Receptionist', 'Front desk and reservation operations', true),
  ('staff', 'Staff', 'Operational staff access', true),
  ('customer', 'Customer', 'Guest/customer portal access', true)
ON CONFLICT (code) DO NOTHING;
