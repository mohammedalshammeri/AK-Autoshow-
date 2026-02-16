// محاولة اتصال بسيطة للتشخيص
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
    max: 1,
  });

  console.log('🔗 Testing Neon Connection...\n');
  console.log('Connection String:', process.env.DATABASE_URL ? 'Found ✅' : 'Missing ❌');
  console.log('\nAttempting to connect (this may take 10-15 seconds)...\n');

  try {
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // اختبار بسيط
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📅 Server Time:', result.rows[0].current_time);
    console.log('🗄️  PostgreSQL:', result.rows[0].pg_version.split(',')[0]);

    // التحقق من الجداول
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log('\n📋 Tables found:', tables.rows.length);
    tables.rows.forEach(t => console.log('   -', t.tablename));

    client.release();
    await pool.end();
    
    console.log('\n✅ Connection test passed! Database is accessible.\n');
    console.log('💡 Now run: node apply_migrations.cjs');

  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if Neon database is awake (may be in sleep mode)');
    console.error('   2. Visit Neon dashboard and make sure project is active');
    console.error('   3. Try again in 30 seconds (database waking up)');
    console.error('   4. Check your internet connection');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
