import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireEventCapability } from '@/lib/event-permissions';
import { getSecurityHeaders } from '@/lib/auth';

async function requireAdminSession(request: NextRequest) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('carshowx_admin_token')?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: getSecurityHeaders() }) };
  }
  const result = await query(
    `SELECT s.user_id, u.role FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.session_token = $1 AND s.is_active = true`,
    [token]
  );
  if (result.rows.length === 0) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid session' }, { status: 401, headers: getSecurityHeaders() }) };
  }
  return { ok: true, userId: result.rows[0].user_id, role: result.rows[0].role };
}

// GET /api/admin/events/[id]/rounds/[roundId]/registrations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response!;

    const { id: eventId, roundId } = await params;
    await requireEventCapability(eventId, 'view');

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    const categoryFilter = searchParams.get('category') || 'all';
    const search = searchParams.get('q') || '';

    let whereClause = `r.event_id = $1 AND r.round_id = $2`;
    const values: any[] = [eventId, roundId];
    let idx = 3;

    if (statusFilter !== 'all') {
      whereClause += ` AND r.status = $${idx++}`;
      values.push(statusFilter);
    }
    if (categoryFilter !== 'all') {
      whereClause += ` AND r.car_category = $${idx++}`;
      values.push(categoryFilter);
    }
    if (search) {
      whereClause += ` AND (r.full_name ILIKE $${idx} OR r.registration_number ILIKE $${idx} OR r.phone_number ILIKE $${idx} OR r.car_make ILIKE $${idx} OR r.car_model ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

    const result = await query(
      `SELECT
        r.id, r.full_name, r.email, r.phone_number, r.country_code,
        r.car_make, r.car_model, r.car_year, r.car_category,
        r.status, r.registration_number, r.created_at,
        r.driver_cpr, r.car_photo_url, r.driver_cpr_photo_url,
        r.has_passenger, r.passenger_name, r.passenger_cpr, r.passenger_mobile,
        r.check_in_status, r.inspection_status, r.rejection_reason,
        r.round_id
      FROM registrations r
      WHERE ${whereClause}
      ORDER BY r.created_at DESC`,
      values
    );

    // Get stats for this round
    const statsRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status='pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status='approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status='rejected' THEN 1 END) as rejected
      FROM registrations
      WHERE event_id=$1 AND round_id=$2`,
      [eventId, roundId]
    );

    // Get round info
    const roundRes = await query(
      `SELECT id, name, round_order, status, round_date FROM rounds WHERE id=$1`,
      [roundId]
    );

    return NextResponse.json({
      success: true,
      registrations: result.rows,
      stats: statsRes.rows[0],
      round: roundRes.rows[0] || null,
    }, { headers: getSecurityHeaders() });
  } catch (error: any) {
    console.error('Round registrations GET error:', error);
    const msg = String(error?.message || '');
    if (msg === 'NOT_AUTHENTICATED') return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (msg === 'FORBIDDEN' || msg === 'NO_EVENT_ACCESS') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/events/[id]/rounds/[roundId]/registrations
// Used to update status (approve/reject) or move registration to another round
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response!;

    const { id: eventId, roundId } = await params;
    await requireEventCapability(eventId, 'approve');

    const body = await request.json();
    const { registrationId, status, newRoundId } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'Missing registrationId' }, { status: 400 });
    }

    if (newRoundId) {
      // Move registration to another round
      await query(
        `UPDATE registrations SET round_id=$1 WHERE id=$2 AND event_id=$3`,
        [newRoundId, registrationId, eventId]
      );
      return NextResponse.json({ success: true, action: 'moved' }, { headers: getSecurityHeaders() });
    }

    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      await query(
        `UPDATE registrations SET status=$1 WHERE id=$2 AND event_id=$3`,
        [status, registrationId, eventId]
      );
      return NextResponse.json({ success: true, action: 'status_updated' }, { headers: getSecurityHeaders() });
    }

    return NextResponse.json({ error: 'No valid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Round registrations PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
