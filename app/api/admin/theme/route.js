import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
    const db = await getDb();
    const currentSeasonIsland = db.season?.currentSeasonIsland || 1;
    return NextResponse.json({ 
        isSeasonalThemeEnabled: db.isSeasonalThemeEnabled || false,
        currentSeasonIsland
    });
}

export async function POST(request) {
    const { isSeasonalThemeEnabled } = await request.json();
    const db = await getDb();
    db.isSeasonalThemeEnabled = isSeasonalThemeEnabled;
    await saveDb(db);
    return NextResponse.json({ success: true, isSeasonalThemeEnabled: db.isSeasonalThemeEnabled });
}
