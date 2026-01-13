import fs from 'fs';
import path from 'path';

// Define where the data lives. 
// Note: In Vercel/Production, you cannot write to the file system like this. 
// This is strictly for your local Phase-1 development as requested.
const DB_PATH = path.join(process.cwd(), 'data', 'store.json');

const DEFAULTS = {
    squadrons: [],
    members: [],
    meetings: [],
    transactions: []
};

export function getDb() {
    try {
        // Create data folder if it doesn't exist
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULTS));
            return DEFAULTS;
        }

        const file = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(file);
    } catch (error) {
        console.error("DB Read Error:", error);
        return DEFAULTS;
    }
}

export function saveDb(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error("DB Write Error:", error);
        return false;
    }
}