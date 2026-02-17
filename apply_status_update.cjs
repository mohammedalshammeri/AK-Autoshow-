const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function applyStatusUpdate() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connecting to Database...');
    
    const sqlPath = path.join(__dirname, 'update_events_status_constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL from update_events_status_constraint.sql...');
    await client.query(sql);

    console.log('✅ Successfully updated events status constraint!');
  } catch (err) {
    console.error('❌ Error applying status update:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applyStatusUpdate();