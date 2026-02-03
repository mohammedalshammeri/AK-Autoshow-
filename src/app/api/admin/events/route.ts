// Admin Events API Endpoint
// Get all events for management

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📅 Loading events...');

    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Verify session
    const sessionResult = await query(
      `SELECT user_id, is_active FROM admin_sessions 
       WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Get all events
    const eventsResult = await query(
      `SELECT id, name, description, event_date, location, created_at 
       FROM events 
       ORDER BY created_at DESC`
    );

    const events = eventsResult.rows;

    console.log(`✅ Loaded ${events.length} events`);

    return NextResponse.json(
      { 
        success: true, 
        events: events,
        total: events.length
      },
      { 
        status: 200,
        headers: getSecurityHeaders()
      }
    );

  } catch (error: any) {
    console.error('❌ Events API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('carshowx_admin_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { name, event_date, location, description, name_ar, name_en, location_ar, location_en, description_ar, description_en } = body;

    const result = await query(
      `INSERT INTO events (name, event_date, location, description, name_ar, name_en, location_ar, location_en, description_ar, description_en) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, event_date, location, description, name_ar, name_en, location_ar, location_en, description_ar, description_en]
    );

    return NextResponse.json({ success: true, event: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('carshowx_admin_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { id, name, event_date, location, description, name_ar, name_en, location_ar, location_en, description_ar, description_en } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });

    const result = await query(
      `UPDATE events SET 
         name=$1, event_date=$2, location=$3, description=$4, 
         name_ar=$5, name_en=$6, location_ar=$7, location_en=$8, description_ar=$9, description_en=$10,
         updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, event_date, location, description, name_ar, name_en, location_ar, location_en, description_ar, description_en, id]
    );

    return NextResponse.json({ success: true, event: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('carshowx_admin_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });

    await query('DELETE FROM events WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
