import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

/**
 * PURE FUNCTION
 * Computes attendance-, lateness-, and admin-level transactions for a meeting.
 * DOES NOT handle roles or speeches anymore.
 *
 * @param {Object} meeting
 * @param {String} squadronId
 * @param {Object} inputs
 * {
 * attendedMemberIds: [],
 * lateMemberIds: [],
 * manualAdjustment?: number
 * }
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
            category: 'attendance', // Keeping simple strings for legacy compat if constants not fully everywhere yet, or use TRANSACTION_CATEGORY.ATTENDANCE if preferred
            description: `Attended ${meeting.type} meeting`,
            starsDelta: STARS.ATTENDANCE,
            timestamp
        });
    });

    // 2. Perfect Attendance Bonus (squadron-level)
    if (inputs.attendedMemberIds.length >= 4) {
        transactions.push({
            id: uuidv4(),
            meetingId: meeting.id,
            squadronId,
            memberId: null,
            category: 'bonus',
            description: 'Perfect Attendance Bonus (4/4)',
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

/**
 * PURE FUNCTION
 * Computes role- and speech-based transactions AFTER a meeting,
 * based on actual member performance.
 *
 * NOTE: We do not import rotationEngine here directly to avoid circular deps or logic pollution.
 * The API route will handle the orchestration of State Updates vs Transaction Generation.
 */
export function computeRoleTransactions(meeting, roleAssignments) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    roleAssignments.forEach(assignment => {
        // Skip Guests or incomplete
        if (assignment.fulfilledExternally || !assignment.memberId || assignment.status !== 'completed') {
            return;
        }

        // 1. Standard Role Stars
        // Speaker: 10, Evaluator: 5, TAG/Functionary: 5
        let stars = 0;
        const role = assignment.roleName.toLowerCase();

        if (role.includes('speaker')) stars = 10;
        else if (role.includes('evaluator')) stars = 5;
        else stars = 5; // TMOD, GE, TAG, etc.

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

/**
 * NEW: Compute Table Topics / Activity Rewards
 * Implements the Unbounded Participation Engine rules.
 * * Rules:
 * 1. Guests ignored.
 * 2. Members grouped by Squadron.
 * 3. Sorted by Temporal Order (orderIndex).
 * 4. First member per squad = +15 (Leader).
 * 5. Others per squad = +10.
 * 6. Squadron Synergy = 5 * count.
 */
export function computeTableTopicsTransactions(meeting) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    // Safety check
    if (!meeting.tableTopics || !meeting.tableTopics.participants) {
        return [];
    }

    const participants = meeting.tableTopics.participants;

    // STEP 1: Filter & Group (Ignore Guests)
    // Map<squadronId, Array<Participant>>
    const squadMap = {};

    participants.forEach(p => {
        if (p.isGuest || !p.memberId || !p.squadronId) return;

        if (!squadMap[p.squadronId]) {
            squadMap[p.squadronId] = [];
        }
        squadMap[p.squadronId].push(p);
    });

    // STEP 2: Process Each Squadron
    Object.keys(squadMap).forEach(squadronId => {
        const squadParticipants = squadMap[squadronId];

        // Sort by Order/Timestamp (Earliest first)
        // Using orderIndex from Phase 3.2.1 as the temporal truth
        squadParticipants.sort((a, b) => a.orderIndex - b.orderIndex);

        // A. Individual Rewards
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

        // B. Squadron Synergy Bonus
        // 5 Stars per participating member
        const count = squadParticipants.length;
        if (count > 0) {
            const synergyStars = 5 * count;
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: squadronId,
                memberId: null, // Squadron-level transaction
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

    // Retrieve Attendance Data (Lateness)
    // meeting.scoringData structure: { [squadId]: { lateMemberIds: [...] } }
    const lateMemberIds = new Set();
    if (meeting.scoringData) {
        Object.values(meeting.scoringData).forEach(data => {
            if (data.lateMemberIds) data.lateMemberIds.forEach(id => lateMemberIds.add(id));
        });
    }

    roleAssignments.forEach(assignment => {
        // A. SPEAKER NO-SHOW FINE
        // Condition: Role is Speaker AND Status is 'no-show' AND Owned by a Squadron
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

        // B. LATENESS PENALTY FOR ROLE HOLDERS
        // Condition: Member performed role (completed) BUT was late
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