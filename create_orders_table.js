import fs from 'fs';
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

async function createOrdersTableDirect() {
  console.log('Creating orders table directly...');

  try {
    // Try inserting data directly to check if table exists
    const { data, error } = await supabase
      .from('orders')
      .insert({
        product_id: 1,
        customer_name: 'Test Customer',
        size: 'L',
        price: 25.00,
        status: 'pending'
      });

    if (error && error.code === 'PGRST116') {
      console.log('Table does not exist, please create it manually in Supabase dashboard');
      console.log('SQL to run:');
      console.log(`
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  size TEXT,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');
      `);
      return;
    } else if (error) {
      console.log('Table might exist, error:', error);
    } else {
      console.log('Orders table exists, cleaning up test data...');
      // Clean up test data
      await supabase.from('orders').delete().eq('customer_name', 'Test Customer');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createOrdersTableDirect();
