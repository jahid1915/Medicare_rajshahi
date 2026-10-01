-- ============================================================
-- NIRAMOY HEALTHCARE PLATFORM — PostgreSQL Schema
-- Migration from MongoDB/Mongoose to Supabase PostgreSQL
-- ============================================================
-- Run this entire script in Supabase SQL Editor (once).
-- It is IDEMPOTENT — safe to run multiple times.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- MIGRATION TRACKING
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_id_map (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type     TEXT NOT NULL,
  mongodb_id      TEXT NOT NULL,
  supabase_id     UUID NOT NULL,
  migrated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, mongodb_id)
);

CREATE INDEX IF NOT EXISTS idx_migration_map_type_mongo ON migration_id_map(entity_type, mongodb_id);
CREATE INDEX IF NOT EXISTS idx_migration_map_supabase ON migration_id_map(entity_type, supabase_id);

-- ─────────────────────────────────────────────────────────────
-- USERS (application-level, linked to auth.users)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id                UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  legacy_mongodb_id           TEXT UNIQUE,    -- original MongoDB _id for traceability

  name                        TEXT NOT NULL DEFAULT 'Patient',
  email                       TEXT UNIQUE,
  phone                       TEXT UNIQUE,
  password_hash               TEXT,           -- kept for server-managed auth transition
  role                        TEXT NOT NULL DEFAULT 'patient'
                                CHECK (role IN (
                                  'patient','doctor','specialist_doctor',
                                  'pharmacy_owner','pharmacist',
                                  'hospital_admin','hospital_management',
                                  'nurse','lab_tech','radiology_tech',
                                  'receptionist','ambulance_op',
                                  'researcher','compliance_auditor','super_admin'
                                )),

  -- Basic info
  date_of_birth               DATE,
  gender                      TEXT CHECK (gender IN ('male','female','other')),
  address                     TEXT,
  blood_group                 TEXT,
  profile_picture             TEXT,
  preferred_language          TEXT DEFAULT 'bn',

  -- Emergency contact
  emergency_contact           TEXT,
  emergency_contact_name      TEXT,
  emergency_contact_relation  TEXT,
  emergency_contact_phone     TEXT,

  -- Medical info
  allergies                   TEXT DEFAULT '',
  existing_conditions         TEXT DEFAULT '',
  previous_surgeries          TEXT DEFAULT '',
  current_medications         TEXT DEFAULT '',
  medical_history             TEXT DEFAULT '',

  -- Organization references
  hospital_id                 UUID,           -- FK added after hospitals table
  pharmacy_id                 UUID,           -- FK added after pharmacies table

  -- Status
  is_active                   BOOLEAN DEFAULT TRUE,
  is_verified                 BOOLEAN DEFAULT FALSE,
  is_email_verified           BOOLEAN DEFAULT FALSE,
  last_login                  TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email    ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone    ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_mongo_id ON profiles(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- HOSPITALS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospitals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id   TEXT UNIQUE,

  name                TEXT NOT NULL,
  short_name          TEXT,
  type                TEXT NOT NULL CHECK (type IN ('government','private','clinic','ngo')),

  city                TEXT DEFAULT 'Rajshahi',
  district            TEXT DEFAULT 'Rajshahi',
  division            TEXT DEFAULT 'Rajshahi',
  area                TEXT,
  address             TEXT,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,

  phone               TEXT,
  emergency_phone     TEXT,
  email               TEXT,
  website             TEXT,

  is_verified         BOOLEAN DEFAULT FALSE,
  verification_level  TEXT DEFAULT 'unverified'
                        CHECK (verification_level IN (
                          'verified','hospital_verified','admin_verified','unverified'
                        )),
  verified_at         TIMESTAMPTZ,
  verified_by         UUID,                 -- references profiles.id

  has_icu             BOOLEAN DEFAULT FALSE,
  has_ccu             BOOLEAN DEFAULT FALSE,
  has_nicu            BOOLEAN DEFAULT FALSE,
  has_picu            BOOLEAN DEFAULT FALSE,
  has_emergency       BOOLEAN DEFAULT FALSE,
  has_blood_bank      BOOLEAN DEFAULT FALSE,
  has_pharmacy        BOOLEAN DEFAULT FALSE,
  has_diagnostic      BOOLEAN DEFAULT FALSE,
  has_ambulance       BOOLEAN DEFAULT FALSE,
  has_dialysis        BOOLEAN DEFAULT FALSE,

  bed_count_approx    INTEGER,
  services            TEXT[],
  description         TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  admin_user_id       UUID,                 -- references profiles.id

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city     ON hospitals(city, district);
CREATE INDEX IF NOT EXISTS idx_hospitals_type     ON hospitals(type);
CREATE INDEX IF NOT EXISTS idx_hospitals_verified ON hospitals(is_verified);
CREATE INDEX IF NOT EXISTS idx_hospitals_mongo    ON hospitals(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- SPECIALTIES (normalized)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS specialties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialties_slug ON specialties(slug);

-- ─────────────────────────────────────────────────────────────
-- DOCTORS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctors (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id           TEXT UNIQUE,

  name                        TEXT NOT NULL,
  slug                        TEXT UNIQUE NOT NULL,
  normalized_name             TEXT,
  source_names                TEXT[],

  -- Primary specialty (denormalized for fast query)
  specialty                   TEXT DEFAULT 'General Practice',

  qualifications              TEXT,
  training                    TEXT,
  education_training          TEXT[],
  fellowships                 TEXT[],
  medical_focus               TEXT[],
  designation                 TEXT,
  workplace                   TEXT,
  experience                  TEXT,
  biography                   TEXT,

  bmdc_registration           TEXT,
  verified                    BOOLEAN DEFAULT FALSE,
  rating                      NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count                INTEGER DEFAULT 0,
  reviews_data                JSONB DEFAULT '{}',
  profile_claim               TEXT,

  image_url                   TEXT,
  profile_url                 TEXT,
  source                      TEXT DEFAULT 'BDDoctorDirectory',
  source_metadata             JSONB DEFAULT '{}',
  last_scraped                TIMESTAMPTZ,

  city                        TEXT DEFAULT 'Rajshahi',
  country                     TEXT DEFAULT 'Bangladesh',

  is_active                   BOOLEAN DEFAULT TRUE,
  is_outdated                 BOOLEAN DEFAULT FALSE,
  admin_notes                 TEXT,

  -- Legacy references
  user_id                     UUID,           -- references profiles.id
  hospital_id                 UUID,           -- references hospitals.id
  consultation_fee            NUMERIC(10,2),
  currency                    TEXT DEFAULT 'BDT',
  available_for_telemedicine  BOOLEAN DEFAULT FALSE,

  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty   ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_workplace   ON doctors(workplace);
CREATE INDEX IF NOT EXISTS idx_doctors_verified    ON doctors(verified);
CREATE INDEX IF NOT EXISTS idx_doctors_rating      ON doctors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_doctors_city        ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_mongo       ON doctors(legacy_mongodb_id);
CREATE INDEX IF NOT EXISTS idx_doctors_slug        ON doctors(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_name_fts    ON doctors USING gin(to_tsvector('english', name || ' ' || COALESCE(specialty,'') || ' ' || COALESCE(designation,'') || ' ' || COALESCE(workplace,'')));

-- ─────────────────────────────────────────────────────────────
-- DOCTOR SPECIALTIES (many-to-many)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_specialties (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id  UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  is_primary    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, specialty_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_specialties_doctor  ON doctor_specialties(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_spec    ON doctor_specialties(specialty_id);

-- ─────────────────────────────────────────────────────────────
-- DOCTOR DEGREES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_degrees (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  degree        TEXT NOT NULL,
  institution   TEXT,
  subject       TEXT,
  year          INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_degrees_doctor ON doctor_degrees(doctor_id);

-- ─────────────────────────────────────────────────────────────
-- DOCTOR BRANCHES (for appointment booking)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_branches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id       UUID REFERENCES hospitals(id) ON DELETE SET NULL,

  name              TEXT NOT NULL,
  address           TEXT NOT NULL,
  city              TEXT DEFAULT 'Rajshahi',
  phone             TEXT,
  room_number       TEXT DEFAULT '',
  consultation_fee  NUMERIC(10,2) DEFAULT 800,
  active            BOOLEAN DEFAULT TRUE,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_branches_doctor ON doctor_branches(doctor_id, active);
CREATE INDEX IF NOT EXISTS idx_doctor_branches_mongo  ON doctor_branches(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- DOCTOR CHAMBERS (embedded in Doctor, now normalized)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_chambers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id             UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id           UUID REFERENCES hospitals(id) ON DELETE SET NULL,

  name                  TEXT,
  address               TEXT,
  visiting_hours        TEXT,
  visiting_hour         TEXT,
  closed_day            TEXT,
  appointment           TEXT,
  appointment_numbers   TEXT[],
  google_map            TEXT,
  display_order         INTEGER DEFAULT 0,

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chambers_doctor ON doctor_chambers(doctor_id);

-- ─────────────────────────────────────────────────────────────
-- DOCTOR SCHEDULES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id         UUID NOT NULL REFERENCES doctor_branches(id) ON DELETE CASCADE,

  day_of_week       SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  day_name          TEXT,
  start_time        TEXT NOT NULL,
  end_time          TEXT NOT NULL,
  slot_duration     INTEGER DEFAULT 20,
  max_patients      INTEGER DEFAULT 20,
  consultation_type TEXT DEFAULT 'both' CHECK (consultation_type IN ('in_person','online','both')),
  active            BOOLEAN DEFAULT TRUE,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_doctor_branch ON doctor_schedules(doctor_id, branch_id, day_of_week, active);
CREATE INDEX IF NOT EXISTS idx_schedules_mongo          ON doctor_schedules(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PHARMACIES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pharmacies (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id         TEXT UNIQUE,

  name                      TEXT NOT NULL,
  slug                      TEXT,
  license_number            TEXT,
  owner_id                  UUID REFERENCES profiles(id) ON DELETE SET NULL,

  phone                     TEXT NOT NULL,
  email                     TEXT,
  address                   TEXT NOT NULL,
  area                      TEXT NOT NULL,
  city                      TEXT DEFAULT 'Rajshahi',
  district                  TEXT DEFAULT 'Rajshahi',
  latitude                  DOUBLE PRECISION DEFAULT 24.3745,
  longitude                 DOUBLE PRECISION DEFAULT 88.6042,

  rating                    NUMERIC(3,2) DEFAULT 4.8 CHECK (rating BETWEEN 0 AND 5),
  review_count              INTEGER DEFAULT 0,

  is_verified               BOOLEAN DEFAULT TRUE,
  is_active                 BOOLEAN DEFAULT TRUE,
  is_24_7                   BOOLEAN DEFAULT FALSE,

  opening_hours             JSONB DEFAULT '{"open":"08:00 AM","close":"11:00 PM"}',
  delivery_available        BOOLEAN DEFAULT TRUE,
  delivery_eta_mins         INTEGER DEFAULT 30,
  delivery_fee              NUMERIC(8,2) DEFAULT 40,
  free_delivery_above       NUMERIC(8,2) DEFAULT 500,
  banner_image              TEXT,
  featured_notice           TEXT,
  accepted_payment_methods  TEXT[],

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_city   ON pharmacies(city, area, is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacies_owner  ON pharmacies(owner_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_mongo  ON pharmacies(legacy_mongodb_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_fts    ON pharmacies USING gin(to_tsvector('english', name || ' ' || address || ' ' || area));

-- ─────────────────────────────────────────────────────────────
-- MEDICINES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medicines (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id     TEXT UNIQUE,

  brand_name            TEXT NOT NULL,
  generic_name          TEXT NOT NULL,
  category              TEXT NOT NULL,
  manufacturer          TEXT NOT NULL,
  dosage_form           TEXT NOT NULL DEFAULT 'Tablet',
  strength              TEXT NOT NULL,
  unit                  TEXT DEFAULT 'strip of 10',
  unit_price            NUMERIC(10,2) DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT FALSE,
  is_otc                BOOLEAN DEFAULT TRUE,
  description           TEXT DEFAULT '',
  indications           TEXT DEFAULT '',
  dosage_guidelines     TEXT DEFAULT '',
  side_effects          TEXT DEFAULT '',
  precautions           TEXT DEFAULT '',
  image_url             TEXT,
  is_active             BOOLEAN DEFAULT TRUE,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_brand   ON medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_cat     ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_mongo   ON medicines(legacy_mongodb_id);
CREATE INDEX IF NOT EXISTS idx_medicines_fts     ON medicines USING gin(to_tsvector('english', brand_name || ' ' || generic_name || ' ' || manufacturer));

-- ─────────────────────────────────────────────────────────────
-- PHARMACY INVENTORY
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pharmacy_inventories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id   TEXT UNIQUE,

  pharmacy_id         UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id         UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,

  stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity   INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  available_quantity  INTEGER DEFAULT 0,
  unit_price          NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  discounted_price    NUMERIC(10,2),
  batch_number        TEXT DEFAULT '',
  expiry_date         DATE,
  in_stock            BOOLEAN DEFAULT TRUE,
  reorder_level       INTEGER DEFAULT 20,
  stock_status        TEXT DEFAULT 'IN_STOCK'
                        CHECK (stock_status IN ('IN_STOCK','LOW_STOCK','OUT_OF_STOCK','EXPIRED')),
  demand_trend        TEXT DEFAULT 'Stable'
                        CHECK (demand_trend IN ('Surging','High Demand','Stable','Low Demand')),
  trend_reason        TEXT DEFAULT '',
  risk_level          TEXT DEFAULT 'Normal'
                        CHECK (risk_level IN ('Critical Shortage','Surge Warning','Normal','Overstocked')),
  last_updated_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active           BOOLEAN DEFAULT TRUE,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pharmacy_id, medicine_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy     ON pharmacy_inventories(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_inventory_medicine     ON pharmacy_inventories(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_status ON pharmacy_inventories(pharmacy_id, stock_status);
CREATE INDEX IF NOT EXISTS idx_inventory_in_stock     ON pharmacy_inventories(in_stock, stock_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry       ON pharmacy_inventories(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_mongo        ON pharmacy_inventories(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PHARMACY ORDERS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id     TEXT UNIQUE,

  order_number          TEXT UNIQUE NOT NULL,
  patient_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pharmacy_id           UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  prescription_id       UUID,                -- references prescriptions.id

  prescription_required   BOOLEAN DEFAULT FALSE,
  prescription_image      TEXT,
  prescription_verified   BOOLEAN DEFAULT FALSE,
  verified_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,

  subtotal              NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee          NUMERIC(8,2) DEFAULT 40,
  discount              NUMERIC(8,2) DEFAULT 0,
  total_amount          NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),

  delivery_address      JSONB NOT NULL DEFAULT '{}',
  delivery_type         TEXT DEFAULT 'home_delivery'
                          CHECK (delivery_type IN ('home_delivery','pickup')),
  payment_method        TEXT DEFAULT 'cash_on_delivery'
                          CHECK (payment_method IN ('cash_on_delivery','bkash','nagad','card','sslcommerz')),
  payment_status        TEXT DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','paid','failed','refunded')),
  status                TEXT DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  timeline              JSONB DEFAULT '[]',
  cancel_reason         TEXT DEFAULT '',
  notes                 TEXT DEFAULT '',

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON pharmacy_orders(pharmacy_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_patient  ON pharmacy_orders(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_mongo    ON pharmacy_orders(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PHARMACY ORDER ITEMS (normalized from embedded array)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pharmacy_order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES pharmacy_orders(id) ON DELETE CASCADE,
  medicine_id     UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,

  brand_name      TEXT NOT NULL,
  generic_name    TEXT DEFAULT '',
  dosage_form     TEXT DEFAULT 'Tablet',
  strength        TEXT DEFAULT '',
  quantity        INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price      NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price     NUMERIC(10,2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON pharmacy_order_items(order_id);

-- ─────────────────────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id     TEXT UNIQUE,

  appointment_id        TEXT UNIQUE,              -- human readable APT-YYYYMMDD-XXXX
  serial_number         TEXT,

  patient_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id             UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES doctor_branches(id) ON DELETE SET NULL,
  facility_id           UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  chamber_index         INTEGER DEFAULT 0,

  appointment_date      DATE NOT NULL,
  start_time            TEXT,
  end_time              TEXT,
  time_slot             TEXT NOT NULL,

  appointment_type      TEXT DEFAULT 'Online Consultation',
  consultation_type     TEXT DEFAULT 'in_person',
  consultation_fee      NUMERIC(10,2) NOT NULL DEFAULT 800,
  currency              TEXT DEFAULT 'BDT',

  status                TEXT DEFAULT 'PENDING_PAYMENT'
                          CHECK (status IN (
                            'PENDING_PAYMENT','CONFIRMED','WAITING','IN_PROGRESS',
                            'COMPLETED','CANCELLED','NO_SHOW','REFUND_PENDING',
                            'REFUNDED','EXPIRED','RESCHEDULED',
                            'pending','awaiting_payment','confirmed','waiting',
                            'in_progress','completed','cancelled','no_show'
                          )),
  payment_status        TEXT DEFAULT 'UNPAID'
                          CHECK (payment_status IN (
                            'UNPAID','PENDING','PAID','FAILED','CANCELLED','REFUNDED',
                            'unpaid','pending','paid','failed'
                          )),

  payment_id            UUID,                     -- references payments.id
  ssl_transaction_id    TEXT,
  hold_expires_at       TIMESTAMPTZ,
  email_delivery_status TEXT DEFAULT 'PENDING'
                          CHECK (email_delivery_status IN ('PENDING','SENT','FAILED')),
  pdf_url               TEXT,

  -- Patient snapshot at booking time
  patient_name          TEXT,
  patient_email         TEXT,
  patient_phone         TEXT,
  gender                TEXT,
  age                   TEXT,
  address               TEXT,
  emergency_contact     TEXT,
  blood_group           TEXT,
  consultation_reason   TEXT,

  family_member_name    TEXT,
  symptoms              TEXT,
  ai_triage_summary     TEXT,
  doctor_notes          TEXT,

  cancelled_at          TIMESTAMPTZ,
  cancel_reason         TEXT,
  completed_at          TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor       ON appointments(doctor_id, branch_id, appointment_date, time_slot, status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient      ON appointments(patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status       ON appointments(status, hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_appointments_ssl          ON appointments(ssl_transaction_id);
CREATE INDEX IF NOT EXISTS idx_appointments_mongo        ON appointments(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id       TEXT UNIQUE,

  payment_number          TEXT UNIQUE,

  order_id                UUID,                   -- references pharmacy_orders.id
  appointment_id          UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  amount                  NUMERIC(10,2) NOT NULL,
  currency                TEXT DEFAULT 'BDT',

  gateway                 TEXT DEFAULT 'sslcommerz'
                            CHECK (gateway IN ('sslcommerz','aamarpay','shurjopay','manual','cash')),
  method                  TEXT,

  transaction_id          TEXT UNIQUE,
  gateway_transaction_id  TEXT,
  session_key             TEXT,
  validation_id           TEXT,
  bank_transaction_id     TEXT,
  risk_level              TEXT DEFAULT '0',
  idempotency_key         TEXT UNIQUE,

  status                  TEXT DEFAULT 'initiated'
                            CHECK (status IN (
                              'initiated','pending','processing','successful',
                              'failed','cancelled','refunded','partially_refunded',
                              'PENDING','PAID','FAILED','CANCELLED'
                            )),

  gateway_response        JSONB,
  raw_gateway_reference   JSONB,

  service_type            TEXT DEFAULT 'doctor_appointment'
                            CHECK (service_type IN (
                              'doctor_appointment','pharmacy_order',
                              'hospital_admission','diagnostic_test','general'
                            )),
  hospital_id             UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  pharmacy_id             UUID REFERENCES pharmacies(id) ON DELETE SET NULL,

  customer_name           TEXT,
  customer_phone          TEXT,
  customer_email          TEXT,

  paid_at                 TIMESTAMPTZ,
  failed_at               TIMESTAMPTZ,
  failure_reason          TEXT,
  status_history          JSONB DEFAULT '[]',

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_patient        ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment    ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction    ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created        ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_mongo          ON payments(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id       TEXT UNIQUE,

  prescription_number     TEXT UNIQUE NOT NULL,
  patient_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id               UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id          UUID REFERENCES appointments(id) ON DELETE SET NULL,
  appointment_number      TEXT DEFAULT '',

  doctor_name             TEXT DEFAULT 'Attending Physician',
  doctor_specialization   TEXT DEFAULT 'General Medicine',
  doctor_bmdc_reg         TEXT DEFAULT '',
  hospital_name           TEXT DEFAULT '',

  diagnosis               TEXT DEFAULT '',
  chief_complaints        TEXT DEFAULT '',
  vitals                  JSONB DEFAULT '{}',
  tests_advised           TEXT[],
  advice                  TEXT DEFAULT '',
  follow_up_date          DATE,
  file_url                TEXT,

  source_type             TEXT DEFAULT 'teleconsultation'
                            CHECK (source_type IN ('teleconsultation','in_person','patient_upload')),
  is_verified             BOOLEAN DEFAULT TRUE,
  verified_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient     ON prescriptions(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor      ON prescriptions(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_mongo       ON prescriptions(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- PRESCRIPTION ITEMS (medicines in each prescription)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescription_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,

  medicine_name     TEXT NOT NULL,
  generic_name      TEXT DEFAULT '',
  dosage            TEXT NOT NULL,
  duration          TEXT NOT NULL,
  timing            TEXT DEFAULT 'After meal',
  instructions      TEXT DEFAULT '',
  display_order     INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rx_items_prescription ON prescription_items(prescription_id);

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                    CHECK (type IN (
                      'appointment_confirmed','appointment_reminder','appointment_cancelled',
                      'payment_successful','payment_failed','refund_processed',
                      'hospital_booking_confirmed','invoice_generated','resource_updated','general'
                    )),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  reference_id    TEXT,
  reference_type  TEXT,
  channels        TEXT[] DEFAULT ARRAY['in_app'],

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_mongo  ON notifications(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- OTP VERIFICATIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS otp_verifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  email           TEXT,
  phone           TEXT,
  otp_hash        TEXT NOT NULL,
  purpose         TEXT DEFAULT 'PATIENT_SIGNUP',
  expires_at      TIMESTAMPTZ NOT NULL,
  attempt_count   INTEGER DEFAULT 0 CHECK (attempt_count <= 10),
  resend_count    INTEGER DEFAULT 0,
  last_resend_at  TIMESTAMPTZ DEFAULT NOW(),
  verified        BOOLEAN DEFAULT FALSE,
  metadata        JSONB DEFAULT '{}',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone   ON otp_verifications(phone, purpose, verified);
CREATE INDEX IF NOT EXISTS idx_otp_email   ON otp_verifications(email, purpose, verified);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name      TEXT,
  actor_role      TEXT,
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     TEXT,
  old_value       JSONB,
  new_value       JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  detail          TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor    ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_mongo    ON audit_logs(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- INVENTORY AUDITS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_audits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT UNIQUE,

  pharmacy_id       UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id       UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,

  action            TEXT NOT NULL
                      CHECK (action IN (
                        'STOCK_ADDED','STOCK_REMOVED','STOCK_UPDATED','EXPIRED',
                        'MANUAL_ADJUSTMENT','ORDER_RESERVED','ORDER_RELEASED',
                        'ORDER_SOLD','EXCEL_IMPORT'
                      )),
  previous_quantity INTEGER DEFAULT 0,
  new_quantity      INTEGER NOT NULL,
  batch_number      TEXT DEFAULT '',
  reason            TEXT DEFAULT '',
  timestamp_at      TIMESTAMPTZ DEFAULT NOW(),

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_audit_pharmacy ON inventory_audits(pharmacy_id, medicine_id, timestamp_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_audit_mongo    ON inventory_audits(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- HOSPITAL RESOURCES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospital_resources (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id     TEXT UNIQUE,

  hospital_id           UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  resource_type         TEXT NOT NULL
                          CHECK (resource_type IN (
                            'general_bed','cabin','ac_cabin','non_ac_cabin',
                            'icu','ccu','nicu','picu','hdu',
                            'emergency_bed','isolation_bed','burn_bed',
                            'operation_theatre','dialysis_unit',
                            'ambulance','oxygen_unit','ventilator'
                          )),
  resource_name         TEXT NOT NULL,

  total_capacity        INTEGER,
  available_count       INTEGER,
  occupied_count        INTEGER,
  reserved_count        INTEGER DEFAULT 0,
  maintenance_count     INTEGER DEFAULT 0,
  occupancy_percentage  INTEGER,

  status                TEXT DEFAULT 'unknown'
                          CHECK (status IN ('available','limited','full','unavailable','maintenance','unknown')),

  is_bookable           BOOLEAN DEFAULT FALSE,
  booking_policy        TEXT DEFAULT 'information_only'
                          CHECK (booking_policy IN (
                            'online_booking','request_only',
                            'hospital_confirmation_required','information_only'
                          )),
  price_per_day         NUMERIC(10,2),

  last_updated          TIMESTAMPTZ,
  updated_by            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source                TEXT DEFAULT 'manual'
                          CHECK (source IN ('hospital_admin','manual','api','system')),
  verification_status   TEXT DEFAULT 'unverified'
                          CHECK (verification_status IN (
                            'verified','hospital_verified','admin_verified','unverified','stale'
                          )),

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospital_resources_hospital ON hospital_resources(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_resources_type     ON hospital_resources(hospital_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_hospital_resources_status   ON hospital_resources(status);
CREATE INDEX IF NOT EXISTS idx_hospital_resources_mongo    ON hospital_resources(legacy_mongodb_id);

-- ─────────────────────────────────────────────────────────────
-- INVOICES (empty — preserve for future use)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT,
  invoice_number  TEXT UNIQUE,
  patient_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount          NUMERIC(10,2),
  status          TEXT DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ORDERS (empty — preserve for future use)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_mongodb_id TEXT,
  order_number    TEXT UNIQUE,
  patient_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ADD DEFERRED FOREIGN KEYS (circular refs resolved)
-- ─────────────────────────────────────────────────────────────

-- profiles.hospital_id → hospitals.id
ALTER TABLE profiles
  ADD CONSTRAINT IF NOT EXISTS fk_profiles_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL;

-- profiles.pharmacy_id → pharmacies.id
ALTER TABLE profiles
  ADD CONSTRAINT IF NOT EXISTS fk_profiles_pharmacy
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;

-- appointments.payment_id → payments.id
ALTER TABLE appointments
  ADD CONSTRAINT IF NOT EXISTS fk_appointments_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- pharmacy_orders.prescription_id → prescriptions.id
ALTER TABLE pharmacy_orders
  ADD CONSTRAINT IF NOT EXISTS fk_orders_prescription
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all sensitive tables
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventories  ENABLE ROW LEVEL SECURITY;

-- Public read-only (no login required)
ALTER TABLE doctors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_branches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_chambers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_specialties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_degrees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_resources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines             ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────

-- Users can read/update their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Service role can do anything (backend)
DROP POLICY IF EXISTS "profiles_service_all" ON profiles;
CREATE POLICY "profiles_service_all" ON profiles
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Appointments ──────────────────────────────────────────────

DROP POLICY IF EXISTS "appointments_patient_own" ON appointments;
CREATE POLICY "appointments_patient_own" ON appointments
  FOR SELECT USING (
    patient_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "appointments_service_all" ON appointments;
CREATE POLICY "appointments_service_all" ON appointments
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Prescriptions ─────────────────────────────────────────────

DROP POLICY IF EXISTS "prescriptions_patient_own" ON prescriptions;
CREATE POLICY "prescriptions_patient_own" ON prescriptions
  FOR SELECT USING (
    patient_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "prescriptions_service_all" ON prescriptions;
CREATE POLICY "prescriptions_service_all" ON prescriptions
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Prescription Items ────────────────────────────────────────

DROP POLICY IF EXISTS "rx_items_patient_own" ON prescription_items;
CREATE POLICY "rx_items_patient_own" ON prescription_items
  FOR SELECT USING (
    prescription_id IN (
      SELECT id FROM prescriptions
      WHERE patient_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
    )
  );

DROP POLICY IF EXISTS "rx_items_service_all" ON prescription_items;
CREATE POLICY "rx_items_service_all" ON prescription_items
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Payments ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "payments_patient_own" ON payments;
CREATE POLICY "payments_patient_own" ON payments
  FOR SELECT USING (
    patient_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "payments_service_all" ON payments;
CREATE POLICY "payments_service_all" ON payments
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Notifications ─────────────────────────────────────────────

DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (
    user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  ) WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "notifications_service_all" ON notifications;
CREATE POLICY "notifications_service_all" ON notifications
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Pharmacy Orders ───────────────────────────────────────────

DROP POLICY IF EXISTS "pharmacy_orders_patient_own" ON pharmacy_orders;
CREATE POLICY "pharmacy_orders_patient_own" ON pharmacy_orders
  FOR SELECT USING (
    patient_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "pharmacy_orders_service_all" ON pharmacy_orders;
CREATE POLICY "pharmacy_orders_service_all" ON pharmacy_orders
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Pharmacy Order Items ──────────────────────────────────────

DROP POLICY IF EXISTS "order_items_service_all" ON pharmacy_order_items;
CREATE POLICY "order_items_service_all" ON pharmacy_order_items
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── OTP Verifications ─────────────────────────────────────────

DROP POLICY IF EXISTS "otp_service_all" ON otp_verifications;
CREATE POLICY "otp_service_all" ON otp_verifications
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Audit Logs ────────────────────────────────────────────────

DROP POLICY IF EXISTS "audit_service_all" ON audit_logs;
CREATE POLICY "audit_service_all" ON audit_logs
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Inventory Audits ──────────────────────────────────────────

DROP POLICY IF EXISTS "inv_audit_service_all" ON inventory_audits;
CREATE POLICY "inv_audit_service_all" ON inventory_audits
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Pharmacy Inventories ──────────────────────────────────────

DROP POLICY IF EXISTS "pharmacy_inv_public_read" ON pharmacy_inventories;
CREATE POLICY "pharmacy_inv_public_read" ON pharmacy_inventories
  FOR SELECT USING (is_active = TRUE AND in_stock = TRUE);

DROP POLICY IF EXISTS "pharmacy_inv_service_all" ON pharmacy_inventories;
CREATE POLICY "pharmacy_inv_service_all" ON pharmacy_inventories
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── Public Tables (READ-only for anyone) ──────────────────────

DROP POLICY IF EXISTS "doctors_public_read" ON doctors;
CREATE POLICY "doctors_public_read" ON doctors
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "doctors_service_all" ON doctors;
CREATE POLICY "doctors_service_all" ON doctors
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "specialties_public_read" ON specialties;
CREATE POLICY "specialties_public_read" ON specialties
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "specialties_service_all" ON specialties;
CREATE POLICY "specialties_service_all" ON specialties
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "doctor_specialties_public_read" ON doctor_specialties;
CREATE POLICY "doctor_specialties_public_read" ON doctor_specialties
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "doctor_specialties_service_all" ON doctor_specialties;
CREATE POLICY "doctor_specialties_service_all" ON doctor_specialties
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "doctor_degrees_public_read" ON doctor_degrees;
CREATE POLICY "doctor_degrees_public_read" ON doctor_degrees
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "doctor_degrees_service_all" ON doctor_degrees;
CREATE POLICY "doctor_degrees_service_all" ON doctor_degrees
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "doctor_chambers_public_read" ON doctor_chambers;
CREATE POLICY "doctor_chambers_public_read" ON doctor_chambers
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "doctor_chambers_service_all" ON doctor_chambers;
CREATE POLICY "doctor_chambers_service_all" ON doctor_chambers
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "doctor_branches_public_read" ON doctor_branches;
CREATE POLICY "doctor_branches_public_read" ON doctor_branches
  FOR SELECT USING (active = TRUE);

DROP POLICY IF EXISTS "doctor_branches_service_all" ON doctor_branches;
CREATE POLICY "doctor_branches_service_all" ON doctor_branches
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "doctor_schedules_public_read" ON doctor_schedules;
CREATE POLICY "doctor_schedules_public_read" ON doctor_schedules
  FOR SELECT USING (active = TRUE);

DROP POLICY IF EXISTS "doctor_schedules_service_all" ON doctor_schedules;
CREATE POLICY "doctor_schedules_service_all" ON doctor_schedules
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "hospitals_public_read" ON hospitals;
CREATE POLICY "hospitals_public_read" ON hospitals
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "hospitals_service_all" ON hospitals;
CREATE POLICY "hospitals_service_all" ON hospitals
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "hospital_resources_public_read" ON hospital_resources;
CREATE POLICY "hospital_resources_public_read" ON hospital_resources
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "hospital_resources_service_all" ON hospital_resources;
CREATE POLICY "hospital_resources_service_all" ON hospital_resources
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "pharmacies_public_read" ON pharmacies;
CREATE POLICY "pharmacies_public_read" ON pharmacies
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "pharmacies_service_all" ON pharmacies;
CREATE POLICY "pharmacies_service_all" ON pharmacies
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "medicines_public_read" ON medicines;
CREATE POLICY "medicines_public_read" ON medicines
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "medicines_service_all" ON medicines;
CREATE POLICY "medicines_service_all" ON medicines
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','hospitals','doctors','doctor_branches','doctor_schedules',
    'pharmacies','medicines','pharmacy_inventories','pharmacy_orders',
    'appointments','payments','prescriptions','notifications',
    'otp_verifications','audit_logs','inventory_audits','hospital_resources',
    'invoices','orders'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────
-- Schema created successfully.
-- Next step: Run migration scripts to populate data from MongoDB.
-- ─────────────────────────────────────────────────────────────
