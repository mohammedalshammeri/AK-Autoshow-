const { Client } = require('pg');

async function main() {
  const rawDatabaseUrl = process.env.DATABASE_URL;
  if (!rawDatabaseUrl) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  
  // Strip sslmode if present
  const databaseUrl = (() => {
    try {
      const url = new URL(rawDatabaseUrl);
      url.searchParams.delete('sslmode');
      return url.toString();
    } catch {
      return rawDatabaseUrl;
    }
  })();

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  
  try {
    const res = await client.query(`SELECT email, role, is_active FROM admin_users WHERE email = 'info@bsmc.bh'`);
    if (res.rows.length > 0) {
      console.log('✅ User found:', res.rows[0]);
    } else {
      console.log('❌ User info@bsmc.bh NOT found.');
    }
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
