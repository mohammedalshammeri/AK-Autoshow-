const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'setup_rounds_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Applying SQL schema from setup_rounds_schema.sql...');
    await pool.query(sql);
    console.log('Schema applied successfully!');
    
  } catch(e) { 
      console.error('Error applying schema:', e); 
      process.exit(1);
  }
  finally { pool.end(); }
}
run();