import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    const { nextSeasonNumber } = await request.json();
    const db = getDb();

    // 1. Calculate Final Standings (Snapshot)
    const squadronStats = db.squadrons.map(sq => {
        // Calculate live balance from transactions
        const balance = db.transactions
            .filter(t => t.squadronId === sq.id)
            .reduce((acc, t) => acc + t.starsDelta, 0);
        return { ...sq, totalStars: balance };
    }).sort((a, b) => b.totalStars - a.totalStars);

    const memberStats = db.members.map(m => {
        const stars = db.transactions
            .filter(t => t.memberId === m.id)
            .reduce((acc, t) => acc + t.starsDelta, 0);
        return { ...m, totalStars: stars };
    }).sort((a, b) => b.totalStars - a.totalStars);

    const winningSquadron = squadronStats[0];
    const apexPredator = memberStats[0];

    // 2. Create Hall of Fame Entry
    const hofEntry = {
        id: uuidv4(),
        seasonNumber: db.season.seasonNumber,
        concludedAt: new Date().toISOString(),
        winningSquadron: {
            name: winningSquadron ? winningSquadron.name : 'No Winner',
            stars: winningSquadron ? winningSquadron.totalStars : 0
        },
        apexPredator: {
            name: apexPredator ? apexPredator.name : 'No Winner',
            stars: apexPredator ? apexPredator.totalStars : 0
        },
        // Store Top 3 for display
        topSquadrons: squadronStats.slice(0, 3).map(s => ({ name: s.name, stars: s.totalStars })),
        topMembers: memberStats.slice(0, 3).map(m => ({ name: m.name, stars: m.totalStars }))
    };

    db.hallOfFame.unshift(hofEntry); // Add to top

    // 3. Operational Reset (Clear Data)
    db.meetings = [];
    db.auctions = [];
    db.transactions = []; // Clear Ledger

    // 4. Reseed Squadrons to 100 Stars
    db.squadrons = db.squadrons.map(sq => ({
        ...sq,
        totalStars: 100,
        rotationState: null // Clear rotation history
    }));

    // 5. Reset Member States
    db.members = db.members.map(m => ({
        ...m,
        totalStars: 0,
        lastSpeechMeetingIndex: -10, // Safe Reset
        speechCooldownUntilMeetingIndex: 0
    }));

    // 6. Initialize New Season
    db.season = {
        seasonNumber: parseInt(nextSeasonNumber) || (db.season.seasonNumber + 1),
        status: 'ACTIVE',
        startedAt: new Date().toISOString()
    };

    // 7. Seed Transactions
    db.squadrons.forEach(sq => {
        db.transactions.push({
            id: uuidv4(),
            meetingId: 'season-start-seed',
            squadronId: sq.id,
            category: TRANSACTION_CATEGORY.SEED,
            description: `Season ${db.season.seasonNumber} Seed Allocation`,
            starsDelta: 100,
            timestamp: new Date().toISOString(),
            locked: true
        });
    });

    saveDb(db);

    return NextResponse.json({ success: true, season: db.season.seasonNumber });
}