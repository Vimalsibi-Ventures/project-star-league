import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
    const body = await request.json();
    const db = await getDb();
    
    if (!db.season) {
        db.season = {
            seasonNumber: 1,
            status: 'ACTIVE',
            startedAt: new Date().toISOString(),
            currentSeasonIsland: 1,
            meetingsCompleted: 0
        };
    }
    
    if (body.currentSeasonIsland !== undefined) {
        const clampedIsland = Math.min(Math.max(parseInt(body.currentSeasonIsland, 10) || 1, 1), 5);
        db.season.currentSeasonIsland = clampedIsland;
    }

    if (body.meetingsCompleted !== undefined) {
        const parsedMeetings = Math.max(parseInt(body.meetingsCompleted, 10) || 0, 0);
        db.meetingsCompleted = parsedMeetings;
        db.season.meetingsCompleted = parsedMeetings;
    }
    
    await saveDb(db);
    
    return NextResponse.json({ 
        success: true, 
        currentSeasonIsland: db.season.currentSeasonIsland,
        meetingsCompleted: db.meetingsCompleted ?? db.season.meetingsCompleted ?? 0
    });
}
