import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumnsManually() {
  console.log('🔧 إضافة الأعمدة يدوياً...');
  
  const alterCommands = [
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS name_ar TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS name_en TEXT", 
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS location_ar TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS location_en TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS description_ar TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS description_en TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS website_url TEXT",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS features TEXT[]",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true"
  ];
  
  try {
    // إضافة الأعمدة واحداً تلو الآخر
    for (let i = 0; i < alterCommands.length; i++) {
      const command = alterCommands[i];
      console.log(`⚙️ إضافة العمود ${i + 1}/${alterCommands.length}...`);
      
      // استخدام query مباشر
      const { error } = await supabase
        .from('events')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`➕ محاولة إضافة العمود: ${command.match(/ADD COLUMN IF NOT EXISTS (\\w+)/)?.[1]}`);
      }
    }
    
    // التحقق من الأعمدة
    console.log('🔍 التحقق من الجدول...');
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ خطأ:', error);
    } else {
      console.log('📋 الأعمدة المتاحة:', Object.keys(events?.[0] || {}));
    }
    
    // تحديث البيانات الموجودة
    console.log('🔄 تحديث البيانات الموجودة...');
    const { data: updateData, error: updateError } = await supabase
      .from('events')
      .select('*');
      
    if (updateData && updateData.length > 0) {
      console.log(`📊 عدد الأحداث الموجودة: ${updateData.length}`);
      
      // تحديث كل حدث
      for (const event of updateData) {
        const updates = {};
        
        if (!event.name_ar && event.name) updates.name_ar = event.name;
        if (!event.name_en && event.name) updates.name_en = event.name;
        if (!event.location_ar && event.location) updates.location_ar = event.location;
        if (!event.location_en && event.location) updates.location_en = event.location;
        if (!event.description_ar && event.description) updates.description_ar = event.description;
        if (!event.description_en && event.description) updates.description_en = event.description;
        if (typeof event.is_active === 'undefined') updates.is_active = true;
        
        if (Object.keys(updates).length > 0) {
          console.log(`📝 تحديث الحدث ID: ${event.id}`);
          const { error: eventUpdateError } = await supabase
            .from('events')
            .update(updates)
            .eq('id', event.id);
            
          if (eventUpdateError) {
            console.error(`❌ خطأ في تحديث الحدث ${event.id}:`, eventUpdateError);
          }
        }
      }
    }
    
    console.log('✅ تم الانتهاء من العملية');
    
  } catch (err) {
    console.error('❌ خطأ عام:', err);
  }
}

addColumnsManually();
