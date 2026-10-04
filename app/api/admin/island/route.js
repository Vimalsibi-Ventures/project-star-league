import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
    const { currentSeasonIsland } = await request.json();
    const db = await getDb();
    
    if (!db.season) {
        db.season = {
            seasonNumber: 1,
            status: 'ACTIVE',
            startedAt: new Date().toISOString(),
            currentSeasonIsland: 1
        };
    }
    
    db.season.currentSeasonIsland = currentSeasonIsland;
    await saveDb(db);
    
    return NextResponse.json({ success: true, currentSeasonIsland: db.season.currentSeasonIsland });
}
