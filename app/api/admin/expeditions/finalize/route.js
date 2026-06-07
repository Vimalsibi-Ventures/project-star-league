import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_CATEGORY } from '@/lib/constants';
import {
    computeMeetingTransactions,
    computeRoleTransactions,
    computeTableTopicsTransactions,
    computePenaltyTransactions
} from '@/lib/scoringEngine';

export async function POST(request) {
    try {
        const { expeditionIds, clubName, squadronId, attendanceData, ttData, totalMembersCount, roleUpdates } = await request.json();
        const db = await getDb();
        const timestamp = new Date().toISOString();

        // 1. Mock Meeting (Using first ID as anchor)
        const mockMeeting = { id: expeditionIds[0], type: 'offline', clubName, isExpedition: true, tableTopics: ttData || { participants: [] } };
        const scoringInputs = { attendedMemberIds: attendanceData.attended || [], lateMemberIds: attendanceData.late || [], totalMembersCount, manualAdjustment: 0 };

        // 2. Map Roles & Awards
        const roleData = roleUpdates.map(r => ({ squadronId, memberId: r.memberId, roleName: r.roleName, status: r.status, winningSquadronId: squadronId }));
        
        const awardTransactions = roleUpdates.filter(r => r.isBestPerformer).map(r => ({
            id: uuidv4(), meetingId: mockMeeting.id, squadronId, memberId: r.memberId,
            category: TRANSACTION_CATEGORY.AWARD, description: `Best Performer: ${r.roleName} at ${clubName}`,
            starsDelta: 5, timestamp, locked: true
        }));

        // 3. Scoring (Runs once per group)
        const allNewTransactions = [
            ...computeMeetingTransactions(mockMeeting, squadronId, scoringInputs),
            ...computeRoleTransactions(mockMeeting, roleData),
            ...computeTableTopicsTransactions(mockMeeting),
            ...computePenaltyTransactions(mockMeeting, roleData),
            ...awardTransactions
        ];

        // 4. Update Shared State
        if (!db.transactions) db.transactions = [];
        db.transactions.push(...allNewTransactions);

        expeditionIds.forEach(id => {
            const exp = db.expeditions.find(e => e.id === id);
            if (exp) { exp.status = 'finalized'; exp.finalizedAt = timestamp; }
        });

        await saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}