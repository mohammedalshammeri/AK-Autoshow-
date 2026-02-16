const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('🚀 Connecting to database...');
  try {
    const sqlPath = path.join(__dirname, 'update_registrations_schema.sql');
    if (!fs.existsSync(sqlPath)) {
        throw new Error(`SQL file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 SQL File loaded. Executing...');
    
    // Split by semicolons properly or run as one block?
    // pg.query usually handles multiple statements if they are valid SQL.
    // However, sometimes it's safer to run the whole file content.
    
    await pool.query(sql);
    
    console.log('✅ Schema update executed successfully!');
  } catch(e) { 
    console.error('❌ Error executing SQL:', e); 
  } finally { 
    await pool.end(); 
  }
}

run();