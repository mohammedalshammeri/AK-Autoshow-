const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  try {
    const res = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'audit_log'");
    if (res.rows.length === 0) {
        console.log('MISSING');
    } else {
        console.log('EXISTS');
    }
  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
check();