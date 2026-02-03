// اختبار قاعدة بيانات السيارات الشاملة المحدثة
import { getCarMakes, getCarModels } from './src/lib/carApiService.js';

async function testAllBrands() {
  console.log('🚗 اختبار قاعدة البيانات الشاملة الجديدة\n');
  
  try {
    // اختبار جلب الماركات
    console.log('📋 جاري جلب جميع الماركات...');
    const makes = await getCarMakes();
    console.log(`✅ تم جلب ${makes.length} ماركة بنجاح!\n`);
    
    // عرض جميع الماركات
    console.log('🌍 جميع الماركات المتاحة:');
    makes.forEach((make, index) => {
      if (index < 30) { // عرض أول 30 ماركة
        console.log(`${index + 1}. ${make.Make_Name} (ID: ${make.Make_ID})`);
      }
    });
    
    console.log(`... و ${makes.length - 30} ماركة أخرى`);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // اختبار بعض الماركات المهمة
    const testBrands = ['Toyota', 'BMW', 'Mercedes-Benz', 'Hummer', 'Mitsubishi', 'Tesla', 'Ferrari'];
    
    for (const brand of testBrands) {
      console.log(`🏎️ اختبار فئات ${brand}:`);
      const models = await getCarModels(brand);
      if (models.length > 0) {
        console.log(`✅ ${models.length} فئة متاحة:`);
        models.slice(0, 10).forEach((model, index) => {
          console.log(`  ${index + 1}. ${model.Model_Name}`);
        });
        if (models.length > 10) {
          console.log(`  ... و ${models.length - 10} فئة أخرى`);
        }
      } else {
        console.log(`❌ لا توجد فئات لـ ${brand}`);
      }
      console.log('');
    }
    
    console.log('🎉 الاختبار مكتمل بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testAllBrands();
