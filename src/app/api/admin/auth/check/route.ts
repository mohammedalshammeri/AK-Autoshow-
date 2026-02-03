// ================================================
// CarShowX Admin System - Auth Check API Endpoint (Simplified)
// Purpose: Verify admin authentication status using session tokens
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { AdminService } from '@/lib/SimpleAdminServicePg';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking admin authentication...');

    // Get token from cookies
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json(
        { authenticated: false, error: 'No token found' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    console.log('🔍 Found token, checking session...');

    const adminService = new AdminService();
    const result = await adminService.validateSession(token);

    if (!result.success || !result.user) {
      console.log('❌ Session not found or inactive');
      return NextResponse.json(
        { authenticated: false, error: 'Session invalid' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }
    
    const user = result.user;

    console.log('✅ User authenticated:', user.email);

    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          permissions: user.permissions,
        }
      },
      { 
        status: 200,
        headers: getSecurityHeaders()
      }
    );

  } catch (error) {
    console.error('❌ Auth check error:', error);
    
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}
