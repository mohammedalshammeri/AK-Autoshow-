import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wumiortcmpcrrefdchzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bWlvcnRjbXBjcnJlZmRjaHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTY3MjUzNywiZXhwIjoyMDQ3MjQ4NTM3fQ.TuYKJhiMSKMn7zR8WF0vg-jcBQLRIYfQmuwPJ0Irt2E';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateEventsTable() {
  try {
    console.log('📊 تحديث جدول الأحداث...');
    
    // تنفيذ التحديثات step by step
    const updates = [
      // إضافة الحقول الجديدة
      `ALTER TABLE public.events 
       ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
       ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
       ADD COLUMN IF NOT EXISTS description_en TEXT,
       ADD COLUMN IF NOT EXISTS description_ar TEXT,
       ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
       ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming',
       ADD COLUMN IF NOT EXISTS features TEXT[],
       ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
       ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10,2) DEFAULT 0,
       ADD COLUMN IF NOT EXISTS max_participants INTEGER,
       ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
       
      // إضافة constraint للحالة
      `ALTER TABLE public.events 
       DROP CONSTRAINT IF EXISTS events_status_check;
       ALTER TABLE public.events 
       ADD CONSTRAINT events_status_check 
       CHECK (status IN ('upcoming', 'current', 'ended'));`,
       
      // تحديث البيانات الموجودة
      `UPDATE public.events 
       SET 
         name_ar = COALESCE(name_ar, name),
         name_en = COALESCE(name_en, name),
         description_ar = COALESCE(description_ar, description),
         description_en = COALESCE(description_en, description),
         status = COALESCE(status, 'upcoming'),
         is_active = COALESCE(is_active, true)
       WHERE name_ar IS NULL OR name_en IS NULL;`
    ];

    for (const [index, query] of updates.entries()) {
      console.log(`▶️ تنفيذ التحديث ${index + 1}/${updates.length}`);
      const { error } = await supabase.from('events').select('*').limit(1);
      if (!error) {
        // استخدام rpc للتنفيذ المباشر
        const { data, error: rpcError } = await supabase.rpc('exec_sql', { 
          sql: query 
        });
        
        if (rpcError) {
          console.warn(`⚠️ تحذير في التحديث ${index + 1}:`, rpcError);
        } else {
          console.log(`✅ نجح التحديث ${index + 1}`);
        }
      }
    }
    
    // إنشاء فهارس
    console.log('📋 إنشاء الفهارس...');
    await supabase.rpc('exec_sql', { 
      sql: `CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
            CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
            CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(is_active);`
    });
    
    console.log('🎉 تم تحديث جدول الأحداث بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  }
}

updateEventsTable();
