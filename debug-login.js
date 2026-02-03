import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load env vars manually to ensure we get them
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testLogin() {
  console.log('🧪 Testing Admin Login Debugger');
  console.log('-------------------------------');
  
  try {
    // 1. Check Connection
    console.log('📡 Testing Database Connection...');
    const nowRes = await pool.query('SELECT NOW()');
    console.log('✅ Connected! DB Time:', nowRes.rows[0].now);

    // 2. Check Admin Table
    console.log('\n🔍 Searching for admin user: admin@carshowx.app');
    const userRes = await pool.query(
      `SELECT * FROM admin_users WHERE email = $1`,
      ['admin@carshowx.app']
    );

    const user = userRes.rows[0];

    if (!user) {
      console.error('❌ User NOT found inside `admin_users` table.');
      
      // Auto-fix attempt
      console.log('🛠️  Attempting to create admin user...');
      const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
      
      try {
        const insertRes = await pool.query(
          `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active, permissions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            'admin@carshowx.app',
            hashedPassword,
            'System',
            'Administrator',
            'super_admin',
            true,
            JSON.stringify({
              users: ['create', 'read', 'update', 'delete'],
              cars: ['create', 'read', 'update', 'delete'],
              events: ['create', 'read', 'update', 'delete'],
              content: ['create', 'read', 'update', 'delete'],
              settings: ['create', 'read', 'update', 'delete'],
              system: ['create', 'read', 'update', 'delete']
            })
          ]
        );
        console.log('✅ Admin user created successfully via fallback script!');
        console.log('UID:', insertRes.rows[0].id);
      } catch (insertError) {
        console.error('❌ Failed to create admin user:', insertError.message);
      }
    } else {
      console.log('✅ User Found with ID:', user.id);
      console.log('   Is Active:', user.is_active);
      console.log('   Role:', user.role);

      // 3. Check Password
      console.log('\n🔑 Verifying Password: CarShowX@2025!');
      const isValid = await bcrypt.compare('CarShowX@2025!', user.password_hash);
      
      if (isValid) {
        console.log('✅ Password matches hash in DB.');
      } else {
        console.error('❌ Password mismatch!');
        console.log('🛠️  Resetting password to default...');
        
        const newHash = await bcrypt.hash('CarShowX@2025!', 12);
        await pool.query(
          `UPDATE admin_users SET password_hash = $1 WHERE id = $2`,
          [newHash, user.id]
        );
        console.log('✅ Password reset to: CarShowX@2025!');
      }
    }

  } catch (err) {
    console.error('💥 Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

testLogin();
