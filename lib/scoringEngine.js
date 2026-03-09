import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

/**
 * PURE FUNCTION
 * Computes attendance-, lateness-, and admin-level transactions for a meeting.
 * DOES NOT handle roles or speeches anymore.
 */
export function computeMeetingTransactions(meeting, squadronId, inputs) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    const STARS = {
        ATTENDANCE: meeting.type === 'online' ? 5 : 10,
        PERFECT_ATTENDANCE_BONUS: 20,
        LATENESS_PENALTY: -5
    };

    // 1. Attendance (per member)
    inputs.attendedMemberIds.forEach(memberId => {
        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId,
            memberId,
            category: 'attendance', 
            description: `Attended ${meeting.type} meeting`,
            starsDelta: STARS.ATTENDANCE,
            timestamp
        });
    });

    // 2. Perfect Attendance Bonus (Full House Rule)
    // We get the actual size of the squadron. If it matches attendance, boom! Bonus.
    const totalMembers = inputs.totalMembersCount || 4; // Fallback just in case
    
    if (inputs.attendedMemberIds.length === totalMembers && totalMembers > 0) {
        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId,
            memberId: null,
            category: 'bonus',
            description: `Full House Attendance Bonus (${totalMembers}/${totalMembers})`,
            starsDelta: STARS.PERFECT_ATTENDANCE_BONUS,
            timestamp
        });
    }

    // 3. Lateness Penalty (per member)
    inputs.lateMemberIds.forEach(memberId => {
        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId,
            memberId,
            category: 'penalty',
            description: 'Late arrival penalty',
            starsDelta: STARS.LATENESS_PENALTY,
            timestamp
        });
    });

    // 4. Manual Adjustment (admin-only, squadron-level)
    if (inputs.manualAdjustment && inputs.manualAdjustment !== 0) {
        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId,
            memberId: null,
            category: 'manual',
            description: 'Admin adjustment',
            starsDelta: inputs.manualAdjustment,
            timestamp
        });
    }

    return transactions;
}

export function computeRoleTransactions(meeting, roleAssignments) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    roleAssignments.forEach(assignment => {
        if (assignment.fulfilledExternally || !assignment.memberId || assignment.status !== 'completed') {
            return;
        }

        let stars = 0;
        const role = assignment.roleName.toLowerCase();

        if (role.includes('speaker')) stars = 10;
        else if (role.includes('evaluator')) stars = 5;
        else stars = 5; 

        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId: assignment.squadronId,
            memberId: assignment.memberId,
            category: TRANSACTION_CATEGORY.ROLE,
            description: `Role: ${assignment.roleName}`,
            starsDelta: stars,
            timestamp,
            locked: true
        });
    });

    return transactions;
}

export function computeTableTopicsTransactions(meeting) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    if (!meeting.tableTopics || !meeting.tableTopics.participants) {
        return [];
    }

    const participants = meeting.tableTopics.participants;
    const squadMap = {};

    participants.forEach(p => {
        if (p.isGuest || !p.memberId || !p.squadronId) return;

        if (!squadMap[p.squadronId]) {
            squadMap[p.squadronId] = [];
        }
        squadMap[p.squadronId].push(p);
    });

    Object.keys(squadMap).forEach(squadronId => {
        const squadParticipants = squadMap[squadronId];
        squadParticipants.sort((a, b) => a.orderIndex - b.orderIndex);

        squadParticipants.forEach((p, index) => {
            const isFirst = index === 0;
            const reward = isFirst ? 15 : 10;
            const desc = isFirst ? 'TT/Activity Leader (+15)' : 'TT/Activity Participant (+10)';

            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: squadronId,
                memberId: p.memberId,
                category: TRANSACTION_CATEGORY.TT_INDIVIDUAL,
                description: desc,
                starsDelta: reward,
                timestamp,
                locked: true
            });
        });

        const count = squadParticipants.length;
        if (count > 0) {
            const synergyStars = 5 * count;
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: squadronId,
                memberId: null, 
                category: TRANSACTION_CATEGORY.TT_SYNERGY,
                description: `TT/Activity Synergy (${count} members)`,
                starsDelta: synergyStars,
                timestamp,
                locked: true
            });
        }
    });

    return transactions;
}

export function computePenaltyTransactions(meeting, roleAssignments) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    const lateMemberIds = new Set();
    if (meeting.scoringData) {
        Object.values(meeting.scoringData).forEach(data => {
            if (data.lateMemberIds) data.lateMemberIds.forEach(id => lateMemberIds.add(id));
        });
    }

    roleAssignments.forEach(assignment => {
        const isSpeaker = assignment.roleName.toLowerCase().includes('speaker');
        if (isSpeaker && assignment.status === 'no-show' && assignment.winningSquadronId) {
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: assignment.winningSquadronId,
                memberId: null,
                category: TRANSACTION_CATEGORY.SPEAKER_NO_SHOW,
                description: `Fine: Failed to produce speaker for ${assignment.roleName}`,
                starsDelta: -20,
                timestamp,
                locked: true
            });
        }

        if (assignment.memberId && assignment.status === 'completed' && !assignment.fulfilledExternally) {
            if (lateMemberIds.has(assignment.memberId)) {
                transactions.push({
                    id: uuidv4(),
                    meetingId: meeting.id,
                    squadronId: assignment.squadronId,
                    memberId: assignment.memberId,
                    category: TRANSACTION_CATEGORY.LATENESS_PENALTY,
                    description: `Penalty: Role holder arrived late (${assignment.roleName})`,
                    starsDelta: -5,
                    timestamp,
                    locked: true
                });
            }
        }
    });

    return transactions;
}