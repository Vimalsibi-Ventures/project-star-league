'use client';

import { useRouter } from 'next/navigation';

// Updated to accept 'members' and 'isSeasonal' props
export default function LeaderboardTable({ squadrons, members, isSeasonal }) {
    const router = useRouter();

    // 1. Sort by Stars (Descending)
    const sorted = [...squadrons].sort((a, b) => b.totalStars - a.totalStars);

    // 2. Calculate Rank
    let currentRank = 1;
    const rankedSquadrons = sorted.map((squad, index) => {
        if (index > 0 && squad.totalStars < sorted[index - 1].totalStars) {
            currentRank++;
        }
        return { ...squad, rank: currentRank };
    });

    return (
        <div className="w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Rank</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Squadron</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-white uppercase tracking-[0.2em]">Members</th>
                        <th className="px-6 py-5 text-right text-[11px] font-bold text-white uppercase tracking-[0.2em]">Stars</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rankedSquadrons.map((squadron, index) => {
                        const isRankOne = squadron.rank === 1;
                        
                        // DYNAMIC COUNT CALCULATION
                        const dynamicMemberCount = members.filter(m => m.squadronId === squadron.id).length;

                        // FACTION STYLING LOGIC
                        let rowClasses = `group cursor-pointer transition-all duration-300 ${isRankOne ? 'bg-gradient-to-r from-[#fbbf24]/10 to-transparent' : (index % 2 === 0 ? 'bg-white/5' : 'bg-transparent')} hover:bg-white/10`;
                        let nameClasses = `font-bold text-base transition-colors ${isRankOne ? 'text-[#fbbf24]' : 'text-gray-100 group-hover:text-white'}`;
                        let subText = isRankOne ? "Current Leader" : "";

                        if (isSeasonal) {
                            if (squadron.faction === 'pirate') {
                                rowClasses += " backdrop-blur-md bg-amber-950/70 border-l-4 border-[#fbbf24]/50 shadow-2xl";
                                nameClasses += " font-serif text-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                                subText = isRankOne ? "Pirate King" : "Wanted Pirate Crew";
                            } else if (squadron.faction === 'marine') {
                                rowClasses += " backdrop-blur-md bg-blue-950/70 border-l-4 border-red-600/50 shadow-2xl";
                                nameClasses += " font-serif text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                                subText = isRankOne ? "Fleet Admiral" : "Marine Base";
                            }
                        }

                        return (
                            <tr
                                key={squadron.id}
                                onClick={() => router.push(`/squadrons/${squadron.id}`)}
                                className={rowClasses}
                            >
                                <td className="px-6 py-6">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm
                                        ${isRankOne
                                            ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_#fbbf24] scale-110'
                                            : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}
                                    `}>
                                        {squadron.rank}
                                    </div>
                                </td>

                                <td className="px-6 py-6">
                                    <div className={nameClasses}>
                                        {squadron.name}
                                    </div>
                                    {subText && <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${isSeasonal && squadron.faction === 'marine' ? 'text-red-400' : 'text-[#fbbf24]'}`}>{subText}</div>}
                                </td>

                                {/* DYNAMIC COUNT DISPLAY */}
                                <td className="px-6 py-6 text-sm text-gray-100 group-hover:text-white">
                                    {dynamicMemberCount} Members
                                </td>

                                <td className="px-6 py-6 text-right">
                                    <div className={`text-2xl font-black tracking-tight ${isRankOne ? 'text-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'}`}>
                                        {squadron.totalStars}
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