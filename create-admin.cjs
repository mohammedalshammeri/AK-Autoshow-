// Quick admin user creation
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('🔑 Service Key:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickCreateAdmin() {
  console.log('🚀 Creating admin user...');

  try {
    // Check if tables exist first
    console.log('📋 Checking if admin_users table exists...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      console.log('💡 You may need to run the database setup first.');
      return;
    }
    
    console.log('✅ admin_users table exists');

    // Check existing user
    console.log('👤 Checking for existing admin user...');
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (existing) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existing.email);
      console.log('🎯 Role:', existing.role);
      console.log('🔄 Active:', existing.is_active ? 'Yes' : 'No');
      console.log('');
      console.log('🔑 Login Credentials:');
      console.log('   Email: admin@carshowx.app');
      console.log('   Password: CarShowX@2025!');
      return;
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
    console.log('✅ Password hashed');

    console.log('👤 Creating admin user...');
    // Create user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@carshowx.app',
        password_hash: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'super_admin',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          cars: ['create', 'read', 'update', 'delete'],
          events: ['create', 'read', 'update', 'delete'],
          content: ['create', 'read', 'update', 'delete'],
          settings: ['create', 'read', 'update', 'delete'],
          system: ['create', 'read', 'update', 'delete']
        },
        is_active: true,
        login_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }

    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('👤 ID:', data.id);
    console.log('🎯 Role:', data.role);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Go to http://localhost:3000/admin/login');
    console.log('2. Use the credentials above');
    console.log('3. You will have full admin access!');

    // Log the activity
    const { error: logError } = await supabase
      .from('admin_activity_log')
      .insert({
        user_id: data.id,
        action: 'user_created',
        entity_type: 'admin_users',
        entity_id: data.id,
        details: {
          email: 'admin@carshowx.app',
          role: 'super_admin',
          created_by: 'quick_script'
        },
        status: 'success'
      });

    if (logError) {
      console.warn('⚠️  Failed to log activity:', logError.message);
    } else {
      console.log('📝 Activity logged successfully');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

quickCreateAdmin();
