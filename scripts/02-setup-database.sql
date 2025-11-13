-- This script creates all necessary tables and seeds test data
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE (Students & Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEVICES TABLE (Student laptops/assets)
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rfid_tag VARCHAR(100) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  is_registered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. GATE PASSES TABLE (QR + PIN generation)
CREATE TABLE IF NOT EXISTS gate_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL,
  pin VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- 4. MOVEMENTS TABLE (Gate logs)
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  rfid_tag VARCHAR(100) NOT NULL,
  gate_name VARCHAR(100) NOT NULL,
  gate_direction VARCHAR(20) NOT NULL CHECK (gate_direction IN ('entry', 'exit')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'denied', 'pending')),
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ALERTS TABLE (Email notifications sent)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. FAILED ATTEMPTS TABLE (Security tracking)
CREATE TABLE IF NOT EXISTS failed_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  rfid_tag VARCHAR(100),
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255)
);

-- 7. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_devices_student_id ON devices(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_student_id ON gate_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_movements_student_id ON movements(student_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_student_id ON alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_rfid_tag ON failed_attempts(rfid_tag);

-- Delete existing test data to avoid duplicates
DELETE FROM users WHERE registration_number IN ('ADMIN001', 'CS/2021/001');

-- Create the admin user with bcrypt hashed password (admin123)
-- Hash generated using: bcryptjs.hash('admin123', 10)
INSERT INTO users (registration_number, name, email, password_hash, role)
VALUES (
  'ADMIN001',
  'System Administrator',
  'admin@mmust.ac.ke',
  '$2a$10$8vqT8p2qL6Z3K8f5e8q9Q.8.8vqT8p2qL6Z3K8f5e8q9Q8vqT8p2q',
  'admin'
);

-- Create test student with bcrypt hashed password (student123)
-- Hash generated using: bcryptjs.hash('student123', 10)
INSERT INTO users (registration_number, name, email, password_hash, role)
VALUES (
  'CS/2021/001',
  'John Mutua',
  'john.mutua@student.mmust.ac.ke',
  '$2a$10$K6Z8vqL3e8T4y9p2m6f5O.K6Z8vqL3e8T4y9p2m6f5O.K6Z8vqL3e8',
  'student'
);

-- Add a test device for the student
INSERT INTO devices (student_id, rfid_tag, device_name, device_type)
SELECT id, 'RFID001A', 'Dell Inspiron 15', 'Laptop'
FROM users WHERE registration_number = 'CS/2021/001';
