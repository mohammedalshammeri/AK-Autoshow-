import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';
import { requireEventCapability } from '@/lib/event-permissions';

async function requireAdminSession(request: NextRequest) {
  const token = request.cookies.get('carshowx_admin_token')?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: getSecurityHeaders() }
      ),
    };
  }

  const sessionResult = await query(
    `SELECT user_id, is_active FROM admin_sessions 
     WHERE session_token = $1 AND is_active = true`,
    [token]
  );

  if (sessionResult.rows.length === 0) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401, headers: getSecurityHeaders() }
      ),
    };
  }

  return { ok: true as const };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId, registrationId } = await params;
    await requireEventCapability(eventId, 'view');

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
      WHERE r.id = $1 AND r.event_id = $2
      GROUP BY r.id`,
      [registrationId, eventId]
    );

    if (regResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    const registration = regResult.rows[0];

    if (registration.registration_type === 'group') {
      const carsResult = await query(
        `SELECT * FROM registration_cars WHERE registration_id = $1 ORDER BY id ASC`,
        [registrationId]
      );
      registration.group_cars = carsResult.rows;
    }

    return NextResponse.json(
      { success: true, registration },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event registration GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId, registrationId } = await params;
    await requireEventCapability(eventId, 'edit_registration');
    const body = await request.json();

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
    for (const [key, value] of Object.entries(body || {})) {
      if (!allowedFields.has(key)) continue;
      if (typeof value === 'undefined') continue;
      updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }

    values.push(registrationId);
    values.push(eventId);

    const sql = `UPDATE registrations SET ${setClauses.join(', ')} WHERE id = $${values.length - 1} AND event_id = $${values.length} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, registration: result.rows[0] },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event registration PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
