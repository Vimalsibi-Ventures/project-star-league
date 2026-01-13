import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MEETING_STATUS } from '@/lib/constants';

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.meetings);
}

export async function POST(request) {
    const { date, type } = await request.json();
    const db = getDb();

    const newMeeting = {
        id: uuidv4(),
        date,
        type,
        status: MEETING_STATUS.DRAFT, // Enforce initial state
        roleAssignments: [], // Initialize empty
        createdAt: new Date().toISOString()
    };

    db.meetings.push(newMeeting);
    saveDb(db);
    return NextResponse.json(newMeeting);
}