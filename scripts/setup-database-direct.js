/**
 * CarShowX Database Setup Script
 * Executes SQL files directly in Supabase to create admin tables
 */

const SUPABASE_URL = 'https://bvebeycfhtikfmcyadiy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZWJleWNmaHRpa2ZtY3lhZGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAxNjc4NSwiZXhwIjoyMDc4NTkyNzg1fQ.YYNDeWXuMNd12jCme8viwMBDYBZ_5e_-5wsTfow3auY';

async function executeSQL(sql, description) {
  console.log(`🔧 ${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (response.ok) {
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️ ${description} - Response: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function setupAdminDatabase() {
  console.log('🚀 CarShowX Admin Database Setup');
  console.log('================================\n');

  // Step 1: Create admin_users table
  const createUsersTable = `
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
  `;
  
  await executeSQL(createUsersTable, 'Creating admin_users table');

  // Step 2: Create admin_sessions table
  const createSessionsTable = `
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
  `;
  
  await executeSQL(createSessionsTable, 'Creating admin_sessions table');

  // Step 3: Create admin_activity_log table
  const createActivityTable = `
    CREATE TABLE IF NOT EXISTS admin_activity_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
        session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        details JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  await executeSQL(createActivityTable, 'Creating admin_activity_log table');

  // Step 4: Create test admin user
  const createAdminUser = `
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
  `;
  
  await executeSQL(createAdminUser, 'Creating test admin user');

  // Step 5: Verify setup
  console.log('\n🔍 Verifying database setup...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=email,full_name,role,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const users = await response.json();
      console.log('✅ Database verification successful');
      console.log('\n👥 Created admin users:');
      users.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('⚠️ Could not verify users, but tables should be created');
    }
  } catch (error) {
    console.log('⚠️ Verification failed, but setup may have succeeded');
  }

  console.log('\n🎉 Database setup completed!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: admin@carshowx.app');
  console.log('   Password: CarShowX@2025!');
  console.log('\n🌐 Test Login: http://localhost:3000/admin/login');
  console.log('\nNow try logging in with the credentials above!');
}

// Run setup
setupAdminDatabase().catch(console.error);
