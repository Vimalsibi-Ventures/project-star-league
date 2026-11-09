import { NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/lib/data';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
    // Added await for cloud database
    return NextResponse.json(await getTransactions());
}

export async function POST(request) {
    const data = await request.json();
    const db = await getDb();

    let resolvedMember = null;
    const lookupVal = data.memberId || (data.agent && data.agent !== 'Squadron Level' ? data.agent : null);
    if (lookupVal && db.members) {
        resolvedMember = db.members.find(
            m => m.id === lookupVal || (m.name && m.name.toLowerCase() === String(lookupVal).toLowerCase())
        );
    }

    const enrichedData = {
        ...data,
        memberId: resolvedMember ? resolvedMember.id : (data.memberId ?? null),
        agent: resolvedMember ? resolvedMember.name : (data.agent || 'Squadron Level')
    };

    const transaction = await createTransaction(enrichedData);
    return NextResponse.json(transaction);
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const transactionId = body.id || body.transactionId;
        const { agent, memberId } = body;

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const db = await getDb();
        if (!db.transactions) {
            return NextResponse.json({ error: 'No transactions found' }, { status: 404 });
        }

        const txIndex = db.transactions.findIndex(t => t.id === transactionId);
        if (txIndex === -1) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const tx = db.transactions[txIndex];

        // Resolve member if a specific member ID or name was selected
        let resolvedMember = null;
        const lookupVal = memberId !== undefined ? memberId : agent;

        if (lookupVal && lookupVal !== 'Squadron Level' && db.members) {
            resolvedMember = db.members.find(
                m => m.id === lookupVal || (m.name && m.name.toLowerCase() === String(lookupVal).toLowerCase())
            );
        }

        if (!lookupVal || lookupVal === 'Squadron Level') {
            tx.memberId = null;
            tx.agent = 'Squadron Level';
        } else if (resolvedMember) {
            tx.memberId = resolvedMember.id;
            tx.agent = resolvedMember.name;
        } else {
            tx.memberId = memberId || null;
            tx.agent = String(agent);
        }

        // Preserve squadronId and starsDelta untouched
        db.transactions[txIndex] = tx;
        await saveDb(db);

        return NextResponse.json({ success: true, transaction: tx });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}