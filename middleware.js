import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    let session = request.cookies.get('admin_session');

    // 1. If they land on the main login page, DESTROY any existing session.
    // This acts as a natural "Logout". If they hit 'Back' to reach this page, 
    // their session is cleared, forcing a fresh login if they try to go forward again.
    if (pathname === '/admin') {
        const response = NextResponse.next();
        
        // Tell the browser never to cache the login page
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        
        if (session) {
            response.cookies.delete('admin_session');
        }
        return response;
    }

    // 2. Protect everything INSIDE the /admin/ folder and your /api/admin/ endpoints
    if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
        if (!session) {
            // No pass? Kick them back to the login screen
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }
    
    // 3. Prevent the browser's "Back/Forward Cache" from bypassing security
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
}

// This tells the bouncer exactly which routes to stand in front of
export const config = {
    // Explicitly added '/admin' so the logout logic triggers perfectly
    matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};