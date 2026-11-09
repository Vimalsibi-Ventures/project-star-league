import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';

export async function POST(request) {
    try {
        const { squadronId, starsDelta, reason, memberId, agent } = await request.json();

        // Validate the incoming payload
        if (!squadronId || starsDelta === undefined || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const timestamp = new Date().toISOString();

        // Resolve specific member if provided via memberId or agent (ID or Name)
        let resolvedMember = null;
        const lookupVal = memberId || (agent && agent !== 'Squadron Level' ? agent : null);
        if (lookupVal && db.members) {
            resolvedMember = db.members.find(
                m => m.id === lookupVal || (m.name && m.name.toLowerCase() === String(lookupVal).toLowerCase())
            );
        }

        const resolvedMemberId = resolvedMember ? resolvedMember.id : (memberId || null);
        const resolvedAgent = resolvedMember
            ? resolvedMember.name
            : (agent && agent.trim() !== '' ? agent : 'Squadron Level');

        // Generate the custom transaction
        const newTransaction = {
            id: uuidv4(),
            meetingId: 'manual_adjustment', // Special flag for manual records
            squadronId: squadronId,
            memberId: resolvedMemberId, // Linked to individual if selected, else null
            agent: resolvedAgent, // Specific member name or "Squadron Level" fallback
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

        return NextResponse.json({ success: true, transaction: newTransaction });
    } catch (error) {
        console.error('Error processing manual adjustment:', error);
        return NextResponse.json({ error: 'Failed to process manual adjustment' }, { status: 500 });
    }
}