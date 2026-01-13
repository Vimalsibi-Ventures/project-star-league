import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeRoleTransactions } from '@/lib/scoringEngine';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    if (meeting.status === 'closed') return NextResponse.json({ error: 'Meeting already closed' }, { status: 400 });

    // 1. Generate Transactions
    const newTransactions = computeRoleTransactions(meeting, roleAssignments);

    // 2. Commit to DB
    db.transactions.push(...newTransactions);

    // 3. Close Meeting
    meeting.status = 'closed';
    meeting.roleAssignments = roleAssignments; // Archive

    saveDb(db);
    return NextResponse.json({ success: true, count: newTransactions.length });
}