// تطبيق التعديلات بشكل متسلسل مع معالجة الأخطاء
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function applyMigrations() {
  let client;
  try {
    console.log('🔗 Connecting to Neon Database...\n');
    client = await pool.connect();
    console.log('✅ Connected!\n');

    // 1. إضافة event_type
    console.log('📝 Adding event_type column...');
    try {
      await client.query(`
        ALTER TABLE events 
        ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'carshow' 
        CHECK (event_type IN ('carshow', 'drift', 'exhibition'))
      `);
      console.log('✅ event_type column added\n');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️  event_type already exists\n');
      } else {
        throw e;
      }
    }

    // 2. إضافة registration_number
    console.log('📝 Adding registration_number column...');
    try {
      await client.query(`
        ALTER TABLE registrations 
        ADD COLUMN IF NOT EXISTS registration_number TEXT
      `);
      console.log('✅ registration_number column added\n');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️  registration_number already exists\n');
      } else {
        throw e;
      }
    }

    // 3. إنشاء index
    console.log('📝 Creating index...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_registration_number 
        ON registrations(registration_number)
      `);
      console.log('✅ Index created\n');
    } catch (e) {
      console.log('ℹ️  Index may already exist\n');
    }

    // 4. التحقق من النتيجة
    console.log('─'.repeat(50));
    console.log('🔍 Verification:\n');

    const eventsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'event_type'
    `);
    console.log(eventsCheck.rows.length > 0 ? '✅ event_type exists' : '❌ event_type missing');

    const regCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registrations' AND column_name = 'registration_number'
    `);
    console.log(regCheck.rows.length > 0 ? '✅ registration_number exists' : '❌ registration_number missing');

    console.log('\n' + '─'.repeat(50));
    console.log('🎉 Database migration completed successfully!\n');

    client.release();
    await pool.end();

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    if (client) client.release();
    await pool.end();
    process.exit(1);
  }
}

applyMigrations();
