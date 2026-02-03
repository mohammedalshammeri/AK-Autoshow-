// Check Supabase Storage for car_images
// Run this in browser console on Supabase dashboard

// Or check via JavaScript
const checkStorage = async () => {
  const { data, error } = await supabase.storage
    .from('car_images')
    .list('', {
      limit: 10,
      offset: 0
    });
  
  console.log('Storage files:', data);
  console.log('Storage error:', error);
};

checkStorage();
