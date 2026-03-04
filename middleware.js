import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow people to see the main login page (/admin) so they can actually log in!
    if (pathname === '/admin') {
        return NextResponse.next();
    }

    // Protect everything INSIDE the /admin/ folder and your /api/admin/ endpoints
    if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
        
        // Ask the browser to show the VIP pass
        let session = request.cookies.get('admin_session');

        if (!session) {
            // No pass? Kick them back to the login screen
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }
    
    return NextResponse.next();
}

// This tells the bouncer exactly which routes to stand in front of
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};