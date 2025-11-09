-- Supabase schema for Agendou
-- Run this in the Supabase SQL editor (Project -> SQL)

-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  user_type text NOT NULL DEFAULT 'client' CHECK (user_type IN ('client','clinic','admin')),
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Clinics (one-to-one with users when user_type = 'clinic')
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address jsonb,
  phone text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Specializations (catalog)
CREATE TABLE IF NOT EXISTS specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Junction table clinics <-> specializations (N:N)
CREATE TABLE IF NOT EXISTS clinic_specializations (
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialization_id uuid NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, specialization_id)
);

-- Availabilities (clinic scheduling)
CREATE TABLE IF NOT EXISTS availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  work_days text[], -- e.g. ['mon','tue','wed']
  start_time time NOT NULL,
  end_time time NOT NULL,
  appointment_duration integer NOT NULL DEFAULT 30, -- minutes
  created_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text,
  date timestamptz NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinics_user_id ON clinics(user_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Sample data for specializations
INSERT INTO specializations (name) VALUES
  ('Cardiology'),
  ('Dermatology'),
  ('Dentistry'),
  ('Psychology')
ON CONFLICT (name) DO NOTHING;

-- Notes:
-- 1) Execute this file in the Supabase SQL editor (SQL -> New Query) with a service_role key session.
-- 2) If you prefer a different data shape (e.g. multiple availabilities per clinic), we can adjust availabilities table.
-- 3) After running, you can inspect tables in the Supabase Table editor and test queries from the backend.
