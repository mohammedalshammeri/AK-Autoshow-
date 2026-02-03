require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

console.log('🚀 Creating admin user...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (existing) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existing.email);
      console.log('🔑 Use password: CarShowX@2025!');
      return;
    }

    // Create new admin user
    const password = 'CarShowX@2025!';
    const hashedPassword = await bcrypt.hash(password, 12);

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

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('👤 ID:', data.id);

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createAdmin();
