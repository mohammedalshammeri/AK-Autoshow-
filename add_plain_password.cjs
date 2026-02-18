require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Adding plain_password column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS plain_password TEXT;
    `);
    console.log('✅ Column plain_password added successfully.');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();