// Simple bucket check without environment variables
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for .env.local file...');

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📄 .env.local exists: ${envExists}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('🔑 Environment variables found:');
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`   - ${key.trim()}`);
    }
  });
  
  const hasSupabaseUrl = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_URL'));
  const hasServiceKey = lines.some(line => line.includes('SUPABASE_SERVICE_ROLE_KEY'));
  
  console.log(`✅ SUPABASE_URL: ${hasSupabaseUrl ? 'Found' : 'Missing'}`);
  console.log(`✅ SERVICE_KEY: ${hasServiceKey ? 'Found' : 'Missing'}`);
  
  if (hasSupabaseUrl && hasServiceKey) {
    console.log('🎉 All required environment variables are present!');
    console.log('💡 You can now run: node test_car_images_bucket_fixed.mjs');
  } else {
    console.log('❌ Missing required environment variables for bucket test');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('💡 Create .env.local with your Supabase credentials');
}

console.log('\n🔧 To fix the registration issue:');
console.log('1. Run the SQL fix in Supabase Dashboard:');
console.log('   📁 Open: fix_car_images_bucket_mime.sql');
console.log('2. Test the bucket after SQL fix');
console.log('3. Try registration again');

console.log('\n📋 Current bucket status from previous check:');
console.log('   ✅ car-images bucket exists');
console.log('   ❌ MIME type restrictions need to be fixed');
console.log('   💡 Run the SQL fix to resolve this');
