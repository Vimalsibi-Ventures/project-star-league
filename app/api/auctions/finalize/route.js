import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getLeaderboards } from '@/lib/leaderboard';
import { processAuctionFinalization } from '@/lib/auctionEngine';

export async function POST(request) {
    const { meetingId } = await request.json();
    const db = getDb();

    const auction = db.auctions.find(a => a.meetingId === meetingId);
    if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    if (auction.status === 'finalized') return NextResponse.json({ error: 'Already finalized' }, { status: 400 });

    // 1. Get Current Balances for Validation
    const { rankedSquadrons } = getLeaderboards();
    const balanceMap = {};
    rankedSquadrons.forEach(sq => {
        balanceMap[sq.id] = sq.totalStars;
    });

    // 2. Process & Validate
    const result = processAuctionFinalization(auction, auction.items, balanceMap);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 3. Commit
    db.transactions.push(...result.transactions);
    auction.status = 'finalized';
    saveDb(db);

    return NextResponse.json({ success: true, count: result.transactions.length });
}