import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.squadrons);
}

export async function POST(request) {
    const { name } = await request.json();
    const db = getDb();

    const newSquadron = {
        id: uuidv4(),
        name,
        memberIds: [],
        createdAt: new Date().toISOString()
    };

    // Seed with 100 Stars
    const seedTransaction = {
        id: uuidv4(),
        meetingId: 'system-seed',
        squadronId: newSquadron.id,
        category: 'seed',
        description: 'Initial Squadron Funding',
        starsDelta: 100,
        timestamp: new Date().toISOString()
    };

    db.squadrons.push(newSquadron);
    db.transactions.push(seedTransaction);

    saveDb(db);
    return NextResponse.json(newSquadron);
}

export async function DELETE(request) {
    const { id, resetAll } = await request.json();

    if (resetAll) {
        // Reset to empty state
        saveDb({ squadrons: [], members: [], meetings: [], transactions: [] });
        return NextResponse.json({ success: true });
    }

    const db = getDb();
    db.squadrons = db.squadrons.filter(s => s.id !== id);
    // Also remove members of this squadron
    db.members = db.members.filter(m => m.squadronId !== id);
    // Note: We keep transactions for audit logs, or you can delete them if preferred

    saveDb(db);
    return NextResponse.json({ success: true });
}