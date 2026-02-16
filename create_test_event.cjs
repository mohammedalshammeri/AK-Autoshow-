require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createDriftEvent() {
  try {
    const insert = await pool.query(`
        INSERT INTO events (name, event_date, location, description, settings, status)
        VALUES (
            'Bahrain Drift Championship 2026 (Round 2)', 
            '2026-03-20', 
            'Bahrain International Circuit', 
            'The ultimate drifting competition returned.',
            '{"requires_cpr": true, "allow_passengers": true, "is_drift": true, "show_car_category": true}',
            'upcoming'
        ) RETURNING id;
    `);
    console.log('✅ Created new test event with ID:', insert.rows[0].id);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

createDriftEvent();