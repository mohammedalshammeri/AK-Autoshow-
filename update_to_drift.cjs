// تحديث فعالية موجودة لتكون drift event
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateEventType() {
  try {
    // عرض جميع الفعاليات أولاً
    console.log('📋 Current Events:\n');
    const events = await pool.query(`
      SELECT id, name, event_type 
      FROM events 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    events.rows.forEach((event, index) => {
      console.log(`${index + 1}. [${event.event_type || 'NULL'}] ${event.name}`);
      console.log(`   ID: ${event.id}\n`);
    });

    // اختر ID الفعالية التي تريد تحويلها لـ drift
    const eventIdToUpdate = process.argv[2];

    if (!eventIdToUpdate) {
      console.log('⚠️  Usage: node update_to_drift.cjs <event-id>');
      console.log('Example: node update_to_drift.cjs abc-123-def');
      pool.end();
      return;
    }

    // تحديث الفعالية
    const result = await pool.query(`
      UPDATE events 
      SET event_type = 'drift'
      WHERE id = $1
      RETURNING id, name, event_type
    `, [eventIdToUpdate]);

    if (result.rows.length === 0) {
      console.log('❌ Event not found with ID:', eventIdToUpdate);
    } else {
      const updated = result.rows[0];
      console.log('✅ Event Updated Successfully!');
      console.log('');
      console.log('📋 Event Details:');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Name: ${updated.name}`);
      console.log(`   Type: ${updated.event_type}`);
      console.log('');
      console.log('🔗 Updated Registration URL:');
      console.log(`   http://localhost:3000/ar/e/${updated.id}`);
      console.log('');
      console.log('💡 This event now has:');
      console.log('   ✓ J2drift branding');
      console.log('   ✓ Detailed terms & conditions');
      console.log('   ✓ Custom registration numbers');
      console.log('   ✓ QR code generation');
    }

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

updateEventType();
