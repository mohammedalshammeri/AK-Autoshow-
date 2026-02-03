/**
 * اختبار تشخيص سريع لمشكلة تسجيل الدخول
 */

async function testLogin() {
  console.log('🔍 بدء اختبار تسجيل الدخول...\n');
  
  const BASE_URL = 'http://localhost:3000';
  
  try {
    // اختبار 1: التحقق من صحة API
    console.log('📡 اختبار 1: فحص API...');
    const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        rememberMe: false
      })
    });
    
    const data = await response.json();
    
    console.log('📊 نتيجة الاستجابة:');
    console.log('   الحالة:', response.status);
    console.log('   البيانات:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('🎉 النظام يعمل بشكل صحيح!');
    } else if (response.status === 401) {
      console.log('❌ خطأ في المصادقة (401)');
      
      if (data.error === 'Invalid credentials') {
        console.log('🔍 التشخيص:');
        console.log('   1. المستخدم غير موجود في قاعدة البيانات');
        console.log('   2. أو كلمة المرور خاطئة');
        console.log('   3. أو مشكلة في hash كلمة المرور');
        
        console.log('\n💡 الحلول المقترحة:');
        console.log('   • تحقق من وجود المستخدم في Supabase Users');
        console.log('   • أعد تشغيل SQL script');
        console.log('   • تحقق من إعدادات المصادقة في Supabase');
      }
    } else {
      console.log('⚠️ خطأ غير متوقع:', response.status);
    }
    
  } catch (error) {
    console.log('💥 خطأ في الشبكة:', error.message);
    console.log('🔧 تأكد من أن الخادم يعمل على localhost:3000');
  }
}

// تشغيل الاختبار
testLogin();
