const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  // Check recent pending registrations for event 5
  const pending = await pool.query("SELECT id, full_name, status, registration_number FROM registrations WHERE event_id = 5 AND status = 'pending' LIMIT 5");
  console.log('Pending registrations:', JSON.stringify(pending.rows));
  
  // Check users table count
  const userCount = await pool.query("SELECT COUNT(*) FROM users");
  console.log('Users count:', userCount.rows[0].count);
  
  // Check constraints on users table
  const constraints = await pool.query(`
    SELECT conname, contype FROM pg_constraint 
    WHERE conrelid = 'users'::regclass
  `);
  console.log('Users constraints:', JSON.stringify(constraints.rows));
  
  // Check admin_sessions to see if there are active sessions
  const sessions = await pool.query("SELECT user_id, is_active FROM admin_sessions WHERE is_active = true LIMIT 5");
  console.log('Active sessions:', JSON.stringify(sessions.rows));
}

main().then(() => pool.end()).catch(e => { console.error(e.message); pool.end(); });
