import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getLeaderboards } from '@/lib/leaderboard';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

const BOUNTY_STARS = 100;

export async function POST() {
    try {
        const db = await getDb();

        if (!db.isSeasonalThemeEnabled) {
            return NextResponse.json({ error: 'Seasonal theme is not enabled' }, { status: 400 });
        }

        // Guard against double-disbursement
        if (db.members.some(m => m.lockedSeasonTitle)) {
            return NextResponse.json({ error: 'Titles have already been locked for this season' }, { status: 409 });
        }

        // Individual leaderboard (sorted by stars desc, agent-attribution aware)
        const { rankedSquadrons, rankedMembers } = await getLeaderboards();
        const factionBySquadron = {};
        rankedSquadrons.forEach(s => { factionBySquadron[s.id] = s.faction || 'unaligned'; });

        const active = rankedMembers.filter(m => m.isActive !== false);
        const topPirates = active.filter(m => factionBySquadron[m.squadronId] === 'pirate').slice(0, 4);
        const topMarines = active.filter(m => factionBySquadron[m.squadronId] === 'marine').slice(0, 4);

        const winners = [
            ...topPirates.map(m => ({ member: m, title: 'Yonko' })),
            ...topMarines.map((m, i) => ({ member: m, title: i === 0 ? 'Admiral' : 'Vice Admiral' }))
        ];

        if (winners.length === 0) {
            return NextResponse.json({ error: 'No eligible Pirate or Marine members found' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const newTransactions = [];

        winners.forEach(({ member, title }) => {
            const dbMember = db.members.find(m => m.id === member.id);
            if (dbMember) dbMember.lockedSeasonTitle = title;

            newTransactions.push({
                id: uuidv4(),
                meetingId: 'title_bounty',
                squadronId: member.squadronId,
                memberId: member.id,
                agent: member.name,
                category: TRANSACTION_CATEGORY.TITLE_BOUNTY,
                description: `Title Bounty: ${title}`,
                starsDelta: BOUNTY_STARS,
                timestamp,
                locked: true
            });
        });

        db.transactions.push(...newTransactions);
        await saveDb(db);

        return NextResponse.json({
            success: true,
            locked: winners.map(w => ({ id: w.member.id, name: w.member.name, title: w.title })),
            bountiesAwarded: newTransactions.length
        });
    } catch (error) {
        console.error('Error locking titles:', error);
        return NextResponse.json({ error: 'Failed to lock titles' }, { status: 500 });
    }
}

