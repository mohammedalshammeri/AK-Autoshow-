-- CarShowX Admin System - Test Setup
-- Create first admin user for testing

-- First, let's create a test super admin user with a known password
-- Password: "CarShowX@2025!" (will be hashed)

-- Hash for password "CarShowX@2025!" using BCrypt with 12 rounds
-- This will be replaced with proper hashing in the application
INSERT INTO admin_users (
    email, 
    password_hash, 
    full_name, 
    role,
    is_active,
    email_verified,
    permissions
) VALUES (
    'admin@carshowx.app',
    '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdtB5F6ZzBjKjCx9/rJK.8J8uGd8gE.a2', -- CarShowX@2025!
    'System Administrator',
    'super_admin',
    true,
    true,
    jsonb_build_object(
        'full_access', true,
        'can_manage_users', true,
        'can_manage_registrations', true,
        'can_manage_events', true,
        'can_view_system_logs', true,
        'can_change_settings', true
    )
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    permissions = EXCLUDED.permissions;

-- Create a test admin user
INSERT INTO admin_users (
    email, 
    password_hash, 
    full_name, 
    role,
    is_active,
    email_verified,
    permissions
) VALUES (
    'test@carshowx.app',
    '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdtB5F6ZzBjKjCx9/rJK.8J8uGd8gE.a2', -- CarShowX@2025!
    'Test Administrator',
    'admin',
    true,
    true,
    jsonb_build_object(
        'can_manage_registrations', true,
        'can_manage_events', true,
        'can_view_users', true,
        'can_view_activity_logs', true
    )
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    permissions = EXCLUDED.permissions;

-- Create a test moderator user
INSERT INTO admin_users (
    email, 
    password_hash, 
    full_name, 
    role,
    is_active,
    email_verified,
    permissions
) VALUES (
    'moderator@carshowx.app',
    '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdtB5F6ZzBjKjCx9/rJK.8J8uGd8gE.a2', -- CarShowX@2025!
    'Test Moderator',
    'moderator',
    true,
    true,
    jsonb_build_object(
        'can_view_registrations', true,
        'can_update_registrations', true,
        'can_view_events', true
    )
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    permissions = EXCLUDED.permissions;

-- Show created users
SELECT 
    email, 
    full_name, 
    role, 
    is_active, 
    created_at
FROM admin_users 
WHERE email IN ('admin@carshowx.app', 'test@carshowx.app', 'moderator@carshowx.app')
ORDER BY role;
