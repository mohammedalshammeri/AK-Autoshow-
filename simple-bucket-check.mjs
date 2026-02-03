// Simple bucket creation script
import { createClient } from '@supabase/supabase-js';

// You need to replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createSponsorsBucket() {
  console.log('🔍 Checking sponsors bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const sponsorsBucket = buckets?.find(bucket => bucket.id === 'sponsors-logos');
    
    if (sponsorsBucket) {
      console.log('✅ Sponsors bucket already exists:', sponsorsBucket);
    } else {
      console.log('📦 Creating sponsors bucket...');
      
      const { data, error } = await supabase.storage.createBucket('sponsors-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
      } else {
        console.log('✅ Bucket created successfully:', data);
      }
    }

    // Test upload
    console.log('\n📤 Testing file upload...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testPath = `test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('sponsors-logos')
      .upload(testPath, testFile);
      
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful');
      
      // Clean up test file
      await supabase.storage.from('sponsors-logos').remove([testPath]);
    }

  } catch (error) {
    console.error('❌ General error:', error);
  }
}

createSponsorsBucket();
