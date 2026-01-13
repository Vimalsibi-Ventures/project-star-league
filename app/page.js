import { getSquadrons, getMembers, getMeetings, getAuctionByMeeting } from '@/lib/data';
import LandingClient from '@/components/LandingClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
    const leaderboardData = getSquadrons();
    const memberData = getMembers();

    // Logic to find Next Meeting & Auction
    const allMeetings = getMeetings();
    const today = new Date();
    // Find first meeting in the future
    const upcomingMeeting = allMeetings
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .find(m => new Date(m.date) >= today);

    let auctionData = null;
    if (upcomingMeeting) {
        const auction = getAuctionByMeeting(upcomingMeeting.id);
        if (auction && auction.items && auction.items.length > 0) {
            // Enrich items with Squadron Names for display
            auctionData = {
                ...auction,
                items: auction.items.map(item => {
                    const squad = leaderboardData.find(s => s.id === item.winningSquadronId);
                    return { ...item, winnerName: squad ? squad.name : 'Unclaimed' };
                })
            };
        }
    }

    return (
        <LandingClient
            leaderboardData={leaderboardData}
            memberData={memberData}
            upcomingMeeting={upcomingMeeting}
            auctionData={auctionData}
        />
    );
}