import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load env vars manually
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

async function setupDatabase() {
  console.log('🏗️ Setting up Admin Database Tables');
  console.log('----------------------------------');
  
  try {
    // 1. Create Tables
    console.log('📦 Creating tables if they don\'t exist...');
    
    // Admin Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        permissions JSONB DEFAULT '{}',
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ admin_users table ready');

    // Admin Sessions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(512) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ admin_sessions table ready');

    // Activity Log Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        details JSONB,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ admin_activity_log table ready');

    // 2. Check for Admin User
    console.log('\n🔍 Checking default admin user...');
    
    const userRes = await pool.query(
      `SELECT * FROM admin_users WHERE email = $1`,
      ['admin@carshowx.app']
    );

    if (userRes.rows.length === 0) {
      console.log('👤 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
      
      await pool.query(
        `INSERT INTO admin_users (email, password_hash, full_name, role, is_active, permissions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'admin@carshowx.app',
          hashedPassword,
          'System Administrator',
          'super_admin',
          true,
          JSON.stringify({ full_access: true })
        ]
      );
      console.log('✅ Super Admin created: admin@carshowx.app');
    } else {
      console.log('✅ Admin user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
      await pool.query(
        `UPDATE admin_users SET password_hash = $1 WHERE email = $2`,
        [hashedPassword, 'admin@carshowx.app']
      );
      console.log('✅ Password reset to: CarShowX@2025!');
    }

  } catch (err) {
    console.error('💥 Setup Error:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase();
