import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify admin session
    const sessionResult = await query(
      `SELECT user_id FROM admin_sessions WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
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
    }

    // Update car status
    const updateResult = await query(
      `UPDATE registrations SET status = $1 WHERE id = $2 RETURNING id`,
      [status, carId]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Car not found or failed to update' },
        { status: 404 }
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
