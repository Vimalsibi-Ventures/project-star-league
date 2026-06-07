import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    try {
        const { expeditionIds } = await request.json();
        const db = await getDb();

        if (db.expeditions) {
            db.expeditions.forEach(exp => {
                if (expeditionIds.includes(exp.id)) {
                    exp.status = 'assigned';
                    delete exp.finalizedAt;
                }
            });
        }

        if (db.transactions) {
            db.transactions = db.transactions.filter(t => 
                !expeditionIds.includes(t.meetingId) || t.category === TRANSACTION_CATEGORY.EXPEDITION_FEE
            );
        }

        await saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Undo failed' }, { status: 500 });
    }
}