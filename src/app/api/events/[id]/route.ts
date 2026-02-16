import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Use SELECT * to stay compatible with older schemas (optional columns may not exist in prod).
    const sql = `SELECT * FROM events WHERE id = $1`;
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rawEvent = result.rows[0] as Record<string, any>;

    // Normalize common fields so UIs can rely on them even if columns are missing.
    const name = rawEvent.name ?? '';
    const description = rawEvent.description ?? '';
    const location = rawEvent.location ?? '';

    const event = {
      ...rawEvent,
      name,
      description,
      location,
      name_ar: rawEvent.name_ar ?? name,
      name_en: rawEvent.name_en ?? name,
      description_ar: rawEvent.description_ar ?? description,
      description_en: rawEvent.description_en ?? description,
      location_ar: rawEvent.location_ar ?? location,
      location_en: rawEvent.location_en ?? location,
      registration_count: rawEvent.registration_count ?? 0,
      max_participants: rawEvent.max_participants ?? null,
      settings: rawEvent.settings ?? {},
    };

    return NextResponse.json(event);

  } catch (error) {
    console.error('API Event Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}