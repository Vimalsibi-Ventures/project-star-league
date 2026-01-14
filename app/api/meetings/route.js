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

export async function DELETE(request) {
    const { id } = await request.json();
    const db = getDb();
    const idx = db.meetings.findIndex(m => m.id === id);
    if (idx !== -1) {
        // PATCH-H: Server Check
        if (db.meetings[idx].status === 'closed') return NextResponse.json({ error: 'Cannot delete closed meeting' }, { status: 400 });
        db.meetings.splice(idx, 1);
        saveDb(db);
    }
    return NextResponse.json({ success: true });
}