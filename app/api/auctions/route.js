import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// NEW: Add this GET handler so the frontend can fetch the auctions
export async function GET() {
    const db = getDb();
    // Return empty array if auctions doesn't exist yet
    return NextResponse.json(db.auctions || []);
}

export async function POST(request) {
    const { meetingId, items } = await request.json();
    const db = getDb();

    // Ensure auctions array exists
    if (!db.auctions) db.auctions = [];

    let auction = db.auctions.find(a => a.meetingId === meetingId);

    if (auction && auction.status === 'finalized') {
        return NextResponse.json({ error: 'Auction already finalized' }, { status: 400 });
    }

    if (!auction) {
        auction = {
            id: uuidv4(),
            meetingId,
            status: 'draft',
            createdAt: new Date().toISOString(),
            items: []
        };
        db.auctions.push(auction);
    }

    // Update items in draft
    auction.items = items.map(item => ({
        id: item.id || uuidv4(),
        title: item.title,
        winningSquadronId: item.winningSquadronId || '',
        starsSpent: parseInt(item.starsSpent) || 0
    }));

    saveDb(db);
    return NextResponse.json({ success: true, auction });
}