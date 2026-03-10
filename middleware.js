import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    let session = request.cookies.get('admin_session');

    // 1. Handling the main Login Page (/admin)
    if (pathname === '/admin') {
        if (session) {
            // If they are already logged in and try to go to the login page, 
            // bounce them directly into the Command Center.
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        
        // If not logged in, let them see the lock screen, but tell the browser NOT to cache it.
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;
    }

    // 2. Protecting the Command Center (/admin/... and /api/admin/...)
    if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
        if (!session) {
            // No VIP pass? Kick them back to the login screen.
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }
    
    // 3. For all protected routes, apply strict no-cache headers to defeat the Back button.
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
}

// This tells the bouncer exactly which routes to stand in front of
export const config = {
    matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};