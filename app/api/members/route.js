import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.members);
}

export async function POST(request) {
    const { name, squadronId } = await request.json();
    const db = getDb();

    const newMember = {
        id: uuidv4(),
        name,
        squadronId,
        joinedAt: new Date().toISOString()
    };

    db.members.push(newMember);

    // Link member to squadron (optional redundancy, but helpful)
    const squadron = db.squadrons.find(s => s.id === squadronId);
    if (squadron) {
        if (!squadron.memberIds) squadron.memberIds = [];
        squadron.memberIds.push(newMember.id);
    }

    saveDb(db);
    return NextResponse.json(newMember);
}

export async function DELETE(request) {
    const { id } = await request.json();
    const db = getDb();

    db.members = db.members.filter(m => m.id !== id);
    // We do not delete transactions associated with the member to preserve history

    saveDb(db);
    return NextResponse.json({ success: true });
}