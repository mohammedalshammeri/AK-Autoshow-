import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .select('user_id, is_active')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
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
      { make: 'Mercedes-Benz', model: 'S-Class', year: 2023, owner_name: 'أحمد محمد', owner_email: 'ahmed@example.com', owner_phone: '+973-1234-5678', status: 'approved' },
      { make: 'BMW', model: 'X7', year: 2024, owner_name: 'سارة أحمد', owner_email: 'sara@example.com', owner_phone: '+973-2345-6789', status: 'approved' },
      { make: 'Audi', model: 'Q8', year: 2023, owner_name: 'محمد علي', owner_email: 'mohammed@example.com', owner_phone: '+973-3456-7890', status: 'approved' },
      { make: 'Lamborghini', model: 'Aventador', year: 2022, owner_name: 'عبدالله سالم', owner_email: 'abdullah@example.com', owner_phone: '+973-4567-8901', status: 'approved' },
      { make: 'Ferrari', model: '488 GTB', year: 2023, owner_name: 'فاطمة خالد', owner_email: 'fatima@example.com', owner_phone: '+973-5678-9012', status: 'approved' },
      
      // Rejected cars
      { make: 'Toyota', model: 'Camry', year: 2020, owner_name: 'عمر حسن', owner_email: 'omar@example.com', owner_phone: '+973-6789-0123', status: 'rejected' },
      { make: 'Honda', model: 'Civic', year: 2019, owner_name: 'ليلى أحمد', owner_email: 'layla@example.com', owner_phone: '+973-7890-1234', status: 'rejected' },
      
      // Pending cars
      { make: 'Porsche', model: '911 Turbo', year: 2024, owner_name: 'خالد محمد', owner_email: 'khaled@example.com', owner_phone: '+973-8901-2345', status: 'pending' },
      { make: 'McLaren', model: '720S', year: 2023, owner_name: 'نورا سالم', owner_email: 'nora@example.com', owner_phone: '+973-9012-3456', status: 'pending' },
      { make: 'Bentley', model: 'Continental GT', year: 2022, owner_name: 'حسن علي', owner_email: 'hassan@example.com', owner_phone: '+973-0123-4567', status: 'pending' }
    ];

    // Insert cars
    const { error: carError } = await supabaseAdmin
      .from('car_registrations')
      .insert(carData.map(car => ({
        ...car,
        created_at: new Date(),
        updated_at: new Date()
      })));

    if (carError) {
      console.error('❌ Failed to insert car data:', carError);
      return NextResponse.json(
        { success: false, error: 'Failed to insert car data' },
        { 
          status: 500,
          headers: getSecurityHeaders()
        }
      );
    }

    // Insert sample events
    const eventData = [
      {
        title: 'Bahrain International Car Show 2025',
        title_ar: 'معرض البحرين الدولي للسيارات 2025',
        description: 'The biggest automotive event in the Gulf region featuring luxury and sports cars.',
        description_ar: 'أكبر فعالية للسيارات في منطقة الخليج تضم السيارات الفاخرة والرياضية.',
        start_date: '2025-03-15',
        end_date: '2025-03-17',
        location: 'Bahrain International Exhibition Centre',
        location_ar: 'مركز البحرين الدولي للمعارض',
        registration_deadline: '2025-03-01',
        max_participants: 200,
        current_participants: 45,
        status: 'active'
      },
      {
        title: 'Classic Cars Heritage Festival',
        title_ar: 'مهرجان السيارات الكلاسيكية',
        description: 'Celebrating automotive heritage with vintage and classic automobiles.',
        description_ar: 'احتفال بتراث السيارات مع العرض الكلاسيكي والقديم.',
        start_date: '2025-04-20',
        end_date: '2025-04-22',
        location: 'Manama City Centre',
        location_ar: 'مركز مدينة المنامة',
        registration_deadline: '2025-04-05',
        max_participants: 150,
        current_participants: 30,
        status: 'upcoming'
      },
      {
        title: 'Electric Future Expo',
        title_ar: 'معرض مستقبل السيارات الكهربائية',
        description: 'Showcasing the latest in electric vehicle technology and sustainability.',
        description_ar: 'عرض أحدث تقنيات السيارات الكهربائية والاستدامة.',
        start_date: '2025-05-10',
        end_date: '2025-05-12',
        location: 'Gulf Convention Centre',
        location_ar: 'مركز مؤتمرات الخليج',
        registration_deadline: '2025-04-25',
        max_participants: 300,
        current_participants: 120,
        status: 'active'
      }
    ];

    // Insert events
    const { error: eventError } = await supabaseAdmin
      .from('events')
      .insert(eventData.map(event => ({
        ...event,
        created_at: new Date(),
        updated_at: new Date()
      })));

    if (eventError) {
      console.error('❌ Failed to insert event data:', eventError);
      return NextResponse.json(
        { success: false, error: 'Failed to insert event data' },
        { 
          status: 500,
          headers: getSecurityHeaders()
        }
      );
    }

    console.log('✅ Test data inserted successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Test data inserted successfully',
        data: {
          cars: carData.length,
          events: eventData.length
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
