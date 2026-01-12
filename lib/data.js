// In-memory data store for v1
// This will be replaced with a database later

let squadrons = [
    { id: '1', name: 'Alpha Squadron' },
    { id: '2', name: 'Bravo Squadron' },
    { id: '3', name: 'Charlie Squadron' },
];

let members = [
    { id: '1', name: 'John Doe', squadronId: '1' },
    { id: '2', name: 'Jane Smith', squadronId: '1' },
    { id: '3', name: 'Bob Johnson', squadronId: '1' },
    { id: '4', name: 'Alice Williams', squadronId: '1' },
    { id: '5', name: 'Charlie Brown', squadronId: '2' },
    { id: '6', name: 'Diana Prince', squadronId: '2' },
    { id: '7', name: 'Eve Davis', squadronId: '2' },
    { id: '8', name: 'Frank Miller', squadronId: '2' },
    { id: '9', name: 'Grace Lee', squadronId: '3' },
    { id: '10', name: 'Henry Wilson', squadronId: '3' },
    { id: '11', name: 'Iris Chen', squadronId: '3' },
    { id: '12', name: 'Jack Ryan', squadronId: '3' },
];

let meetings = [];

let transactions = [];

// Getters
export function getSquadrons() {
    return squadrons;
}

export function getSquadron(id) {
    return squadrons.find(s => s.id === id);
}

export function getMembers() {
    return members;
}

export function getMembersBySquadron(squadronId) {
    return members.filter(m => m.squadronId === squadronId);
}

export function getMeetings() {
    return meetings;
}

export function getTransactions() {
    return transactions;
}

export function getTransactionsBySquadron(squadronId) {
    return transactions.filter(t => t.squadronId === squadronId);
}

// Compute squadron stars from transactions
export function getSquadronStars(squadronId) {
    const squadronTransactions = getTransactionsBySquadron(squadronId);
    return squadronTransactions.reduce((sum, t) => sum + t.starsDelta, 0);
}

// Compute member stars from transactions
export function getMemberStars(memberId) {
    const memberTransactions = transactions.filter(t => t.memberId === memberId);
    return memberTransactions.reduce((sum, t) => sum + t.starsDelta, 0);
}

// Setters
export function createSquadron(squadron) {
    const newSquadron = {
        id: Date.now().toString(),
        ...squadron
    };
    squadrons.push(newSquadron);
    return newSquadron;
}

export function updateSquadron(id, updates) {
    const index = squadrons.findIndex(s => s.id === id);
    if (index !== -1) {
        squadrons[index] = { ...squadrons[index], ...updates };
        return squadrons[index];
    }
    return null;
}

export function deleteSquadron(id) {
    squadrons = squadrons.filter(s => s.id !== id);
    // Also delete associated members and transactions
    members = members.filter(m => m.squadronId !== id);
    transactions = transactions.filter(t => t.squadronId !== id);
}

export function createMember(member) {
    const newMember = {
        id: Date.now().toString(),
        ...member
    };
    members.push(newMember);
    return newMember;
}

export function deleteMember(id) {
    members = members.filter(m => m.id !== id);
    transactions = transactions.filter(t => t.memberId !== id);
}

export function createMeeting(meeting) {
    const newMeeting = {
        id: Date.now().toString(),
        finalized: false,
        ...meeting
    };
    meetings.push(newMeeting);
    return newMeeting;
}

export function finalizeMeeting(id) {
    const meeting = meetings.find(m => m.id === id);
    if (meeting) {
        meeting.finalized = true;
    }
}

export function createTransaction(transaction) {
    const newTransaction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...transaction
    };
    transactions.push(newTransaction);
    return newTransaction;
}

export function resetSystem() {
    squadrons = [];
    members = [];
    meetings = [];
    transactions = [];
}