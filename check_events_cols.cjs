const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'events'").then(r => { 
  console.log('events columns:', JSON.stringify(r.rows.map(x=>x.column_name))); 
  pool.end(); 
}).catch(e => { console.error(e.message); pool.end(); });
