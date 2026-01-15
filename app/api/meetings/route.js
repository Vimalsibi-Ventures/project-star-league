import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MEETING_STATUS, TRANSACTION_CATEGORY } from '@/lib/constants';

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.meetings);
}

export async function POST(request) {
    // PATCH 1: Accept 'time'
    const { date, time, type } = await request.json();
    const db = getDb();

    const newMeeting = {
        id: uuidv4(),
        date,
        time: time || '18:00', // Default if missing
        type,
        status: MEETING_STATUS.DRAFT,
        roleAssignments: [],
        createdAt: new Date().toISOString()
    };

    db.meetings.push(newMeeting);
    saveDb(db);
    return NextResponse.json(newMeeting);
}

// ... (DELETE handler from Phase 3.4 Patch 5 remains unchanged) ...
export async function DELETE(request) {
    const { id } = await request.json();
    const db = getDb();

    const meetingIdx = db.meetings.findIndex(m => m.id === id);
    if (meetingIdx === -1) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const meeting = db.meetings[meetingIdx];

    if ([MEETING_STATUS.MEETING_LIVE, MEETING_STATUS.CLOSED, MEETING_STATUS.AWARDS_ASSIGNED].includes(meeting.status)) {
        return NextResponse.json({ error: 'Cannot cancel a Live or Closed meeting.' }, { status: 403 });
    }

    const auctionTxns = db.transactions.filter(t =>
        t.meetingId === id &&
        t.category === TRANSACTION_CATEGORY.AUCTION
    );

    const refunds = auctionTxns.map(t => ({
        id: uuidv4(),
        meetingId: id,
        squadronId: t.squadronId,
        memberId: null,
        category: 'auction_refund',
        description: `Refund: Cancelled Meeting (${t.description})`,
        starsDelta: Math.abs(t.starsDelta),
        timestamp: new Date().toISOString(),
        locked: true
    }));

    if (refunds.length > 0) {
        db.transactions.push(...refunds);
    }

    db.meetings.splice(meetingIdx, 1);

    saveDb(db);
    return NextResponse.json({ success: true, refundedCount: refunds.length });
}