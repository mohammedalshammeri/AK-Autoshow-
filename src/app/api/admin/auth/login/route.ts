// ================================================
// CarShowX Admin System - Login API Endpoint
// Created: November 17, 2025
// Purpose: Handle admin user authentication
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/SimpleAdminServicePg';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin login attempt...');

    // Get request data
    let body;
    try {
      const text = await request.text();
      if (!text) {
         return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (e) {
      console.error('Login JSON parse error:', e);
      return NextResponse.json({ success: false, error: 'Invalid JSON request' }, { status: 400 });
    }

    const { email, password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const deviceInfo = { browser: userAgent.substring(0, 100) };

    console.log('🌐 Login attempt from:', { ip_address: ipAddress, user_agent: userAgent.substring(0, 100) });

    // Create admin service instance
    const adminService = new AdminService();

    // Authenticate user
    const result = await adminService.authenticateUser(
      email,
      password,
      rememberMe,
      deviceInfo,
      ipAddress
    );

    if (!result.success) {
      console.log('❌ Login failed:', result.error);
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }    console.log('✅ Login successful for:', email);

    // Create response with session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        full_name: result.user?.full_name,
        role: result.user?.role,
        permissions: result.user?.permissions,
        assigned_event_id: result.user?.assigned_event_id,
      },
      token: result.session?.token,
      expires_at: result.session?.expires_at
    });

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
    };    response.cookies.set('carshowx_admin_token', result.session?.token || '', cookieOptions);
    response.cookies.set('carshowx_admin_session', result.session?.id || '', cookieOptions);

    console.log('🍪 Cookies set for admin session');

    return response;

  } catch (error) {
    console.error('❌ Login API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
