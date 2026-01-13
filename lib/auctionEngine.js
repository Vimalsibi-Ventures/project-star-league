import { v4 as uuidv4 } from 'uuid';

/**
 * Validates and converts auction items into ledger transactions.
 * Returns { success: boolean, error?: string, transactions?: Array }
 */
export function processAuctionFinalization(auction, auctionItems, squadronBalances) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    // 1. Calculate Total Spend per Squadron to check for over-drafting
    const spendMap = {}; // { [squadronId]: number }

    auctionItems.forEach(item => {
        if (!item.winningSquadronId) return; // Unsold item

        const currentSpend = spendMap[item.winningSquadronId] || 0;
        spendMap[item.winningSquadronId] = currentSpend + parseInt(item.starsSpent);
    });

    // 2. Validate Balances
    for (const [squadronId, spendAmount] of Object.entries(spendMap)) {
        const currentBalance = squadronBalances[squadronId] || 0;
        if (spendAmount > currentBalance) {
            return {
                success: false,
                error: `Squadron ID ${squadronId} has ${currentBalance} stars but tried to spend ${spendAmount}.`
            };
        }
    }

    // 3. Generate Transactions (Only if validation passes)
    auctionItems.forEach(item => {
        if (item.winningSquadronId && item.starsSpent > 0) {
            transactions.push({
                id: uuidv4(),
                meetingId: auction.meetingId,
                squadronId: item.winningSquadronId,
                memberId: null, // Deduction applies to the group funds
                category: 'auction',
                description: `Won Auction: ${item.title}`,
                starsDelta: -Math.abs(item.starsSpent), // Ensure it's negative
                timestamp
            });
        }
    });

    return { success: true, transactions };
}