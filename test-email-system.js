#!/usr/bin/env node

/**
 * اختبار سريع لنظام البريد الإلكتروني
 * Quick Email System Test
 */

const https = require('https');

async function testEmailSystem() {
  console.log('🧪 بدء اختبار نظام البريد الإلكتروني...');
  
  const testData = {
    testEmail: 'delivered@resend.dev' // Resend's test email
  };
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/test-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const postData = JSON.stringify(testData);
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    const result = await testEmailSystem();
    
    console.log('📊 نتائج الاختبار:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.success) {
      console.log('✅ النظام يعمل بشكل صحيح!');
      console.log('📧 تم إرسال إيميل اختباري إلى delivered@resend.dev');
    } else {
      console.log('❌ فشل الاختبار:', result.error);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.log('💡 تأكد من أن الخادم يعمل على http://localhost:3000');
  }
}

// تشغيل الاختبار
main();
