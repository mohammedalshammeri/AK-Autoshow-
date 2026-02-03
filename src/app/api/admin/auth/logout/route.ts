// ================================================
// CarShowX Admin System - Logout API Endpoint
// Created: November 17, 2025
// Purpose: Handle admin user logout
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/auth';
import { AdminService } from '@/lib/SimpleAdminServicePg';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Admin logout request...');

    // Get token from cookies
    const token = request.cookies.get('carshowx_admin_token')?.value;
    
    if (token) {
      const adminService = new AdminService();
      await adminService.invalidateSession(token);
      console.log('✅ Session invalidated');
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { 
        status: 200,
        headers: getSecurityHeaders()
      }
    );

    // Clear authentication cookies
    response.cookies.delete('carshowx_admin_token');
    response.cookies.delete('carshowx_admin_session');

    return response;

  } catch (error) {
    console.error('❌ Logout error:', error);
    
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );

    // Still try to clear cookies
    response.cookies.delete('carshowx_admin_token');
    response.cookies.delete('carshowx_admin_session');
    
    return response;
  }
}
