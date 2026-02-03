// اختبار سريع لـ bucket car-images
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// قراءة متغيرات البيئة
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function quickTest() {
  console.log('🚀 اختبار سريع لـ bucket car-images...\n');
  
  try {
    // فحص bucket
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ خطأ:', error);
      return;
    }

    const carBucket = buckets.find(b => b.name === 'car-images');
    
    if (!carBucket) {
      console.log('❌ bucket car-images غير موجود');
      console.log('📋 Buckets المتاحة:', buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ bucket car-images موجود');
    console.log('📋 الإعدادات:', {
      public: carBucket.public,
      allowedMimes: carBucket.allowed_mime_types,
      sizeLimit: carBucket.file_size_limit
    });
    
    // اختبار رفع صورة
    console.log('\n🧪 اختبار رفع صورة...');
    
    const testData = Buffer.from('test image data');
    const fileName = `test-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, testData, {
        contentType: 'image/jpeg'
      });
    
    if (uploadError) {
      console.log('❌ فشل الرفع:', uploadError.message);
      console.log('🔧 تحتاج لتنفيذ إصلاح SQL');
    } else {
      console.log('✅ نجح الرفع! المشكلة محلولة');
      // تنظيف
      await supabase.storage.from('car-images').remove([fileName]);
    }
    
  } catch (err) {
    console.error('❌ خطأ:', err.message);
  }
}

quickTest();
