import { getDb } from './db';

export function getLeaderboards() {
    const db = getDb();

    // 1. Initialize Score Maps
    const squadronScores = {}; // { [id]: number }
    const memberScores = {};   // { [id]: number }

    // 2. Process Every Transaction in History
    db.transactions.forEach(tx => {
        // Add to Squadron Total
        if (!squadronScores[tx.squadronId]) squadronScores[tx.squadronId] = 0;
        squadronScores[tx.squadronId] += tx.starsDelta;

        // Add to Individual Total (if linked to a specific member)
        if (tx.memberId) {
            if (!memberScores[tx.memberId]) memberScores[tx.memberId] = 0;
            memberScores[tx.memberId] += tx.starsDelta;
        }
    });

    // 3. Hydrate Squadrons with Scores
    const rankedSquadrons = db.squadrons.map(sq => ({
        ...sq,
        totalStars: squadronScores[sq.id] || 0,
        memberCount: sq.memberIds ? sq.memberIds.length : 0
    })).sort((a, b) => b.totalStars - a.totalStars);

    // 4. Hydrate Members with Scores
    const rankedMembers = db.members.map(m => {
        const squadron = db.squadrons.find(s => s.id === m.squadronId);
        return {
            ...m,
            squadronName: squadron ? squadron.name : 'Unknown',
            totalStars: memberScores[m.id] || 0
        };
    }).sort((a, b) => b.totalStars - a.totalStars);

    return { rankedSquadrons, rankedMembers };
}