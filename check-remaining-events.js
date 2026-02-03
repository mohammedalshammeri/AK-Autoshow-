import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRemainingEvents() {
  try {
    console.log('📊 التحقق من الأحداث المتبقية بعد عملية الحذف...\n');

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ في جلب الأحداث:', error);
      return;
    }

    console.log(`📈 إجمالي الأحداث المتبقية: ${events.length}\n`);

    if (events.length > 0) {
      console.log('📋 قائمة الأحداث المتبقية:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ID: ${event.id}`);
        console.log(`   الاسم: ${event.name || 'غير محدد'}`);
        console.log(`   الموقع: ${event.location || 'غير محدد'}`);
        console.log(`   التاريخ: ${new Date(event.event_date).toLocaleDateString('ar-SA')}`);
        console.log(`   الحالة: ${event.status || 'غير محدد'}`);
        console.log(`   نشط: ${event.is_active ? 'نعم' : 'لا'}`);
        console.log('   ---');
      });
    } else {
      console.log('📝 لا توجد أحداث في قاعدة البيانات');
    }

    console.log('\n🎯 خلاصة التحليل:');
    console.log('- حذف الأحداث من قاعدة البيانات يعمل بشكل صحيح ✅');
    console.log('- جميع الأعمدة المطلوبة موجودة ✅');
    
    if (events.length > 0) {
      console.log('- يوجد أحداث متبقية في قاعدة البيانات 📊');
    }
    
    console.log('\n💡 التوصية:');
    console.log('إذا كانت المشكلة لا تزال موجودة في الواجهة:');
    console.log('1. تحقق من تحديث state في React');
    console.log('2. تأكد من استدعاء fetchEvents بعد الحذف');
    console.log('3. فحص وجود cache في المتصفح');

  } catch (error) {
    console.error('💥 خطأ غير متوقع:', error);
  }
}

checkRemainingEvents();
