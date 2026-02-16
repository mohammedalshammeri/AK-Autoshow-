const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const file = process.argv[2];
  if (!file) {
      console.error('Please provide a sql file');
      process.exit(1);
  }
  
  try {
    const sql = fs.readFileSync(file, 'utf8');
    const res = await pool.query(sql);
    console.table(res.rows);
  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
run();