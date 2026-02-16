const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'admin_users'
    `);
    console.log('ADMIN_USERS COLS:', res.rows);
  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
run();