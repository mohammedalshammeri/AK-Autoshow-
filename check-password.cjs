// Check admin password hash
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPassword() {
  console.log('🔍 Checking admin password...');

  try {
    // Get user
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (error || !user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('🔑 Password hash:', user.password_hash.substring(0, 20) + '...');

    // Test password
    const testPassword = 'CarShowX@2025!';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log('🧪 Testing password:', testPassword);
    console.log('🎯 Password match:', isValid ? '✅ YES' : '❌ NO');

    if (!isValid) {
      console.log('🔄 Updating password...');
      
      // Hash new password
      const newHash = await bcrypt.hash(testPassword, 12);
      
      // Update password
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: newHash })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Update failed:', updateError);
      } else {
        console.log('✅ Password updated successfully!');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkPassword();
