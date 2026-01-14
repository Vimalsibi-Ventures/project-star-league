import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MEETING_STATUS } from '@/lib/constants';

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.auctions || []);
}

export async function POST(request) {
    const { meetingId, items } = await request.json();
    const db = getDb();

    if (!db.auctions) db.auctions = [];

    // Allow nullable meetingId for future binding, but if provided, validate
    let auction = null;
    if (meetingId) {
        auction = db.auctions.find(a => a.meetingId === meetingId);
    }

    if (auction && auction.status === 'finalized') {
        return NextResponse.json({ error: 'Auction already finalized' }, { status: 400 });
    }

    if (!auction) {
        auction = {
            id: uuidv4(),
            meetingId: meetingId || null,
            status: 'draft',
            createdAt: new Date().toISOString(),
            items: []
        };
        db.auctions.push(auction);
    }

    // Update items - NOW SAVING TEMPLATE METADATA
    auction.items = items.map(item => ({
        id: item.id || uuidv4(),
        title: item.title,
        roleTemplateId: item.roleTemplateId || 'custom', // Store template reference
        slotLabel: item.slotLabel || '', // Store slot number
        winningSquadronId: item.winningSquadronId || '',
        starsSpent: parseInt(item.starsSpent) || 0
    }));

    // Update Meeting Status if linked
    if (meetingId) {
        const meeting = db.meetings.find(m => m.id === meetingId);
        if (meeting && meeting.status === MEETING_STATUS.DRAFT) {
            meeting.status = MEETING_STATUS.AUCTION_CONFIGURED;
        }
    }

    saveDb(db);
    return NextResponse.json({ success: true, auction });
}