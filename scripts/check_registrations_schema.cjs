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
    console.log('\n--- Columns for registrations ---');
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations'
    `);
    
    res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
