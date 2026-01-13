import { getSquadrons, getMembers } from '@/lib/data';
import LandingClient from '@/components/LandingClient';

export const dynamic = 'force-dynamic'; // Ensure data is fresh on every load

export default function HomePage() {
    // 1. Fetch Data on the Server (Where 'fs' is allowed)
    const leaderboardData = getSquadrons();
    const memberData = getMembers();

    // 2. Pass Data to Client Component
    return (
        <LandingClient
            leaderboardData={leaderboardData}
            memberData={memberData}
        />
    );
}