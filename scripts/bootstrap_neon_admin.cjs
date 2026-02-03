/*
  Bootstrap a Neon-backed admin user (no Supabase).

  Usage (PowerShell):
    $env:ADMIN_PASSWORD='your-password'; node scripts/bootstrap_neon_admin.cjs --email info@bsmc.bh --name mohammed --password-env ADMIN_PASSWORD

  Notes:
  - Requires DATABASE_URL in environment (.env.local is loaded by Next, but not by node).
    If you run this directly, ensure DATABASE_URL is available in your shell env.
*/

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const email = getArg('--email');
  const fullName = getArg('--name');
  const passwordEnv = getArg('--password-env');

  if (!email || !fullName || !passwordEnv) {
    console.error('Missing args. Required: --email --name --password-env');
    process.exit(1);
  }

  const password = process.env[passwordEnv];
  if (!password) {
    console.error(`Missing env var ${passwordEnv} (password)`);
    process.exit(1);
  }

  const rawDatabaseUrl = process.env.DATABASE_URL;
  if (!rawDatabaseUrl) {
    console.error('DATABASE_URL is not set in the environment.');
    console.error('Tip (PowerShell): $env:DATABASE_URL=(Get-Content .env.local | ? { $_ -match "^DATABASE_URL=" } ).Split("=",2)[1]');
    process.exit(1);
  }

  // Strip sslmode to avoid pg warnings; we set SSL explicitly via the `ssl` option below.
  const databaseUrl = (() => {
    try {
      const url = new URL(rawDatabaseUrl);
      url.searchParams.delete('sslmode');
      return url.toString();
    } catch {
      return rawDatabaseUrl;
    }
  })();

  const passwordHash = await bcrypt.hash(password, 12);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // Ensure uuid generator is available
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // Create only the required admin tables (pure Postgres/Neon).
    // We intentionally avoid Supabase-specific RLS policies that reference auth.uid().
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
        permissions JSONB DEFAULT '{}'::jsonb,
        avatar_url TEXT,
        phone VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(512) UNIQUE NOT NULL,
        refresh_token VARCHAR(512) UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        refresh_expires_at TIMESTAMP WITH TIME ZONE,
        ip_address INET,
        user_agent TEXT,
        device_info JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
        session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        old_values JSONB,
        new_values JSONB,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
      CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
      CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON admin_activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON admin_activity_log(created_at);

      -- Ensure email_verified column exists (migration for existing table)
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
    `);

    // Upsert first admin user
    await client.query(
      `INSERT INTO admin_users (email, password_hash, full_name, role, permissions, is_active, email_verified)
       VALUES ($1, $2, $3, 'super_admin', '{}'::jsonb, true, true)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = 'super_admin',
         is_active = true,
         email_verified = true,
         updated_at = NOW()
       RETURNING id, email, full_name, role, is_active, created_at;`,
      [email.toLowerCase(), passwordHash, fullName]
    );

    const check = await client.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM admin_users WHERE email = $1 LIMIT 1;',
      [email.toLowerCase()]
    );

    console.log('✅ Neon admin user ready:', check.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌ Bootstrap failed:', e);
  process.exit(1);
});
