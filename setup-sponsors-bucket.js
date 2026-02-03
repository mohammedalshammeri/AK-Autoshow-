const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة مفقودة');
  console.log('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSponsorsLogoBucket() {
  try {
    console.log('🔄 إنشاء bucket لشعارات الرعاة...');

    // إنشاء bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('sponsors-logos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    if (bucketError && bucketError.message.includes('already exists')) {
      console.log('✅ bucket موجود مسبقاً');
    } else {
      console.log('✅ تم إنشاء bucket بنجاح:', bucketData);
    }

    // التحقق من البucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const sponsorsBucket = buckets.find(bucket => bucket.id === 'sponsors-logos');
    
    if (sponsorsBucket) {
      console.log('✅ bucket الرعاة موجود ونشط:', {
        id: sponsorsBucket.id,
        name: sponsorsBucket.name,
        public: sponsorsBucket.public,
        createdAt: sponsorsBucket.created_at
      });
    } else {
      throw new Error('فشل في العثور على bucket الرعاة');
    }

    // اختبار رفع ملف تجريبي
    console.log('🔄 اختبار رفع ملف تجريبي...');
    
    const testContent = Buffer.from('test logo content');
    const testFileName = `test/logo-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sponsors-logos')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('✅ تم اختبار الرفع بنجاح:', uploadData.path);

    // حذف الملف التجريبي
    const { error: deleteError } = await supabase.storage
      .from('sponsors-logos')
      .remove([testFileName]);

    if (deleteError) {
      console.warn('⚠️ تحذير: فشل حذف الملف التجريبي:', deleteError.message);
    } else {
      console.log('✅ تم حذف الملف التجريبي');
    }

    console.log('\n🎉 تم إعداد bucket الرعاة بنجاح!');
    console.log('📋 الخطوات التالية:');
    console.log('1. تأكد من أن RLS policies صحيحة في Supabase Dashboard');
    console.log('2. اختبر رفع شعار راعي من لوحة التحكم');
    console.log('3. تحقق من ظهور الشعار في الموقع');

  } catch (error) {
    console.error('❌ خطأ في إعداد bucket الرعاة:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('💡 نصيحة: تأكد من استخدام service_role key وليس anon key');
    }
    
    if (error.message.includes('not found')) {
      console.log('💡 نصيحة: تأكد من صحة رابط Supabase في .env.local');
    }
    
    process.exit(1);
  }
}

createSponsorsLogoBucket();
