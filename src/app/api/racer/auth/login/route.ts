import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // Get user from database
    const userResult = await query(
      `SELECT u.*, r.full_name, r.car_make, r.car_model, r.car_category, r.event_id, r.status as registration_status
       FROM users u
       LEFT JOIN registrations r ON u.registration_id = r.id
       WHERE u.username = $1 AND u.role = 'racer'`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        registrationId: user.registration_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
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

    // Set cookie
    response.cookies.set('racer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Racer login error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
