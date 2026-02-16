require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEvents() {
  try {
    const res = await pool.query(`SELECT id, name, settings FROM events WHERE settings IS NOT NULL LIMIT 5`);
    console.log('Events with settings:', res.rows);
    
    if (res.rows.length === 0) {
        console.log('No configured events found. Creating test event...');
        const insert = await pool.query(`
            INSERT INTO events (name, event_date, location, description, settings, status)
            VALUES (
                'Bahrain Drift Championship 2026', 
                '2026-03-15', 
                'Bahrain International Circuit', 
                'The ultimate drifting competition.',
                '{"requires_cpr": true, "allow_passengers": true, "is_drift": true}',
                'upcoming'
            ) RETURNING id;
        `);
        console.log('Created test event with ID:', insert.rows[0].id);
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkEvents();