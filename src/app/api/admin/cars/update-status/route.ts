import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify admin session
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('user_id, is_active')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { carId, status } = body;

    // Validate input
    if (!carId || !status) {
      return NextResponse.json(
        { error: 'Car ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }    // Update car status
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ 
        status
      })
      .eq('id', carId);

    if (updateError) {
      console.error('Error updating car status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update car status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Car status updated to ${status}`
    });

  } catch (error) {
    console.error('Error in update-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
