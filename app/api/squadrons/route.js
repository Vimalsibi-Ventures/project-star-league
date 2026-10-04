import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await getDb();
    return NextResponse.json(db.squadrons);
}

export async function POST(request) {
    const { name, logoUrl, faction } = await request.json();
    const db = await getDb();

    const newSquadron = {
        id: uuidv4(),
        name,
        logoUrl: logoUrl || null,
        faction: faction || 'unaligned',
        memberIds: [],
        isActive: true,
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

    await saveDb(db);
    return NextResponse.json(newSquadron);
}

export async function DELETE(request) {
    const { id, resetAll } = await request.json();

    if (resetAll) {
        // Reset to empty state
        await saveDb({ squadrons: [], members: [], meetings: [], transactions: [] });
        return NextResponse.json({ success: true });
    }

    const db = await getDb();
    
    // Soft delete to preserve historical data
    const squadron = db.squadrons.find(s => s.id === id);
    if (squadron) {
        squadron.isActive = false;
    }

    await saveDb(db);
    return NextResponse.json({ success: true });
}

export async function PUT(request) {
    const { id, name, logoUrl, faction } = await request.json();
    const db = await getDb();

    const squadron = db.squadrons.find(s => s.id === id);
    if (squadron) {
        if (name) squadron.name = name;
        if (logoUrl !== undefined) squadron.logoUrl = logoUrl;
        if (faction !== undefined) squadron.faction = faction;
    }

    await saveDb(db);
    return NextResponse.json({ success: true, squadron });
}