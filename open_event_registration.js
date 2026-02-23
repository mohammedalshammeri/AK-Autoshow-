// Script: open_event_registration.js
// Usage: node open_event_registration.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const eventName = '🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  const newDate = '2026-02-27';
  try {
    const res = await pool.query(
      `UPDATE events SET status = 'active', is_active = TRUE, event_date = $1, updated_at = NOW()
       WHERE name = $2 RETURNING id, name, status, is_active, event_date;`,
      [newDate, eventName]
    );
    if (res.rows.length === 0) {
      console.log('❌ لم يتم العثور على الفعالية');
    } else {
      console.log('✅ تم فتح التسجيل وتحديث التاريخ:', res.rows[0]);
    }
  } catch (err) {
    console.error('خطأ في التحديث:', err);
  } finally {
    await pool.end();
  }
}

main();
