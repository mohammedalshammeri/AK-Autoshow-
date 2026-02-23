// Script: update_event_description_round2.cjs
// Usage: node update_event_description_round2.cjs

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const eventName = '🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  const descAr = 'هذه الفعالية هي الجولة الثانية من سلسلة فعاليات الدرفت والفريستايل لموسم رمضان 2026.';
  const descEn = 'This event is the second round of the Drift & Freestyle Nights series for Ramadan 2026.';
  try {
    const res = await pool.query(
      `UPDATE events SET description = $1, description_ar = $2, description_en = $3 WHERE name = $4 RETURNING id, name, description, description_ar, description_en;`,
      [descEn, descAr, descEn, eventName]
    );
    if (res.rows.length === 0) {
      console.log('❌ لم يتم العثور على الفعالية');
    } else {
      console.log('✅ تم تحديث وصف الفعالية للجولة الثانية:', res.rows[0]);
    }
  } catch (err) {
    console.error('خطأ في التحديث:', err);
  } finally {
    await pool.end();
  }
}

main();
