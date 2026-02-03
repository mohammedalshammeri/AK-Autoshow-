// إنشاء bucket للصور في Supabase Storage
// Create bucket for car images in Supabase Storage

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvebeycfhtikfmcyadiy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZWJleWNmaHRpa2ZtY3lhZGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAxNjc4NSwiZXhwIjoyMDc4NTkyNzg1fQ.YYNDeWXuMNd12jCme8viwMBDYBZ_5e_-5wsTfow3auY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCarImagesBucket() {
  try {
    // إنشاء bucket جديد
    const { data, error } = await supabase.storage.createBucket('car-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "car-images" already exists!');
        return true;
      }
      console.error('❌ Error creating bucket:', error);
      return false;
    }

    console.log('✅ Successfully created bucket "car-images":', data);
    return true;
  } catch (error) {
    console.error('❌ Exception creating bucket:', error);
    return false;
  }
}

// تشغيل الدالة
createCarImagesBucket();
