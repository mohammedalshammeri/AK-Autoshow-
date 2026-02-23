import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';
import { isEventRole } from '@/lib/event-permissions';

const SESSION_COOKIE = 'carshowx_admin_token';

async function requireAdminSession(request: NextRequest): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: getSecurityHeaders() }
      ),
    };
  }

  const sessionResult = await query(
    `SELECT user_id FROM admin_sessions WHERE session_token = $1 AND is_active = true`,
    [token]
  );

  const userId = sessionResult.rows[0]?.user_id as string | undefined;
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401, headers: getSecurityHeaders() }
      ),
    };
  }

  return { ok: true, userId };
}

async function requireManageStaff(eventId: string, userId: string): Promise<boolean> {
  const userResult = await query(`SELECT role, is_active FROM admin_users WHERE id = $1`, [userId]);
  const user = userResult.rows[0];
  if (!user || user.is_active === false) return false;

  const globalRole = String(user.role);
  if (globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'management' || globalRole === 'organizer') return true;

  const staffResult = await query(
    `SELECT event_role FROM event_admin_users WHERE event_id = $1::bigint AND admin_user_id = $2`,
    [eventId, userId]
  );
  return String(staffResult.rows[0]?.event_role || '') === 'event_admin';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId } = await params;
    const allowed = await requireManageStaff(eventId, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const result = await query(
      `SELECT 
        au.id,
        au.email,
        au.full_name,
        au.is_active,
        au.role as global_role,
        eau.event_role
      FROM admin_users au
      LEFT JOIN event_admin_users eau
        ON eau.admin_user_id = au.id AND eau.event_id = $1::bigint
      ORDER BY au.full_name ASC NULLS LAST, au.email ASC`,
      [eventId]
    );

    return NextResponse.json(
      { success: true, users: result.rows },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event staff GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
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
    const allowed = await requireManageStaff(eventId, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const adminUserId = String(body?.adminUserId || '');
    const eventRole = body?.eventRole;

    if (!adminUserId || !isEventRole(eventRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    await query(
      `INSERT INTO event_admin_users (event_id, admin_user_id, event_role)
       VALUES ($1::bigint, $2, $3)
       ON CONFLICT (event_id, admin_user_id)
       DO UPDATE SET event_role = EXCLUDED.event_role, updated_at = NOW()`,
      [eventId, adminUserId, eventRole]
    );

    return NextResponse.json(
      { success: true },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event staff POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId } = await params;
    const allowed = await requireManageStaff(eventId, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const adminUserId = String(body?.adminUserId || '');
    const eventRole = body?.eventRole;

    if (!adminUserId || !isEventRole(eventRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const result = await query(
      `UPDATE event_admin_users
       SET event_role = $1, updated_at = NOW()
       WHERE event_id = $2::bigint AND admin_user_id = $3
       RETURNING id`,
      [eventRole, eventId, adminUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event staff PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id: eventId } = await params;
    const allowed = await requireManageStaff(eventId, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json().catch(() => ({}));
    const adminUserId = String(body?.adminUserId || '');

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    await query(
      `DELETE FROM event_admin_users WHERE event_id = $1::bigint AND admin_user_id = $2`,
      [eventId, adminUserId]
    );

    return NextResponse.json(
      { success: true },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: any) {
    console.error('❌ Event staff DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
