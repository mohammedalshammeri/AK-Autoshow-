/**
 * خدمة API للفعاليات
 * Event API Service
 */

import { query } from '@/lib/db' // Switch to Neon DB

export interface Event {
  id: string;
  name: string;
  description?: string;
  event_date?: string;
  location?: string;
  created_at?: string;
}

/**
 * جلب جميع الفعاليات المتاحة
 * Fetch all available events
 */
export async function getAvailableEvents(): Promise<Event[]> {
  try {
    const result = await query(
      `SELECT * FROM events WHERE (is_active = true OR status IN ('active', 'upcoming', 'paused')) ORDER BY event_date ASC`
    );

    if (result.rows.length === 0) {
      console.log('No events found in Neon DB');
    }

    return result.rows || [];
  } catch (error) {
    console.error('Database connection error (Neon):', error);
    return [];
  }
}

/**
 * جلب فعالية محددة بالـ ID
 * Get specific event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const result = await query(`SELECT * FROM events WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Database connection error (Neon):', error);
    return null;
  }
}
