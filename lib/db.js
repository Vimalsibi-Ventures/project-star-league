import { Redis } from '@upstash/redis';

// This automatically looks for the keys in your .env file!
const redis = Redis.fromEnv();

// This is your clean, starting database structure
const DEFAULT_DB = {
    squadrons: [],
    members: [],
    meetings: [],
    auctions: [],
    transactions: [],
    hallOfFame: [],
    season: {
        seasonNumber: 1,
        status: 'ACTIVE',
        startedAt: new Date().toISOString()
    }
};

export async function getDb() {
    try {
        // Go to the cloud and get the database
        const db = await redis.get('StarLeagueDB');
        
        // If it's empty (first time running), return the default one
        if (!db) {
            return DEFAULT_DB;
        }

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
    } catch (error) {
        console.error("Database connection error:", error);
        return DEFAULT_DB; // Fallback so the site doesn't crash
    }
}

export async function saveDb(data) {
    // Send the new data to the cloud
    await redis.set('StarLeagueDB', data);
}