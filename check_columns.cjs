// التحقق من الأعمدة الموجودة في جدول events و registrations
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    console.log('🔍 Checking Database Columns...\n');

    // فحص جدول events
    const eventsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);

    console.log('📋 Events Table Columns:');
    eventsColumns.rows.forEach(col => {
      const emoji = col.column_name === 'event_type' ? '⭐' : '  ';
      console.log(`${emoji} ${col.column_name.padEnd(25)} (${col.data_type})`);
    });

    const hasEventType = eventsColumns.rows.some(c => c.column_name === 'event_type');
    console.log(`\n${hasEventType ? '✅' : '❌'} event_type column: ${hasEventType ? 'EXISTS' : 'MISSING'}`);

    console.log('\n' + '─'.repeat(50) + '\n');

    // فحص جدول registrations
    const regColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position
    `);

    console.log('📋 Registrations Table Columns:');
    regColumns.rows.forEach(col => {
      const emoji = col.column_name === 'registration_number' ? '⭐' : '  ';
      console.log(`${emoji} ${col.column_name.padEnd(25)} (${col.data_type})`);
    });

    const hasRegNumber = regColumns.rows.some(c => c.column_name === 'registration_number');
    console.log(`\n${hasRegNumber ? '✅' : '❌'} registration_number column: ${hasRegNumber ? 'EXISTS' : 'MISSING'}`);

    console.log('\n' + '─'.repeat(50) + '\n');

    // الخلاصة
    if (hasEventType && hasRegNumber) {
      console.log('🎉 All required columns exist! You\'re ready to go!');
    } else {
      console.log('⚠️  Missing columns detected. Run the following:\n');
      if (!hasEventType) {
        console.log('   node -e "..." add_event_type_column.sql');
      }
      if (!hasRegNumber) {
        console.log('   node -e "..." add_registration_number_column.sql');
      }
    }

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

checkColumns();
