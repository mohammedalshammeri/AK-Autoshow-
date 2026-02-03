import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة غير موجودة')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupGalleryTable() {
  console.log('🔄 إنشاء جدول gallery_images...')
  
  try {
    // إنشاء الجدول
    const { error: tableError } = await supabase.rpc('sql', {
      query: `
        -- إنشاء جدول صور معرض الفعاليات
        CREATE TABLE IF NOT EXISTS gallery_images (
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
        
        -- إضافة فهرس للترتيب والحالة النشطة
        CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order, is_active);
        CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
      `
    })

    if (tableError) {
      console.error('❌ خطأ في إنشاء الجدول:', tableError)
      return false
    }

    console.log('✅ تم إنشاء جدول gallery_images بنجاح')

    // إضافة دالة التحديث
    const { error: functionError } = await supabase.rpc('sql', {
      query: `
        -- إضافة دالة تحديث وقت التعديل
        CREATE OR REPLACE FUNCTION update_gallery_images_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- إنشاء المحفز
        DROP TRIGGER IF EXISTS gallery_images_updated_at ON gallery_images;
        CREATE TRIGGER gallery_images_updated_at
            BEFORE UPDATE ON gallery_images
            FOR EACH ROW
            EXECUTE FUNCTION update_gallery_images_updated_at();
      `
    })

    if (functionError) {
      console.error('❌ خطأ في إنشاء دالة التحديث:', functionError)
    } else {
      console.log('✅ تم إنشاء دالة التحديث بنجاح')
    }

    // إضافة بيانات تجريبية
    const { data: existingData } = await supabase
      .from('gallery_images')
      .select('id')
      .limit(1)

    if (!existingData || existingData.length === 0) {
      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert([
          {
            title: 'معرض السيارات الفاخرة 2024',
            description: 'صور من معرض السيارات الفاخرة السنوي',
            image_url: '/gallery/sample1.jpg',
            file_name: 'sample1.jpg',
            display_order: 1
          },
          {
            title: 'مشاركات متميزة',
            description: 'أفضل السيارات المشاركة في المعرض',
            image_url: '/gallery/sample2.jpg',
            file_name: 'sample2.jpg',
            display_order: 2
          },
          {
            title: 'لحظات لا تُنسى',
            description: 'أجمل اللحظات من فعاليات المعرض',
            image_url: '/gallery/sample3.jpg',
            file_name: 'sample3.jpg',
            display_order: 3
          }
        ])

      if (insertError) {
        console.error('❌ خطأ في إضافة البيانات التجريبية:', insertError)
      } else {
        console.log('✅ تم إضافة البيانات التجريبية بنجاح')
      }
    }

    // التحقق من الجدول
    const { data: testData, error: selectError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order')

    if (selectError) {
      console.error('❌ خطأ في قراءة البيانات:', selectError)
      return false
    }

    console.log('✅ البيانات الموجودة في الجدول:')
    console.table(testData)

    return true

  } catch (error) {
    console.error('❌ خطأ عام:', error)
    return false
  }
}

async function setupGalleryStorage() {
  console.log('🔄 إنشاء bucket للمعرض...')
  
  try {
    // إنشاء البكت
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('gallery-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ bucket موجود بالفعل')
      } else {
        console.error('❌ خطأ في إنشاء bucket:', bucketError)
        return false
      }
    } else {
      console.log('✅ تم إنشاء bucket بنجاح:', bucketData)
    }

    // إنشاء السياسات
    const policies = [
      {
        name: 'gallery_images_read_policy',
        definition: `(bucket_id = 'gallery-images')`,
        check: `(bucket_id = 'gallery-images')`,
        command: 'SELECT'
      },
      {
        name: 'gallery_images_insert_policy',
        definition: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        check: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        command: 'INSERT'
      },
      {
        name: 'gallery_images_update_policy',
        definition: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        check: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        command: 'UPDATE'
      },
      {
        name: 'gallery_images_delete_policy',
        definition: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        check: `(bucket_id = 'gallery-images' AND auth.role() = 'authenticated')`,
        command: 'DELETE'
      }
    ]

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('sql', {
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'objects' 
              AND policyname = '${policy.name}'
              AND schemaname = 'storage'
            ) THEN
              CREATE POLICY "${policy.name}"
              ON storage.objects FOR ${policy.command}
              USING (${policy.definition});
            END IF;
          END $$;
        `
      })

      if (policyError) {
        console.error(`❌ خطأ في إنشاء سياسة ${policy.name}:`, policyError)
      } else {
        console.log(`✅ تم إنشاء سياسة ${policy.name}`)
      }
    }

    return true

  } catch (error) {
    console.error('❌ خطأ عام في إعداد التخزين:', error)
    return false
  }
}

async function main() {
  console.log('🚀 بدء إعداد نظام معرض الصور...')
  
  const tableSuccess = await setupGalleryTable()
  const storageSuccess = await setupGalleryStorage()
  
  if (tableSuccess && storageSuccess) {
    console.log('🎉 تم إعداد نظام معرض الصور بنجاح!')
    console.log('✅ الجدول: gallery_images')
    console.log('✅ التخزين: gallery-images bucket')
    console.log('✅ السياسات: تم إنشاؤها')
    console.log('✅ البيانات التجريبية: تم إضافتها')
  } else {
    console.log('❌ فشل في إعداد النظام')
    process.exit(1)
  }
}

main().catch(console.error)
