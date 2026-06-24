-- ============================================================================
-- Propel CSR Activity Management — PostgreSQL Schema (Phase 1 / MVP)
-- ============================================================================
-- Derived from: Business_Requirements_Document.docx (Sections 5, 6, 10, 11)
-- Engine: PostgreSQL 14+
--
-- This file is the literal DDL — primary keys, foreign keys, indexes,
-- constraints — independent of any ORM. The backend's Prisma schema
-- (prisma/schema.prisma) maps onto this same structure; either can be the
-- source of truth, but if you hand-run migrations, run THIS file first and
-- then point Prisma at the resulting database with `prisma db pull`.
--
-- Run as: psql -d propel_csr -f sql/schema.sql
-- ============================================================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------

CREATE TYPE role_enum AS ENUM (
  'VOLUNTEER', 'COORDINATOR', 'CSR_ADMIN', 'MANAGEMENT', 'FINANCE'
);

CREATE TYPE event_status_enum AS ENUM (
  'DRAFT', 'SUBMITTED_FOR_APPROVAL', 'UNDER_REVIEW', 'BUDGET_PENDING',
  'APPROVED', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED',
  'ONGOING', 'COMPLETED', 'CLOSURE_PENDING', 'CLOSED', 'CANCELLED'
);

CREATE TYPE registration_status_enum AS ENUM (
  'APPLIED', 'WAITLISTED', 'CONFIRMED', 'WITHDRAWN', 'ATTENDED', 'NO_SHOW', 'CANCELLED'
);

CREATE TYPE budget_status_enum AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED',
  'REJECTED', 'UTILIZATION_SUBMITTED', 'FINANCE_VERIFIED', 'CLOSED'
);

CREATE TYPE need_status_enum AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED_FOR_PROPOSAL',
  'REJECTED', 'CONVERTED_TO_PROPOSAL', 'CLOSED'
);

CREATE TYPE urgency_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE attendance_status_enum AS ENUM ('Present', 'Absent', 'Excused');

CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Paid', 'Rejected');

-- ----------------------------------------------------------------------------
-- Generic trigger: auto-maintain updated_at on row changes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. EMPLOYEES  — master data store (BRD 6.1 / Section 10)
-- ============================================================================
CREATE TABLE employees (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id             VARCHAR(20)  NOT NULL,
  name               VARCHAR(150) NOT NULL,
  mobile             VARCHAR(20),
  email              VARCHAR(150) NOT NULL,
  department         VARCHAR(100) NOT NULL,
  location           VARCHAR(100) NOT NULL DEFAULT 'Coimbatore',
  designation        VARCHAR(100),
  reporting_manager  VARCHAR(150),
  role               role_enum    NOT NULL DEFAULT 'VOLUNTEER',
  is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_employees_emp_id UNIQUE (emp_id),
  CONSTRAINT uq_employees_email  UNIQUE (email)
);

CREATE INDEX idx_employees_department ON employees (department);
CREATE INDEX idx_employees_role       ON employees (role);
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. VOLUNTEER_PROFILES — 1:1 extension of an employee who opts in (BRD 6.1)
-- ============================================================================
CREATE TABLE volunteer_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id          UUID NOT NULL,
  preferred_categories TEXT[] NOT NULL DEFAULT '{}',
  availability         VARCHAR(100),
  emergency_contact    VARCHAR(100),
  skills               TEXT,
  total_hours          NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (total_hours >= 0),
  recognition_points   INTEGER      NOT NULL DEFAULT 0 CHECK (recognition_points >= 0),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_volunteer_profiles_employee UNIQUE (employee_id),
  CONSTRAINT fk_volunteer_profiles_employee FOREIGN KEY (employee_id)
    REFERENCES employees (id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. CSR_CATEGORIES — Education, Health & Hygiene, etc. (BRD Section 5)
-- ============================================================================
CREATE TABLE csr_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  annual_budget   NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (annual_budget >= 0),
  budget_utilized NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (budget_utilized >= 0),

  CONSTRAINT uq_csr_categories_name UNIQUE (name)
);

-- ============================================================================
-- 4. COMMUNITY_NEEDS — bottom-up need submission (BRD 6.2)
-- ============================================================================
CREATE TABLE community_needs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(200) NOT NULL,
  description        TEXT NOT NULL,
  category_id        UUID NOT NULL,
  location           VARCHAR(150) NOT NULL,
  beneficiary_group  VARCHAR(150),
  contact_person     VARCHAR(150),
  est_beneficiaries  INTEGER NOT NULL DEFAULT 0 CHECK (est_beneficiaries >= 0),
  est_budget         NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (est_budget >= 0),
  urgency            urgency_enum NOT NULL DEFAULT 'MEDIUM',
  submitted_by       UUID,                    -- references employees(id); nullable for external submitters
  submitted_by_label VARCHAR(150),             -- free-text fallback (e.g. "Panchayat President Office")
  status             need_status_enum NOT NULL DEFAULT 'SUBMITTED',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_needs_category     FOREIGN KEY (category_id)  REFERENCES csr_categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_needs_submitted_by FOREIGN KEY (submitted_by) REFERENCES employees (id)      ON DELETE SET NULL
);

CREATE INDEX idx_needs_category ON community_needs (category_id);
CREATE INDEX idx_needs_status   ON community_needs (status);
CREATE INDEX idx_needs_urgency  ON community_needs (urgency);
CREATE TRIGGER trg_needs_updated_at
  BEFORE UPDATE ON community_needs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 5. CSR_PROPOSALS — need converted into a formal proposal (BRD 6.3)
-- ============================================================================
CREATE TABLE csr_proposals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   VARCHAR(200) NOT NULL,
  need_id                 UUID,                 -- nullable: proposals can also originate without a logged need
  category_id             UUID NOT NULL,
  objective               TEXT NOT NULL,
  proposed_solution       TEXT,
  event_type              VARCHAR(100) NOT NULL,
  location                VARCHAR(150) NOT NULL,
  planned_date            DATE,
  expected_volunteers     INTEGER NOT NULL DEFAULT 0 CHECK (expected_volunteers >= 0),
  expected_beneficiaries  INTEGER NOT NULL DEFAULT 0 CHECK (expected_beneficiaries >= 0),
  estimated_budget        NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (estimated_budget >= 0),
  coordinator_id          UUID,
  status                  VARCHAR(50) NOT NULL DEFAULT 'Draft',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_proposals_need      UNIQUE (need_id),
  CONSTRAINT fk_proposals_need      FOREIGN KEY (need_id)        REFERENCES community_needs (id) ON DELETE SET NULL,
  CONSTRAINT fk_proposals_category  FOREIGN KEY (category_id)    REFERENCES csr_categories (id)   ON DELETE RESTRICT,
  CONSTRAINT fk_proposals_coord     FOREIGN KEY (coordinator_id) REFERENCES employees (id)        ON DELETE SET NULL
);

CREATE INDEX idx_proposals_category ON csr_proposals (category_id);

-- ============================================================================
-- 6. CSR_EVENTS — the live activity record (BRD 6.3, 6.4, 6.5)
-- ============================================================================
CREATE TABLE csr_events (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id              UUID,
  title                    VARCHAR(200) NOT NULL,
  category_id              UUID NOT NULL,
  objective                TEXT,
  location                 VARCHAR(150) NOT NULL,
  event_date               DATE NOT NULL,
  event_time               VARCHAR(50),
  status                   event_status_enum NOT NULL DEFAULT 'DRAFT',
  volunteers_needed        INTEGER NOT NULL DEFAULT 0 CHECK (volunteers_needed >= 0),
  expected_beneficiaries   INTEGER NOT NULL DEFAULT 0 CHECK (expected_beneficiaries >= 0),
  actual_beneficiaries     INTEGER NOT NULL DEFAULT 0 CHECK (actual_beneficiaries >= 0),
  coordinator_id           UUID NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_events_proposal     UNIQUE (proposal_id),
  CONSTRAINT fk_events_proposal     FOREIGN KEY (proposal_id)    REFERENCES csr_proposals (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_category     FOREIGN KEY (category_id)    REFERENCES csr_categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_events_coordinator  FOREIGN KEY (coordinator_id) REFERENCES employees (id)      ON DELETE RESTRICT
);

CREATE INDEX idx_events_category    ON csr_events (category_id);
CREATE INDEX idx_events_coordinator ON csr_events (coordinator_id);
CREATE INDEX idx_events_status      ON csr_events (status);
CREATE INDEX idx_events_date        ON csr_events (event_date);
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON csr_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 7. EVENT_VOLUNTEER_REGISTRATIONS — who applied to which event (BRD 6.4)
-- ============================================================================
CREATE TABLE event_volunteer_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL,
  volunteer_id  UUID NOT NULL,            -- references volunteer_profiles(id)
  role          VARCHAR(100),
  status        registration_status_enum NOT NULL DEFAULT 'APPLIED',
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_event_volunteer        UNIQUE (event_id, volunteer_id),
  CONSTRAINT fk_registrations_event     FOREIGN KEY (event_id)     REFERENCES csr_events (id)          ON DELETE CASCADE,
  CONSTRAINT fk_registrations_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteer_profiles (id)  ON DELETE CASCADE
);

CREATE INDEX idx_registrations_event     ON event_volunteer_registrations (event_id);
CREATE INDEX idx_registrations_volunteer ON event_volunteer_registrations (volunteer_id);
CREATE INDEX idx_registrations_status    ON event_volunteer_registrations (status);

-- ============================================================================
-- 8. VOLUNTEER_ATTENDANCE — check-in/out + hours logged (BRD 6.5)
-- ============================================================================
CREATE TABLE volunteer_attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL,
  employee_id   UUID,                     -- nullable: allows logging a walk-in not yet in employee master
  display_name  VARCHAR(150) NOT NULL,    -- denormalized for fast read / non-system attendees
  check_in      TIMESTAMPTZ,
  check_out     TIMESTAMPTZ,
  hours         NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (hours >= 0),
  status        attendance_status_enum NOT NULL DEFAULT 'Present',
  remarks       TEXT,

  CONSTRAINT fk_attendance_event    FOREIGN KEY (event_id)    REFERENCES csr_events (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees (id)  ON DELETE SET NULL
);

CREATE INDEX idx_attendance_event    ON volunteer_attendance (event_id);
CREATE INDEX idx_attendance_employee ON volunteer_attendance (employee_id);

-- ============================================================================
-- 9. BUDGET_REQUESTS — allocation requests against a category/event (BRD 6.7)
-- ============================================================================
CREATE TABLE budget_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID,
  category_id       UUID NOT NULL,
  requested_amount  NUMERIC(14,2) NOT NULL CHECK (requested_amount > 0),
  expense_head      VARCHAR(150),
  justification     TEXT,
  requested_by      UUID NOT NULL,
  status            budget_status_enum NOT NULL DEFAULT 'SUBMITTED',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_budget_requests_event    FOREIGN KEY (event_id)     REFERENCES csr_events (id)     ON DELETE SET NULL,
  CONSTRAINT fk_budget_requests_category FOREIGN KEY (category_id)  REFERENCES csr_categories (id)  ON DELETE RESTRICT,
  CONSTRAINT fk_budget_requests_employee FOREIGN KEY (requested_by) REFERENCES employees (id)       ON DELETE RESTRICT
);

CREATE INDEX idx_budget_requests_event    ON budget_requests (event_id);
CREATE INDEX idx_budget_requests_category ON budget_requests (category_id);
CREATE INDEX idx_budget_requests_status   ON budget_requests (status);
CREATE TRIGGER trg_budget_requests_updated_at
  BEFORE UPDATE ON budget_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 10. BUDGET_UTILIZATIONS — actual spend lines against an approved request
-- ============================================================================
CREATE TABLE budget_utilizations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id         UUID NOT NULL,
  amount_spent       NUMERIC(14,2) NOT NULL CHECK (amount_spent > 0),
  expense_line_item  VARCHAR(150),
  expense_date       DATE,
  vendor_name        VARCHAR(150),
  invoice_number     VARCHAR(100),
  payment_status     payment_status_enum NOT NULL DEFAULT 'Pending',
  remarks            TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_utilizations_request FOREIGN KEY (request_id) REFERENCES budget_requests (id) ON DELETE CASCADE
);

CREATE INDEX idx_utilizations_request ON budget_utilizations (request_id);

-- ============================================================================
-- 11. EVENT_COMPLETION_REPORTS — closure record (BRD 6.9)
-- ============================================================================
CREATE TABLE event_completion_reports (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                 UUID NOT NULL,
  actual_volunteer_count   INTEGER NOT NULL DEFAULT 0 CHECK (actual_volunteer_count >= 0),
  actual_beneficiary_count INTEGER NOT NULL DEFAULT 0 CHECK (actual_beneficiary_count >= 0),
  volunteer_hours          NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (volunteer_hours >= 0),
  outcome                  TEXT,
  challenges               TEXT,
  lessons_learned          TEXT,
  budget_utilized          NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (budget_utilized >= 0),
  status                   VARCHAR(50) NOT NULL DEFAULT 'Submitted',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_completion_event   UNIQUE (event_id),
  CONSTRAINT fk_completion_event   FOREIGN KEY (event_id) REFERENCES csr_events (id) ON DELETE CASCADE
);

-- ============================================================================
-- 12. RECOGNITION_AWARDS — badges / volunteer-of-the-month (BRD 6.10)
-- ============================================================================
CREATE TABLE recognition_awards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL,
  award_type   VARCHAR(100) NOT NULL,     -- e.g. 'Badge: 4 Events', 'CSR Champion', 'Volunteer of the Month'
  criteria     TEXT,
  awarded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_awards_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_awards_employee ON recognition_awards (employee_id);

-- ============================================================================
-- 13. APPROVAL_HISTORY — full audit trail for every workflow decision (BRD 6.8)
-- ============================================================================
CREATE TABLE approval_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type      VARCHAR(50) NOT NULL,   -- 'CommunityNeed' | 'CSRProposal' | 'BudgetRequest' | 'EventCompletionReport'
  entity_id        UUID NOT NULL,
  approver_id      UUID NOT NULL,
  action           VARCHAR(50) NOT NULL,   -- 'Approve' | 'Reject' | 'ReturnForCorrection' | 'RequestInfo'
  previous_status  VARCHAR(50),
  new_status       VARCHAR(50),
  comments         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_approval_history_approver FOREIGN KEY (approver_id) REFERENCES employees (id) ON DELETE RESTRICT
);

CREATE INDEX idx_approval_history_entity   ON approval_history (entity_type, entity_id);
CREATE INDEX idx_approval_history_approver ON approval_history (approver_id);

-- ============================================================================
-- 14. DOCUMENT_ATTACHMENTS — photos / bills / supporting docs (BRD 6.6, 6.9)
-- ============================================================================
CREATE TABLE document_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name     VARCHAR(255) NOT NULL,
  file_url      VARCHAR(500) NOT NULL,     -- cloud storage URL (Azure Blob / S3)
  uploaded_by   UUID,
  need_id       UUID,
  event_id      UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_attachments_uploader FOREIGN KEY (uploaded_by) REFERENCES employees (id)      ON DELETE SET NULL,
  CONSTRAINT fk_attachments_need     FOREIGN KEY (need_id)     REFERENCES community_needs (id) ON DELETE CASCADE,
  CONSTRAINT fk_attachments_event    FOREIGN KEY (event_id)    REFERENCES csr_events (id)       ON DELETE CASCADE,
  CONSTRAINT chk_attachments_one_parent CHECK (
    (need_id IS NOT NULL AND event_id IS NULL) OR
    (need_id IS NULL AND event_id IS NOT NULL)
  )
);

CREATE INDEX idx_attachments_need  ON document_attachments (need_id);
CREATE INDEX idx_attachments_event ON document_attachments (event_id);

-- ============================================================================
-- 15. NOTIFICATIONS — in-app notification feed (BRD 6.11)
-- ============================================================================
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  UUID NOT NULL,
  text          VARCHAR(500) NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient ON notifications (recipient_id);
CREATE INDEX idx_notifications_unread    ON notifications (recipient_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- 16. AUDIT_LOGS — system-wide action log, for DPDP / security review
-- ============================================================================
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID NOT NULL,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES employees (id) ON DELETE RESTRICT
);

CREATE INDEX idx_audit_logs_actor  ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
