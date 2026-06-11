import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    try {
        const { squadronId, starsDelta, reason } = await request.json();

        // Validate the incoming payload
        if (!squadronId || starsDelta === undefined || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const timestamp = new Date().toISOString();

        // Generate the custom transaction
        const newTransaction = {
            id: uuidv4(),
            meetingId: 'manual_adjustment', // Special flag for manual records
            squadronId: squadronId,
            memberId: null, // Applied to the whole house, not an individual
            category: TRANSACTION_CATEGORY.MANUAL || 'manual', // Fallback if constant is missing
            description: reason,
            starsDelta: Number(starsDelta), // Allows both positive and negative values
            timestamp: timestamp,
            locked: true
        };

        // Safely push to the global ledger
        if (!db.transactions) {
            db.transactions = [];
        }
        db.transactions.push(newTransaction);

        // Save state back to Redis
        await saveDb(db);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing manual adjustment:', error);
        return NextResponse.json({ error: 'Failed to process manual adjustment' }, { status: 500 });
    }
}