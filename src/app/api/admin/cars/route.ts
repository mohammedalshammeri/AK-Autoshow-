// Admin Cars API Endpoint
// Get all car registrations for management

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    }    // Get all car registrations
    const { data: cars, error: carsError } = await supabaseAdmin
      .from('registrations')
      .select('id, car_make as make, car_model as model, car_year as year, full_name as owner_name, email as owner_email, phone_number as owner_phone, status, created_at')
      .order('created_at', { ascending: false });

    if (carsError) {
      console.error('❌ Failed to load cars:', carsError);
      return NextResponse.json(
        { success: false, error: 'Failed to load cars' },
        { 
          status: 500,
          headers: getSecurityHeaders()
        }
      );
    }

    console.log(`✅ Loaded ${cars?.length || 0} car registrations`);

    return NextResponse.json(
      { 
        success: true, 
        cars: cars || [],
        total: cars?.length || 0
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
