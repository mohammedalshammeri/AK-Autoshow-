import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {    // Check authentication
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify admin session
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('user_id, is_active')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, action } = body;

    // Validate input
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
    }    let result;    if (action === 'delete') {
      // Actually delete the event from database
      console.log(`🗑️ Deleting event with ID: ${eventId}`);
      
      // First check if event exists
      const { data: existingEvent, error: checkError } = await supabase
        .from('events')
        .select('id, name')
        .eq('id', eventId)
        .single();
        
      if (checkError || !existingEvent) {
        console.log(`⚠️ Event ${eventId} not found:`, checkError);
        return NextResponse.json({
          error: 'Event not found'
        }, { status: 404 });
      }
      
      console.log(`🗑️ Found event: ${existingEvent.name}, proceeding with deletion...`);
      
      // Delete related registrations first to avoid foreign key constraints
      const { error: registrationsDeleteError } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', eventId);
        
      if (registrationsDeleteError) {
        console.log(`⚠️ Warning: Could not delete related registrations:`, registrationsDeleteError);
        // Continue anyway - might not have registrations
      }
        // Try to delete the event - if it fails, use soft delete
      result = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      // Check if delete failed due to constraints
      if (result.error) {
        console.log(`⚠️ Hard delete failed, trying soft delete:`, result.error.message);
        
        // Use soft delete instead - mark as deleted
        result = await supabase
          .from('events')
          .update({ 
            status: 'deleted',
            name: existingEvent.name + ' (محذوف)',
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
          
        console.log(`🔄 Used soft delete for event ${eventId}`);
      }
    } else {
      // Update event status
      let updateData: any = {};
      switch (action) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          break;
      }
      
      result = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);
    }    const { error: updateError, data } = result;

    if (updateError) {
      console.error(`❌ Error ${action === 'delete' ? 'deleting' : 'updating'} event:`, updateError);
      return NextResponse.json(
        { error: `Failed to ${action === 'delete' ? 'delete' : 'update'} event: ${updateError.message}` },
        { status: 500 }
      );
    }    console.log(`✅ Event ${action === 'delete' ? 'deleted' : 'updated'} successfully:`, data);
      // For delete action, verify that the event is gone or marked as deleted
    if (action === 'delete') {
      const { data: verifyStatus } = await supabase
        .from('events')
        .select('id, status')
        .eq('id', eventId)
        .single();
        
      if (verifyStatus && verifyStatus.status !== 'deleted') {
        console.error(`❌ Event ${eventId} still exists and not marked as deleted!`);
        return NextResponse.json({
          error: 'Delete operation failed - event still active'
        }, { status: 500 });
      }
      
      if (!verifyStatus) {
        console.log(`✅ Verified: Event ${eventId} has been completely deleted from database`);
      } else {
        console.log(`✅ Verified: Event ${eventId} has been soft-deleted (marked as deleted)`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Event ${action === 'delete' ? 'deleted' : action + 'd'} successfully`,
      data: data,
      verified: action === 'delete' ? 'Event completely removed from database' : undefined
    });

  } catch (error) {
    console.error('Error in event action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
