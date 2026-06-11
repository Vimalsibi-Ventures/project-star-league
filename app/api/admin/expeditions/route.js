import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function GET() {
    const db = await getDb();
    return NextResponse.json(db.expeditions || []);
}

export async function POST(request) {
    try {
        const { clubName, roleName, cost, squadronId, memberId } = await request.json();
        const db = await getDb();
        
        if (!db.expeditions) db.expeditions = [];
        if (!db.transactions) db.transactions = [];

        const expeditionId = uuidv4();
        const timestamp = new Date().toISOString();

        db.expeditions.push({
            id: expeditionId,
            clubName,
            roleName,
            cost: Number(cost) || 0,
            squadronId,
            memberId,
            status: 'assigned', 
            createdAt: timestamp
        });

        // Your custom logic: Deduct stars for the expedition dispatch fee
        if (Number(cost) > 0) {
            db.transactions.push({
                id: uuidv4(),
                meetingId: expeditionId,
                squadronId,
                memberId,
                category: TRANSACTION_CATEGORY.EXPEDITION_FEE,
                description: `Dispatch Fee: ${roleName} at ${clubName}`,
                starsDelta: -Math.abs(Number(cost)),
                timestamp,
                locked: true
            });
        }

        await saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// NEW: Delete handler to cancel an active deployment and refund the fee
export async function DELETE(request) {
    try {
        const { id } = await request.json();
        const db = await getDb();
        
        if (!db.expeditions) return NextResponse.json({ error: 'No expeditions found' }, { status: 404 });
        
        // 1. Remove the expedition from the active queue
        db.expeditions = db.expeditions.filter(exp => exp.id !== id);
        
        // 2. Safely remove the dispatch fee transaction to refund the stars
        if (db.transactions) {
            db.transactions = db.transactions.filter(t => t.meetingId !== id);
        }
        
        await saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting expedition:', error);
        return NextResponse.json({ error: 'Failed to delete expedition' }, { status: 500 });
    }
}