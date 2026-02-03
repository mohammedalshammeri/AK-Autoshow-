// Quick admin user creation
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickCreateAdmin() {
  console.log('🚀 Creating admin user...');

  try {
    // Check existing user
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (existing) {
      console.log('✅ Admin user already exists:', existing.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);

    // Create user
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

    console.log('✅ Admin user created!');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('👤 ID:', data.id);

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

quickCreateAdmin().catch(console.error);
