const { Client } = require('pg');

async function main() {
  const rawDatabaseUrl = process.env.DATABASE_URL;
  if (!rawDatabaseUrl) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  const databaseUrl = rawDatabaseUrl.replace('?sslmode=require', '');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  
  try {
    const tables = ['admin_users', 'admin_sessions', 'admin_activity_log'];
    
    for (const table of tables) {
      console.log(`\n--- Columns for ${table} ---`);
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      
      if (res.rows.length === 0) {
        console.log('(Table does not exist)');
      } else {
        res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
      }
    }
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
