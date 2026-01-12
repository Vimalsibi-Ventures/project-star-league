import { NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/auth';

export async function POST(request) {
    const { username, password } = await request.json();

    if (validateAdmin(username, password)) {
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}