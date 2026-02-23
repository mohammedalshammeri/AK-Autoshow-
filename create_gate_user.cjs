const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const gateUserId = 'a2791ef7-e182-479a-97cb-05fd50d3272c';
  
  // Check if user already exists
  const exists = await pool.query('SELECT id FROM admin_users WHERE id = $1', [gateUserId]);
  if (exists.rows.length > 0) {
    console.log('Gate user already exists in admin_users');
    pool.end();
    return;
  }
  
  // Create the gate user with a default password
  const password = 'Gate@J2Drift2026';
  const hash = await bcrypt.hash(password, 12);
  
  await pool.query(`
    INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, permissions)
    VALUES ($1, $2, $3, $4, $5, true, '{}')
  `, [gateUserId, 'gate@j2drift.com', hash, 'Gate Staff', 'staff']);
  
  console.log('✅ Gate user created successfully');
  console.log('Email: gate@j2drift.com');
  console.log('Password:', password);
  console.log('Role: staff (will use event_admin_users for event-specific access)');
}

main().then(() => pool.end()).catch(e => { console.error(e.message); pool.end(); });
