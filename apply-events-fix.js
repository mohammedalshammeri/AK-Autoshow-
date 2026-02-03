import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyEventsFix() {
  console.log('🔧 تطبيق إصلاح جدول الأحداث...');
  
  try {
    // قراءة السكريپت SQL
    const sqlScript = readFileSync('./fix_events_table_columns.sql', 'utf8');
    console.log('📄 تم قراءة السكريپت SQL بنجاح');
    
    // تنفيذ الاستعلامات واحداً تلو الآخر
    const sqlCommands = sqlScript.split(';').filter(cmd => cmd.trim());
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim();
      if (command) {
        console.log(`⚙️ تنفيذ الأمر ${i + 1}/${sqlCommands.length}...`);
        
        const { data, error } = await supabase.rpc('sql', {
          query: command
        });
        
        if (error) {
          console.error(`❌ خطأ في الأمر ${i + 1}:`, error);
          // استمر في التنفيذ حتى لو فشل أمر واحد
        } else {
          console.log(`✅ تم تنفيذ الأمر ${i + 1} بنجاح`);
        }
      }
    }
    
    // التحقق من النتيجة النهائية
    console.log('🔍 التحقق من الأعمدة الجديدة...');
    const { data: events, error: selectError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
      
    if (selectError) {
      console.error('❌ خطأ في جلب البيانات:', selectError);
    } else {
      console.log('✅ الأعمدة الموجودة الآن:', Object.keys(events?.[0] || {}));
      
      // التحقق من الأعمدة المطلوبة
      const requiredColumns = [
        'name_ar', 'name_en', 'location_ar', 'location_en',
        'description_ar', 'description_en', 'website_url',
        'features', 'registration_fee', 'max_participants', 'is_active'
      ];
      
      const availableColumns = Object.keys(events?.[0] || {});
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('🎉 جميع الأعمدة المطلوبة متوفرة الآن!');
      } else {
        console.log('⚠️ الأعمدة المفقودة:', missingColumns);
      }
    }
    
  } catch (err) {
    console.error('❌ خطأ عام:', err);
  }
}

applyEventsFix();
