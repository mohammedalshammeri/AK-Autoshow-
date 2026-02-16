import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query(`
      SELECT 
        e.name as "eventName",
        e.event_date as "eventDate", 
        e.location,
        COUNT(r.id) as "totalRegistrations",
        COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as "pendingCount",
        COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as "approvedCount",
        COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) as "rejectedCount"
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, e.name, e.event_date, e.location
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const data = result.rows[0];
    data.eventDate = new Date(data.eventDate).toLocaleDateString('ar-BH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch event stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
