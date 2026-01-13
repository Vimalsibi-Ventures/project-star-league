import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeRoleTransactions } from '@/lib/scoringEngine';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // Validation: Must have attendance done before closing
    if (meeting.status !== MEETING_STATUS.ATTENDANCE_FINALIZED) {
        return NextResponse.json({ error: 'Attendance must be finalized first' }, { status: 400 });
    }

    const newTransactions = computeRoleTransactions(meeting, roleAssignments);

    db.transactions.push(...newTransactions);

    meeting.status = MEETING_STATUS.CLOSED;
    meeting.roleAssignments = roleAssignments; // Final save

    saveDb(db);
    return NextResponse.json({ success: true, count: newTransactions.length });
}