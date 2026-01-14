import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeRoleTransactions } from '@/lib/scoringEngine';
import { MEETING_STATUS } from '@/lib/constants';
import { logRoleCallToSheets } from '@/lib/googleSheetsLogger';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // UPDATED CHECK: Must be AWARDS_ASSIGNED
    if (meeting.status !== MEETING_STATUS.AWARDS_ASSIGNED) {
        return NextResponse.json({ error: 'Awards must be assigned before closing' }, { status: 400 });
    }

    // 1. Generate Transactions (Role Stars)
    const newTransactions = computeRoleTransactions(meeting, roleAssignments);

    // 2. Commit to DB
    db.transactions.push(...newTransactions);

    meeting.status = MEETING_STATUS.CLOSED;
    // roleAssignments were already saved incrementally or passed here for finality. 
    // We update them just in case edits were made.
    meeting.roleAssignments = roleAssignments;

    saveDb(db);

    // 3. Logging
    await logRoleCallToSheets(meeting, roleAssignments, db.squadrons, db.members);

    return NextResponse.json({ success: true, count: newTransactions.length });
}