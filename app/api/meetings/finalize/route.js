import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeMeetingTransactions } from '@/lib/scoringEngine';

export async function POST(request) {
    const { meetingId, scoringData } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);

    if (!meeting) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.status === 'finalized') {
        return NextResponse.json({ error: 'Meeting already finalized' }, { status: 400 });
    }

    // Generate Transactions for each Squadron
    let newTransactions = [];

    // scoringData is an object: { [squadronId]: { attendedMemberIds: [], ... } }
    Object.keys(scoringData).forEach(squadronId => {
        const inputs = scoringData[squadronId];
        const txs = computeMeetingTransactions(meeting, squadronId, inputs);
        newTransactions = [...newTransactions, ...txs];
    });

    // Commit to DB
    db.transactions.push(...newTransactions);

    // Update Meeting Status
    meeting.status = 'finalized';
    meeting.scoringData = scoringData; // Archive the inputs

    saveDb(db);

    return NextResponse.json({ success: true, count: newTransactions.length });
}