const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
  try {
    // إنشاء bucket للصور
    console.log('🖼️ إنشاء bucket للصور...');
    const { data: imagesBucket, error: imagesError } = await supabase.storage.createBucket('product-images', { public: true });
    if (imagesError && !imagesError.message.includes('already exists')) {
      console.error('❌ خطأ إنشاء bucket الصور:', imagesError);
    } else {
      console.log('✅ bucket الصور جاهز:', imagesBucket || 'موجود مسبقاً');
    }

    // إنشاء bucket للفيديو
    console.log('🎥 إنشاء bucket للفيديو...');
    const { data: videosBucket, error: videosError } = await supabase.storage.createBucket('product-videos', { public: true });
    if (videosError && !videosError.message.includes('already exists')) {
      console.error('❌ خطأ إنشاء bucket الفيديو:', videosError);
    } else {
      console.log('✅ bucket الفيديو جاهز:', videosBucket || 'موجود مسبقاً');
    }

    console.log('🎉 كل شيء جاهز! يمكنك الآن رفع الصور والفيديو من الأدمن');
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

createBuckets();
