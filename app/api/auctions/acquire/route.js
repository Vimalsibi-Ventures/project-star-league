import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';
import { getLeaderboards } from '@/lib/leaderboard';

export async function POST(request) {
    const { meetingId, auctionItemId, squadronId } = await request.json();
    const db = getDb();

    // 1. Validations
    const auction = db.auctions.find(a => a.meetingId === meetingId);
    if (!auction || auction.status !== 'finalized') {
        return NextResponse.json({ error: 'Auction not ready for manual acquisition' }, { status: 400 });
    }

    const item = auction.items.find(i => i.id === auctionItemId);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    if (item.winningSquadronId) return NextResponse.json({ error: 'Item already sold' }, { status: 400 });

    // 2. Financial Check (10 Star Flat Rate)
    const FLAT_COST = 10;
    const { rankedSquadrons } = getLeaderboards();
    const squadron = rankedSquadrons.find(s => s.id === squadronId);

    if (!squadron) return NextResponse.json({ error: 'Squadron not found' }, { status: 404 });
    if (squadron.totalStars < FLAT_COST) {
        return NextResponse.json({ error: 'Insufficient funds (Cost: 10 Stars)' }, { status: 400 });
    }

    // 3. Execution
    item.winningSquadronId = squadronId;
    item.starsSpent = FLAT_COST;

    const transaction = {
        id: uuidv4(),
        meetingId: meetingId,
        squadronId: squadronId,
        memberId: null,
        category: TRANSACTION_CATEGORY.AUCTION,
        description: `Manual Acquisition: ${item.title}`,
        starsDelta: -FLAT_COST,
        timestamp: new Date().toISOString(),
        locked: true
    };

    db.transactions.push(transaction);
    saveDb(db);

    return NextResponse.json({ success: true });
}