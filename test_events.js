import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEvents() {
  console.log('🔍 Testing events...');
  
  try {
    // Get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('id, name, status')
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching events:', error.message);
      return;
    }

    console.log('✅ Events found:');
    events?.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.name} - Status: ${event.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEvents();
