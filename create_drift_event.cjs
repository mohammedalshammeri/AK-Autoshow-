// إنشاء فعالية Drift للاختبار
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createDriftEvent() {
  try {
    console.log('🏁 Creating J2drift Test Event...');
    
    const result = await pool.query(`
      INSERT INTO events (
        name, 
        name_ar,
        name_en,
        description,
        description_ar,
        description_en,
        event_date,
        location,
        location_ar,
        location_en,
        event_type,
        status,
        max_participants,
        settings
      ) VALUES (
        'J2drift Championship 2026',
        'بطولة J2drift للدريفت 2026',
        'J2drift Championship 2026',
        'Professional drift championship with multiple rounds',
        'بطولة دريفت احترافية متعددة الجولات في حلبة البحرين الدولية',
        'Professional drift championship with multiple rounds',
        '2026-03-20',
        'Bahrain International Circuit',
        'حلبة البحرين الدولية - الصخير',
        'Bahrain International Circuit',
        'drift',
        'upcoming',
        50,
        '{
          "requires_cpr": true,
          "allow_passengers": true,
          "show_car_category": true
        }'::jsonb
      )
      RETURNING id, name, event_type
    `);

    const event = result.rows[0];
    console.log('✅ Drift Event Created!');
    console.log('📋 Event ID:', event.id);
    console.log('🏷️  Name:', event.name);
    console.log('🎯 Type:', event.event_type);
    console.log('');
    console.log('🔗 Registration URL:');
    console.log(`   http://localhost:3000/ar/e/${event.id}`);
    console.log('');
    console.log('💡 This event will:');
    console.log('   ✓ Show J2drift logo');
    console.log('   ✓ Display detailed 8-point terms');
    console.log('   ✓ Generate BN-DATE-RW2-XXXX registration numbers');
    console.log('   ✓ Send drift-themed email/WhatsApp');
    console.log('   ✓ Generate QR codes');

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

createDriftEvent();
