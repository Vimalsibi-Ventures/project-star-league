/**
 * PURE FUNCTION: Transforms meeting inputs into star transactions
 * @param {Object} meeting - The meeting object
 * @param {String} squadronId - Target squadron ID
 * @param {Object} inputs - { attendedMemberIds, lateMemberIds, rolesCount, etc. }
 */
export function computeMeetingTransactions(meeting, squadronId, inputs) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    // SCORING CONFIGURATION
    const STARS = {
        ATTENDANCE: meeting.type === 'online' ? 5 : 10,
        PERFECT_ATTENDANCE_BONUS: 20,
        LATENESS_PENALTY: -5,
        ROLE: 5,
        SPEECH: 10,
        AWARD: 10,
        SYNERGY: 15, // if applicable
        MANUAL: 1    // Multiplier for manual adjustments
    };

    // 1. Attendance (Per Member)
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

    // 2. Perfect Attendance Bonus (Squadron Level)
    // We assume 4 members is the standard for a full squadron
    if (inputs.attendedMemberIds.length >= 4) {
        transactions.push({
            id: crypto.randomUUID(),
            meetingId: meeting.id,
            squadronId,
            memberId: null, // Applied to squadron
            category: 'bonus',
            description: 'Perfect Attendance Bonus (4/4)',
            starsDelta: STARS.PERFECT_ATTENDANCE_BONUS,
            timestamp
        });
    }

    // 3. Lateness (Per Member)
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

    // 4. Roles (Aggregated)
    if (inputs.rolesCount > 0) {
        transactions.push({
            id: crypto.randomUUID(),
            meetingId: meeting.id,
            squadronId,
            memberId: null,
            category: 'role',
            description: `${inputs.rolesCount} Roles taken`,
            starsDelta: inputs.rolesCount * STARS.ROLE,
            timestamp
        });
    }

    // 5. Speeches
    if (inputs.speechesCount > 0) {
        transactions.push({
            id: crypto.randomUUID(),
            meetingId: meeting.id,
            squadronId,
            memberId: null,
            category: 'speech',
            description: `${inputs.speechesCount} Speeches delivered`,
            starsDelta: inputs.speechesCount * STARS.SPEECH,
            timestamp
        });
    }

    // 6. Manual Adjustment
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