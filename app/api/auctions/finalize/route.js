import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getLeaderboards } from '@/lib/leaderboard';
import { processAuctionFinalization } from '@/lib/auctionEngine';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    const { meetingId } = await request.json();
    const db = getDb();

    const auction = db.auctions.find(a => a.meetingId === meetingId);
    if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    if (auction.status === 'finalized') return NextResponse.json({ error: 'Already finalized' }, { status: 400 });

    const { rankedSquadrons } = getLeaderboards();
    const balanceMap = {};
    rankedSquadrons.forEach(sq => {
        balanceMap[sq.id] = sq.totalStars;
    });

    const result = processAuctionFinalization(auction, auction.items, balanceMap);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    db.transactions.push(...result.transactions);
    auction.status = 'finalized';

    // Update Meeting Status
    const meeting = db.meetings.find(m => m.id === meetingId);
    if (meeting) {
        // Enforce one-way transition
        if ([MEETING_STATUS.DRAFT, MEETING_STATUS.AUCTION_CONFIGURED].includes(meeting.status)) {
            meeting.status = MEETING_STATUS.AUCTION_FINALIZED;
        }
    }

    saveDb(db);
    return NextResponse.json({ success: true, count: result.transactions.length });
}