-- ===================================================
-- University Maintenance Request System - Database Schema
-- Compatible with PostgreSQL 14+, Docker, and DBeaver
-- ===================================================

-- 1. Create Database (Run if not created)
-- CREATE DATABASE university_maintenance;

-- 2. Drop table if exists (Optional / Reset)
-- DROP TABLE IF EXISTS tickets;

-- 3. Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(50) PRIMARY KEY,
    issue VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    contact_name VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    assigned_to_name VARCHAR(100) DEFAULT 'Unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 5. Insert Sample Data
INSERT INTO tickets (id, issue, description, category, location, priority, status, contact_name, contact_phone, contact_email, assigned_to_name)
VALUES
('REQ-1045', 'Main water pipe leak in basement', 'Flooding water detected near main valves.', 'Plumbing', 'Science Hall B1', 'Urgent', 'Open', 'Supakorn', '081-234-5678', 'supakorn@university.ac.th', 'Dave M. (Plumber)'),
('REQ-1044', 'Power surge in computer laboratory', 'Monitors turned off suddenly, breaker tripped.', 'Electrical', 'Engineering Bldg, Rm 204', 'Urgent', 'Open', 'Dr. Jane Smith', '089-987-6543', 'jane@university.ac.th', 'Kittisak P. (Electrician)'),
('REQ-1042', 'Leaking AC unit', 'Air conditioner dripping water onto study desks.', 'HVAC', 'Engineering Bldg, Room 302', 'High', 'Pending', 'Supakorn', '081-234-5678', 'supakorn@university.ac.th', 'Somchai R. (HVAC)'),
('REQ-1041', 'Projector mount broken', 'HDMI connection loose and projector dangling.', 'AV/IT', 'Business Annex 101', 'Medium', 'In Progress', 'Prof. Anderson', '082-111-2233', 'anderson@university.ac.th', 'Anan T. (AV Tech)'),
('REQ-1038', 'Clogged sink', 'Restroom sink drained very slowly.', 'Plumbing', 'Dormitory A, Rm 412', 'Low', 'Completed', 'Supakorn', '081-234-5678', 'supakorn@university.ac.th', 'Dave M. (Plumber)')
ON CONFLICT (id) DO NOTHING;
