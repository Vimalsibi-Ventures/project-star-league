import { NextResponse } from 'next/server';
import { getSquadrons, createSquadron, deleteSquadron, resetSystem } from '@/lib/data';

export async function GET() {
    return NextResponse.json(getSquadrons());
}

export async function POST(request) {
    const data = await request.json();
    const squadron = createSquadron(data);
    return NextResponse.json(squadron);
}

export async function DELETE(request) {
    const { id, resetAll } = await request.json();

    if (resetAll) {
        resetSystem();
        return NextResponse.json({ success: true });
    }

    deleteSquadron(id);
    return NextResponse.json({ success: true });
}