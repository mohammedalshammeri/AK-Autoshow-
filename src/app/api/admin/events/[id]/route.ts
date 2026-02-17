
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Construct dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Allowed fields to update
    const fields = [
      'name', 'description', 'event_date', 'location', 'status',
      'name_ar', 'name_en', 'description_ar', 'description_en', 
      'location_ar', 'location_en', 'image_url', 'max_participants'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // Add ID as the last parameter
    values.push(id);
    
    const queryText = `UPDATE events SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: result.rows[0] });

  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
