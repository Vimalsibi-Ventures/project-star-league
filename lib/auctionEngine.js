import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from './constants';

export function processAuctionFinalization(auction, auctionItems, squadronBalances) {
    const transactions = [];
    const timestamp = new Date().toISOString();

    // 1. Calculate Spend
    const spendMap = {};
    auctionItems.forEach(item => {
        if (!item.winningSquadronId) return;
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

    // 3. Generate Transactions (LOCKED)
    auctionItems.forEach(item => {
        if (item.winningSquadronId && item.starsSpent > 0) {
            transactions.push({
                id: uuidv4(),
                meetingId: auction.meetingId,
                squadronId: item.winningSquadronId,
                memberId: null,
                category: TRANSACTION_CATEGORY.AUCTION,
                description: `Won Auction: ${item.title}`,
                starsDelta: -Math.abs(item.starsSpent),
                timestamp,
                locked: true // CRITICAL SAFETY FIX
            });
        }
    });

    return { success: true, transactions };
}