
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
console.log(`URL Present: ${!!supabaseUrl}`);
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
      console.error(`❌ Error accessing ${tableName}:`, error.message, error.details || '');
      return false;
    } else {
      console.log(`✅ Table ${tableName} is accessible (Count: ${data === null ? 'N/A' : 'Head request success'})`); // data is null for head:true usually
      // Let's try simple select 1 just to be sure
      const { data: rows, error: selectError } = await supabase.from(tableName).select('*').limit(1);
      if (selectError) {
         console.error(`  ⚠️ Limited select failed: ${selectError.message}`);
      } else {
         console.log(`  ✅ Select test success. Rows found: ${rows.length}`);
      }
      return true;
    }
  } catch (e) {
    console.error(`❌ Exception checking ${tableName}:`, e.message);
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

  if (allSuccess) {
    console.log('\n✅ All checks passed! The application should work.');
    console.log('If errors persist in browser, check:\n1. Browser Console Networks tab\n2. Next.js Server Logs for timeout\n3. RLS policies preventing public access');
  } else {
    console.log('\n❌ Some checks failed. See above errors.');
  }
}

run();
