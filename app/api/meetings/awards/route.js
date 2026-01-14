import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MEETING_STATUS, TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    const { meetingId, awards } = await request.json(); // awards = [{ title, memberId, squadronId, isGuest }]
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    if (meeting.status !== MEETING_STATUS.ATTENDANCE_FINALIZED) {
        return NextResponse.json({ error: 'Meeting must have finalized attendance before awards' }, { status: 400 });
    }

    const transactions = [];
    const timestamp = new Date().toISOString();

    // 1. Process Awards
    awards.forEach(award => {
        // PATCH-2 FIX: Guest Safety - Only award stars if squadronId exists and not guest
        if (award.squadronId && !award.isGuest) {
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: award.squadronId,
                memberId: award.memberId,
                category: TRANSACTION_CATEGORY.AWARD,
                description: `Award Winner: ${award.title}`,
                starsDelta: 5,
                timestamp,
                locked: true
            });
        }
        // Guests: No transaction, just saved in meeting.awards metadata below
    });

    // 2. Process Synergy (Existing Logic Preserved)
    const activeMembersBySquadron = {};

    if (meeting.roleAssignments) {
        meeting.roleAssignments.forEach(role => {
            if (role.squadronId && role.memberId && role.status === 'completed' && !role.fulfilledExternally) {
                if (!activeMembersBySquadron[role.squadronId]) {
                    activeMembersBySquadron[role.squadronId] = new Set();
                }
                activeMembersBySquadron[role.squadronId].add(role.memberId);
            }
        });
    }

    Object.entries(activeMembersBySquadron).forEach(([squadronId, memberSet]) => {
        const uniqueCount = memberSet.size;
        if (uniqueCount > 0) {
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: squadronId,
                memberId: null,
                category: TRANSACTION_CATEGORY.SYNERGY,
                description: `Synergy Bonus (${uniqueCount} Active Members)`,
                starsDelta: uniqueCount * 5,
                timestamp,
                locked: true
            });
        }
    });

    // 3. Update State & Save
    db.transactions.push(...transactions);
    meeting.status = MEETING_STATUS.AWARDS_ASSIGNED;
    meeting.awards = awards; // Persist award history (includes guests for audit)

    saveDb(db);
    return NextResponse.json({ success: true, count: transactions.length });
}