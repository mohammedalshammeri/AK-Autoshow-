import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseEventDeletionIssue() {
  console.log('🔍 تشخيص مشكلة حذف الأحداث...\n');

  try {
    // 1. فحص الأحداث الموجودة
    console.log('📋 فحص الأحداث الموجودة...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('❌ خطأ في جلب الأحداث:', eventsError);
      return;
    }

    console.log(`📊 عدد الأحداث الموجودة: ${events.length}\n`);

    if (events.length > 0) {
      console.log('📋 قائمة الأحداث:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ID: ${event.id}`);
        console.log(`   الاسم: ${event.name || 'غير محدد'}`);
        console.log(`   الحالة: ${event.status || 'غير محدد'}`);
        console.log(`   تاريخ الإنشاء: ${event.created_at}`);
        console.log('   ---');
      });

      // 2. اختبار حذف حدث موجود
      const testEventId = events[0].id;
      console.log(`\n🧪 اختبار حذف الحدث: ${events[0].name}`);
      console.log(`🎯 معرف الحدث: ${testEventId}`);

      const { data: deleteResult, error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', testEventId)
        .select();

      if (deleteError) {
        console.error('❌ خطأ في الحذف:', deleteError);
        console.error('🔍 تفاصيل الخطأ:', JSON.stringify(deleteError, null, 2));
      } else {
        console.log('✅ نتيجة الحذف:', deleteResult);
        console.log(`📊 عدد السجلات المحذوفة: ${deleteResult?.length || 0}`);

        // 3. التحقق من الحذف
        console.log('\n🔍 التحقق من نجاح الحذف...');
        const { data: remainingEvents, error: checkError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (checkError) {
          console.error('❌ خطأ في فحص الأحداث المتبقية:', checkError);
        } else {
          console.log(`📈 الأحداث المتبقية: ${remainingEvents.length}`);
          
          const eventStillExists = remainingEvents.some(e => e.id === testEventId);
          if (eventStillExists) {
            console.error('💥 مشكلة: الحدث لا يزال موجوداً بعد الحذف!');
          } else {
            console.log('✅ تم حذف الحدث بنجاح من قاعدة البيانات');
          }
        }
      }
    } else {
      console.log('📝 لا توجد أحداث في قاعدة البيانات للاختبار');
      
      // إنشاء حدث اختبار
      console.log('\n➕ إنشاء حدث اختبار...');
      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert([
          {
            name: 'حدث اختبار للحذف',
            description: 'هذا حدث اختبار سيتم حذفه',
            event_date: new Date().toISOString(),
            location: 'موقع اختبار',
            status: 'upcoming'
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ خطأ في إنشاء حدث اختبار:', createError);
      } else {
        console.log('✅ تم إنشاء حدث اختبار:', newEvent);
        console.log('💡 يمكنك الآن اختبار حذفه من لوحة الإدارة');
      }
    }

    // 4. فحص صلاحيات RLS
    console.log('\n🔐 فحص صلاحيات Row Level Security...');
    const { data: authUser } = await supabase.auth.getUser();
    console.log('👤 المستخدم الحالي:', authUser?.user?.email || 'غير معروف');

  } catch (error) {
    console.error('💥 خطأ غير متوقع:', error);
  }
}

diagnoseEventDeletionIssue();
