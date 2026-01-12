import { NextResponse } from 'next/server';
import { getMeetings, createMeeting, finalizeMeeting } from '@/lib/data';

export async function GET() {
    return NextResponse.json(getMeetings());
}

export async function POST(request) {
    const data = await request.json();
    const meeting = createMeeting(data);
    return NextResponse.json(meeting);
}

export async function PUT(request) {
    const { id } = await request.json();
    finalizeMeeting(id);
    return NextResponse.json({ success: true });
}