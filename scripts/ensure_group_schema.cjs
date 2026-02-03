const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' }); // Load from .env.local

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is missing');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to Neon Postgres');

    // 1. Add registration_type if missing
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'registration_type') THEN
              ALTER TABLE registrations ADD COLUMN registration_type VARCHAR(20) DEFAULT 'individual';
              RAISE NOTICE 'Added registration_type column';
          END IF;
      END $$;
    `);

    // 2. Add car_count if missing
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'car_count') THEN
              ALTER TABLE registrations ADD COLUMN car_count INTEGER DEFAULT 1;
              RAISE NOTICE 'Added car_count column';
          END IF;
      END $$;
    `);

    // 3. Add group_name if missing
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'group_name') THEN
              ALTER TABLE registrations ADD COLUMN group_name VARCHAR(255);
              RAISE NOTICE 'Added group_name column';
          END IF;
      END $$;
    `);

    // 4. Create registration_cars table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registration_cars (
        id BIGSERIAL PRIMARY KEY,
        registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        plate_number VARCHAR(50) NOT NULL,
        qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    
    // 5. Index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reg_cars_registration_id ON registration_cars(registration_id);
    `);

    console.log('✅ Group Registration Schema verification completed successfully.');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
