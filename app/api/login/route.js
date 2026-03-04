import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        // Check if the credentials match using your updated auth.js file
        if (validateAdmin(username, password)) {
            
            // Give the browser a secure VIP pass that lasts for 7 days
            cookies().set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, 
                path: '/',
            });
            
            // Your frontend already expects this success message, so we leave it unchanged
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}