const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_AlWK5onj2eJY@ep-still-butterfly-ahpwtbqu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS attendance_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS attendance_confirmed_at TIMESTAMPTZ
    `);
    console.log('✅ Added attendance_confirmed + attendance_confirmed_at columns');
    
    // Check
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='registrations' AND column_name LIKE 'attendance%'`);
    console.log('Columns:', res.rows.map(r => r.column_name));
  } catch (e) {
    console.error('❌', e.message);
  } finally {
    pool.end();
  }
}
run();
