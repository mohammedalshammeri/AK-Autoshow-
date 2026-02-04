'use server';

import { Resend } from 'resend';
import CleanApprovalEmail from '@/emails/CleanApprovalEmail';
import RejectionEmail from '@/emails/RejectionEmail';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { query } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface RegistrationResult {
  success: boolean;
  message: string;
  registrationNumber?: string;
  error?: string;
}

export async function registerAction(formData: FormData): Promise<RegistrationResult> {
  console.log('🚀 بدء عملية التسجيل (Neon DB)...');
  
  try {
    const eventId = formData.get('eventId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const countryCode = formData.get('countryCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const carMake = formData.get('carMake') as string;
    const carModel = formData.get('carModel') as string;
    const carYear = formData.get('carYear') as string;

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    console.log('📋 البيانات المستلمة:', {
      eventId,
      fullName,
      email,
      phone: fullPhoneNumber,
      car: `${carMake} ${carModel} ${carYear}`
    });

    if (!eventId || !fullName || !email || !phoneNumber || !carMake || !carModel || !carYear) {
      console.error('❌ بيانات مفقودة في النموذج');
      return {
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة',
        error: 'Missing required fields'
      };
    }

    const registrationNumber = `AKA-${Date.now().toString().slice(-4)}`;
    
    console.log('🎫 رقم التسجيل المولد:', registrationNumber);

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

    const carImages = formData.getAll('carImages') as File[];
    const validImages = carImages.filter(file => file instanceof File && file.size > 0);
    const singleImage = validImages.length > 0 ? [validImages[0]] : [];

    console.log(`📸 معالجة ${singleImage.length} صورة للسيارة...`);

    if (singleImage.length > 0) {
      const file = singleImage[0];
      const fileName = `${registrationData.id}_1_${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log(`📤 بد رفع الصورة...`);      
      
      let imageUrl = '';

      if (process.env.CLOUDINARY_CLOUD_NAME) {
         try {
            console.log('☁️ جاري الرفع إلى Cloudinary...');
            const cResult = await uploadToCloudinary(file, 'car-images');
            imageUrl = cResult.secure_url;
            console.log('✅ تم الرفع إلى Cloudinary:', imageUrl);
         } catch (e: any) {
            console.error('❌ خطأ في Cloudinary:', e);
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
  try {
    console.log('🚀 بدء إرسال إيميل الموافقة...');
    console.log('📋 البيانات المستلمة:', payload);

    // 1. Fetch Diamond Sponsors
    console.log('💎 جلب الرعاة الماسمين (Diamond Sponsors)...');
    let diamondSponsors = [];
    try {
      const sponsorsQuery = `SELECT name, logo_url FROM sponsors WHERE tier = 'diamond' AND is_active = true ORDER BY name ASC`;
      const sponsorsResult = await query(sponsorsQuery);
      diamondSponsors = sponsorsResult.rows;
      console.log(`✅ تم العثور على ${diamondSponsors.length} راعي ماسي`);
    } catch (e) {
      console.error('⚠️ تحذير: فشل جلب الرعاة', e);
    }

    // 2. Fetch Registration Details
    console.log('🔍 جلب تفاصيل التسجيل...');
    const regQuery = `SELECT car_make, car_model, car_year, registration_type, id FROM registrations WHERE id = $1`;
    const regResult = await query(regQuery, [payload.registrationId]);
    const registrationData = regResult.rows[0];

    if (!registrationData) {
        throw new Error(`Registration not found for ID: ${payload.registrationId}`);
    }

    const isGroup = registrationData.registration_type === 'group';
    let groupCars = [];

    // 3. Handle Group vs Individual Logic
    if (isGroup) {
        console.log('👥 هذا تسجيل مجموعة. جلب تفاصيل السيارات...');
        const carsQuery = `SELECT make, model, plate_number as plate, qr_code as "qrCode" FROM registration_cars WHERE registration_id = $1`;
        const carsResult = await query(carsQuery, [payload.registrationId]);
        groupCars = carsResult.rows;
        console.log(`✅ تم جلب ${groupCars.length} سيارة للمجموعة`);
    } else {
        console.log('👤 هذا تسجيل فردي.');
    }

    // 4. Fetch Event Details
    let eventData;
    try {
        const eventQuery = `SELECT name, event_date, location FROM events WHERE id = $1`;
        const eventResult = await query(eventQuery, [payload.eventId]);
        eventData = eventResult.rows[0];
    } catch (e) {
        console.error("Error fetching event", e);
    }
    
    if (!eventData) {
      console.log('Event not found or error, trying first available event...');
      const firstEventQuery = `SELECT name, event_date, location FROM events LIMIT 1`;
      const firstEventResult = await query(firstEventQuery);
      eventData = firstEventResult.rows[0];
    }

    const cleanEventName = eventData?.name?.trim() || 'AKAutoshow 2026';
    const cleanLocation = eventData?.location?.trim() || 'Bahrain International Exhibition Centre';
    const eventDate = eventData?.event_date 
        ? new Date(eventData.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Coming Soon';

    // 5. Send Email
    const senderEmail = 'AKAutoshow <noreply@akautoshow.com>';
    
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [payload.participantEmail],
      subject: `AKAutoshow Registration Approved - ${payload.registrationNumber}`,
      replyTo: 'support@akautoshow.com',
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@akautoshow.com>',
      },
      react: CleanApprovalEmail({
        participantName: payload.participantName,
        eventName: cleanEventName,
        eventDate: eventDate,
        eventLocation: cleanLocation,
        vehicleDetails: isGroup 
            ? `${groupCars.length} Vehicles Registered`
            : `${registrationData.car_make} ${registrationData.car_model} ${registrationData.car_year}`,
        registrationNumber: payload.registrationNumber,
        qrCodeData: isGroup ? undefined : payload.registrationNumber, // Pass ONLY for individual
        isGroup: isGroup,
        groupCars: groupCars,
        diamondSponsors: diamondSponsors
      }),
    });

    if (error) {
      console.error('❌ خطأ من Resend:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ تم إرسال إيميل الموافقة بنجاح!');
    return { success: true, data };

  } catch (error) {
    console.error('❌ خطأ عام في دالة إرسال الإيميل:', error);
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
