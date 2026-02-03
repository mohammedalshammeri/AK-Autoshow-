import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEventsColumns() {
  try {
    console.log('🔍 فحص الأعمدة المطلوبة في جدول events...\n');

    // فحص البنية الحالية لجدول events
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', {
      table_name: 'events'
    });

    if (tableError) {
      console.log('⚠️ استخدام طريقة بديلة لفحص الجدول...');
      
      // محاولة جلب عينة من البيانات لفحص الأعمدة
      const { data: sampleEvent, error: sampleError } = await supabase
        .from('events')
        .select('*')
        .limit(1)
        .single();

      if (sampleError && sampleError.code !== 'PGRST116') {
        throw sampleError;
      }

      if (sampleEvent) {
        console.log('📋 الأعمدة الموجودة حالياً:');
        const currentColumns = Object.keys(sampleEvent);
        currentColumns.forEach(col => console.log(`  ✓ ${col}`));
        
        // التحقق من الأعمدة المطلوبة
        const requiredColumns = [
          'name_ar', 'name_en', 'location_ar', 'location_en',
          'description_ar', 'description_en', 'website_url',
          'status', 'features', 'registration_fee', 
          'max_participants', 'is_active'
        ];

        console.log('\n🔍 فحص الأعمدة المطلوبة:');
        const missingColumns = [];
        
        requiredColumns.forEach(col => {
          if (currentColumns.includes(col)) {
            console.log(`  ✅ ${col} - موجود`);
          } else {
            console.log(`  ❌ ${col} - مفقود`);
            missingColumns.push(col);
          }
        });

        if (missingColumns.length === 0) {
          console.log('\n🎉 جميع الأعمدة المطلوبة موجودة! لا حاجة لتطبيق السكريبت.');
          return { needsUpdate: false, missingColumns: [] };
        } else {
          console.log(`\n⚠️ يوجد ${missingColumns.length} أعمدة مفقودة. يجب تطبيق السكريبت.`);
          return { needsUpdate: true, missingColumns };
        }
      } else {
        console.log('📝 الجدول فارغ. سنحتاج لفحص البنية مباشرة.');
        return { needsUpdate: true, missingColumns: ['unknown - table is empty'] };
      }
    }

    console.log('✅ تم فحص البنية بنجاح');
    console.log('معلومات الجدول:', tableInfo);

  } catch (error) {
    console.error('❌ خطأ في فحص الأعمدة:', error.message);
    return { needsUpdate: true, error: error.message };
  }
}

// تشغيل الفحص
checkEventsColumns().then(result => {
  console.log('\n📊 نتيجة الفحص:', result);
  process.exit(0);
}).catch(error => {
  console.error('💥 خطأ عام:', error);
  process.exit(1);
});
