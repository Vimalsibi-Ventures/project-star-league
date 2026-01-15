import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

/**
 * Generates transactions for Role Substitutions (Mercenary Rule).
 * Transfer fee from Winning Squadron -> Substitute Squadron.
 */
export function computeSubstitutionTransactions(meeting, roleAssignments, members) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    roleAssignments.forEach(assignment => {
        // Skip Guests, Speakers, or Unassigned
        if (assignment.fulfilledExternally || !assignment.memberId || !assignment.squadronId) return;
        if (assignment.roleName.toLowerCase().includes('speaker')) return; // Speakers cannot sub

        // Logic: Check if Assignee's Squadron != Winning Squadron
        // We need the original auction item to know the winner.
        // Assuming roleAssignments carries 'squadronId' which is the ASSIGNEE's squadron
        // and we need to compare it to the 'winningSquadronId' from the auction item.
        // BUT, the payload usually has `squadronId` as the Assignee's squad.
        // We rely on `assignment.winningSquadronId` being passed or inferred.

        // Let's assume the payload sent to Close includes `winningSquadronId`.
        const winnerId = assignment.winningSquadronId;
        const performerId = assignment.squadronId;
        const fee = parseInt(assignment.substitutionFee || 0);

        if (winnerId && performerId && winnerId !== performerId && fee > 0) {
            // 1. Deduct from Winner
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: winnerId,
                memberId: null,
                category: TRANSACTION_CATEGORY.SUBSTITUTION_FEE,
                description: `Sub Fee Paid to ${assignment.squadronName || 'Mercenary'}`,
                starsDelta: -fee,
                timestamp,
                locked: true
            });

            // 2. Add to Substitute
            transactions.push({
                id: uuidv4(),
                meetingId: meeting.id,
                squadronId: performerId,
                memberId: assignment.memberId, // Credit relevant to member's squad contribution
                category: TRANSACTION_CATEGORY.SUBSTITUTION_FEE,
                description: `Sub Fee Received for ${assignment.roleName}`,
                starsDelta: fee,
                timestamp,
                locked: true
            });
        }
    });

    return transactions;
}