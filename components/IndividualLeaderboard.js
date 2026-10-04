'use client';

import { useRouter } from 'next/navigation';
import LeagueCurrency from '@/components/LeagueCurrency';

export default function IndividualLeaderboard({ members, squadrons, isSeasonal }) {
    const router = useRouter();

    // PATCH 2: Dense Ranking Logic
    const sorted = [...members].sort((a, b) => b.totalStars - a.totalStars);

    let currentRank = 1;
    const rankedMembers = sorted.map((member, index) => {
        if (index > 0 && member.totalStars < sorted[index - 1].totalStars) {
            currentRank++;
        }

        // Find the squadron to determine faction
        const sq = squadrons ? squadrons.find(s => s.id === member.squadronId) : null;
        return { ...member, rank: currentRank, faction: sq?.faction || 'unaligned' };
    });

    // Determine Top Pirates & Marines for titles
    let pirateCount = 0;
    let marineCount = 0;
    const rankedWithTitles = rankedMembers.map((member) => {
        let seasonalTitle = null;
        let seasonalFaction = 'unaligned';

        if (isSeasonal) {
            if (member.faction === 'pirate') {
                pirateCount++;
                if (pirateCount <= 4) {
                    seasonalTitle = "Yonko (Emperor)";
                    seasonalFaction = 'pirate';
                } else {
                    seasonalTitle = "Pirate";
                    seasonalFaction = 'pirate';
                }
            } else if (member.faction === 'marine') {
                marineCount++;
                if (marineCount === 1) {
                    seasonalTitle = "Admiral";
                    seasonalFaction = 'marine';
                } else if (marineCount <= 4) {
                    seasonalTitle = "Vice Admiral";
                    seasonalFaction = 'marine';
                } else {
                    seasonalTitle = "Marine";
                    seasonalFaction = 'marine';
                }
            }
        }
        return { ...member, seasonalTitle, seasonalFaction };
    });

    return (
        <div className="w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Rank</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Member</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Squadron</th>
                        <th className="px-6 py-5 text-right text-[11px] font-bold text-white uppercase tracking-[0.2em]">Stars</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rankedWithTitles.map((member, index) => {
                        const isRankOne = member.rank === 1;
                        const isTopThree = member.rank <= 3;
                        
                        let rowClasses = `group cursor-pointer transition-all duration-300 ${isRankOne ? 'bg-gradient-to-r from-[#fbbf24]/10 to-transparent' : (index % 2 === 0 ? 'bg-white/5' : 'bg-transparent')} hover:bg-white/10`;
                        let nameClasses = `font-bold text-base transition-colors ${isRankOne ? 'text-[#fbbf24]' : 'text-gray-100 group-hover:text-white'}`;
                        let scoreClasses = `text-xl font-black tracking-tight ${isRankOne ? 'text-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'}`;

                        if (isSeasonal) {
                            if (member.seasonalFaction === 'pirate' && member.seasonalTitle === 'Yonko (Emperor)') {
                                rowClasses += " backdrop-blur-md bg-amber-950/70 border-l-4 border-[#fbbf24]/50 shadow-2xl";
                                nameClasses += " font-serif text-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                                scoreClasses = "text-xl font-black text-[#fbbf24] font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                            } else if (member.seasonalFaction === 'marine' && (member.seasonalTitle === 'Admiral' || member.seasonalTitle === 'Vice Admiral')) {
                                rowClasses += " backdrop-blur-md bg-blue-950/70 border-l-4 border-red-600/50 shadow-2xl";
                                nameClasses += " font-serif text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                                scoreClasses = "text-xl font-black text-red-400 font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                            }
                        }

                        return (
                            <tr
                                key={member.id}
                                // PATCH: Added router.push to make the ENTIRE ROW clickable!
                                onClick={() => router.push(`/members/${member.id}`)}
                                className={rowClasses}
                            >
                                {/* RANK */}
                                <td className="px-6 py-5">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm
                                        ${isRankOne
                                            ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_#fbbf24] scale-110'
                                            : isTopThree
                                                ? 'bg-white/10 text-white border border-white/10'
                                                : 'bg-transparent text-gray-500'}
                                    `}>
                                        {isRankOne ? '👑' : member.rank}
                                    </div>
                                </td>

                                {/* MEMBER NAME */}
                                <td className="px-6 py-5">
                                    <div className={nameClasses}>
                                        {member.name}
                                    </div>
                                    {member.seasonalTitle && (
                                        <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${member.seasonalFaction === 'marine' ? 'text-red-400' : 'text-[#fbbf24]'}`}>
                                            {member.seasonalTitle}
                                        </div>
                                    )}
                                </td>

                                {/* SQUADRON */}
                                <td className="px-6 py-5 text-sm text-gray-300 group-hover:text-white uppercase tracking-wide text-[10px]">
                                    {member.squadronName}
                                </td>

                                {/* STARS */}
                                <td className="px-6 py-5 text-right">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 opacity-60">
                                        {isSeasonal ? 'Active Bounty' : 'Total Score'}
                                    </div>
                                    <div className={scoreClasses}>
                                        <LeagueCurrency /> {member.totalStars}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}