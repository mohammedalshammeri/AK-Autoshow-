const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const resSessions = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admin_sessions'");
    console.log('ADMIN_SESSIONS:', resSessions.rows.map(r => r.column_name));

    const resCarReg = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'car_registrations'");
    console.log('CAR_REGISTRATIONS EXISTS:', resCarReg.rows.length > 0);
    
  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
run();
