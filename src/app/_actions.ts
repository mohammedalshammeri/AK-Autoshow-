'use server';

import { Resend } from 'resend';
import CleanApprovalEmail from '@/emails/CleanApprovalEmail';
import RejectionEmail from '@/emails/RejectionEmail';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Add Cloudinary import
import { query } from '@/lib/db'; // Import Neon DB connection

const resend = new Resend(process.env.RESEND_API_KEY);

// Add registration result interface and function
// export const maxDuration = 60; // Ensure long timeout for file uploads  <-- REMOVED because Next.js only allows async exports in server actions
export interface RegistrationResult {
  success: boolean;
  message: string;
  registrationNumber?: string;
  error?: string;
}

export async function registerAction(formData: FormData): Promise<RegistrationResult> {
  console.log('🚀 بدء عملية التسجيل (Neon DB)...');
  
  try {
    // استخراج البيانات من FormData
    const eventId = formData.get('eventId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const countryCode = formData.get('countryCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const carMake = formData.get('carMake') as string;
    const carModel = formData.get('carModel') as string;
    const carYear = formData.get('carYear') as string;

    // دمج رقم الهاتف مع كود الدولة
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    console.log('📋 البيانات المستلمة:', {
      eventId,
      fullName,
      email,
      phone: fullPhoneNumber,
      car: `${carMake} ${carModel} ${carYear}`
    });

    // التحقق من البيانات المطلوبة
    if (!eventId || !fullName || !email || !phoneNumber || !carMake || !carModel || !carYear) {
      console.error('❌ بيانات مفقودة في النموذج');
      return {
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة',
        error: 'Missing required fields'
      };
    }

    // توليد رقم تسجيل فريد
    const registrationNumber = `AKA-${Date.now().toString().slice(-4)}`;
    
    console.log('🎫 رقم التسجيل المولد:', registrationNumber);

    // حفظ بيانات التسجيل في قاعدة البيانات (Neon)
    const insertQuery = `
      INSERT INTO registrations (event_id, full_name, email, phone_number, car_make, car_model, car_year, status, registration_number, country_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at
    `;
    
    const registrationValues = [
      eventId, 
      fullName, 
      email, 
      fullPhoneNumber, 
      carMake, 
      carModel, 
      parseInt(carYear), 
      'pending', 
      registrationNumber,
      countryCode
    ];

    const result = await query(insertQuery, registrationValues);
    const registrationData = result.rows[0];

    console.log('✅ تم حفظ التسجيل بنجاح:', registrationData);

    // معالجة رفع الصور (صورة واحدة فقط)
    const carImages = formData.getAll('carImages') as File[];
    const validImages = carImages.filter(file => file instanceof File && file.size > 0);
    
    // ✅ تقليل إلى صورة واحدة فقط
    const singleImage = validImages.length > 0 ? [validImages[0]] : [];

    console.log(`📸 معالجة ${singleImage.length} صورة للسيارة...`);

    if (singleImage.length > 0) {
      const file = singleImage[0];
      const fileName = `${registrationData.id}_1_${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log(`📤 بد رفع الصورة...`);      
      
      let imageUrl = '';

      // محاولة الرفع إلى Cloudinary
      if (process.env.CLOUDINARY_CLOUD_NAME) {
         try {
            console.log('☁️ جاري الرفع إلى Cloudinary...');
            const cResult = await uploadToCloudinary(file, 'car-images');
            imageUrl = cResult.secure_url;
            console.log('✅ تم الرفع إلى Cloudinary:', imageUrl);
         } catch (e: any) {
            console.error('❌ خطأ في Cloudinary:', e);
            // إرجاع خطأ للمستخدم بدلاً من إكمال التسجيل بدون صورة
            return {
              success: false, 
              message: 'فشل رفع الصورة. يرجى التأكد من الصورة والمحاولة مرة أخرى.',
              error: `Cloudinary Error: ${e.message || 'Unknown upload error'}`
            };
         }
      } else {
         console.warn('⚠️ لم يتم ضبط إعدادات Cloudinary - سيتم تخطي رفع الصورة');
         return {
            success: false,
            message: 'خطأ في إعدادات النظام (Cloudinary مفقود). يرجى التواصل مع الإدارة.',
            error: 'Missing Cloudinary Configuration'
         };
      }

      if (imageUrl) {
        // حفظ معلومات الصورة في قاعدة البيانات (Neon)
        const imageInsertQuery = `
          INSERT INTO car_images (registration_id, image_url, file_name)
          VALUES ($1, $2, $3)
        `;
        await query(imageInsertQuery, [registrationData.id, imageUrl, fileName]);
        console.log(`✅ تم حفظ رابط الصورة في قاعدة البيانات`);
      }
    }

    console.log('🎉 تم إكمال عملية التسجيل بنجاح!');
    
    return {
      success: true,
      message: 'تم التسجيل بنجاح! سيتم مراجعة طلبك قريباً.',
      registrationNumber: registrationNumber
    };

  } catch (error) {
    console.error('❌ خطأ عام في عملية التسجيل:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    
    return {
      success: false,
      message: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.',
      error: errorMessage
    };
  }
}

interface SendEmailPayload {
  registrationId: string;
  participantEmail: string;
  participantName: string;
  registrationNumber: string;
  eventId: number | string;
}

export async function sendApprovalEmail(payload: SendEmailPayload) {
  try {    console.log('🚀 بدء إرسال إيميل الموافقة...');
    console.log('📋 البيانات المستلمة:', payload);
    console.log('🔍 جلب تفاصيل الحدث لـ eventId:', payload.eventId);

    // Fetch Registration Details from Neon
    const regQuery = `SELECT car_make, car_model, car_year FROM registrations WHERE id = $1`;
    const regResult = await query(regQuery, [payload.registrationId]);
    const registrationData = regResult.rows[0];

    console.log('🚗 تفاصيل السيارة:', registrationData);

    // Fetch Event Details from Neon
    let eventData;
    try {
        const eventQuery = `SELECT name, event_date, location FROM events WHERE id = $1`;
        const eventResult = await query(eventQuery, [payload.eventId]);
        eventData = eventResult.rows[0];
    } catch (e) {
        console.error("Error fetching event", e);
    }
    
    // If event not found, try to get first available event as fallback
    if (!eventData) {
      console.log('Event not found or error, trying first available event...');
      const firstEventQuery = `SELECT name, event_date, location FROM events LIMIT 1`;
      const firstEventResult = await query(firstEventQuery);
      eventData = firstEventResult.rows[0];
    }

    if (!eventData) {
      console.log('❌ لم يتم العثور على الحدث، استخدام بيانات افتراضية');
      // Use default elegant event data
      eventData = {
        name: 'معرض السيارات الفاخرة - AKAutoshow 2026',
        event_date: new Date('2025-12-31T19:00:00').toISOString(),
        location: 'مركز البحرين الدولي للمعارض، المنامة'
      };
    }

    console.log('Successfully fetched event details:', eventData);    // Clean and format event data 
    const cleanEventName = eventData.name?.trim() || 'AKAutoshow 2026 - Premium Car Exhibition';
    const cleanLocation = eventData.location?.trim() || 'Bahrain International Exhibition & Convention Centre, Manama';

    const eventDate = new Date(eventData.event_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });// Send the Email using Resend
    console.log('📧 بدء إرسال الإيميل باستخدام Resend...');
    
    // Use better sender configuration
    const senderEmail = 'AKAutoshow <onboarding@resend.dev>';
    
    console.log('📤 إعدادات الإرسال:', {
      from: senderEmail,
      to: payload.participantEmail,
      subject: `تم قبول تسجيلك في ${cleanEventName}!`
    });    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [payload.participantEmail],
      subject: `AKAutoshow Registration Approved - ${payload.registrationNumber}`,
      replyTo: 'support@akautoshow.com',      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@akautoshow.com>',
        'X-Mailer': 'AKAutoshow-Registration-System',
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },tags: [
        { name: 'category', value: 'registration_approval' },
        { name: 'event', value: 'akautoshow_event' }
      ],      react: CleanApprovalEmail({
        participantName: payload.participantName,
        eventName: cleanEventName,
        eventDate: eventDate,
        eventLocation: cleanLocation,
        vehicleDetails: `${registrationData?.car_make || 'Premium Vehicle'} ${registrationData?.car_model || 'Model'} ${registrationData?.car_year || '2024'}`,
        registrationNumber: payload.registrationNumber,
      }),
    });if (error) {
      console.error('❌ خطأ من Resend:', error);
      console.error('🔍 تفاصيل الخطأ:', JSON.stringify(error, null, 2));
      
      // Add specific error handling
      if (error.message?.includes('domain')) {
        console.error('🚨 مشكلة في النطاق: قد تحتاج لتحقق النطاق في Resend Dashboard');
      }
      
      return { success: false, error: error.message };
    }

    console.log('✅ تم إرسال الإيميل بنجاح!');
    console.log('📧 بيانات الإرسال:', data);
    
    // Add delivery tips based on recipient domain
    const recipientDomain = payload.participantEmail.split('@')[1];
    console.log(`💡 نصائح التسليم لنطاق ${recipientDomain}:`);
    
    if (recipientDomain === 'gmail.com') {
      console.log('- تحقق من مجلد Promotions في Gmail');
      console.log('- تحقق من مجلد Spam');
    } else if (recipientDomain === 'yahoo.com' || recipientDomain === 'outlook.com') {
      console.log('- تحقق من مجلد Junk/Bulk');
      console.log('- قد يحتاج النطاق للتحقق');
    }
    
    console.log('⚠️  ملاحظة: النطاق onboarding@resend.dev محدود للاختبار فقط');
    console.log('📧 لإيميلات الإنتاج، يُنصح بإعداد نطاق مُحقق');
    
    return { success: true, data };

  } catch (error) {
    console.error('❌ خطأ عام في دالة إرسال الإيميل:', error);
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
    return { success: false, error: errorMessage };
  }
}

interface SendRejectionEmailPayload {
  participantEmail: string;
  participantName: string;
  eventName: string;
}

export async function sendRejectionEmail(payload: SendRejectionEmailPayload) {
  try {
    console.log('🚀 بدء إرسال إيميل الرفض...');
    const { data, error } = await resend.emails.send({
      from: 'AK Auto Show <noreply@akautoshow.com>',
      to: [payload.participantEmail],
      subject: `Regarding your application for ${payload.eventName}`,
      react: RejectionEmail({
        participantName: payload.participantName,
        eventName: payload.eventName,
      }),
    });

    if (error) {
      console.error('❌ خطأ من Resend أثناء إرسال إيميل الرفض:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ تم إرسال إيميل الرفض بنجاح!');
    return { success: true, data };

  } catch (error) {
    console.error('❌ خطأ عام في دالة إرسال إيميل الرفض:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
    return { success: false, error: errorMessage };
  }
}
