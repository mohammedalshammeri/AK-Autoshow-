require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRegColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations';
    `);
    console.log('Columns in registrations table:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkRegColumns();