require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersAndSessions() {
  console.log('🔍 Checking admin users and sessions...');
  
  // Check users
  const { data: users, error } = await supabase
    .from('admin_users')
    .select('id, email, first_name, last_name, role, is_active');
    
  if (error) {
    console.error('❌ Users error:', error);
  } else {
    console.log('👥 Found users:', users?.length || 0);
    users?.forEach(user => {
      console.log(`👤 ${user.email} - ID: ${user.id} - Active: ${user.is_active}`);
    });
  }
  
  // Check sessions
  console.log('\n🔍 Checking active sessions...');
  const { data: sessions, error: sessError } = await supabase
    .from('admin_sessions')
    .select('id, user_id, session_token, is_active, expires_at')
    .eq('is_active', true)
    .limit(10);
    
  if (sessError) {
    console.error('❌ Sessions error:', sessError);
  } else {
    console.log('📊 Active sessions:', sessions?.length || 0);
    sessions?.forEach((session, i) => {
      console.log(`🔑 Session ${i+1}: User ID: ${session.user_id} - Expires: ${session.expires_at}`);
      console.log(`   Token preview: ${session.session_token.substring(0, 30)}...`);
    });
  }
}

checkUsersAndSessions().catch(console.error);
