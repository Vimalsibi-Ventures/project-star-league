import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

export function getDb() {
    if (!fs.existsSync(DB_PATH)) {
        const initialDb = {
            squadrons: [],
            members: [],
            meetings: [],
            auctions: [],
            transactions: [],
            hallOfFame: [], // NEW: Archive
            season: {       // NEW: Active Season Tracking
                seasonNumber: 1,
                status: 'ACTIVE',
                startedAt: new Date().toISOString()
            }
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
        return initialDb;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // Safety Patch: Ensure new fields exist on old DBs
    if (!db.hallOfFame) db.hallOfFame = [];
    if (!db.season) {
        db.season = {
            seasonNumber: 1,
            status: 'ACTIVE',
            startedAt: new Date().toISOString()
        };
    }

    return db;
}

export function saveDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}