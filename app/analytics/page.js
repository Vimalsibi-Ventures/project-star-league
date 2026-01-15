import { getLeaderboards } from '@/lib/leaderboard';
import { getTransactions, getMeetings } from '@/lib/data';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
    const { rankedSquadrons, rankedMembers } = getLeaderboards();
    const transactions = getTransactions();
    const meetings = getMeetings();

    // ---------------------------------------------------------
    // 1. Apply Dense Ranking Logic (Consistent with Leaderboard)
    // ---------------------------------------------------------
    const sortedMembers = [...rankedMembers].sort((a, b) => b.totalStars - a.totalStars);

    let currentRank = 1;
    const fullyRankedMembers = sortedMembers.map((member, index) => {
        // Increment rank only if the current member has fewer stars than the previous one
        if (index > 0 && member.totalStars < sortedMembers[index - 1].totalStars) {
            currentRank++;
        }
        return { ...member, rank: currentRank };
    });

    // ---------------------------------------------------------
    // 2. Stats Calculation
    // ---------------------------------------------------------

    // UPDATED: Identify ALL Apex Predators (Everyone at Rank 1)
    const apexPredators = fullyRankedMembers.filter(m => m.rank === 1);

    // Economy Stats
    const totalStarsDistributed = transactions.reduce((acc, t) => acc + t.starsDelta, 0);
    const totalAuctionsWon = transactions.filter(t => t.category === 'auction').length;

    // Squadron Win/Loss (Auction Spending)
    const squadronSpending = rankedSquadrons.map(sq => {
        const spent = transactions
            .filter(t => t.squadronId === sq.id && t.category === 'auction')
            .reduce((acc, t) => acc + Math.abs(t.starsDelta), 0);
        return { name: sq.name, spent };
    }).sort((a, b) => b.spent - a.spent);

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight">League Analytics</h1>
                    <Link href="/" className="text-gray-400 text-sm font-bold uppercase hover:text-white">← Back to Arena</Link>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* APEX PREDATOR CARD (UPDATED FOR TIES) */}
                    <div className="glass-card p-6 rounded-2xl border-t-4 border-t-[#fbbf24]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {apexPredators.length > 1 ? 'Apex Predators (Tied)' : 'Apex Predator'}
                        </h3>
                        <div className={`font-black text-white mt-2 ${apexPredators.length > 2 ? 'text-lg leading-snug' : 'text-2xl'}`}>
                            {apexPredators.length > 0
                                ? apexPredators.map(p => p.name).join(', ')
                                : 'N/A'}
                        </div>
                        <div className="text-[#fbbf24] text-sm font-bold mt-1">
                            {apexPredators.length > 0 ? `${apexPredators[0].totalStars} Stars` : ''}
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border-t-4 border-t-blue-500">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Economy Size</h3>
                        <div className="text-2xl font-black text-white mt-2">{totalStarsDistributed} ★</div>
                        <div className="text-blue-400 text-sm font-bold mt-1">Total Circulation</div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-t-4 border-t-purple-500">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Auction Activity</h3>
                        <div className="text-2xl font-black text-white mt-2">{totalAuctionsWon} Items</div>
                        <div className="text-purple-400 text-sm font-bold mt-1">Sold to Squadrons</div>
                    </div>
                </div>

                {/* SQUADRON SPENDING CHART (CSS BAR CHART) */}
                <div className="glass-card p-8 rounded-2xl mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Auction Expenditure</h2>
                    <div className="space-y-4">
                        {squadronSpending.map((sq, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-32 text-xs font-bold text-gray-400 uppercase text-right">{sq.name}</div>
                                <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-[#fbbf24] to-orange-500 h-full rounded-full"
                                        style={{ width: `${Math.min((sq.spent / 200) * 100, 100)}%` }} // Scaling factor
                                    ></div>
                                </div>
                                <div className="w-16 text-xs font-bold text-white">{sq.spent} ★</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INDIVIDUAL TOP 10 (Updated with Dense Ranking) */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide">Top 10 Performers</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Member</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Squadron</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Stars</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {fullyRankedMembers.slice(0, 10).map((m) => (
                                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-[#fbbf24]">
                                        #{m.rank}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{m.name}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{m.squadronName}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-white">{m.totalStars}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}