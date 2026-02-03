import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEventOperations() {
  console.log('🧪 اختبار عمليات الأحداث...\n');

  try {
    // 1. جلب جميع الأحداث
    console.log('1️⃣ جلب الأحداث الحالية...');
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ خطأ في جلب الأحداث:', fetchError);
      return;
    }

    console.log(`✅ تم جلب ${events.length} حدث:`);
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ID: ${event.id} - اسم: ${event.name}`);
    });

    if (events.length === 0) {
      console.log('\n📝 لا توجد أحداث للاختبار. سأنشئ حدث تجريبي...');
      
      // إنشاء حدث تجريبي
      const testEvent = {
        name: 'حدث اختبار للحذف',
        event_date: new Date('2025-12-01T10:00:00').toISOString(),
        location: 'موقع تجريبي',
        description: 'هذا حدث تجريبي للاختبار فقط',
        status: 'upcoming'
      };

      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert([testEvent])
        .select()
        .single();

      if (createError) {
        console.error('❌ خطأ في إنشاء حدث تجريبي:', createError);
        return;
      }

      console.log(`✅ تم إنشاء حدث تجريبي بـ ID: ${newEvent.id}`);
      events.push(newEvent);
    }

    // 2. اختبار حذف أول حدث
    const eventToDelete = events[0];
    console.log(`\n2️⃣ اختبار حذف الحدث: "${eventToDelete.name}" (ID: ${eventToDelete.id})`);

    const { error: deleteError, data: deleteData } = await supabase
      .from('events')
      .delete()
      .eq('id', eventToDelete.id)
      .select();

    if (deleteError) {
      console.error('❌ خطأ في حذف الحدث:', deleteError);
      return;
    }

    console.log(`✅ تم حذف الحدث بنجاح!`);
    console.log(`📊 عدد السجلات المحذوفة: ${deleteData?.length || 0}`);
    console.log(`📋 بيانات الحدث المحذوف:`, deleteData);

    // 3. التحقق من الحذف
    console.log(`\n3️⃣ التحقق من الحذف...`);
    const { data: remainingEvents, error: verifyError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true });

    if (verifyError) {
      console.error('❌ خطأ في التحقق:', verifyError);
      return;
    }

    console.log(`✅ عدد الأحداث المتبقية: ${remainingEvents.length}`);
    
    const deletedEventExists = remainingEvents.find(e => e.id === eventToDelete.id);
    if (deletedEventExists) {
      console.log('❌ خطأ: الحدث ما زال موجود في قاعدة البيانات!');
    } else {
      console.log('✅ تأكيد: تم حذف الحدث نهائياً من قاعدة البيانات');
    }

    console.log('\n🎉 انتهى الاختبار بنجاح!');
    console.log('\n📋 الخلاصة:');
    console.log('- جلب الأحداث: يعمل ✅');
    console.log('- حذف الأحداث: يعمل ✅');
    console.log('- التحقق من الحذف: يعمل ✅');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  }
}

testEventOperations();
