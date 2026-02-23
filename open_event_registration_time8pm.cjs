// Script: open_event_registration_time8pm.cjs
// Usage: node open_event_registration_time8pm.cjs

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const eventName = '🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  // 8:00 PM Bahrain time = 17:00:00 UTC
  const newDate = '2026-02-27T17:00:00.000Z';
  const roundLabelAr = 'الجولة الثانية';
  const roundLabelEn = 'Round 2';
  try {
    const res = await pool.query(
      `UPDATE events SET status = 'active', is_active = TRUE, event_date = $1
       WHERE name = $2 RETURNING id, name, status, is_active, event_date;`,
      [newDate, eventName]
    );
    if (res.rows.length === 0) {
      console.log('❌ لم يتم العثور على الفعالية');
    } else {
      console.log('✅ تم فتح التسجيل وتحديث التاريخ والوقت:', res.rows[0]);
      console.log('ℹ️  ملاحظة: هذه الفعالية هي', roundLabelAr, '|', roundLabelEn);
    }
  } catch (err) {
    console.error('خطأ في التحديث:', err);
  } finally {
    await pool.end();
  }
}

main();
