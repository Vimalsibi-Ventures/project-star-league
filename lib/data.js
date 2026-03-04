import { getLeaderboards } from './leaderboard';
import { getDb } from './db';

// --- GETTERS (Used by Public UI) ---

export async function getSquadrons() {
    const { rankedSquadrons } = await getLeaderboards();
    return rankedSquadrons;
}

export async function getSquadron(id) {
    const { rankedSquadrons } = await getLeaderboards();
    return rankedSquadrons.find(s => s.id === id);
}

export async function getMembers() {
    const { rankedMembers } = await getLeaderboards();
    return rankedMembers;
}

export async function getMembersBySquadron(squadronId) {
    const { rankedMembers } = await getLeaderboards();
    return rankedMembers.filter(m => m.squadronId === squadronId);
}

export async function getMeetings() {
    const db = await getDb();
    return db.meetings;
}

export async function getTransactions() {
    const db = await getDb();
    return db.transactions;
}

export async function getTransactionsBySquadron(squadronId) {
    const db = await getDb();
    // Return most recent first
    return db.transactions
        .filter(t => t.squadronId === squadronId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Compute squadron stars (Redundant wrapper for compatibility, but good to keep)
export async function getSquadronStars(squadronId) {
    const squadron = await getSquadron(squadronId);
    return squadron ? squadron.totalStars : 0;
}

export async function getMemberStars(memberId) {
    const members = await getMembers();
    const member = members.find(m => m.id === memberId);
    return member ? member.totalStars : 0;
}

export async function getAuctions() {
    const db = await getDb();
    return db.auctions;
}

export async function getAuctionByMeeting(meetingId) {
    const db = await getDb();
    return db.auctions.find(a => a.meetingId === meetingId);
}