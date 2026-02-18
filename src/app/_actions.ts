'use server';

import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import CleanApprovalEmail from '@/emails/CleanApprovalEmail';
import RejectionEmail from '@/emails/RejectionEmail';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { query } from '@/lib/db';
import { sendApprovalNotification } from '@/lib/notification-service';
import { generateRegistrationNumber, generateStandardRegistrationNumber } from '@/lib/qr-generator';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : { emails: { send: async () => ({ error: { message: 'RESEND_API_KEY is missing' } }) } } as any;

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
      from: 'AKAutoshow <noreply@akautoshow.com>',
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

export async function registerDynamicEventAction(formData: FormData): Promise<RegistrationResult> {
  console.log('🚀 بدء عملية التسجيل الديناميكي (Dynamic Event Registration)...');
  
  try {
    // 1. Basic Info
    const eventId = formData.get('eventId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const countryCode = formData.get('countryCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    // Terms & Conditions (server-side enforcement)
    const agreedRaw = formData.get('agreed');
    const agreed = agreedRaw === 'true' || agreedRaw === 'on' || agreedRaw === '1';
    if (!agreed) {
      return {
        success: false,
        message: 'You must accept the Terms & Conditions before submitting.',
        error: 'TERMS_NOT_ACCEPTED'
      };
    }
    
    // 2. Car Info
    const carMake = formData.get('carMake') as string;
    const carModel = formData.get('carModel') as string;
    const carYear = formData.get('carYear') as string;
    
    // 3. Extended Info (Optional depending on event settings)
    const driverCpr = formData.get('driverCpr') as string;
    const carCategory = formData.get('carCategory') as string; // 'hedarz', 'turbo', '4x4'
    const emergencyName = formData.get('emergencyName') as string;
    const emergencyNumber = formData.get('emergencyNumber') as string;
    
    // Safety Checklist
    const safetyChecklistRaw = formData.get('safetyChecklist') as string;
    let safetyChecklist = [];
    if (safetyChecklistRaw) {
      try {
        safetyChecklist = JSON.parse(safetyChecklistRaw);
      } catch (e) {
        console.error('Failed to parse safety checklist', e);
      }
    }
    
    // 4. Passenger Info
    const hasPassengerRaw = formData.get('hasPassenger');
    const hasPassenger = hasPassengerRaw === 'true' || hasPassengerRaw === 'on';
    const passengerName = formData.get('passengerName') as string || null;
    const passengerCpr = formData.get('passengerCpr') as string || null;
    const passengerMobile = formData.get('passengerMobile') as string || null;

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // Common Validation
    if (!eventId || !fullName || !email || !phoneNumber || !carMake || !carModel) {
      return { success: false, message: 'Missing basic required fields', error: 'Missing required fields' };
    }

    // Note: We skip strict validation here for dynamic fields because the client-side form handles visibility.
    // However, if CPR is sent, we save it.

    const registrationNumber = `EVT-${Date.now().toString().slice(-5)}`;
    
    // 5. File Uploads (Driver ID, Passenger ID, Car Images)
    const carImages = formData.getAll('carImages') as File[];
    const validCarImages = carImages.filter(file => file instanceof File && file.size > 0);
    
    const driverCprImage = formData.get('driverCprPhoto') as File;
    const passengerCprImage = formData.get('passengerCprPhoto') as File;

    // Hard requirements: ID photo + at least one car image
    if (!driverCprImage || !(driverCprImage instanceof File) || driverCprImage.size <= 0) {
      return {
        success: false,
        message: 'Driver ID photo is required.',
        error: 'MISSING_DRIVER_ID_PHOTO'
      };
    }

    if (!validCarImages || validCarImages.length === 0) {
      return {
        success: false,
        message: 'Car photo is required.',
        error: 'MISSING_CAR_PHOTO'
      };
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return {
        success: false,
        message: 'File upload is not configured. Please contact the organizer.',
        error: 'UPLOAD_NOT_CONFIGURED'
      };
    }

    let driverCprUrl = '';
    let passengerCprUrl = '';

    try {
      console.log('☁️ Uploading Driver ID...');
      const driverRes = await uploadToCloudinary(driverCprImage, 'event-docs/cpr');
      driverCprUrl = driverRes.secure_url;

      if (hasPassenger && passengerCprImage && passengerCprImage.size > 0) {
        console.log('☁️ Uploading Passenger ID...');
        const passengerRes = await uploadToCloudinary(passengerCprImage, 'event-docs/cpr');
        passengerCprUrl = passengerRes.secure_url;
      }
    } catch (e) {
      console.error('Upload Error:', e);
      return {
        success: false,
        message: 'Failed to upload required images. Please try again.',
        error: 'UPLOAD_FAILED'
      };
    }

    // 6. DB Insertion
    const insertQuery = `
      INSERT INTO registrations (
        event_id, full_name, email, phone_number, car_make, car_model, car_year, status, registration_number, country_code,
        driver_cpr, driver_cpr_photo_url, car_category, has_passenger, 
        passenger_name, passenger_cpr, passenger_mobile, passenger_cpr_photo_url,
        emergency_contact_name, emergency_contact_number, safety_checklist, check_in_status, inspection_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending', 'pending')
      RETURNING id
    `;
    
    // Use proper types for integer parsing
    const yearInt = parseInt(carYear) || 2025;

    const values = [
      eventId, fullName, email, fullPhoneNumber, carMake, carModel, yearInt, registrationNumber, countryCode,
      driverCpr, driverCprUrl, carCategory, hasPassenger,
      passengerName, passengerCpr, passengerMobile, passengerCprUrl,
      emergencyName, emergencyNumber, JSON.stringify(safetyChecklist)
    ];

    const result = await query(insertQuery, values);
    const regId = result.rows[0].id;
    console.log('✅ Registration created:', regId);

    // 7. Car Images
    let firstCarImageUrl = '';
    for (const [index, file] of validCarImages.entries()) {
        try {
            const res = await uploadToCloudinary(file, 'car-images');
            if (index === 0) firstCarImageUrl = res.secure_url;

            await query(
                `INSERT INTO car_images (registration_id, image_url, file_name) VALUES ($1, $2, $3)`,
                [regId, res.secure_url, `dynamic_${regId}_${Date.now()}_${index}`]
            );
        } catch (e) { console.error('Car image upload failed', e); }
    }

    if (!firstCarImageUrl) {
      try {
        await query('DELETE FROM registrations WHERE id = $1', [regId]);
      } catch (cleanupErr) {
        console.error('Failed to cleanup registration after car image upload failure', cleanupErr);
      }
      return {
        success: false,
        message: 'Failed to upload required car photo. Please try again.',
        error: 'CAR_PHOTO_UPLOAD_FAILED'
      };
    }

    if (firstCarImageUrl) {
        await query(`UPDATE registrations SET car_photo_url = $1 WHERE id = $2`, [firstCarImageUrl, regId]);
    }

    return {
      success: true,
      message: 'Registration successful',
      registrationNumber
    };

  } catch (error: any) {
    console.error('❌ Dynamic Registration Failed:', error);
    return { success: false, message: 'Registration failed', error: error.message };
  }
}


export async function approveRacerRegistration(registrationId: string) {
  try {
    // Get registration data with event details
    const regResult = await query(
      `SELECT r.*, e.name as event_name, e.event_date, e.location, e.event_type, e.id as event_id
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       WHERE r.id = $1`, 
      [registrationId]
    );
    const reg = regResult.rows[0];
    if (!reg) throw new Error('Registration not found');

    // Per-event permission check (event staff roles)
    const { requireEventCapability } = await import('@/lib/event-permissions');
    await requireEventCapability(String(reg.event_id), 'approve');

    const userCheck = await query(`SELECT id FROM users WHERE registration_id = $1`, [registrationId]);
    if (userCheck.rows.length > 0) return { success: false, message: 'User already exists' };

    // Generate credentials
    const sanitizedName = reg.full_name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const username = (sanitizedName + Math.floor(100 + Math.random() * 900)).toLowerCase();
    const password = Math.random().toString(36).slice(-8); 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate registration number based on event type
    const eventType = reg.event_type || 'carshow';
    let customRegNumber: string;
    
    if (eventType === 'drift') {
      customRegNumber = generateRegistrationNumber(reg.event_id);
    } else {
      const countResult = await query(`SELECT COUNT(*) as count FROM registrations WHERE event_id = $1 AND status = 'approved'`, [reg.event_id]);
      const count = parseInt(countResult.rows[0].count) + 1;
      customRegNumber = generateStandardRegistrationNumber(reg.event_id, count);
    }

    // Create user account
    await query(
      `INSERT INTO users (username, password_hash, plain_password, role, registration_id) VALUES ($1, $2, $3, 'racer', $4)`,
      [username, hashedPassword, password, registrationId]
    );

    // Update registration with custom number
    await query(
      `UPDATE registrations SET status = 'approved', registration_number = $1 WHERE id = $2`, 
      [customRegNumber, registrationId]
    );

    // Send notifications based on event type
    const phoneWithCode = `${reg.country_code || '+973'}${reg.phone_number}`;
    const carDetails = `${reg.car_make} ${reg.car_model} ${reg.car_year || ''}`.trim();
    const eventUrl = `https://akautoshow.com/ar/events/${reg.event_id}`;
    
    await sendApprovalNotification(
      eventType === 'drift' ? 'drift' : 'carshow',
      {
        email: reg.email,
        phone: phoneWithCode,
        fullName: reg.full_name,
        registrationNumber: customRegNumber,
        username,
        password,
        eventName: reg.event_name,
        eventDate: new Date(reg.event_date).toLocaleDateString('ar-BH'),
        location: reg.location,
        carDetails,
        eventUrl
      }
    );

    return { success: true, username, password, registrationNumber: customRegNumber };

  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

