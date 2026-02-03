/**
 * Simple Database Setup for CarShowX Admin System
 * Sets up tables directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseServiceKey) {
  throw new Error('Environment variable SUPABASE_SERVICE_ROLE_KEY is not defined');
}
if (!supabaseUrl) {
  throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminTables() {
  console.log('🚀 Setting up CarShowX Admin System...\n');

  try {
    // 1. Create admin_users table
    console.log('📊 Creating admin_users table...');
    const { error: usersError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (usersError) console.log('Note: admin_users table may already exist');

    // 2. Create admin_sessions table
    console.log('📊 Creating admin_sessions table...');
    const { error: sessionsError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (sessionsError) console.log('Note: admin_sessions table may already exist');

    // 3. Create admin_activity_log table
    console.log('📊 Creating admin_activity_log table...');
    const { error: activityError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (activityError) console.log('Note: admin_activity_log table may already exist');

    // 4. Create test admin user
    console.log('👤 Creating test admin user...');
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
    
    const { error: insertError } = await supabase
      .from('admin_users')
      .upsert({
        email: 'admin@carshowx.app',
        password_hash: hashedPassword,
        full_name: 'System Administrator',
        role: 'super_admin',
        is_active: true,
        email_verified: true,
        permissions: {
          full_access: true,
          can_manage_users: true,
          can_manage_registrations: true,
          can_manage_events: true,
          can_view_system_logs: true,
          can_change_settings: true
        }
      }, {
        onConflict: 'email'
      });

    if (insertError) {
      console.error('❌ Failed to create admin user:', insertError);
    } else {
      console.log('✅ Admin user created successfully');
    }

    // 5. Verify setup
    console.log('\n🔍 Verifying database setup...');
    const { data: users, error: verifyError } = await supabase
      .from('admin_users')
      .select('email, full_name, role, is_active')
      .limit(5);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Database setup verified');
      console.log('👥 Admin users:');
      users?.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
      });
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: admin@carshowx.app');
    console.log('   Password: CarShowX@2025!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Export for use
export { setupAdminTables };

// Run if called directly
if (require.main === module) {
  setupAdminTables().catch(console.error);
}
