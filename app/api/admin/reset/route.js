import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    const { type } = await request.json();
    const db = getDb();

    if (type === 'hard') {
        saveDb({ squadrons: [], members: [], meetings: [], auctions: [], transactions: [] });
        return NextResponse.json({ success: true, message: 'System Wiped' });
    }

    if (type === 'soft') {
        // 1. Clear Operational Data
        db.meetings = [];
        db.auctions = [];
        db.transactions = []; // Clear Ledger (Reset Balance to 0)

        // 2. Re-seed Squadrons with 100 Stars
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
        return NextResponse.json({ success: true, message: 'Term Reset Complete (100★ per Squadron)' });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
}