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
    console.log('Adding group_name column to registrations table...');
    await client.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS group_name TEXT;
    `);
    console.log('✅ Column group_name added successfully.');
    
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
