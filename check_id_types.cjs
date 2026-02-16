require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function main() {
  const sql = `
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'events' AND column_name = 'id') OR
        (table_name = 'admin_users' AND column_name = 'id') OR
        (table_name = 'admin_sessions' AND column_name = 'user_id')
      )
    ORDER BY table_name, column_name;
  `;

  const result = await pool.query(sql);
  console.table(result.rows);
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  pool.end();
  process.exit(1);
});
