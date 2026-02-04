import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Inserting test data...');

    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Verify admin session
    const sessionRes = await query(
      `SELECT user_id, is_active FROM admin_sessions 
       WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    const session = sessionRes.rows[0];

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Insert sample car registrations
    const carData = [
      // Approved cars
      { make: 'Mercedes-Benz', model: 'S-Class', year: 2023, full_name: 'أحمد محمد', email: 'ahmed@example.com', phone_number: '+973-1234-5678', status: 'approved' },
      { make: 'BMW', model: 'X7', year: 2024, full_name: 'سارة أحمد', email: 'sara@example.com', phone_number: '+973-2345-6789', status: 'approved' },
      { make: 'Audi', model: 'Q8', year: 2023, full_name: 'محمد علي', email: 'mohammed@example.com', phone_number: '+973-3456-7890', status: 'approved' },
      { make: 'Lamborghini', model: 'Aventador', year: 2022, full_name: 'عبدالله سالم', email: 'abdullah@example.com', phone_number: '+973-4567-8901', status: 'approved' },
      { make: 'Ferrari', model: '488 GTB', year: 2023, full_name: 'فاطمة خالد', email: 'fatima@example.com', phone_number: '+973-5678-9012', status: 'approved' },
      
      // Rejected cars
      { make: 'Toyota', model: 'Camry', year: 2020, full_name: 'عمر حسن', email: 'omar@example.com', phone_number: '+973-6789-0123', status: 'rejected' },
      { make: 'Honda', model: 'Civic', year: 2019, full_name: 'ليلى أحمد', email: 'layla@example.com', phone_number: '+973-7890-1234', status: 'rejected' },
      
      // Pending cars
      { make: 'Porsche', model: '911 Turbo', year: 2024, full_name: 'خالد محمد', email: 'khaled@example.com', phone_number: '+973-8901-2345', status: 'pending' },
      { make: 'McLaren', model: '720S', year: 2023, full_name: 'نورا سالم', email: 'nora@example.com', phone_number: '+973-9012-3456', status: 'pending' },
      { make: 'Bentley', model: 'Continental GT', year: 2022, full_name: 'حسن علي', email: 'hassan@example.com', phone_number: '+973-0123-4567', status: 'pending' }
    ];

    // Insert cars
    for (const car of carData) {
        await query(
            `INSERT INTO registrations 
            (car_make, car_model, car_year, full_name, email, phone_number, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [car.make, car.model, car.year, car.full_name, car.email, car.phone_number, car.status]
        );
    }

    console.log('✅ Test data inserted successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Test data inserted successfully',
        data: {
          cars: carData.length,
          events: 0
        }
      },
      { 
        status: 200,
        headers: getSecurityHeaders()
      }
    );

  } catch (error) {
    console.error('❌ Test data API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}
