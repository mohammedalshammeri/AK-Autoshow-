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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId } = await params;
    await requireEventCapability(eventId, 'gate_scan');

    const { searchParams } = new URL(request.url);
    const rawQuery = String(searchParams.get('q') || '').trim();

    if (!rawQuery) {
      return NextResponse.json(
        { success: true, results: [] },
        { status: 200, headers: getSecurityHeaders() }
      );
    }

    const like = `%${rawQuery}%`;

    const result = await query(
      `SELECT
        r.id,
        r.event_id,
        r.full_name,
        r.email,
        r.phone_number,
        r.status,
        r.registration_number,
        r.car_make,
        r.car_model,
        r.car_year,
        r.created_at,
        r.check_in_status,
        r.inspection_status,
        r.checked_in_at,
        r.rejection_reason,
        COALESCE(
          json_agg(
            json_build_object('id', ci.id, 'image_url', ci.image_url)
          ) FILTER (WHERE ci.id IS NOT NULL),
          '[]'
        ) as car_images
      FROM registrations r
      LEFT JOIN car_images ci ON r.id = ci.registration_id
      WHERE r.event_id = $1
        AND (
          r.registration_number ILIKE $2
          OR r.full_name ILIKE $2
          OR r.email ILIKE $2
          OR r.phone_number ILIKE $2
          OR r.car_make ILIKE $2
          OR r.car_model ILIKE $2
        )
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT 50`,
      [eventId, like]
    );

    return NextResponse.json(
      { success: true, results: result.rows },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Gate scan search error:', error);

    const message = String(error?.message || 'Internal server error');
    if (message === 'NOT_AUTHENTICATED') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }
    if (message === 'NO_EVENT_ACCESS' || message === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId } = await params;
    await requireEventCapability(eventId, 'gate_scan');

    const body = await request.json().catch(() => ({}));
    const registrationId = String(body?.registrationId || '').trim();
    const action = String(body?.action || '').trim();
    const notes = typeof body?.notes === 'string' ? body.notes : undefined;

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Missing registrationId' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (action !== 'check_in' && action !== 'reject_gate') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    let updated;

    if (action === 'check_in') {
      const res = await query(
        `UPDATE registrations
         SET check_in_status = 'checked_in',
             inspection_status = 'passed',
             checked_in_at = NOW()
         WHERE id = $1 AND event_id = $2
         RETURNING id, event_id, check_in_status, inspection_status, checked_in_at`,
        [registrationId, eventId]
      );
      updated = res.rows[0];
    } else {
      const res = await query(
        `UPDATE registrations
         SET inspection_status = 'rejected',
             rejection_reason = $1
         WHERE id = $2 AND event_id = $3
         RETURNING id, event_id, inspection_status, rejection_reason`,
        [notes || 'Rejected at gate', registrationId, eventId]
      );
      updated = res.rows[0];
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, registration: updated },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Gate scan update error:', error);

    const message = String(error?.message || 'Internal server error');
    if (message === 'NOT_AUTHENTICATED') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }
    if (message === 'NO_EVENT_ACCESS' || message === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
