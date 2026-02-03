/**
 * Create Admin User Script
 * Creates the admin user in the admin_users table
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dplzgbzqjpfruovdtgir.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log('🚀 Starting admin user creation...');

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.email);
      console.log('👤 User ID:', existingUser.id);
      console.log('🔑 Role:', existingUser.role);
      console.log('🎯 Status:', existingUser.is_active ? 'Active' : 'Inactive');
      return;
    }

    // Hash password
    const password = 'CarShowX@2025!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('🔐 Password hashed successfully');

    // Create admin user
    const adminUser = {
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
      created_by: null,
      last_login: null,
      login_count: 0
    };

    const { data, error } = await supabase
      .from('admin_users')
      .insert(adminUser)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('👤 User ID:', data.id);
    console.log('🎯 Role: super_admin');

    // Log the creation
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
          created_by: 'system_script'
        },
        status: 'success'
      });

    if (logError) {
      console.warn('⚠️  Failed to log user creation:', logError);
    } else {
      console.log('📝 User creation logged successfully');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('🎉 Script completed successfully');
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
