require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function run() {
  try {
    const cons = await pool.query(
      "select conname, pg_get_constraintdef(c.oid) as def from pg_constraint c join pg_class t on t.oid=c.conrelid where t.relname='admin_users' and c.contype='c'"
    );
    console.log('admin_users check constraints:');
    console.table(cons.rows);

    const sample = await pool.query(
      'select email, role from admin_users order by created_at desc limit 5'
    );
    console.log('sample admin_users:');
    console.table(sample.rows);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
