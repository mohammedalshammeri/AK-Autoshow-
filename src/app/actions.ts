'use server';

import { getAvailableEvents } from '@/lib/eventsService';
import { getClient } from '@/lib/db'; // Import direct DB client for transactions
import { uploadToCloudinary } from '@/lib/cloudinary';
import { registerAction as neonRegisterAction } from './_actions';

interface RegistrationResult {
  success: boolean;
  message?: string;
  registrationNumber?: string;
  error?: string;
  registrationId?: string;
  qrCodes?: { plate: string, code: string }[];
}

// Neon-backed registration (no Supabase)
// export const maxDuration = 60; // Set timeout to 60 seconds (Hobby limit usually 10s, Pro 60s)  <-- REMOVED because Next.js only allows async exports in server actions
export async function registerAction(formData: FormData): Promise<RegistrationResult> {
  // Delegate to the dedicated Neon implementation.
  return (await neonRegisterAction(formData)) as RegistrationResult;
}

export async function registerGroupAction(formData: FormData): Promise<RegistrationResult> {
  console.log('🚀 بدء عملية تسجيل القروب...');
  
  // 1. استخراج البيانات الأساسية
  const eventId = formData.get('eventId') as string;
  const fullName = formData.get('fullName') as string; // Will serve as Group Manager Name
  const groupName = formData.get('groupName') as string;
  const email = formData.get('email') as string;
  const countryCode = formData.get('countryCode') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const carsJson = formData.get('carsData') as string;
  const groupType = formData.get('groupType') as string; // 'same' or 'mixed'

  if (!eventId || !fullName || !groupName || !email || !phoneNumber || !carsJson) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  let cars: any[] = [];
  try {
    cars = JSON.parse(carsJson);
  } catch (e) {
    return { success: false, error: 'بيانات السيارات غير صالحة' };
  }

  const db = await getClient();
  
  try {
    await db.client.query('BEGIN'); // Start transaction

    // 2. إنشاء التسجيل الرئيسي (Master Record)
    const registrationNumber = `GRP-${Date.now().toString().slice(-4)}`;
    
    // Insert into registrations table using Neon DB directly
    const insertRegQuery = `
      INSERT INTO registrations 
      (event_id, full_name, email, phone_number, status, registration_number, registration_type, car_count, created_at, car_make, car_model, car_year, group_name)
      VALUES ($1, $2, $3, $4, 'pending', $5, 'group', $6, NOW(), 'Various', 'Group', 2025, $7)
      RETURNING id
    `;
    
    // Note: We fill dummy values for make/model/year in the main table to satisfy NOT NULL constraints if they exist
    // Based on previous schema, they might be NOT NULL. 
    // Let's assume they are. If not, we can pass NULL or remove them from query.
    // Given the previous user schema context, they likely are required columns in the main table.
    
    const regRes = await db.client.query(insertRegQuery, [
      eventId,
      fullName,
      email,
      countryCode + phoneNumber,
      registrationNumber,
      cars.length,
      groupName
    ]);
    
    const registrationId = regRes.rows[0].id;
    console.log('✅ تم إنشاء طلب القروب:', registrationId);

    const qrCodesList = [];

    // 3. إدخال السيارات (Details)
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const carImageFile = formData.get(`carImage_${i}`) as File;
      
      let imageUrl = '';
      
      // Upload image if exists
      if (carImageFile && carImageFile.size > 0) {
        const fileExtension = carImageFile.name.split('.').pop() || 'jpg';
        const fileName = `group_${registrationId}_car_${i}_${Date.now()}.${fileExtension}`;

        try {
          const cResult = await uploadToCloudinary(carImageFile, 'car-images', 'image');
          imageUrl = cResult.secure_url;
        } catch (e) {
          console.error('❌ Cloudinary upload failed for group car image:', e);
        }
      }

      // Insert into registration_cars
      const insertCarQuery = `
        INSERT INTO registration_cars 
        (registration_id, make, model, year, plate_number, qr_code)
        VALUES ($1, $2, $3, $4, $5, gen_random_uuid()::text)
        RETURNING qr_code
      `;

      const carRes = await db.client.query(insertCarQuery, [
        registrationId,
        car.make,
        car.model,
        parseInt(car.year),
        car.plateNumber
      ]);

      qrCodesList.push({
        plate: car.plateNumber,
        code: carRes.rows[0].qr_code
      });

      // Also insert into car_images table to keep compatibility with existing admin view if needed
      if (imageUrl) {
        await db.client.query(`
          INSERT INTO car_images (registration_id, image_url, file_name)
          VALUES ($1, $2, $3)
        `, [registrationId, imageUrl, 'Group Image']);
      }
    }

    await db.client.query('COMMIT'); // Commit transaction
    
    return {
      success: true,
      message: 'تم تسجيل القروب بنجاح',
      registrationNumber,
      qrCodes: qrCodesList
    };

  } catch (error) {
    await db.client.query('ROLLBACK');
    console.error('❌ Group Registration Failed:', error);
    return { success: false, error: 'فشل في عملية التسجيل، يرجى المحاولة مرة أخرى' };
  } finally {
    db.release();
  }
}

export async function getEventsAction() {
  try {
    const events = await getAvailableEvents();
    // Ensure data is serializable (plain objects)
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching events in action:', error);
    return [];
  }
}
