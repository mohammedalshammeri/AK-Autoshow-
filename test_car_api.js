// اختبار قاعدة بيانات السيارات الشاملة الجديدة
const { getCarMakes, getCarModels } = require('./src/lib/carApiService.ts');

async function testCarDatabase() {
  console.log('🚗 اختبار قاعدة بيانات السيارات الشاملة الجديدة\n');
  
  try {
    // اختبار جلب الماركات
    console.log('📋 جاري جلب جميع الماركات...');
    const makes = await getCarMakes();
    console.log(`✅ تم جلب ${makes.length} ماركة بنجاح!\n`);
    
    // عرض أول 20 ماركة
    console.log('🏆 أول 20 ماركة:');
    makes.slice(0, 20).forEach((make, index) => {
      console.log(`${index + 1}. ${make.Make_Name} (ID: ${make.Make_ID})`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار جلب فئات Toyota
    console.log('🚗 اختبار فئات Toyota:');
    const toyotaModels = await getCarModels('Toyota');
    console.log(`✅ تم جلب ${toyotaModels.length} فئة لتويوتا:`);
    toyotaModels.slice(0, 15).forEach((model, index) => {
      console.log(`${index + 1}. ${model.Model_Name}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار جلب فئات BMW
    console.log('🏎️ اختبار فئات BMW:');
    const bmwModels = await getCarModels('BMW');
    console.log(`✅ تم جلب ${bmwModels.length} فئة لـ BMW:`);
    bmwModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.Model_Name}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار جلب فئات Mercedes-Benz
    console.log('⭐ اختبار فئات Mercedes-Benz:');
    const mercedesModels = await getCarModels('Mercedes-Benz');
    console.log(`✅ تم جلب ${mercedesModels.length} فئة لمرسيدس:`);
    mercedesModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.Model_Name}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testCarDatabase();
