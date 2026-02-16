require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('add_access_code.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Added access_code column and updated drift event.');
  } catch (e) {
    if (e.code === '42701') {
        console.log('⚠️ Column access_code already exists.');
        // Still update the code just in case
        await pool.query("UPDATE events SET access_code = 'DRIFT26' WHERE id = 4;");
        console.log('✅ Updated access_code for event 4.');
    } else {
        console.error('❌ Error updating database:', e);
    }
  } finally {
    pool.end();
  }
}

runMigration();