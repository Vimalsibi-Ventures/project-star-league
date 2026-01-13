import { getLeaderboards } from './leaderboard';
import { getDb } from './db';

// --- GETTERS (Used by Public UI) ---

export function getSquadrons() {
    const { rankedSquadrons } = getLeaderboards();
    return rankedSquadrons;
}

export function getSquadron(id) {
    const { rankedSquadrons } = getLeaderboards();
    return rankedSquadrons.find(s => s.id === id);
}

export function getMembers() {
    const { rankedMembers } = getLeaderboards();
    return rankedMembers;
}

export function getMembersBySquadron(squadronId) {
    const { rankedMembers } = getLeaderboards();
    return rankedMembers.filter(m => m.squadronId === squadronId);
}

export function getMeetings() {
    return getDb().meetings;
}

export function getTransactions() {
    return getDb().transactions;
}

export function getTransactionsBySquadron(squadronId) {
    // Return most recent first
    return getDb().transactions
        .filter(t => t.squadronId === squadronId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Compute squadron stars (Redundant wrapper for compatibility, but good to keep)
export function getSquadronStars(squadronId) {
    const squadron = getSquadron(squadronId);
    return squadron ? squadron.totalStars : 0;
}

export function getMemberStars(memberId) {
    const members = getMembers();
    const member = members.find(m => m.id === memberId);
    return member ? member.totalStars : 0;
}