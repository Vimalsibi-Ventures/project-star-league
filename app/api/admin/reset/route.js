import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
    const { type } = await request.json();
    const db = getDb();

    if (type === 'hard') {
        saveDb({ squadrons: [], members: [], meetings: [], auctions: [], transactions: [] });
        return NextResponse.json({ success: true });
    }

    if (type === 'soft') {
        // Clear Schedule & Operations
        db.meetings = [];
        // Note: We keep auctions array but unlink them from deleted meetings naturally
        // Or we could clear auctions too since they are tied to meetings?
        // Prompt says "Clears: meetings, meeting role resolutions... attendance". "Preserves: auction history".
        // To preserve history, we shouldn't delete the auction objects, just breaks the link or keep as archive.
        // We will keep them.

        // Ledger remains untouched as requested.

        saveDb(db);
        return NextResponse.json({ success: true, message: 'Term Reset Complete' });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
}