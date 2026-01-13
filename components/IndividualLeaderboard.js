'use client';

export default function IndividualLeaderboard({ members }) {
    return (
        <div className="bg-[#151a23] border border-[#2a3245] rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-[#2a3245]">
                <thead className="bg-[#0e1117]">
                    <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase tracking-wider">
                            Rank
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase tracking-wider">
                            Member Name
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase tracking-wider">
                            Squadron
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase tracking-wider">
                            Contribution Stars
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-[#151a23] divide-y divide-[#2a3245]">
                    {members.map((member, index) => (
                        <tr
                            key={member.id}
                            className={`hover:shadow-[0_0_8px_rgba(79,140,255,0.3)] transition-all ${index === 0 ? 'bg-[#1c2333]' : index % 2 === 0 ? 'bg-[#151a23]' : 'bg-[#1a1f2e]'
                                }`}
                        >
                            <td className={`px-8 py-5 whitespace-nowrap text-lg font-bold ${index === 0 ? 'text-[#d4af37]' : 'text-[#e6e9f0]'
                                }`}>
                                {index === 0 ? '🥇' : index + 1}
                            </td>
                            <td className={`px-8 py-5 whitespace-nowrap text-base font-medium ${index === 0 ? 'text-[#d4af37]' : 'text-[#e6e9f0]'
                                }`}>
                                {member.name}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-base text-[#9aa4bf]">
                                {member.squadronName}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-lg font-bold text-[#e6e9f0]">
                                ★ {member.totalStars}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
