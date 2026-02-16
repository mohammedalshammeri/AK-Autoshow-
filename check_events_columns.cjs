require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events';
    `);
    console.log('Columns in events table:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkColumns();