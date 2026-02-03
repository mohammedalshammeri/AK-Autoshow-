// التحقق من وجود bucket والصلاحيات
// Check if bucket exists and permissions

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvebeycfhtikfmcyadiy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZWJleWNmaHRpa2ZtY3lhZGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAxNjc4NSwiZXhwIjoyMDc4NTkyNzg1fQ.YYNDeWXuMNd12jCme8viwMBDYBZ_5e_-5wsTfow3auY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucket() {
  try {
    // قائمة جميع buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });
    
    // التحقق من bucket محدد
    const carImagesBucket = buckets.find(b => b.name === 'car-images');
    if (carImagesBucket) {
      console.log('✅ car-images bucket exists!');
      console.log('   Public:', carImagesBucket.public);
    } else {
      console.log('❌ car-images bucket not found');
    }
    
    // تجربة رفع ملف تجريبي
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('car-images')
      .upload('test.txt', testFile);
      
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
    } else {
      console.log('✅ Test upload successful:', uploadData);
      
      // حذف الملف التجريبي
      await supabase.storage.from('car-images').remove(['test.txt']);
    }
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

checkBucket();
