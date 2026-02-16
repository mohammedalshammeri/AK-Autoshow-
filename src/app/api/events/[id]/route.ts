import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const sql = `SELECT id, name, description, event_date, location, settings, event_type, name_ar, name_en, description_ar, description_en, location_ar, location_en, max_participants, registration_count FROM events WHERE id = $1`;
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = result.rows[0];
    return NextResponse.json(event);

  } catch (error) {
    console.error('API Event Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}