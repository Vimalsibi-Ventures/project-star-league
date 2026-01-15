import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    // 1. Accept tableTopics and ttLocked in payload
    const { meetingId, roleAssignments, tableTopics, ttLocked } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    if (meeting.status === MEETING_STATUS.CLOSED) {
        return NextResponse.json({ error: 'Meeting is closed' }, { status: 400 });
    }

    // Server-Side Exclusivity Check (Existing)
    const speakerIds = new Set();
    for (const role of roleAssignments) {
        if (role.roleName.toLowerCase().includes('speaker') && role.memberId && !role.fulfilledExternally) {
            if (speakerIds.has(role.memberId)) {
                return NextResponse.json({ error: 'Violation: A member cannot hold multiple Speaker slots.' }, { status: 400 });
            }
            speakerIds.add(role.memberId);
        }
    }
    for (const role of roleAssignments) {
        if (!role.roleName.toLowerCase().includes('speaker') && role.memberId && !role.fulfilledExternally) {
            if (speakerIds.has(role.memberId)) {
                return NextResponse.json({ error: `Violation: Speaker cannot also be ${role.roleName}` }, { status: 400 });
            }
        }
    }

    // 2. Persist Role Assignments
    meeting.roleAssignments = roleAssignments;

    // 3. Persist Table Topics (PATCH 3: State Machine & Lock)
    if (tableTopics) {
        // Respect Lock: If already locked, do not allow updates unless we are explicitly setting the lock (ttLocked=true)
        if (meeting.tableTopics?.locked && !ttLocked) {
            // Silently ignore updates to TT if locked to preserve final state
        } else {
            meeting.tableTopics = {
                participants: tableTopics.participants || [],
                locked: ttLocked || meeting.tableTopics?.locked || false // Persist lock state
            };
        }
    }

    if ([MEETING_STATUS.AUCTION_FINALIZED, MEETING_STATUS.ROLE_RESOLUTION].includes(meeting.status)) {
        meeting.status = MEETING_STATUS.MEETING_LIVE;
    }

    saveDb(db);
    return NextResponse.json({ success: true, status: meeting.status });
}