'use server';

import { query } from '@/lib/db';
import { requireEventCapability } from '@/lib/event-permissions';

export async function getEventRegistrations(eventId: string) {
  try {
    await requireEventCapability(eventId, 'view');
    const sql = `
      SELECT 
        r.*, 
        u.username, 
        u.role as user_role,
        u.plain_password
      FROM registrations r
      LEFT JOIN users u ON u.registration_id = r.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await query(sql, [eventId]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    console.error('Error fetching event registrations:', error);
    return { success: false, error: error.message };
  }
}

export async function getEventDetails(eventId: string) {
    try {
    await requireEventCapability(eventId, 'view');
        const sql = `SELECT * FROM events WHERE id = $1`;
        const result = await query(sql, [eventId]);
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
