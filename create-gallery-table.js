import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة غير موجودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createGalleryTableDirect() {
  console.log('🔄 إنشاء جدول gallery_images مباشرة...')
  
  try {
    // محاولة إنشاء الجدول مباشرة بدون استخدام RPC
    const createTableQuery = `
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
    `

    // استخدام REST API مباشرة
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTableQuery
      })
    })

    if (!response.ok) {
      console.log('❌ فشل في إنشاء الجدول عبر REST API')
      
      // محاولة بديلة: إضافة البيانات مباشرة للتحقق من وجود الجدول
      const { data, error } = await supabase
        .from('gallery_images')
        .insert([
          {
            title: 'معرض السيارات الفاخرة 2024',
            description: 'صور من معرض السيارات الفاخرة السنوي في البحرين',
            image_url: '/gallery/luxury-cars-2024.jpg',
            file_name: 'luxury-cars-2024.jpg',
            display_order: 1,
            is_active: true
          }
        ])
        .select()

      if (error) {
        console.error('❌ الجدول غير موجود وفشل في إنشاؤه:', error.message)
        
        if (error.message.includes('relation "gallery_images" does not exist')) {
          console.log('🔧 حل المشكلة: يرجى تنفيذ الأوامر التالية في Supabase SQL Editor:')
          console.log('\n' + '='.repeat(80))
          console.log('CREATE TABLE gallery_images (')
          console.log('  id SERIAL PRIMARY KEY,')
          console.log('  title VARCHAR(255) NOT NULL,')
          console.log('  description TEXT,')
          console.log('  image_url TEXT NOT NULL,')
          console.log('  file_name VARCHAR(255) NOT NULL,')
          console.log('  display_order INTEGER NOT NULL DEFAULT 0,')
          console.log('  is_active BOOLEAN DEFAULT true,')
          console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
          console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
          console.log(');')
          console.log('\n-- إضافة فهارس')
          console.log('CREATE INDEX idx_gallery_images_order ON gallery_images(display_order, is_active);')
          console.log('\n-- إضافة بيانات تجريبية')
          console.log("INSERT INTO gallery_images (title, description, image_url, file_name, display_order) VALUES")
          console.log("('معرض السيارات الفاخرة 2024', 'صور من معرض السيارات الفاخرة السنوي', '/gallery/sample1.jpg', 'sample1.jpg', 1),")
          console.log("('مشاركات متميزة', 'أفضل السيارات المشاركة في المعرض', '/gallery/sample2.jpg', 'sample2.jpg', 2),")
          console.log("('لحظات لا تُنسى', 'أجمل اللحظات من فعاليات المعرض', '/gallery/sample3.jpg', 'sample3.jpg', 3);")
          console.log('='.repeat(80))
          console.log('\n📍 الرجاء نسخ هذا الكود وتشغيله في:')
          console.log('🔗 https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy/sql/new')
        }
        
        return false
      } else {
        console.log('✅ تم إنشاء الجدول وإدراج البيانات بنجاح!')
        return true
      }
    } else {
      console.log('✅ تم إنشاء الجدول بنجاح')
      return true
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error)
    return false
  }
}

async function testConnection() {
  console.log('🔗 اختبار الاتصال بـ Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ فشل الاتصال:', error)
      return false
    }

    console.log('✅ الاتصال ناجح')
    return true

  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error)
    return false
  }
}

async function main() {
  console.log('🚀 بدء إعداد نظام معرض الصور...')
  
  // اختبار الاتصال أولاً
  const connected = await testConnection()
  
  if (!connected) {
    console.log('❌ فشل الاتصال بـ Supabase')
    return
  }

  // محاولة إنشاء الجدول
  const success = await createGalleryTableDirect()
  
  if (success) {
    console.log('🎉 تم إعداد نظام معرض الصور بنجاح!')
  } else {
    console.log('❌ فشل في إعداد النظام تلقائياً')
    console.log('📝 يرجى إنشاء الجدول يدوياً كما هو موضح أعلاه')
  }
}

main().catch(console.error)
