import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';
import { generateHallOfFameRecord } from '@/lib/hallOfFame';

export async function POST(request) {
    const { type } = await request.json();
    const db = await getDb(); // Added await

    if (type === 'hard') {
        await saveDb({ squadrons: [], members: [], meetings: [], auctions: [], transactions: [], hallOfFame: [] }); // Added await
        return NextResponse.json({ success: true, message: 'System Wiped' });
    }

    if (type === 'soft') {
        if (!db.hallOfFame) db.hallOfFame = [];
        const record = generateHallOfFameRecord(db.squadrons, db.members);
        db.hallOfFame.push(record);

        db.meetings = [];
        db.auctions = [];
        db.transactions = [];

        db.members = db.members.map(m => ({
            ...m,
            totalStars: 0,
            lastSpeechMeetingIndex: -10, 
            speechCooldownUntilMeetingIndex: 0
        }));

        db.squadrons = db.squadrons.map(sq => ({
            ...sq,
            totalStars: 100,
            rotationState: null
        }));

        db.squadrons.forEach(sq => {
            db.transactions.push({
                id: uuidv4(),
                meetingId: 'system-seed-term-start',
                squadronId: sq.id,
                category: TRANSACTION_CATEGORY.SEED,
                description: 'New Term Seed Allocation',
                starsDelta: 100,
                timestamp: new Date().toISOString(),
                locked: true
            });
        });

        await saveDb(db); // Added await
        return NextResponse.json({ success: true, message: 'Term Reset: HoF Archived, 100★ Seeded, Cooldowns Cleared.' });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
}