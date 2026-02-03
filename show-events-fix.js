import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEventsTable() {
  console.log('🔧 إصلاح جدول events...');
  
  try {
    // أولاً: فحص البنية الحالية للجدول
    console.log('🔍 فحص البنية الحالية...');
    const { data: currentEvents, error: currentError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
      
    if (currentError) {
      console.error('❌ خطأ في جلب البيانات الحالية:', currentError);
      return;
    }
    
    console.log('📋 الأعمدة الحالية:', Object.keys(currentEvents?.[0] || {}));
    
    // جرب إضافة الأعمدة باستخدام SQL مباشر
    console.log('🔄 إضافة الأعمدة المفقودة...');
    
    // استخدام SQL Editor API لإضافة الأعمدة
    const alterQueries = [
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS name_ar TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS name_en TEXT;", 
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS location_ar TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS location_en TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS description_ar TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS description_en TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS website_url TEXT;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS features TEXT[];",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10,2) DEFAULT 0;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100;",
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;"
    ];
    
    console.log('📝 الأعمدة التي سيتم إضافتها:');
    alterQueries.forEach((query, index) => {
      const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\\w+)/)?.[1];
      console.log(`${index + 1}. ${columnName}`);
    });
    
    console.log('\\n⚠️  لإضافة هذه الأعمدة، اذهب إلى Supabase SQL Editor وقم بتنفيذ الاستعلامات التالية:');
    console.log('='.repeat(80));
    alterQueries.forEach(query => {
      console.log(query);
    });
    console.log('='.repeat(80));
    
    // تحديث البيانات الموجودة
    console.log('\\n📝 بعد إضافة الأعمدة، قم بتنفيذ هذا الاستعلام لتحديث البيانات:');
    console.log('-'.repeat(60));
    console.log(`UPDATE events SET 
  name_ar = COALESCE(name_ar, name),
  name_en = COALESCE(name_en, name),
  location_ar = COALESCE(location_ar, location), 
  location_en = COALESCE(location_en, location),
  description_ar = COALESCE(description_ar, description),
  description_en = COALESCE(description_en, description),
  status = COALESCE(status, 'upcoming'),
  is_active = COALESCE(is_active, true)
WHERE name_ar IS NULL OR name_en IS NULL;`);
    console.log('-'.repeat(60));
    
  } catch (err) {
    console.error('❌ خطأ عام:', err);
  }
}

fixEventsTable();
