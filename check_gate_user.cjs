const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const gateUserId = 'a2791ef7-e182-479a-97cb-05fd50d3272c';
pool.query('SELECT id, email, full_name, role, is_active FROM admin_users WHERE id = $1', [gateUserId])
  .then(r => { console.log('Gate user:', JSON.stringify(r.rows)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
