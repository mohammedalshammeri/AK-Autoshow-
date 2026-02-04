// Admin Cars API Endpoint
// Get all car registrations for management

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🚗 Loading car registrations...');

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

    // Verify session
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

    // Get all car registrations
    const carsRes = await query(
      `SELECT 
        id, 
        car_make as make, 
        car_model as model, 
        car_year as year, 
        full_name as owner_name, 
        email as owner_email, 
        phone_number as owner_phone, 
        status, 
        created_at
       FROM registrations
       ORDER BY created_at DESC`
    );

    const cars = carsRes.rows;

    console.log(`✅ Loaded ${cars.length} car registrations`);

    return NextResponse.json(
      { 
        success: true, 
        cars: cars,
        total: cars.length
      },
      { 
        status: 200,
        headers: getSecurityHeaders()
      }
    );

  } catch (error) {
    console.error('❌ Cars API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}
