import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/SimpleAdminServicePg';

// GET - Get all admin users
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching admin users...');
    
    // Check permission
    const adminService = new AdminService();
    // In a real scenario, you'd check if the current requester is a super_admin
    // For now, we assume this internal API is protected by middleware or the page logic

    const result = await adminService.getAllUsers();

    if (!result.success) {
      console.error('❌ Error fetching users:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    console.log('✅ Users fetched successfully:', result.data?.length);

    return NextResponse.json({
      success: true,
      users: result.data || []
    });

  } catch (error) {
    console.error('❌ General error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const adminService = new AdminService();
    // TODO: Get current user ID from session/token for 'createdBy'
    const result = await adminService.createUser({ email, password, full_name, role });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    // Also try checking body if searchParams extraction fails or is preferred
    // But standard REST often uses ID in URL path or query for collection delete (though weird for collection root)
    let finalUserId = userId;
    if (!finalUserId) {
        try {
            const body = await request.json();
            finalUserId = body.id;
        } catch (e) {
            // Ignore body parse error, maybe it was just query params
        }
    }

    if (!finalUserId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const adminService = new AdminService();
    // TODO: Get current user ID for 'requestingUserId' to prevent self-deletion
    const result = await adminService.deleteUser(finalUserId);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
