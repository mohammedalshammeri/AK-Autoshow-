require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createFreshAdminUser() {
  console.log('🚀 Creating fresh admin user...');
  
  try {
    // Delete existing user
    console.log('🗑️ Deleting existing user...');
    await supabase
      .from('admin_users')
      .delete()
      .eq('email', 'admin@carshowx.app');
    
    // Create new password hash
    const password = 'CarShowX@2025!';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 Password hashed');
    
    // Create new user
    console.log('👤 Creating new user...');
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@carshowx.app',
        password_hash: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'super_admin',
        permissions: { all: true },
        is_active: true,
        login_count: 0
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('👤 ID:', data.id);
    
    // Test password immediately
    console.log('🧪 Testing password...');
    const isValid = await bcrypt.compare(password, data.password_hash);
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createFreshAdminUser();
