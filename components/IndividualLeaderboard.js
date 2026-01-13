'use client';

export default function IndividualLeaderboard({ members }) {
    return (
        <div className="w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Rank</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Member</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Squadron</th>
                        <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Stars</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {members.map((member, index) => {
                        const isFirst = index === 0;
                        const isTopThree = index < 3;

                        return (
                            <tr
                                key={member.id}
                                className={`
                                    group transition-all duration-300
                                    ${isFirst ? 'bg-gradient-to-r from-[#fbbf24]/10 to-transparent' : 'hover:bg-white/[0.02]'}
                                `}
                            >
                                {/* RANK */}
                                <td className="px-6 py-5">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm
                                        ${isFirst
                                            ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_#fbbf24] scale-110'
                                            : isTopThree
                                                ? 'bg-white/10 text-white border border-white/10'
                                                : 'bg-transparent text-gray-500'}
                                    `}>
                                        {index === 0 ? '👑' : index + 1}
                                    </div>
                                </td>

                                {/* MEMBER NAME */}
                                <td className="px-6 py-5">
                                    <div className={`font-bold text-base transition-colors ${isFirst ? 'text-[#fbbf24]' : 'text-gray-200 group-hover:text-white'}`}>
                                        {member.name}
                                    </div>
                                </td>

                                {/* SQUADRON */}
                                <td className="px-6 py-5 text-sm text-gray-500 group-hover:text-gray-300 uppercase tracking-wide text-[10px]">
                                    {member.squadronName}
                                </td>

                                {/* STARS */}
                                <td className="px-6 py-5 text-right">
                                    <div className={`text-xl font-black tracking-tight ${isFirst ? 'text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-white'}`}>
                                        {member.totalStars}
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