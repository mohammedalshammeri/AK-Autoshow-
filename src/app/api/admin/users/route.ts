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
// TODO: Implement create using AdminService (needs new method)
export async function POST(request: NextRequest) {
    return NextResponse.json({ success: false, error: "Not implemented yet for Pg" }, { status: 501 });
}

// DELETE - Delete admin user
// TODO: Implement delete using AdminService (needs new method)
export async function DELETE(request: NextRequest) {
    return NextResponse.json({ success: false, error: "Not implemented yet for Pg" }, { status: 501 });
}
