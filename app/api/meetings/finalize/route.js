import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { computeMeetingTransactions } from '@/lib/scoringEngine';
import { MEETING_STATUS } from '@/lib/constants';

export async function POST(request) {
    const { meetingId, scoringData } = await request.json();
    const db = getDb();

    const meeting = db.meetings.find(m => m.id === meetingId);

    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // Strict State Check
    if (meeting.status !== MEETING_STATUS.MEETING_LIVE) {
        // Allow if coming from ROLE_RESOLUTION for legacy/flexibility, but prefer LIVE
        if (meeting.status !== MEETING_STATUS.ROLE_RESOLUTION && meeting.status !== MEETING_STATUS.AUCTION_FINALIZED) {
            return NextResponse.json({ error: 'Meeting must be LIVE to score attendance' }, { status: 400 });
        }
    }

    let newTransactions = [];
    Object.keys(scoringData).forEach(squadronId => {
        const inputs = scoringData[squadronId];
        const txs = computeMeetingTransactions(meeting, squadronId, inputs);
        newTransactions = [...newTransactions, ...txs];
    });

    db.transactions.push(...newTransactions);

    meeting.status = MEETING_STATUS.ATTENDANCE_FINALIZED;
    meeting.scoringData = scoringData;

    saveDb(db);

    return NextResponse.json({ success: true, count: newTransactions.length });
}