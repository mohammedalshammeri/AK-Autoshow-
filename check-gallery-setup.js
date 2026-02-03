import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة غير موجودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupGalleryTable() {
  console.log('🔄 إنشاء جدول gallery_images...')
  
  try {
    // محاولة قراءة الجدول أولاً للتحقق من وجوده
    const { data: existingTable, error: checkError } = await supabase
      .from('gallery_images')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('✅ جدول gallery_images موجود بالفعل')
      
      // التحقق من البيانات
      const { data: allData, count } = await supabase
        .from('gallery_images')
        .select('*', { count: 'exact' })
        .order('display_order')

      console.log(`📊 عدد الصور الموجودة: ${count}`)
      if (allData && allData.length > 0) {
        console.table(allData.map(img => ({
          id: img.id,
          title: img.title,
          display_order: img.display_order,
          is_active: img.is_active
        })))
      }
      
      return true
    }

    // إذا لم يكن الجدول موجود، سنحاول إنشاؤه بطريقة مختلفة
    console.log('❌ جدول gallery_images غير موجود. محاولة إنشاؤه...')
    console.log('⚠️ يرجى تشغيل ملف create_gallery_table_complete.sql في Supabase Dashboard يدوياً')
    
    return false

  } catch (error) {
    console.error('❌ خطأ في التحقق من الجدول:', error)
    return false
  }
}

async function testGalleryAPI() {
  console.log('🧪 اختبار API المعرض...')
  
  try {
    // اختبار GET
    const response = await fetch(`${supabaseUrl.replace('.supabase.co', '')}.supabase.co/api/admin/gallery`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 استجابة API:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ تم اختبار API بنجاح:', data)
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ خطأ في API:', errorText)
      return false
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار API:', error)
    return false
  }
}

async function main() {
  console.log('🚀 بدء فحص نظام معرض الصور...')
  
  const tableExists = await setupGalleryTable()
  
  if (tableExists) {
    console.log('🎉 نظام معرض الصور جاهز!')
    
    // اختبار API
    await testGalleryAPI()
  } else {
    console.log('❌ يرجى إنشاء الجدول يدوياً باستخدام:')
    console.log('📄 create_gallery_table_complete.sql')
    console.log('🔗 في Supabase Dashboard > SQL Editor')
  }
}

main().catch(console.error)
