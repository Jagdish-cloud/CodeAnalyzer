-- Migration: Add login fields to staff table
-- Created: 2025-01-27
-- Description: Adds comprehensive login functionality fields to the staff table

-- Add login-related columns to staff table
ALTER TABLE staff 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN password TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN last_login_at TIMESTAMP,
ADD COLUMN login_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP,
ADD COLUMN password_changed_at TIMESTAMP,
ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN two_factor_secret TEXT;

-- Add comments for documentation
COMMENT ON COLUMN staff.username IS 'Unique username for staff login authentication';
COMMENT ON COLUMN staff.password IS 'Hashed password for staff authentication';
COMMENT ON COLUMN staff.is_active IS 'Flag to enable/disable staff login access';
COMMENT ON COLUMN staff.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN staff.login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN staff.locked_until IS 'Timestamp when account is locked due to failed attempts';
COMMENT ON COLUMN staff.password_changed_at IS 'Timestamp when password was last changed';
COMMENT ON COLUMN staff.two_factor_enabled IS 'Flag to enable/disable two-factor authentication';
COMMENT ON COLUMN staff.two_factor_secret IS 'Secret key for two-factor authentication';

-- Create index on username for faster login lookups
CREATE INDEX idx_staff_username ON staff(username);

-- Create index on email for password reset functionality
CREATE INDEX idx_staff_email ON staff(email);

-- Create index on is_active for filtering active staff
CREATE INDEX idx_staff_is_active ON staff(is_active);
