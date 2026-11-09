import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
    const db = await getDb();
    const currentSeasonIsland = db.season?.currentSeasonIsland || 1;
    const meetingsCompleted = db.meetingsCompleted ?? db.season?.meetingsCompleted ?? 0;
    return NextResponse.json({ 
        isSeasonalThemeEnabled: db.isSeasonalThemeEnabled || false,
        currentSeasonIsland,
        meetingsCompleted
    });
}

export async function POST(request) {
    const body = await request.json();
    const db = await getDb();

    if (body.isSeasonalThemeEnabled !== undefined) {
        db.isSeasonalThemeEnabled = body.isSeasonalThemeEnabled;
    }
    if (body.meetingsCompleted !== undefined) {
        const parsedMeetings = Math.max(parseInt(body.meetingsCompleted, 10) || 0, 0);
        db.meetingsCompleted = parsedMeetings;
        if (db.season) db.season.meetingsCompleted = parsedMeetings;
    }
    if (body.currentSeasonIsland !== undefined) {
        const clampedIsland = Math.min(Math.max(parseInt(body.currentSeasonIsland, 10) || 1, 1), 5);
        if (db.season) db.season.currentSeasonIsland = clampedIsland;
    }

    await saveDb(db);
    return NextResponse.json({ 
        success: true, 
        isSeasonalThemeEnabled: db.isSeasonalThemeEnabled,
        currentSeasonIsland: db.season?.currentSeasonIsland || 1,
        meetingsCompleted: db.meetingsCompleted ?? db.season?.meetingsCompleted ?? 0
    });
}
