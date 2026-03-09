import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MEETING_STATUS, TRANSACTION_CATEGORY } from '@/lib/constants';

export async function GET() {
    const db = await getDb();
    return NextResponse.json(db.meetings);
}

export async function POST(request) {
    const { date, time, type } = await request.json();
    const db = await getDb();

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
    await saveDb(db);
    return NextResponse.json(newMeeting);
}

export async function DELETE(request) {
    const { id } = await request.json();
    const db = await getDb();

    const meetingIdx = db.meetings.findIndex(m => m.id === id);
    if (meetingIdx === -1) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const meeting = db.meetings[meetingIdx];

    // Only prevent deletion if the meeting is completely archived/closed
    if (meeting.status === MEETING_STATUS.CLOSED) {
        return NextResponse.json({ error: 'Cannot delete a completely closed/archived meeting.' }, { status: 403 });
    }

    // Find ALL transactions associated with this meeting ID
    const meetingTxns = db.transactions.filter(t => t.meetingId === id);

    // Create an exact opposite transaction for every charge/reward to balance the ledger
    const refunds = meetingTxns
        .filter(t => !t.category.includes('refund')) // Don't refund a refund
        .map(t => ({
            id: uuidv4(),
            meetingId: id,
            squadronId: t.squadronId,
            memberId: t.memberId,
            category: `${t.category}_refund`,
            description: `Reversal (Meeting Deleted): ${t.description}`,
            starsDelta: -(t.starsDelta), // Flips the sign (+ becomes -, - becomes +)
            timestamp: new Date().toISOString(),
            locked: true
        }));

    // Add all reversing transactions to the ledger
    if (refunds.length > 0) {
        db.transactions.push(...refunds);
    }

    // Remove the meeting itself
    db.meetings.splice(meetingIdx, 1);

    await saveDb(db);
    return NextResponse.json({ success: true, refundedCount: refunds.length });
}