// إنشاء bucket الرعاة باستخدام JavaScript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة مفقودة');
  console.log('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSponsorsBucket() {
  console.log('🚀 بدء إنشاء bucket للرعاة...\n');

  try {
    // 1. فحص البucket الموجود
    console.log('📦 فحص البuckets الموجودة...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const existingBucket = buckets?.find(b => b.id === 'sponsors-logos');
    
    if (existingBucket) {
      console.log('✅ Bucket موجود بالفعل:', existingBucket);
    } else {
      console.log('📦 إنشاء bucket جديد...');
      
      const { data, error } = await supabase.storage.createBucket('sponsors-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (error) {
        throw error;
      }

      console.log('✅ تم إنشاء البucket بنجاح!');
    }

    // 2. اختبار رفع ملف
    console.log('\n🧪 اختبار رفع ملف...');
    
    const testContent = 'test image content';
    const testFile = new Blob([testContent], { type: 'image/png' });
    const testPath = `logos/test-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('sponsors-logos')
      .upload(testPath, testFile);

    if (uploadError) {
      throw uploadError;
    }

    console.log('✅ اختبار الرفع نجح!');

    // 3. الحصول على رابط عام
    const { data: urlData } = supabase.storage
      .from('sponsors-logos')
      .getPublicUrl(testPath);

    console.log('🔗 الرابط العام:', urlData.publicUrl);

    // 4. حذف الملف التجريبي
    const { error: deleteError } = await supabase.storage
      .from('sponsors-logos')
      .remove([testPath]);

    if (!deleteError) {
      console.log('🗑️ تم حذف الملف التجريبي');
    }

    console.log('\n🎉 تم إعداد bucket الرعاة بنجاح!');
    console.log('📋 يمكنك الآن رفع صور الرعاة من لوحة التحكم');

  } catch (error) {
    console.error('❌ خطأ في إعداد البucket:', error);
    
    if (error.message?.includes('already exists')) {
      console.log('ℹ️ البucket موجود بالفعل - هذا طبيعي');
    } else {
      process.exit(1);
    }
  }
}

createSponsorsBucket();
