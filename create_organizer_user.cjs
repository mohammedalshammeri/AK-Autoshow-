const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // You might need to install this or use pre-existing logic if you can't require it directly in cjs in some envs. 
// Assuming bcryptjs is available since it's used in the project.
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Get the drift event ID
    const eventRes = await pool.query("SELECT id FROM events WHERE event_type = 'drift' LIMIT 1");
    if (eventRes.rows.length === 0) {
        console.log('❌ No Drift event found. Create one first.');
        return;
    }
    const eventId = eventRes.rows[0].id;
    console.log('📌 Linking Organizer to Event ID:', eventId);

    // 2. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('organizer123', salt);

    // 3. Create Organizer User
    // assigned_event_id is the key here
    const email = 'organizer@drift.com';
    
    // Check if exists
    const check = await pool.query("SELECT id FROM admin_users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
        await pool.query(`
            UPDATE admin_users 
            SET role = 'organizer', assigned_event_id = $1, password_hash = $2
            WHERE email = $3
        `, [eventId, hash, email]);
        console.log('✅ Updated existing user organizer@drift.com');
    } else {
        await pool.query(`
            INSERT INTO admin_users (full_name, email, password_hash, role, is_active, assigned_event_id)
            VALUES ('Drift Organizer', $1, $2, 'organizer', true, $3)
        `, [email, hash, eventId]);
        console.log('✅ Created new user organizer@drift.com');
    }

    console.log('🔐 Credentials:');
    console.log('Email: organizer@drift.com');
    console.log('Pass:  organizer123');
    console.log('🌍 Login URL: /organizer/login');

  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
run();