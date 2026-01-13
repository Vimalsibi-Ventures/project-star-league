import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'store.json');

// ADD 'auctions' to defaults
const DEFAULTS = {
    squadrons: [],
    members: [],
    meetings: [],
    transactions: [],
    auctions: [] // <--- NEW
};

export function getDb() {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULTS));
            return DEFAULTS;
        }

        const file = fs.readFileSync(DB_PATH, 'utf-8');
        // Ensure existing DBs get the new field if missing
        const data = JSON.parse(file);
        if (!data.auctions) data.auctions = [];
        return data;
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