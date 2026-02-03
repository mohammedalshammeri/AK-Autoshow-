import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wumiortcmpcrrefdchzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bWlvcnRjbXBjcnJlZmRjaHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTY3MjUzNywiZXhwIjoyMDQ3MjQ4NTM3fQ.TuYKJhiMSKMn7zR8WF0vg-jcBQLRIYfQmuwPJ0Irt2E';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('🔍 فحص الأحداث الموجودة...');
    
    // عرض جميع الأحداث
    const { data: events, error: selectError } = await supabase
      .from('events')
      .select('*')
      .order('id', { ascending: false });
    
    if (selectError) {
      console.error('❌ خطأ في جلب الأحداث:', selectError);
      return;
    }
    
    console.log('📋 الأحداث الموجودة:');
    events?.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id}, الاسم: ${event.name || 'بدون اسم'}`);
    });

    if (events && events.length > 0) {
      // جرب حذف آخر حدث (للاختبار فقط)
      const lastEvent = events[0];
      console.log(`\n🧪 اختبار حذف الحدث: ${lastEvent.name} (ID: ${lastEvent.id})`);
      
      const { error: deleteError, data: deletedData } = await supabase
        .from('events')
        .delete()
        .eq('id', lastEvent.id)
        .select();
      
      if (deleteError) {
        console.error('❌ فشل في الحذف:', deleteError);
      } else {
        console.log('✅ تم الحذف بنجاح:', deletedData);
      }
      
      // فحص النتائج بعد الحذف
      console.log('\n🔍 فحص الأحداث بعد الحذف...');
      const { data: afterDelete } = await supabase
        .from('events')
        .select('*');
      
      console.log(`📊 عدد الأحداث بعد الحذف: ${afterDelete?.length || 0}`);
    } else {
      console.log('⚠️ لا توجد أحداث للاختبار');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
})();
