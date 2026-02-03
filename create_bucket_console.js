// Create Supabase storage bucket programmatically
// Run this in your browser console on any page of your app

(async function createCarImagesBucket() {
    console.log('🚀 Creating car-images storage bucket...');
    
    try {
        // Import the supabase client (assuming it's available globally)
        const { supabase } = await import('/src/lib/supabaseClient.js');
        
        // Create the bucket
        const { data: bucket, error: bucketError } = await supabase.storage
            .createBucket('car-images', {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            });
            
        if (bucketError) {
            console.error('❌ Error creating bucket:', bucketError);
            return;
        }
        
        console.log('✅ Bucket created successfully:', bucket);
        
        // Test the bucket by listing it
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            return;
        }
        
        const carImagesBucket = buckets.find(b => b.id === 'car-images');
        
        if (carImagesBucket) {
            console.log('✅ car-images bucket found:', carImagesBucket);
            console.log('🎉 Setup complete! You can now upload car images.');
        } else {
            console.log('❌ car-images bucket not found after creation');
        }
        
    } catch (error) {
        console.error('❌ Script error:', error);
        console.log('💡 Please create the bucket manually via Supabase Dashboard');
    }
})();

// Alternative: Simple test to check if bucket exists
async function checkBucket() {
    try {
        const { supabase } = await import('/src/lib/supabaseClient.js');
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('Available buckets:', data);
        const hasCarImages = data.some(bucket => bucket.id === 'car-images');
        console.log('car-images bucket exists:', hasCarImages);
        
        if (!hasCarImages) {
            console.log('❌ Please create the car-images bucket first');
        } else {
            console.log('✅ car-images bucket is ready!');
        }
    } catch (error) {
        console.error('Script error:', error);
    }
}

// Run the check
// checkBucket();
