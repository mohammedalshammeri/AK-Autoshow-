// التحقق من إعداد Storage bucket للرعاة
import { supabase } from './src/lib/supabaseClient.js';

async function checkSponsorsStorage() {
  console.log('🔍 فحص إعدادات Storage للرعاة...\n');

  try {
    // 1. التحقق من وجود البucket
    console.log('📦 التحقق من وجود bucket الرعاة...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ خطأ في جلب البuckets:', bucketsError);
      return;
    }

    const sponsorsBucket = buckets.find(bucket => bucket.id === 'sponsors-logos');
    if (sponsorsBucket) {
      console.log('✅ Bucket موجود:', sponsorsBucket);
    } else {
      console.log('❌ Bucket غير موجود - يجب إنشاؤه أولاً');
      
      // محاولة إنشاء البucket
      console.log('🔨 محاولة إنشاء البucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('sponsors-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.error('❌ فشل إنشاء البucket:', createError);
      } else {
        console.log('✅ تم إنشاء البucket بنجاح:', newBucket);
      }
    }

    // 2. اختبار رفع ملف تجريبي
    console.log('\n📤 اختبار رفع ملف تجريبي...');
    
    // إنشاء ملف تجريبي صغير
    const testFile = new Blob(['test image data'], { type: 'image/png' });
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sponsors-logos')
      .upload(testFileName, testFile);

    if (uploadError) {
      console.error('❌ فشل رفع الملف التجريبي:', uploadError);
    } else {
      console.log('✅ تم رفع الملف التجريبي:', uploadData);
      
      // 3. اختبار جلب رابط الملف
      console.log('\n🔗 اختبار جلب رابط الملف...');
      const { data: urlData } = supabase.storage
        .from('sponsors-logos')
        .getPublicUrl(testFileName);
      
      console.log('✅ رابط الملف العام:', urlData.publicUrl);
      
      // 4. اختبار حذف الملف التجريبي
      console.log('\n🗑️ حذف الملف التجريبي...');
      const { error: deleteError } = await supabase.storage
        .from('sponsors-logos')
        .remove([testFileName]);
        
      if (deleteError) {
        console.error('❌ فشل حذف الملف التجريبي:', deleteError);
      } else {
        console.log('✅ تم حذف الملف التجريبي بنجاح');
      }
    }

    // 5. جلب قائمة الملفات الموجودة
    console.log('\n📁 جلب قائمة الملفات الموجودة...');
    const { data: files, error: listError } = await supabase.storage
      .from('sponsors-logos')
      .list();
      
    if (listError) {
      console.error('❌ فشل جلب قائمة الملفات:', listError);
    } else {
      console.log('📋 الملفات الموجودة:', files?.length || 0, 'ملف');
      files?.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 'غير معروف'} bytes)`);
      });
    }

    console.log('\n🎉 انتهى فحص إعدادات Storage للرعاة');
    
  } catch (error) {
    console.error('❌ خطأ عام في الفحص:', error);
  }
}

// تشغيل الفحص
checkSponsorsStorage();
