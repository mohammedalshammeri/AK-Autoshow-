require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking admin_users table schema...');
  
  try {
    // Try to get any user to see available columns
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      console.error('❌ Error:', error);
    } else if (data) {
      console.log('📋 Available columns:', Object.keys(data));
      console.log('👤 Sample user data:');
      console.log('   ID:', data.id);
      console.log('   Email:', data.email);
      console.log('   Role:', data.role);
      console.log('   Active:', data.is_active);
      console.log('   Created:', data.created_at);
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkSchema().catch(console.error);
