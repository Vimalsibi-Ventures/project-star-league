import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // Validate State
    if (meeting.status === MEETING_STATUS.CLOSED) {
        return NextResponse.json({ error: 'Meeting is closed' }, { status: 400 });
    }

    // Save Assignments
    meeting.roleAssignments = roleAssignments;

    // Transition to MEETING_LIVE if in correct previous state
    // This allows the Admin to "Lock Assignments" and prepare for the meeting
    if ([MEETING_STATUS.AUCTION_FINALIZED, MEETING_STATUS.ROLE_RESOLUTION].includes(meeting.status)) {
        meeting.status = MEETING_STATUS.MEETING_LIVE;
    }

    saveDb(db);
    return NextResponse.json({ success: true, status: meeting.status });
}