import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('racer_token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get updated user info
    const userResult = await query(
      `SELECT u.*, r.full_name, r.car_make, r.car_model, r.car_category, r.event_id, r.status as registration_status
       FROM users u
       LEFT JOIN registrations r ON u.registration_id = r.id
       WHERE u.id = $1 AND u.role = 'racer'`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        carMake: user.car_make,
        carModel: user.car_model,
        carCategory: user.car_category,
        eventId: user.event_id,
        registrationStatus: user.registration_status
      }
    });

  } catch (error: any) {
    console.error('Racer auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
