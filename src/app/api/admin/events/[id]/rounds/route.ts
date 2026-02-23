import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireEventCapability } from '@/lib/event-permissions';
import { getSecurityHeaders } from '@/lib/auth';

async function requireAdminSession(request: NextRequest) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('carshowx_admin_token')?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }
  const result = await query(
    `SELECT s.user_id, u.role FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.session_token = $1 AND s.is_active = true`,
    [token]
  );
  if (result.rows.length === 0) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid session' }, { status: 401 }) };
  }
  return { ok: true, userId: result.rows[0].user_id, role: result.rows[0].role };
}

// GET /api/admin/events/[id]/rounds
// Returns all rounds for an event with registration counts per round
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response!;

    const { id: eventId } = await params;
    await requireEventCapability(eventId, 'view');

    const result = await query(
      `SELECT
        r.id,
        r.name,
        r.round_order,
        r.status,
        r.round_date,
        r.created_at,
        COUNT(reg.id) AS registration_count,
        COUNT(CASE WHEN reg.status = 'approved' THEN 1 END) AS approved_count,
        COUNT(CASE WHEN reg.status = 'pending' THEN 1 END) AS pending_count
      FROM rounds r
      LEFT JOIN registrations reg ON reg.round_id = r.id::text
      WHERE r.event_id = $1
      GROUP BY r.id, r.name, r.round_order, r.status, r.round_date, r.created_at
      ORDER BY r.round_order ASC`,
      [eventId]
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('GET /api/admin/events/[id]/rounds error:', error);
    const msg = String(error?.message || '');
    if (msg === 'NOT_AUTHENTICATED') return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (msg === 'FORBIDDEN' || msg === 'NO_EVENT_ACCESS') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
