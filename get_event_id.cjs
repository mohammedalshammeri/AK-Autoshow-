require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getEvents() {
  try {
    const result = await pool.query(`
      SELECT id, name, event_date, location, status 
      FROM events 
      ORDER BY event_date DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 الفعاليات الموجودة:\n');
    result.rows.forEach(event => {
      console.log(`🎯 ID: ${event.id}`);
      console.log(`   الاسم: ${event.name}`);
      console.log(`   التاريخ: ${event.event_date}`);
      console.log(`   الحالة: ${event.status}\n`);
    });
    
  } catch (e) {
    console.error('❌ خطأ:', e.message);
  } finally {
    pool.end();
  }
}

getEvents();
