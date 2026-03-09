import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    // Shred the VIP pass!
    response.cookies.delete('admin_session');
    return response;
}