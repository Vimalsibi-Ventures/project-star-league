import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    if (meeting.status === MEETING_STATUS.CLOSED) {
        return NextResponse.json({ error: 'Meeting is closed' }, { status: 400 });
    }

    // PATCH-C: Server Side Exclusivity Check
    const speakerIds = new Set();
    for (const role of roleAssignments) {
        if (role.roleName.toLowerCase().includes('speaker') && role.memberId && !role.fulfilledExternally) {
            // Check if this member is already a speaker
            if (speakerIds.has(role.memberId)) {
                return NextResponse.json({ error: 'Violation: A member cannot hold multiple Speaker slots.' }, { status: 400 });
            }
            speakerIds.add(role.memberId);
        }
    }
    // Check if speakers hold other roles
    for (const role of roleAssignments) {
        if (!role.roleName.toLowerCase().includes('speaker') && role.memberId && !role.fulfilledExternally) {
            if (speakerIds.has(role.memberId)) {
                return NextResponse.json({ error: `Violation: Speaker cannot also be ${role.roleName}` }, { status: 400 });
            }
        }
    }

    meeting.roleAssignments = roleAssignments;

    if ([MEETING_STATUS.AUCTION_FINALIZED, MEETING_STATUS.ROLE_RESOLUTION].includes(meeting.status)) {
        meeting.status = MEETING_STATUS.ROLE_RESOLUTION; // Keep in Resolution until explicit Go Live? 
        // Prompt says "Save Assignments & Go Live". So lets move to Live.
        // Actually, logic is usually 2 buttons. Here payload is saved.
        // Let's stick to existing flow: if pre-meeting, update status to Live.
        // Wait, UI says "Save & Go Live".
        meeting.status = MEETING_STATUS.MEETING_LIVE;
    }

    saveDb(db);
    return NextResponse.json({ success: true, status: meeting.status });
}