import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export type EventRole = 'event_admin' | 'approver' | 'data_entry' | 'gate' | 'viewer';
export type EventCapability =
  | 'view'
  | 'gate_scan'
  | 'approve'
  | 'edit_registration'
  | 'manage_rounds'
  | 'manage_staff';

const SESSION_COOKIE = 'carshowx_admin_token';

const GLOBAL_FULL_ACCESS_ROLES = new Set([
  'super_admin',
  'admin',
  'management',
]);

function roleAllows(capability: EventCapability, role: EventRole): boolean {
  if (role === 'event_admin') return true;

  switch (capability) {
    case 'view':
      return true;
    case 'gate_scan':
      return role === 'gate';
    case 'approve':
      return role === 'approver';
    case 'edit_registration':
      return role === 'data_entry' || role === 'approver';
    case 'manage_rounds':
      return false;
    case 'manage_staff':
      return false;
    default:
      return false;
  }
}

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessionResult = await query(
    `SELECT user_id FROM admin_sessions WHERE session_token = $1 AND is_active = true`,
    [token]
  );

  return sessionResult.rows[0]?.user_id || null;
}

export async function requireAdminUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('NOT_AUTHENTICATED');
  return userId;
}

export async function requireEventCapability(eventId: string, capability: EventCapability) {
  const userId = await requireAdminUserId();

  const userResult = await query(
    `SELECT id, role, is_active FROM admin_users WHERE id = $1`,
    [userId]
  );
  const user = userResult.rows[0];
  if (!user || user.is_active === false) throw new Error('FORBIDDEN');

  if (GLOBAL_FULL_ACCESS_ROLES.has(String(user.role))) {
    return { userId, globalRole: String(user.role), eventRole: 'event_admin' as EventRole };
  }

  const staffResult = await query(
    `SELECT event_role FROM event_admin_users WHERE event_id = $1::bigint AND admin_user_id = $2`,
    [eventId, userId]
  );

  const eventRole = staffResult.rows[0]?.event_role as EventRole | undefined;
  if (!eventRole) throw new Error('NO_EVENT_ACCESS');

  if (!roleAllows(capability, eventRole)) throw new Error('FORBIDDEN');

  return { userId, globalRole: String(user.role), eventRole };
}

export function isEventRole(value: unknown): value is EventRole {
  return (
    value === 'event_admin' ||
    value === 'approver' ||
    value === 'data_entry' ||
    value === 'gate' ||
    value === 'viewer'
  );
}
