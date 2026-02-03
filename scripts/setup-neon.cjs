const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  console.log('🚀 Starting Neon Database Setup...');
  const client = await pool.connect();
  
  try {
    // 1. Create Tables
    console.log('📦 Creating tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.events (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT NOT NULL,
        event_date TIMESTAMPTZ,
        location TEXT,
        image_url TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        status TEXT DEFAULT 'upcoming',
        registration_count INTEGER DEFAULT 0,
        max_participants INTEGER DEFAULT 10000
      );
      
      CREATE TABLE IF NOT EXISTS public.registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        event_id BIGINT REFERENCES public.events(id),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        car_make TEXT,
        car_model TEXT,
        car_year INTEGER,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        registration_number TEXT,
        country_code TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS public.car_images (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        file_name TEXT,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
      );

       CREATE TABLE IF NOT EXISTS public.gallery_images (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        title TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        category TEXT DEFAULT 'general',
        file_name TEXT
      );
      
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url TEXT,
        video_url TEXT,
        stock_quantity INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS public.sponsors (
       id BIGSERIAL PRIMARY KEY,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       name TEXT NOT NULL,
       logo_url TEXT,
       website_url TEXT,
       tier TEXT DEFAULT 'standard',
       display_order INTEGER DEFAULT 0,
       is_active BOOLEAN DEFAULT TRUE
      );
    `);
    
    console.log('✅ Tables created successfully.');

    // 2. Insert Default Event if not exists
    console.log('📅 Checking events...');
    const eventCheck = await client.query('SELECT count(*) FROM events');
    
    if (parseInt(eventCheck.rows[0].count) === 0) {
      console.log('➕ Inserting default event...');
      await client.query(`
        INSERT INTO events (name, event_date, location, description, is_active, max_participants)
        VALUES (
          'Bahrain Midnight Meet 2025', 
          '2025-12-31 19:00:00+03', 
          'Bahrain International Circuit', 
          'The biggest car show event in the region.', 
          true,
          10000
        )
      `);
      console.log('✅ Default event inserted.');
    } else {
      console.log('ℹ️ Events already exist.');
    }

    console.log('🎉 Database setup complete! Now connected to Neon.');
    
  } catch (err) {
    console.error('❌ Error setting up database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

setupDatabase();
