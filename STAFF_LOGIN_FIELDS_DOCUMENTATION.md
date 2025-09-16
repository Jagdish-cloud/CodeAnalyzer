# Staff Login Fields Documentation

## Overview
This document describes the new login fields added to the `staff` table to enable comprehensive authentication and security features for staff members.

## New Fields Added

### 1. `username` (TEXT, UNIQUE)
- **Purpose**: Unique identifier for staff login
- **Constraints**: Must be unique across all staff members
- **Usage**: Primary field for staff authentication
- **Example**: "john.doe", "teacher001", "admin.smith"

### 2. `password` (TEXT)
- **Purpose**: Hashed password for authentication
- **Security**: Should be hashed using bcrypt or similar
- **Usage**: Stored securely, never stored in plain text
- **Example**: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."

### 3. `is_active` (BOOLEAN, DEFAULT: true)
- **Purpose**: Enable/disable staff login access
- **Usage**: 
  - `true`: Staff can log in
  - `false`: Staff login is disabled
- **Use Cases**: Temporary suspension, account deactivation

### 4. `last_login_at` (TIMESTAMP)
- **Purpose**: Track when staff last successfully logged in
- **Usage**: Security monitoring, audit trails
- **Format**: ISO 8601 timestamp
- **Example**: "2025-01-27T10:30:00Z"

### 5. `login_attempts` (INTEGER, DEFAULT: 0)
- **Purpose**: Count consecutive failed login attempts
- **Usage**: Security feature to prevent brute force attacks
- **Reset**: Reset to 0 on successful login
- **Threshold**: Typically lock account after 5 failed attempts

### 6. `locked_until` (TIMESTAMP)
- **Purpose**: Temporarily lock account after failed attempts
- **Usage**: Security measure to prevent brute force attacks
- **Format**: ISO 8601 timestamp
- **Example**: "2025-01-27T11:00:00Z" (account locked until this time)

### 7. `password_changed_at` (TIMESTAMP)
- **Purpose**: Track when password was last changed
- **Usage**: Password expiration policies, security audits
- **Format**: ISO 8601 timestamp
- **Example**: "2025-01-20T14:15:00Z"

### 8. `two_factor_enabled` (BOOLEAN, DEFAULT: false)
- **Purpose**: Enable/disable two-factor authentication
- **Usage**: Additional security layer
- **Values**: 
  - `true`: 2FA is enabled for this staff member
  - `false`: 2FA is disabled

### 9. `two_factor_secret` (TEXT)
- **Purpose**: Secret key for two-factor authentication
- **Usage**: Generate TOTP codes for 2FA
- **Security**: Should be encrypted when stored
- **Example**: "JBSWY3DPEHPK3PXP"

## Database Indexes Created

1. **`idx_staff_username`**: Index on `username` for fast login lookups
2. **`idx_staff_email`**: Index on `email` for password reset functionality
3. **`idx_staff_is_active`**: Index on `is_active` for filtering active staff

## Security Features

### Account Lockout
- After 5 failed login attempts, account is locked for 30 minutes
- `login_attempts` tracks failed attempts
- `locked_until` stores lockout expiration time

### Password Security
- Passwords must be hashed using bcrypt (minimum 10 rounds)
- `password_changed_at` tracks password changes
- Consider implementing password expiration policies

### Two-Factor Authentication
- Optional 2FA using TOTP (Time-based One-Time Password)
- `two_factor_enabled` controls 2FA status
- `two_factor_secret` stores the secret key

## Usage Examples

### Creating a New Staff Member with Login
```sql
INSERT INTO staff (
  name, staff_id, role, mobile_number, email, status,
  username, password, is_active
) VALUES (
  'John Doe', 'EMP001', 'Teacher', '9876543210', 'john@school.com', 'Active',
  'john.doe', '$2b$10$hashedpassword', true
);
```

### Updating Login Attempts
```sql
-- Increment failed attempts
UPDATE staff 
SET login_attempts = login_attempts + 1 
WHERE username = 'john.doe';

-- Lock account after 5 attempts
UPDATE staff 
SET locked_until = NOW() + INTERVAL '30 minutes'
WHERE username = 'john.doe' AND login_attempts >= 5;
```

### Successful Login
```sql
-- Reset attempts and update last login
UPDATE staff 
SET login_attempts = 0, 
    last_login_at = NOW(),
    locked_until = NULL
WHERE username = 'john.doe';
```

## Migration Notes

- The migration file `0003_add_staff_login_fields.sql` adds all new columns
- Existing staff records will have `is_active = true` by default
- Username and password fields are nullable to allow gradual migration
- All new fields have appropriate default values

## Best Practices

1. **Password Hashing**: Always use bcrypt with at least 10 rounds
2. **Username Generation**: Use consistent naming convention (e.g., firstname.lastname)
3. **Account Lockout**: Implement progressive lockout (5 attempts = 30 min, 10 attempts = 2 hours)
4. **Audit Logging**: Log all login attempts and password changes
5. **Password Policy**: Enforce strong password requirements
6. **2FA Setup**: Provide clear instructions for 2FA setup

## Integration with Application

The new fields integrate with the existing staff management system and provide:
- Secure authentication for staff portal
- Role-based access control
- Security monitoring and audit trails
- Password management features
- Two-factor authentication support
