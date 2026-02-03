/**
 * Quick Database Setup Script
 * Creates admin tables and test user in Supabase
 */

import { supabaseAdmin } from '../src/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

async function setupAdminDatabase() {
  console.log('🚀 Setting up admin database tables...\n');

  try {
    // 1. Create admin_users table
    console.log('📊 Creating admin_users table...');
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

    const { error: usersError } = await supabaseAdmin.rpc('sql', { query: createUsersTable });
    if (usersError) console.log('Note: admin_users table may already exist');
    console.log('✅ admin_users table ready');

    // 2. Create admin_sessions table
    console.log('📊 Creating admin_sessions table...');
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

    const { error: sessionsError } = await supabaseAdmin.rpc('sql', { query: createSessionsTable });
    if (sessionsError) console.log('Note: admin_sessions table may already exist');
    console.log('✅ admin_sessions table ready');

    // 3. Create admin_activity_log table
    console.log('📊 Creating admin_activity_log table...');
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

    const { error: activityError } = await supabaseAdmin.rpc('sql', { query: createActivityTable });
    if (activityError) console.log('Note: admin_activity_log table may already exist');
    console.log('✅ admin_activity_log table ready');

    // 4. Create test admin user
    console.log('\n👤 Creating test admin user...');
    const password = 'CarShowX@2025!';
    const hashedPassword = await bcrypt.hash(password, 12);

    const { error: insertError } = await supabaseAdmin
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
      console.log('✅ Admin user created/updated successfully');
    }

    // 5. Create additional test users
    const testUsers = [
      {
        email: 'test@carshowx.app',
        full_name: 'Test Administrator',
        role: 'admin',
        permissions: {
          can_manage_registrations: true,
          can_manage_events: true,
          can_view_users: true,
          can_view_activity_logs: true
        }
      },
      {
        email: 'moderator@carshowx.app',
        full_name: 'Test Moderator',
        role: 'moderator',
        permissions: {
          can_view_registrations: true,
          can_update_registrations: true,
          can_view_events: true
        }
      }
    ];

    for (const userData of testUsers) {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .upsert({
          ...userData,
          password_hash: hashedPassword,
          is_active: true,
          email_verified: true
        }, {
          onConflict: 'email'
        });

      if (!error) {
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // 6. Verify setup
    console.log('\n🔍 Verifying database setup...');
    const { data: users, error: verifyError } = await supabaseAdmin
      .from('admin_users')
      .select('email, full_name, role, is_active')
      .order('role');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n👥 Created admin users:');
    users?.forEach(user => {
      console.log(`   • ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
    });

    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@carshowx.app');
    console.log('   Password: CarShowX@2025!');
    console.log('\n🌐 Admin Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    // Try alternative approach - direct table creation
    console.log('\n🔄 Trying alternative approach...');
    
    try {
      // Create tables using direct SQL execution
      const tables = [
        'admin_users',
        'admin_sessions', 
        'admin_activity_log'
      ];

      // Check if tables exist
      for (const tableName of tables) {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          console.log(`❌ Table '${tableName}' does not exist`);
        } else if (error) {
          console.log(`⚠️ Table '${tableName}' error:`, error.message);
        } else {
          console.log(`✅ Table '${tableName}' exists`);
        }
      }

      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run the SQL from database/admin_system_setup.sql');
      console.log('3. Run the SQL from database/create_test_users.sql');
      console.log('4. Then try logging in again');

    } catch (altError) {
      console.error('❌ Alternative approach also failed:', altError);
    }
  }
}

// Run setup
setupAdminDatabase().catch(console.error);
