require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function applyEventStaffPermissions() {
  let client;
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is missing in .env.local');
      process.exit(1);
    }

    console.log('👥 Applying per-event staff permissions (event_admin_users)...\n');

    client = await pool.connect();
    console.log('✅ Connected to database.');

    const sql = fs.readFileSync('add_event_staff_permissions.sql', 'utf8');
    await client.query(sql);

    const verify = await client.query(
      `SELECT to_regclass('public.event_admin_users') as table_name`
    );

    console.log('\n🔍 Verification:');
    console.log(verify.rows[0]?.table_name ? '✅ event_admin_users exists' : '❌ event_admin_users missing');

    console.log('\n🎉 Done.');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    try {
      if (client) client.release();
      await pool.end();
    } catch {}
    process.exit(1);
  }
}

applyEventStaffPermissions();
