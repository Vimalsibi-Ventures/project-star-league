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
    },
    isSeasonalThemeEnabled: false
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
        
        // Safety Patch: Ensure isActive and faction exists for historical persistence
        db.squadrons.forEach(s => {
            if (s.isActive === undefined) s.isActive = true;
            if (s.faction === undefined) s.faction = 'unaligned';
        });
        db.members.forEach(m => {
            if (m.isActive === undefined) m.isActive = true;
        });

        // Safety Patch: Ensure isSeasonalThemeEnabled exists
        if (db.isSeasonalThemeEnabled === undefined) {
            db.isSeasonalThemeEnabled = false;
        }

        return db;
    } catch (error) {
        console.error("Database connection error:", error);
        // FIX: Throw an error instead of returning DEFAULT_DB to prevent the Silent Reset
        throw new Error("Failed to fetch database. Aborting to prevent data wipe.");
    }
}

export async function saveDb(data) {
    // Send the new data to the cloud (Kept for admin resets or full state overwrites)
    await redis.set('StarLeagueDB', data);
}

// FIX: Add atomicAppend to handle safe, concurrent writes via Lua scripting
export async function atomicAppend(collectionName, newItem) {
    const script = `
        local dbStr = redis.call('GET', KEYS[1])
        if not dbStr then return false end
        
        local db = cjson.decode(dbStr)
        local newItem = cjson.decode(ARGV[2])
        
        -- Append the new item to the requested collection
        table.insert(db[ARGV[1]], newItem)
        
        redis.call('SET', KEYS[1], cjson.encode(db))
        return true
    `;

    try {
        await redis.eval(
            script, 
            ['StarLeagueDB'], // KEYS[1]
            [collectionName, JSON.stringify(newItem)] // ARGV[1], ARGV[2]
        );
    } catch (error) {
        console.error(`Failed atomic append for ${collectionName}:`, error);
        throw error;
    }
}