import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';
import { generateHallOfFameRecord } from '@/lib/hallOfFame';

export async function POST(request) {
    const { type } = await request.json();
    const db = getDb();

    if (type === 'hard') {
        saveDb({ squadrons: [], members: [], meetings: [], auctions: [], transactions: [], hallOfFame: [] });
        return NextResponse.json({ success: true, message: 'System Wiped' });
    }

    if (type === 'soft') {
        // 1. Archive to Hall of Fame
        if (!db.hallOfFame) db.hallOfFame = [];
        const record = generateHallOfFameRecord(db.squadrons, db.members);
        db.hallOfFame.push(record);

        // 2. Clear Operational Data
        db.meetings = [];
        db.auctions = [];
        db.transactions = [];

        // 3. PATCH 1: Reset Member States SAFE for Cooldowns
        // Setting lastSpeechMeetingIndex to -10 ensures (1 - (-10)) > 2, making them eligible immediately.
        db.members = db.members.map(m => ({
            ...m,
            totalStars: 0,
            lastSpeechMeetingIndex: -10, // SAFE VALUE
            speechCooldownUntilMeetingIndex: 0
        }));

        // 4. PATCH 1: Reset Squadron States (Rotation History)
        db.squadrons = db.squadrons.map(sq => ({
            ...sq,
            totalStars: 100,
            rotationState: null
        }));

        // 5. Generate Seed Transactions
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

        saveDb(db);
        return NextResponse.json({ success: true, message: 'Term Reset: HoF Archived, 100★ Seeded, Cooldowns Cleared.' });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
}