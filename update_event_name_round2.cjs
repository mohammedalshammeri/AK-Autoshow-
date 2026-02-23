// Script: update_event_name_round2.cjs
// Usage: node update_event_name_round2.cjs

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const oldName = '🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  const newNameAr = 'الجولة الثانية - 🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  const newNameEn = 'Round 2 - 🏁 Drift & Freestyle Nights – You Can | Ramadan 2026';
  try {
    const res = await pool.query(
      `UPDATE events SET name = $1, name_ar = $2, name_en = $3 WHERE name = $4 RETURNING id, name, name_ar, name_en;`,
      [newNameEn, newNameAr, newNameEn, oldName]
    );
    if (res.rows.length === 0) {
      console.log('❌ لم يتم العثور على الفعالية');
    } else {
      console.log('✅ تم تحديث اسم الفعالية للجولة الثانية:', res.rows[0]);
    }
  } catch (err) {
    console.error('خطأ في التحديث:', err);
  } finally {
    await pool.end();
  }
}

main();
