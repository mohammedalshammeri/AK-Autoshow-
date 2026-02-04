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
      `SELECT user_id, is_active FROM admin_sessions 
       WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, isActive } = body;

    // Validate input
    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and isActive status are required' },
        { status: 400 }
      );
    }

    // Update user status
    await query(
      `UPDATE admin_users SET is_active = $1, updated_at = NOW() WHERE id = $2`,
      [isActive, userId]
    );

    return NextResponse.json({
      success: true,
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`
    });

  } catch (error) {
    console.error('Error in toggle-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
