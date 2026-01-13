'use client';

import { useRouter } from 'next/navigation';

export default function LeaderboardTable({ squadrons }) {
    const router = useRouter();
    return (
        <div className="w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Rank</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Squadron</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Members</th>
                        <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Stars</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {squadrons.map((squadron, index) => {
                        const isFirst = index === 0;
                        return (
                            <tr
                                key={squadron.id}
                                onClick={() => router.push(`/squadrons/${squadron.id}`)}
                                className={`
                                    group cursor-pointer transition-all duration-300
                                    ${isFirst ? 'bg-gradient-to-r from-[#fbbf24]/10 to-transparent' : 'hover:bg-white/[0.02]'}
                                `}
                            >
                                {/* RANK */}
                                <td className="px-6 py-6">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm
                                        ${isFirst
                                            ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_#fbbf24] scale-110'
                                            : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}
                                    `}>
                                        {index + 1}
                                    </div>
                                </td>

                                {/* NAME */}
                                <td className="px-6 py-6">
                                    <div className={`font-bold text-base transition-colors ${isFirst ? 'text-[#fbbf24]' : 'text-gray-200 group-hover:text-white'}`}>
                                        {squadron.name}
                                    </div>
                                    {isFirst && <div className="text-[10px] text-[#fbbf24] uppercase tracking-wider font-bold mt-1">Current Leaders</div>}
                                </td>

                                {/* COUNT */}
                                <td className="px-6 py-6 text-sm text-gray-500 group-hover:text-gray-300">
                                    {squadron.memberCount} Members
                                </td>

                                {/* STARS */}
                                <td className="px-6 py-6 text-right">
                                    <div className={`text-2xl font-black tracking-tight ${isFirst ? 'text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-white'}`}>
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