
import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify session
    const sessionResult = await query(
      `SELECT user_id, is_active FROM admin_sessions 
       WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If ID provided, return single registration with full details (including Group Cars)
    if (id) {
      const regResult = await query(
        `SELECT 
          r.*,
          COALESCE(
            json_agg(
              json_build_object('id', ci.id, 'image_url', ci.image_url)
            ) FILTER (WHERE ci.id IS NOT NULL), 
            '[]'
          ) as car_images
        FROM registrations r
        LEFT JOIN car_images ci ON r.id = ci.registration_id
        WHERE r.id = $1
        GROUP BY r.id`,
        [id]
      );

      if (regResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }

      const registration = regResult.rows[0];

      // Fetch group cars if it's a group
      if (registration.registration_type === 'group') {
        const carsResult = await query(
          `SELECT * FROM registration_cars WHERE registration_id = $1 ORDER BY id ASC`,
          [id]
        );
        registration.group_cars = carsResult.rows;
      }

      return NextResponse.json(
        { success: true, registration },
        { status: 200, headers: getSecurityHeaders() }
      );
    }

    // Get registrations with car images (List View)
    const registrationsResult = await query(
      `SELECT 
        r.*,
        COALESCE(
          json_agg(
            json_build_object('id', ci.id, 'image_url', ci.image_url)
          ) FILTER (WHERE ci.id IS NOT NULL), 
          '[]'
        ) as car_images
      FROM registrations r
      LEFT JOIN car_images ci ON r.id = ci.registration_id
      GROUP BY r.id
      ORDER BY r.created_at DESC`
    );

    const registrations = registrationsResult.rows;

    return NextResponse.json(
      { 
        success: true, 
        registrations: registrations,
        total: registrations.length
      },
      { status: 200, headers: getSecurityHeaders() }
    );

  } catch (error: any) {
    console.error('❌ Registrations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('carshowx_admin_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { id, ...rest } = body || {};

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const allowedFields = new Set([
      'status',
      'full_name',
      'email',
      'phone_number',
      'car_make',
      'car_model',
      'car_year',
      'car_category',
      'has_passenger',
      'passenger_name',
    ]);

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (!allowedFields.has(key)) continue;
      if (typeof value === 'undefined') continue;
      updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }

    values.push(id);
    const sql = `UPDATE registrations SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await query(sql, values);

    return NextResponse.json({ success: true, registration: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
