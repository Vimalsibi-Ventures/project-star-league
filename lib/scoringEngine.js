/**
 * PURE FUNCTION
 * Computes attendance-, lateness-, and admin-level transactions for a meeting.
 * DOES NOT handle roles or speeches anymore.
 *
 * @param {Object} meeting
 * @param {String} squadronId
 * @param {Object} inputs
 * {
 *   attendedMemberIds: [],
 *   lateMemberIds: [],
 *   manualAdjustment?: number
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
            id: crypto.randomUUID(),
            meetingId: meeting.id,
            squadronId,
            memberId,
            category: 'attendance',
            description: `Attended ${meeting.type} meeting`,
            starsDelta: STARS.ATTENDANCE,
            timestamp
        });
    });

    // 2. Perfect Attendance Bonus (squadron-level)
    if (inputs.attendedMemberIds.length >= 4) {
        transactions.push({
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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
 * @param {Object} meeting
 * @param {Array} roleAssignments
 * [{
 *   auctionItemId,
 *   roleType: 'speaker' | 'evaluator' | 'functionary',
 *   roleName,
 *   memberId,
 *   squadronId,
 *   status: 'completed' | 'no-show'
 * }]
 */
export function computeRoleTransactions(meeting, roleAssignments) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    const STARS = {
        ROLE_COMPLETION: 5,
        SPEECH_COMPLETION: 10
    };

    roleAssignments.forEach(assignment => {
        if (assignment.status !== 'completed' || !assignment.memberId) return;

        // Role completion
        transactions.push({
            id: crypto.randomUUID(),
            meetingId: meeting.id,
            squadronId: assignment.squadronId,
            memberId: assignment.memberId,
            category: 'role',
            description: `Completed Role: ${assignment.roleName}`,
            starsDelta: STARS.ROLE_COMPLETION,
            timestamp
        });

        // Speech bonus (explicit, not string-matched)
        if (assignment.roleType === 'speaker') {
            transactions.push({
                id: crypto.randomUUID(),
                meetingId: meeting.id,
                squadronId: assignment.squadronId,
                memberId: assignment.memberId,
                category: 'speech',
                description: `Delivered Speech`,
                starsDelta: STARS.SPEECH_COMPLETION,
                timestamp
            });
        }
    });

    return transactions;
}
