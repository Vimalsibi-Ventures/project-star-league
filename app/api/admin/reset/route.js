import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    const { type } = await request.json(); // 'soft' or 'hard'
    const db = getDb();

    if (type === 'hard') {
        saveDb({
            squadrons: [],
            members: [],
            meetings: [],
            auctions: [],
            transactions: []
        });
        return NextResponse.json({ success: true, message: 'System Wiped' });
    }

    if (type === 'soft') {
        // Clear operational data
        db.meetings = [];
        db.auctions = [];
        db.transactions = []; // Clear ledger

        // Re-seed Squadrons with 100 stars
        db.squadrons.forEach(sq => {
            db.transactions.push({
                id: uuidv4(),
                meetingId: 'system-seed-reset',
                squadronId: sq.id,
                category: 'seed',
                description: 'Term Start Seeding',
                starsDelta: 100,
                timestamp: new Date().toISOString()
            });
        });

        saveDb(db);
        return NextResponse.json({ success: true, message: 'Term Reset Complete' });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
}