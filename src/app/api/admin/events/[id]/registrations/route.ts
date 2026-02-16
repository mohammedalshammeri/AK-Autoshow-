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
        id,
        full_name,
        email,
        phone_number,
        country_code,
        car_make,
        car_model,
        car_year,
        status,
        registration_number,
        created_at
      FROM registrations
      WHERE event_id = $1
      ORDER BY created_at DESC
    `, [id]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
