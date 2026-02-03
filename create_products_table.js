import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables not found. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProductsTableDirect() {
  console.log('Creating products table directly...');

  try {
    // Create table using REST API
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_en TEXT,
        description TEXT,
        description_ar TEXT,
        description_en TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        sizes TEXT[],
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTableQuery
      })
    });

    if (!response.ok) {
      console.log('Failed to create table via REST API, trying alternative method...');

      // Try inserting data directly to check if table exists
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: 'Test Product',
          price: 1.00,
          quantity: 1
        });

      if (error && error.code === 'PGRST116') {
        console.log('Table does not exist, please create it manually in Supabase dashboard');
        console.log('SQL to run:');
        console.log(createTableQuery);
        return;
      } else if (error) {
        console.log('Table might exist, error:', error);
      } else {
        console.log('Table exists, cleaning up test data...');
        // Clean up test data
        await supabase.from('products').delete().eq('name', 'Test Product');
      }
    } else {
      console.log('Products table created successfully via REST API');
    }

    // Try to enable RLS and create policies
    const rlsQuery = 'ALTER TABLE products ENABLE ROW LEVEL SECURITY;';
    await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: rlsQuery
      })
    });

    const policies = [
      'CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);',
      'CREATE POLICY "Enable insert for service role" ON products FOR INSERT WITH CHECK (true);',
      'CREATE POLICY "Enable update for service role" ON products FOR UPDATE USING (true);',
      'CREATE POLICY "Enable delete for service role" ON products FOR DELETE USING (true);'
    ];

    for (const policy of policies) {
      await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: policy
        })
      });
    }

    // Insert sample product
    const { error: insertError } = await supabase
      .from('products')
      .insert({
        name: 'Samurai Car Show Limited Edition T-Shirt',
        name_ar: 'تيشيرت ساموراي كار شو إصدار محدود',
        name_en: 'Samurai Car Show Limited Edition T-Shirt',
        description: 'Limited edition t-shirt featuring samurai design for car show enthusiasts. Only 50 pieces available.',
        description_ar: 'تيشيرت إصدار محدود يحمل تصميم ساموراي لعشاق معرض السيارات. متوفر 50 قطعة فقط.',
        description_en: 'Limited edition t-shirt featuring samurai design for car show enthusiasts. Only 50 pieces available.',
        price: 25.00,
        quantity: 50,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        image_url: '/samurai-tshirt.jpg',
        is_active: true
      });

    if (insertError) {
      console.error('Error inserting sample product:', insertError);
    } else {
      console.log('Sample product inserted successfully');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createProductsTableDirect();
