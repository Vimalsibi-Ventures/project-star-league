import LeaderboardTable from '@/components/LeaderboardTable';
import { getSquadrons, getMembersBySquadron, getSquadronStars } from '@/lib/data';

export default function HomePage() {
    const squadrons = getSquadrons();

    // Compute leaderboard data
    const leaderboardData = squadrons.map(squadron => {
        const members = getMembersBySquadron(squadron.id);
        const totalStars = getSquadronStars(squadron.id);

        return {
            id: squadron.id,
            name: squadron.name,
            memberCount: members.length,
            totalStars
        };
    }).sort((a, b) => b.totalStars - a.totalStars);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Squadron Leaderboard
                </h1>
                <p className="text-lg text-gray-600">
                    Compete, collaborate, and climb to the top!
                </p>
            </div>

            <LeaderboardTable squadrons={leaderboardData} />

            <div className="mt-8 text-center">
                <a
                    href="/members"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    View Individual Leaderboard →
                </a>
            </div>
        </div>
    );
}