require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanOldSessions() {
  console.log('🧹 Cleaning old session tokens...');
  
  try {
    // Deactivate sessions with old token format (sess_xxx)
    const { data, error } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .like('session_token', 'sess_%')
      .select('id, session_token');
      
    if (error) {
      console.error('❌ Error cleaning sessions:', error);
    } else {
      console.log('✅ Cleaned sessions:', data?.length || 0);
      data?.forEach((session, i) => {
        console.log(`   ${i+1}. ${session.session_token.substring(0, 20)}...`);
      });
    }
    
    // Show remaining active sessions
    const { data: remaining, error: remError } = await supabase
      .from('admin_sessions')
      .select('id, user_id, session_token, expires_at')
      .eq('is_active', true);
      
    if (!remError) {
      console.log('\n📊 Remaining active sessions:', remaining?.length || 0);
      remaining?.forEach((session, i) => {
        const tokenType = session.session_token.startsWith('ey') ? 'JWT' : 'Old';
        console.log(`   ${i+1}. ${tokenType} - Expires: ${session.expires_at}`);
      });
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

cleanOldSessions().catch(console.error);
