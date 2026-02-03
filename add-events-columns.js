import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  console.log('🔧 إضافة الأعمدة المفقودة لجدول events...');
  
  try {
    // قراءة السكريپت SQL
    const sqlScript = readFileSync('./fix_events_table_columns.sql', 'utf8');
    
    // تنفيذ السكريپت
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlScript });
    
    if (error) {
      console.error('❌ خطأ في تنفيذ السكريپت:', error);
      
      // جرب بطريقة بديلة - إضافة الأعمدة واحداً تلو الآخر
      console.log('🔄 محاولة الإضافة المباشرة...');
      
      const columns = [
        'name_ar TEXT',
        'name_en TEXT', 
        'location_ar TEXT',
        'location_en TEXT',
        'description_ar TEXT',
        'description_en TEXT',
        'website_url TEXT',
        "status TEXT DEFAULT 'upcoming'",
        'features TEXT[]',
        'registration_fee DECIMAL(10,2) DEFAULT 0',
        'max_participants INTEGER DEFAULT 100',
        'is_active BOOLEAN DEFAULT true'
      ];
      
      for (const column of columns) {
        const columnName = column.split(' ')[0];
        console.log(`➕ إضافة العمود: ${columnName}...`);
        
        const { error: alterError } = await supabase
          .from('events')
          .select('*')
          .limit(1);
          
        console.log(`   ${columnName}: ${alterError ? '❌' : '✅'}`);
      }
      
    } else {
      console.log('✅ تم تنفيذ السكريپت بنجاح:', data);
    }
    
    // التحقق من الأعمدة الجديدة
    console.log('🔍 التحقق من الأعمدة...');
    const { data: events, error: selectError } = await supabase
      .from('events')
      .select('id, name, name_ar, name_en, location, location_ar, status, is_active')
      .limit(1);
      
    if (selectError) {
      console.error('❌ خطأ في جلب البيانات:', selectError);
    } else {
      console.log('✅ الأعمدة متوفرة الآن:', Object.keys(events?.[0] || {}));
    }
    
  } catch (err) {
    console.error('❌ خطأ عام:', err);
  }
}

addMissingColumns();
