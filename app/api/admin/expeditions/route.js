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