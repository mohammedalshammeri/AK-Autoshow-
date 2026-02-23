// Script: debug_event_list.cjs
// Usage: node debug_event_list.cjs

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query(
      `SELECT id, name, status, is_active, event_date FROM events WHERE name ILIKE '%Drift%' ORDER BY event_date DESC;`
    );
    if (res.rows.length === 0) {
      console.log('❌ لا يوجد أي فعالية تحتوي Drift في الاسم');
    } else {
      console.log('--- قائمة الفعاليات التي تحتوي Drift في الاسم ---');
      res.rows.forEach(row => {
        console.log(row);
      });
    }
  } catch (err) {
    console.error('خطأ في جلب الفعاليات:', err);
  } finally {
    await pool.end();
  }
}

main();
