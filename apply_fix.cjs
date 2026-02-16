require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runFix() {
  try {
    const sql = fs.readFileSync('fix_event_delete.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Successfully updated database constraints. You can now delete events safely.');
  } catch (e) {
    console.error('❌ Error updating database:', e);
  } finally {
    pool.end();
  }
}

runFix();