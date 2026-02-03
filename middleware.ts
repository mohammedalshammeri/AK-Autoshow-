import createMiddleware from 'next-intl/middleware';
import {routing} from './src/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle admin routes with authentication
  if (pathname.startsWith('/admin/')) {
    // Skip middleware for login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('carshowx_admin_token')?.value;
      if (!token) {
      console.log('🔒 Middleware: No admin token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.log('✅ Middleware: Admin token found, allowing access');
    return NextResponse.next();
  }
  
  // Handle other routes with intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ar|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
