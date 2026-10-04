import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await getDb();
    return NextResponse.json(db.members);
}

export async function POST(request) {
    const { name, squadronId } = await request.json();
    const db = await getDb();

    const newMember = {
        id: uuidv4(),
        name,
        squadronId,
        isActive: true,
        joinedAt: new Date().toISOString()
    };

    db.members.push(newMember);

    // Link member to squadron (optional redundancy, but helpful)
    const squadron = db.squadrons.find(s => s.id === squadronId);
    if (squadron) {
        if (!squadron.memberIds) squadron.memberIds = [];
        squadron.memberIds.push(newMember.id);
    }

    await saveDb(db);
    return NextResponse.json(newMember);
}

export async function DELETE(request) {
    const { id } = await request.json();
    const db = await getDb();

    // Soft delete to preserve historical data
    const member = db.members.find(m => m.id === id);
    if (member) {
        member.isActive = false;
    }

    await saveDb(db);
    return NextResponse.json({ success: true });
}

// Added for Drag-and-Drop Roster Management & Name Editing
export async function PUT(request) {
    const { memberId, targetSquadronId, name } = await request.json();
    const db = await getDb();

    const member = db.members.find(m => m.id === memberId);
    if (member) {
        if (name) member.name = name;
        
        if (targetSquadronId !== undefined) {
            member.squadronId = targetSquadronId;
            
            if (targetSquadronId) {
                // Make sure it is added to the new squadron's memberIds array
                const targetSquadron = db.squadrons.find(s => s.id === targetSquadronId);
                if (targetSquadron) {
                    if (!targetSquadron.memberIds) targetSquadron.memberIds = [];
                    if (!targetSquadron.memberIds.includes(memberId)) {
                        targetSquadron.memberIds.push(memberId);
                    }
                }
            }
        }
    }

    await saveDb(db);
    return NextResponse.json({ success: true, member });
}