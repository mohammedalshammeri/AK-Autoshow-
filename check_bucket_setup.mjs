// إنشاء bucket بسيط
import fs from 'fs';

console.log('🔍 فحص ملف البيئة...');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('✅ ملف .env.local موجود');
  
  // استخراج المتغيرات
  const lines = envContent.split('\n');
  const supabaseUrl = lines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL'))?.split('=')[1];
  const supabaseKey = lines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY'))?.split('=')[1];
  
  if (supabaseUrl && supabaseKey) {
    console.log('✅ متغيرات Supabase موجودة');
    console.log('📋 URL:', supabaseUrl.substring(0, 30) + '...');
  } else {
    console.log('❌ متغيرات Supabase مفقودة');
  }

  console.log('\n📝 لإنشاء البucket، نفذ هذا الكود في Supabase SQL Editor:');
  console.log(`
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'sponsors-logos',
    'sponsors-logos', 
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

SELECT 'Bucket setup complete!' as status, * FROM storage.buckets WHERE id = 'sponsors-logos';
  `);

} catch (error) {
  console.log('❌ خطأ في قراءة ملف البيئة:', error.message);
}
