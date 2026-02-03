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
    console.log('--- Finding Registration "تجربة" ---');
    
    // Find registration
    const regRes = await client.query(`
      SELECT id, full_name, email, phone_number, created_at 
      FROM registrations 
      WHERE full_name LIKE '%تجربة%' OR email LIKE 'admin@cargate.bh'
    `);
    
    if (regRes.rows.length === 0) {
      console.log('❌ No registration found for "تجربة" or "admin@cargate.bh"');
      return;
    }

    for (const reg of regRes.rows) {
      console.log(`\nFound Registration:`);
      console.log(`- ID: ${reg.id}`);
      console.log(`- Name: ${reg.full_name}`);
      console.log(`- Email: ${reg.email}`);
      console.log(`- Created: ${reg.created_at}`);
      
      // Check car_images table
      const imgRes = await client.query(`
        SELECT * FROM car_images WHERE registration_id = $1
      `, [reg.id]);
      
      console.log(`- Images in car_images table: ${imgRes.rows.length}`);
      imgRes.rows.forEach(img => {
        console.log(`  > [${img.id}] ${img.image_url}`);
      });
    }

    console.log('\n--- Checking car_images table structure ---');
    const structure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'car_images'
    `);
    structure.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));

  } catch (err) {
    console.error('Debug failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
