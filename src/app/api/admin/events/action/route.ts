import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify admin session
    const sessionResult = await query(
      `SELECT user_id FROM admin_sessions WHERE session_token = $1 AND is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, action } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action are required' },
        { status: 400 }
      );
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'delete') {
      console.log(`🗑️ Deleting event with ID: ${eventId}`);
      
      // Check if event exists
      const checkResult = await query(`SELECT id, name FROM events WHERE id = $1`, [eventId]);
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      
      const eventName = checkResult.rows[0].name;
      console.log(`🗑️ Found event: ${eventName}, proceeding with deletion...`);
      
      // Attempt hard delete (cascading normally handles children, but we'll try direct delete)
      try {
        await query(`DELETE FROM events WHERE id = $1`, [eventId]);
        result = { success: true };
      } catch (err: any) {
        console.log(`⚠️ Hard delete failed, trying soft delete:`, err.message);
        
        // Soft delete fallback
        await query(
            `UPDATE events SET status = 'deleted', name = $1, updated_at = NOW() WHERE id = $2`,
            [eventName + ' (محذوف)', eventId]
        );
        result = { success: true, softDelete: true };
      }
    } else {
      // Update status
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      await query(
        `UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, eventId]
      );
      result = { success: true };
    }

    return NextResponse.json({
      success: true,
      message: `Event ${action === 'delete' ? 'deleted' : action + 'd'} successfully`,
      verified: action === 'delete' ? 'Event processed' : undefined
    });

  } catch (error) {
    console.error('Error in event action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
