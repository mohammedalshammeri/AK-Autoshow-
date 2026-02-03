import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugEventsDelete() {
  console.log('🔍 فحص مشكلة حذف الأحداث...');
  
  // جلب جميع الأحداث أولاً
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, name_ar')
    .limit(5);
    
  if (error) {
    console.error('❌ خطأ في جلب الأحداث:', error);
    return;
  }
  
  console.log('📋 الأحداث الموجودة:');
  events?.forEach(event => {
    console.log(`- ID: ${event.id} (نوع: ${typeof event.id})`);
    console.log(`  الاسم: ${event.name_ar || event.name}`);
    console.log('---');
  });
  
  if (events && events.length > 0) {
    const testEvent = events[0];
    console.log(`\n🧪 محاولة حذف الحدث: ${testEvent.name_ar || testEvent.name}`);
    console.log(`🎯 معرف الحدث: ${testEvent.id} (نوع: ${typeof testEvent.id})`);
    
    // محاولة حذف تجريبية (لن تحذف فعلياً - سنعمل dry run أولاً)
    const { error: deleteError, data: deleteData } = await supabase
      .from('events') 
      .delete()
      .eq('id', testEvent.id)
      .select();
      
    if (deleteError) {
      console.error('❌ خطأ في عملية الحذف:', deleteError);
    } else {
      console.log('✅ نتيجة الحذف:', deleteData);
      console.log('📊 عدد السجلات المحذوفة:', deleteData?.length || 0);
    }
  }
}

debugEventsDelete();
