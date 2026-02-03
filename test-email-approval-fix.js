import { sendApprovalEmail } from '@/app/_actions';

async function testApprovalEmail() {
  console.log('🧪 اختبار إرسال إيميل الموافقة...');
  
  const testPayload = {
    registrationId: 'test-123',
    participantEmail: 'test@gmail.com',
    participantName: 'محمد أحمد',
    registrationNumber: 'AKA-0001',
    eventId: 1
  };
  
  try {
    console.log('📤 إرسال إيميل اختبار...');
    const result = await sendApprovalEmail(testPayload);
    
    if (result.success) {
      console.log('✅ نجح الاختبار! تم إرسال الإيميل');
      console.log('📧 البيانات:', result.data);
    } else {
      console.error('❌ فشل الاختبار:', result.error);
    }
  } catch (error) {
    console.error('💥 خطأ في الاختبار:', error);
  }
}

testApprovalEmail();
