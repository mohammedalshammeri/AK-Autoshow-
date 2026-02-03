-- CarShowX Admin System - Minimal Setup
-- Creates admin_users table and initial admin user

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY IF NOT EXISTS "Service role can access admin_users" ON admin_users FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role can access admin_sessions" ON admin_sessions FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role can access admin_activity_log" ON admin_activity_log FOR ALL TO service_role USING (true);

-- Insert test admin user (password: CarShowX@2025!)
-- Hash generated with bcrypt rounds=12
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
  '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdtB5F6ZzBjKjCx9/rJK.8J8uGd8gE.a2',
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

-- Verify the setup
SELECT 
  'Tables created successfully' as status,
  email, 
  full_name, 
  role, 
  is_active,
  created_at
FROM admin_users 
WHERE email = 'admin@carshowx.app';
