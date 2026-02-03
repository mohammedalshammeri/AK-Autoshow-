
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually to ensure it's picked up
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else {
    console.error('❌ .env.local file not found!');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Configuration Check ---');
if (supabaseUrl) {
    try {
        const urlObj = new URL(supabaseUrl);
        console.log(`URL Protocol: ${urlObj.protocol}`);
        console.log(`URL Host: ${urlObj.host}`);
        if (!urlObj.protocol.startsWith('http')) {
             console.error('❌ URL does not start with http/https!');
        }
    } catch (e) {
        console.error(`❌ Invalid URL format: ${supabaseUrl} (${e.message})`);
    }
} else {
    console.log('URL Present: false');
}
console.log(`Key Present: ${!!supabaseKey}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  console.log(`\n🔍 Checking table: ${tableName}...`);
  try {
    const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Error accessing ${tableName}:`, error.message);
      if (error && error.cause) console.error('  Cause:', error.cause);
      return false;
    } else {
      console.log(`✅ Table ${tableName} is accessible`);
      return true;
    }
  } catch (e) {
    console.error(`❌ Exception checking ${tableName}:`, e.message);
      if (e.cause) console.error('  Cause:', e.cause);
    return false;
  }
}

async function run() {
  console.log('\n--- Connection Test ---');
  
  const tables = ['events', 'sponsors', 'products'];
  let allSuccess = true;

  for (const table of tables) {
    const success = await checkTable(table);
    if (!success) allSuccess = false;
  }
}

run();
