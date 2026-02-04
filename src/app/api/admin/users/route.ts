import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/SimpleAdminServicePg';

// GET - Get all admin users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    console.log('🔍 Fetching admin users...');
    
    // Check permission
    const adminService = new AdminService();
    // In a real scenario, you'd check if the current requester is a super_admin
    // For now, we assume this internal API is protected by middleware or the page logic

    if (userId) {
      const user = await adminService.getUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

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
    
    // Get current user for audit log
    const sessionToken = request.cookies.get('admin_session')?.value;
    let currentUserId = undefined;
    
    if (sessionToken) {
        const auth = await adminService.validateSession(sessionToken);
        if (auth.success && auth.user) {
            currentUserId = auth.user.id;
        }
    }
    
    const result = await adminService.createUser({ email, password, full_name, role }, currentUserId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT - Update admin user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, password, full_name, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const adminService = new AdminService();
    
    // Get current user for audit log
    const sessionToken = request.cookies.get('admin_session')?.value;
    let currentUserId = undefined;
    
    if (sessionToken) {
        const auth = await adminService.validateSession(sessionToken);
        if (auth.success && auth.user) {
            currentUserId = auth.user.id;
        }
    }

    const result = await adminService.updateUser(id, { email, password, full_name, role }, currentUserId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating user:', error);
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
    
    // Get current user for audit log
    const sessionToken = request.cookies.get('admin_session')?.value;
    let currentUserId = undefined;
    
    if (sessionToken) {
        const auth = await adminService.validateSession(sessionToken);
        if (auth.success && auth.user) {
            currentUserId = auth.user.id;
        }
    }

    const result = await adminService.deleteUser(finalUserId, currentUserId);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
