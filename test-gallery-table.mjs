import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAndCreateGallery() {
  try {
    console.log('🔄 اختبار جدول gallery_images...');
    
    // محاولة إدراج بيانات تجريبية
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{
        title: 'معرض السيارات الفاخرة 2024',
        description: 'صور من معرض السيارات الفاخرة السنوي',
        image_url: '/placeholder-hero.jpg',
        file_name: 'test-gallery.jpg',
        display_order: 1
      }])
      .select();

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ جدول gallery_images غير موجود');
        console.log('📋 يرجى تنفيذ الكود التالي في Supabase SQL Editor:');
        console.log('\n' + '='.repeat(60));
        console.log(`
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gallery_images_order ON gallery_images(display_order, is_active);

INSERT INTO gallery_images (title, description, image_url, file_name, display_order) VALUES
('معرض السيارات الفاخرة 2024', 'صور من معرض السيارات الفاخرة السنوي', '/placeholder-hero.jpg', 'sample1.jpg', 1),
('مشاركات متميزة', 'أفضل السيارات المشاركة في المعرض', '/placeholder-hero.jpg', 'sample2.jpg', 2),
('لحظات لا تُنسى', 'أجمل اللحظات من فعاليات المعرض', '/placeholder-hero.jpg', 'sample3.jpg', 3);
        `);
        console.log('='.repeat(60));
        console.log('🔗 الرابط: https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy/sql/new');
      } else {
        console.error('❌ خطأ آخر:', error);
      }
    } else {
      console.log('✅ الجدول موجود وتم إدراج البيانات بنجاح!');
      console.log('📊 البيانات:', data);
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

testAndCreateGallery();
