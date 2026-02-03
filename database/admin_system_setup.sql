-- ================================================
-- CarShowX Admin System Database Setup
-- Created: November 17, 2025
-- Purpose: Complete user management and permissions system
-- ================================================

-- 1. Admin Users Table
-- =====================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
    permissions JSONB DEFAULT '{}',
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 2. Admin Sessions Table
-- =======================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(512) UNIQUE NOT NULL,
    refresh_token VARCHAR(512) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin Activity Log
-- =====================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Role Permissions Template
-- ============================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(50),
    actions TEXT[] DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission, resource)
);

-- 5. Password Reset Tokens
-- ========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Admin Users Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users(created_at);

-- Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);

-- Activity Log Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON admin_activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON admin_activity_log(created_at);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
DROP POLICY IF EXISTS "Admin users can view based on role" ON admin_users;
CREATE POLICY "Admin users can view based on role" ON admin_users
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT id::text FROM admin_users 
            WHERE is_active = true AND role IN ('super_admin', 'admin')
        )
    );

DROP POLICY IF EXISTS "Super admins can manage all users" ON admin_users;
CREATE POLICY "Super admins can manage all users" ON admin_users
    FOR ALL USING (
        auth.uid()::text IN (
            SELECT id::text FROM admin_users 
            WHERE is_active = true AND role = 'super_admin'
        )
    );

-- Sessions Policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON admin_sessions;
CREATE POLICY "Users can manage own sessions" ON admin_sessions
    FOR ALL USING (user_id = auth.uid());

-- Activity Log Policies
DROP POLICY IF EXISTS "Admin users can view activity log" ON admin_activity_log;
CREATE POLICY "Admin users can view activity log" ON admin_activity_log
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT id::text FROM admin_users 
            WHERE is_active = true AND role IN ('super_admin', 'admin')
        )
    );

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for admin_users updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log INSERT operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO admin_activity_log (
            user_id, action, resource_type, resource_id, 
            new_values, details
        ) VALUES (
            COALESCE(auth.uid(), NEW.created_by),
            'create',
            TG_TABLE_NAME,
            NEW.id::text,
            to_jsonb(NEW),
            jsonb_build_object('operation', 'INSERT', 'table', TG_TABLE_NAME)
        );
        RETURN NEW;
    END IF;
    
    -- Log UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO admin_activity_log (
            user_id, action, resource_type, resource_id, 
            old_values, new_values, details
        ) VALUES (
            auth.uid(),
            'update',
            TG_TABLE_NAME,
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object('operation', 'UPDATE', 'table', TG_TABLE_NAME)
        );
        RETURN NEW;
    END IF;
    
    -- Log DELETE operations
    IF TG_OP = 'DELETE' THEN
        INSERT INTO admin_activity_log (
            user_id, action, resource_type, resource_id, 
            old_values, details
        ) VALUES (
            auth.uid(),
            'delete',
            TG_TABLE_NAME,
            OLD.id::text,
            to_jsonb(OLD),
            jsonb_build_object('operation', 'DELETE', 'table', TG_TABLE_NAME)
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- DEFAULT PERMISSIONS SETUP
-- ================================================

-- Insert default role permissions
INSERT INTO role_permissions (role, permission, resource, actions) VALUES
-- Super Admin (Full Access)
('super_admin', 'full_access', '*', ARRAY['create', 'read', 'update', 'delete']),

-- Admin (High Access)
('admin', 'manage_registrations', 'registrations', ARRAY['create', 'read', 'update', 'delete']),
('admin', 'manage_events', 'events', ARRAY['create', 'read', 'update', 'delete']),
('admin', 'view_users', 'admin_users', ARRAY['read']),
('admin', 'view_activity', 'admin_activity_log', ARRAY['read']),

-- Moderator (Medium Access)
('moderator', 'manage_registrations', 'registrations', ARRAY['read', 'update']),
('moderator', 'view_events', 'events', ARRAY['read']),

-- Viewer (Read Only)
('viewer', 'view_registrations', 'registrations', ARRAY['read']),
('viewer', 'view_events', 'events', ARRAY['read'])

ON CONFLICT (role, permission, resource) DO NOTHING;

-- ================================================
-- CREATE FIRST SUPER ADMIN USER
-- ================================================

-- Note: Password will be hashed in the application
-- Default password: "CarShowX@2025!" (will be changed on first login)

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
    '$2a$12$dummy.hash.will.be.replaced.by.application', -- Placeholder
    'System Administrator',
    'super_admin',
    true,
    true,
    jsonb_build_object(
        'can_manage_users', true,
        'can_view_system_logs', true,
        'can_change_settings', true,
        'full_access', true
    )
) ON CONFLICT (email) DO NOTHING;

-- ================================================
-- GRANTS AND PERMISSIONS
-- ================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_sessions TO authenticated;
GRANT ALL ON admin_activity_log TO authenticated;
GRANT ALL ON role_permissions TO authenticated;
GRANT ALL ON password_reset_tokens TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================
-- CLEANUP OLD SESSIONS FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Delete expired sessions
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    -- Delete old activity logs (keep last 90 days)
    DELETE FROM admin_activity_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete used password reset tokens
    DELETE FROM password_reset_tokens 
    WHERE used_at IS NOT NULL OR expires_at < NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '✅ CarShowX Admin System Database Setup Completed Successfully!';
    RAISE NOTICE '📊 Tables Created: admin_users, admin_sessions, admin_activity_log, role_permissions, password_reset_tokens';
    RAISE NOTICE '🔐 Security: RLS enabled, policies created, proper indexes added';
    RAISE NOTICE '👤 Default Super Admin: admin@carshowx.app (password needs to be set)';
    RAISE NOTICE '🚀 Ready for application integration!';
END $$;
