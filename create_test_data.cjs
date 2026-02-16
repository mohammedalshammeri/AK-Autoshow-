const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Check/Create Event
    let eventId;
    const eventRes = await pool.query("SELECT id FROM events WHERE event_type = 'drift' LIMIT 1");
    
    if (eventRes.rows.length > 0) {
      eventId = eventRes.rows[0].id;
      console.log('📌 Using existing Drift Event ID:', eventId);
    } else {
      console.log('✨ Creating new Test Drift Event...');
      const insertRes = await pool.query(`
        INSERT INTO events (name, description, event_date, location, event_type, settings)
        VALUES ('J2Drift Championship Round 1', 'Testing Event for Organizer Panel', NOW() + INTERVAL '10 days', 'BIC - Sakhir', 'drift', '{"requires_cpr": true, "allow_passengers": true}')
        RETURNING id
      `);
      eventId = insertRes.rows[0].id;
      console.log('✅ Created Event ID:', eventId);
    }

    // 2. Insert Test Registration
    console.log('📝 Inserting Test Registration...');
    const regRes = await pool.query(`
      INSERT INTO registrations (
        event_id, 
        full_name, 
        email, 
        phone_number, 
        country_code,
        car_make, 
        car_model, 
        car_year, 
        car_category,
        driver_cpr, 
        driver_cpr_photo_url,
        car_photo_url,
        has_passenger,
        passenger_name,
        passenger_cpr,
        passenger_cpr_photo_url,
        status,
        check_in_status, 
        created_at
      )
      VALUES (
        $1, 
        'Ahmed Al-Drifter', 
        'ahmed.drift@example.com', 
        '33334444', 
        '+973',
        'Nissan', 
        'Silvia S13', 
        1998, 
        'turbo', -- Testing new category
        '900112345',
        'https://placehold.co/600x400/png?text=Driver+ID',
        'https://placehold.co/600x400/png?text=S13+Turbo',
        true,
        'Ali Mechanic',
        '920554321',
        'https://placehold.co/600x400/png?text=Passenger+ID',
        'pending',
        'pending',
        NOW()
      )
      RETURNING id, registration_number
    `, [eventId]);

    console.log('✅ Test Registration Inserted!');
    console.log('🆔 Reg ID:', regRes.rows[0].id);
    console.log('🔗 Go to: /organizer/events/' + eventId);

  } catch(e) { console.error('❌ Error:', e); }
  finally { pool.end(); }
}
run();