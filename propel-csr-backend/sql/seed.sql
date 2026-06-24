-- ============================================================================
-- Propel CSR Activity Management — Seed Data
-- Run after schema.sql: psql -d propel_csr -f sql/seed.sql
-- ============================================================================

-- CSR Categories (BRD Section 5)
INSERT INTO csr_categories (name, annual_budget, budget_utilized) VALUES
  ('Education',                          1000000, 350000),
  ('Health and Hygiene',                  800000, 200000),
  ('Environment and Sustainability',      500000, 125000),
  ('Sports Development',                  300000,  91400),
  ('Skill Development and Employment',    400000,  58500),
  ('Community Development',               350000,      0),
  ('Disaster Relief / Emergency Support',       0,      0),
  ('Women Empowerment',                         0,      0),
  ('Child Welfare',                             0,      0),
  ('Rural Development',                         0,      0),
  ('Infrastructure Support',                    0,      0),
  ('Other',                                     0,      0);

-- Employees (a small sample set — mirrors the prototype's Employee Master)
INSERT INTO employees (emp_id, name, mobile, email, department, location, designation, reporting_manager, role) VALUES
  ('PI-01007', 'Ganesan',        '+91 98xxxxxx21', 'ganesan@propelind.com',       'IT',            'Coimbatore', 'Head of IT (CIO)',   'Managing Director', 'MANAGEMENT'),
  ('PI-02114', 'Tharunya K',     '+91 98xxxxxx33', 'tharunya.k@propelind.com',    'IT Helpdesk',   'Coimbatore', 'Helpdesk Executive',  'Ganesan',           'VOLUNTEER'),
  ('PI-02098', 'Mani Kandan V',  '+91 98xxxxxx44', 'manikandan.v@propelind.com',  'Infrastructure','Coimbatore', 'Infra Lead',          'Ganesan',           'VOLUNTEER'),
  ('PI-01876', 'Vignesh S',      '+91 98xxxxxx55', 'vignesh.s@propelind.com',     'Production',    'Sulur',      'Shift Engineer',      'Production Head',  'VOLUNTEER'),
  ('PI-01654', 'Priya M',        '+91 98xxxxxx66', 'priya.m@propelind.com',       'Quality',       'Sulur',      'QA Engineer',         'Quality Head',     'VOLUNTEER'),
  ('PI-01290', 'Suresh Babu R',  '+91 98xxxxxx99', 'sureshbabu.r@propelind.com',  'Cybersecurity', 'Coimbatore', 'Cybersecurity Lead',  'Ganesan',           'COORDINATOR'),
  ('PI-00871', 'Lakshmi Narayanan', '+91 98xxxxxx10', 'lakshmi.n@propelind.com',  'CSR',           'Coimbatore', 'CSR Admin',           'Managing Director', 'CSR_ADMIN');

-- Volunteer opt-ins for a few employees
INSERT INTO volunteer_profiles (employee_id, preferred_categories, availability)
SELECT id, ARRAY['Education','Skill Development and Employment'], 'Weekends'
FROM employees WHERE emp_id = 'PI-01007';

INSERT INTO volunteer_profiles (employee_id, preferred_categories, availability)
SELECT id, ARRAY['Health and Hygiene'], 'Weekends'
FROM employees WHERE emp_id = 'PI-02114';

INSERT INTO volunteer_profiles (employee_id, preferred_categories, availability)
SELECT id, ARRAY['Environment and Sustainability'], 'Weekdays after 5pm'
FROM employees WHERE emp_id = 'PI-02098';

-- A sample community need
INSERT INTO community_needs (title, description, category_id, location, est_beneficiaries, urgency, submitted_by_label, status)
SELECT 'Damaged roof in Anganwadi centre, Veerapandi',
       'Roof has visible structural damage following recent rains, posing a safety risk to children.',
       id, 'Veerapandi', 45, 'HIGH', 'Field visit — CSR Team', 'SUBMITTED'
FROM csr_categories WHERE name = 'Community Development';

-- A sample event
INSERT INTO csr_events (title, category_id, objective, location, event_date, event_time, status, volunteers_needed, expected_beneficiaries, coordinator_id)
SELECT 'Govt. School Library Setup — Sulur',
       (SELECT id FROM csr_categories WHERE name = 'Education'),
       'Set up a functional library with 500 books, reading corner and shelving for students of Std 6-10.',
       'Govt. Higher Sec. School, Sulur', '2026-07-04', '9:00 AM - 1:00 PM',
       'REGISTRATION_OPEN', 15, 220,
       (SELECT id FROM employees WHERE emp_id = 'PI-00871');
