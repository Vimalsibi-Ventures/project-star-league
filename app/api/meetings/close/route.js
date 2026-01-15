import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeRoleTransactions, computeTableTopicsTransactions, computePenaltyTransactions } from '@/lib/scoringEngine';
import { computeSubstitutionTransactions } from '@/lib/substitutionEngine'; // NEW
import { evaluateSpeech, getRotationState } from '@/lib/rotationEngine';
import { MEETING_STATUS } from '@/lib/constants';
import { logRoleCallToSheets } from '@/lib/googleSheetsLogger';

export async function POST(request) {
    const { meetingId, roleAssignments } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    if (meeting.status !== MEETING_STATUS.AWARDS_ASSIGNED) {
        return NextResponse.json({ error: 'Awards must be assigned before closing' }, { status: 400 });
    }

    const closedCount = db.meetings.filter(m => m.status === MEETING_STATUS.CLOSED).length;
    const currentMeetingIndex = closedCount + 1;

    // 1. Standard Role Stars
    const roleTransactions = computeRoleTransactions(meeting, roleAssignments);

    // 2. Table Topics / Activity Rewards
    const ttTransactions = computeTableTopicsTransactions(meeting);

    // 3. Governance: Substitution Fees (Phase 3.3)
    const subTransactions = computeSubstitutionTransactions(meeting, roleAssignments, db.members);

    // 4. Governance: Penalties (Phase 3.3)
    const penaltyTransactions = computePenaltyTransactions(meeting, roleAssignments);

    // 5. Rotation & Cooldowns
    const updatedSquadrons = [...db.squadrons];
    const updatedMembers = [...db.members];
    const rotationTransactions = [];

    roleAssignments.forEach(assignment => {
        const isSpeaker = assignment.roleName.toLowerCase().includes('speaker');
        const isCompleted = assignment.status === 'completed';

        if (isSpeaker && isCompleted) {
            const isGuest = assignment.fulfilledExternally;
            if (isGuest) return;

            const squadronIdx = updatedSquadrons.findIndex(s => s.id === assignment.squadronId);
            const memberIdx = updatedMembers.findIndex(m => m.id === assignment.memberId);

            if (squadronIdx > -1 && memberIdx > -1) {
                const squadron = updatedSquadrons[squadronIdx];
                const member = updatedMembers[memberIdx];
                const squadMembers = updatedMembers.filter(m => m.squadronId === squadron.id);

                squadron.rotationState = getRotationState(squadron, squadMembers);
                const result = evaluateSpeech(squadron, member, currentMeetingIndex, false);

                updatedSquadrons[squadronIdx].rotationState = result.nextState;
                updatedMembers[memberIdx].lastSpeechMeetingIndex = result.nextCooldownIndex;

                if (result.isBonusEligible) {
                    rotationTransactions.push({
                        id: crypto.randomUUID(),
                        meetingId: meeting.id,
                        squadronId: squadron.id,
                        memberId: member.id,
                        category: 'rotation_bonus',
                        description: 'Fair Play Rotation Bonus',
                        starsDelta: 5,
                        timestamp: new Date().toISOString(),
                        locked: true
                    });
                }
            }
        }
    });

    // 6. Commit All
    db.squadrons = updatedSquadrons;
    db.members = updatedMembers;

    db.transactions.push(
        ...roleTransactions,
        ...ttTransactions,
        ...rotationTransactions,
        ...subTransactions, // Add Subs
        ...penaltyTransactions // Add Penalties
    );

    meeting.status = MEETING_STATUS.CLOSED;
    meeting.roleAssignments = roleAssignments;

    saveDb(db);

    await logRoleCallToSheets(meeting, roleAssignments, db.squadrons, db.members);

    return NextResponse.json({
        success: true,
        count: db.transactions.length
    });
}