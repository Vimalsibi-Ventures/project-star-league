import { getSquadrons, getMembers, getMeetings, getAuctionByMeeting } from '@/lib/data';
import { getDb } from '@/lib/db'; // Import DB access for Season info
import LandingClient from '@/components/LandingClient';
import { MEETING_STATUS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default function HomePage() {
    const leaderboardData = getSquadrons();
    const memberData = getMembers();
    const allMeetings = getMeetings();
    const db = getDb(); // Fetch DB for Season state
    const today = new Date();

    // 1. Get Active Season Number
    const currentSeason = db.season ? db.season.seasonNumber : 1;

    // PATCH-A & PATCH-F: STRICT VISIBILITY LOGIC (Preserved)
    const upcomingMeeting = allMeetings
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .find(m => {
            // 1. NEVER show Closed or Draft (Admin only)
            if (m.status === MEETING_STATUS.CLOSED || m.status === MEETING_STATUS.DRAFT) {
                return false;
            }

            // 2. ALWAYS show if currently active (overrides date)
            const activeStates = [
                MEETING_STATUS.AUCTION_FINALIZED,
                MEETING_STATUS.ROLE_RESOLUTION,
                MEETING_STATUS.MEETING_LIVE,
                MEETING_STATUS.ATTENDANCE_FINALIZED,
                MEETING_STATUS.AWARDS_ASSIGNED
            ];
            if (activeStates.includes(m.status)) {
                return true;
            }

            // 3. If configured (Auction Configured) but date is future
            if (m.status === MEETING_STATUS.AUCTION_CONFIGURED && new Date(m.date) >= new Date(today.setHours(0, 0, 0, 0))) {
                return true;
            }

            return false;
        });

    let auctionData = null;
    let meetingAssignments = [];

    if (upcomingMeeting) {
        const auction = getAuctionByMeeting(upcomingMeeting.id);
        if (auction && auction.items) {
            auctionData = {
                ...auction,
                items: auction.items.map(item => {
                    const squad = leaderboardData.find(s => s.id === item.winningSquadronId);
                    return { ...item, winnerName: squad ? squad.name : 'Unclaimed' };
                })
            };
        }
        meetingAssignments = upcomingMeeting.roleAssignments || [];
    }

    return (
        <LandingClient
            leaderboardData={leaderboardData}
            memberData={memberData}
            upcomingMeeting={upcomingMeeting}
            auctionData={auctionData}
            meetingAssignments={meetingAssignments}
            seasonNumber={currentSeason} // Pass Season Number to Client
        />
    );
}