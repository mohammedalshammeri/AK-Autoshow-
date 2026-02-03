// Admin authentication middleware
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip middleware for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get('akautoshow_admin_token')?.value;
    
    if (!token) {
      console.log('🔒 Admin middleware: No token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const payload = await verifyToken(token);
      if (!payload) {
        console.log('🔒 Admin middleware: Invalid token, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      console.log('✅ Admin middleware: Valid token for', payload.email);
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Admin middleware: Token verification failed', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}
