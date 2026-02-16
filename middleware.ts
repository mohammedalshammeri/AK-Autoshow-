import createMiddleware from 'next-intl/middleware';
import {routing} from './src/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

function parseOrganizerSession(raw?: string) {
  if (!raw) return null;
  const candidates = [raw];

  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // ignore decode errors
  }

  for (const value of candidates) {
    try {
      return JSON.parse(value);
    } catch {
      // try next candidate
    }
  }

  return null;
}

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

  // Organizer auth & routing (no internationalization)
  if (pathname === '/organizer' || pathname.startsWith('/organizer/')) {
    // Parse cookies
    const organizerSessionRaw = request.cookies.get('organizer_session')?.value;
    const organizerGuard = request.cookies.get('organizer_guard')?.value;
    const organizerSession = parseOrganizerSession(organizerSessionRaw);

    const debugCookiePrefix = (organizerSessionRaw || '').slice(0, 80);
    
    // DEBUG LOGGING
    console.log('🔍 Middleware Check:', {
      path: pathname,
      guard: organizerGuard,
      hasSession: !!organizerSession,
      eventId: organizerSession?.eventId,
      sessionRawPrefix: debugCookiePrefix
    });
    
    // Check authentication status
    const isAuthenticated = organizerGuard === '1' && organizerSession?.eventId;
    
    // Allow login page - it handles its own redirect
    if (pathname === '/organizer/login') {
      const res = NextResponse.next();
      res.headers.set('x-carshowx-mw', 'organizer');
      res.headers.set('x-carshowx-mw-auth', isAuthenticated ? '1' : '0');
      return res;
    }

    // All other organizer routes require authentication
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      const res = NextResponse.redirect(new URL('/organizer/login', request.url));
      res.headers.set('x-carshowx-mw', 'organizer');
      res.headers.set('x-carshowx-mw-auth', '0');
      return res;
    }

    // Enforce event isolation: organizer can only access assigned event
    if (pathname.startsWith('/organizer/events/')) {
      const pathParts = pathname.split('/');
      const routeEventId = pathParts[3];
      if (routeEventId && String(organizerSession?.eventId) !== String(routeEventId)) {
        console.log('⚠️ Event mismatch, redirecting');
        const res = NextResponse.redirect(new URL(`/organizer/events/${organizerSession.eventId}`, request.url));
        res.headers.set('x-carshowx-mw', 'organizer');
        res.headers.set('x-carshowx-mw-auth', '1');
        res.headers.set('x-carshowx-mw-event-mismatch', '1');
        return res;
      }
    }

    console.log('✅ Authenticated, allowing access');
    const res = NextResponse.next();
    res.headers.set('x-carshowx-mw', 'organizer');
    res.headers.set('x-carshowx-mw-auth', '1');
    return res;
  }
  
  // Handle other routes with intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match ALL paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.mp4$|.*\\.webm$|.*\\.mp3$|.*\\.mp4$|.*\\.webm$|.*\\.mp3$).*)',
  ]
};
