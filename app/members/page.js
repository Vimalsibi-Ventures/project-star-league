import { getMembers, getSquadron, getMemberStars } from '@/lib/data';
import Link from 'next/link';

export default function MembersPage() {
    const members = getMembers();

    // Compute member stars and sort
    const memberData = members.map(member => {
        const squadron = getSquadron(member.squadronId);
        const totalStars = getMemberStars(member.id);

        return {
            ...member,
            squadronName: squadron ? squadron.name : 'Unknown',
            totalStars
        };
    }).sort((a, b) => b.totalStars - a.totalStars);

    return (
        <div className="min-h-screen bg-[#0d0f14] pt-[72px]">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <Link href="/" className="text-[#b3b8c5] hover:text-[#f5c518] mb-8 inline-block transition-colors font-medium text-sm uppercase tracking-wide">
                    ← Back to Arena
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#f5f7fa] mb-4 uppercase tracking-wide">
                        Global Rankings
                    </h1>
                    <p className="text-lg text-[#7a8194] max-w-2xl mx-auto">
                        Top performing orators across the entire league
                    </p>
                </div>

                <div className="bg-[#161a22] border border-[#2a2f3a] rounded-xl overflow-hidden shadow-2xl">
                    <table className="min-w-full divide-y divide-[#2a2f3a]">
                        <thead className="bg-[#0d0f14]">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#7a8194] uppercase tracking-widest">
                                    Rank
                                </th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#7a8194] uppercase tracking-widest">
                                    Member Name
                                </th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#7a8194] uppercase tracking-widest">
                                    Squadron
                                </th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#7a8194] uppercase tracking-widest">
                                    Total Stars
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2f3a]">
                            {memberData.map((member, index) => (
                                <tr
                                    key={member.id}
                                    className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-[#161a22]' : 'bg-[#1a1e26]'
                                        } hover:bg-[#1f2430] hover:shadow-[inset_4px_0_0_#f5c518]`}
                                >
                                    <td className={`px-8 py-6 whitespace-nowrap text-xl font-bold ${index === 0 ? 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-[#f5f7fa]'
                                        }`}>
                                        {index === 0 ? '🥇' : index + 1}
                                    </td>
                                    <td className={`px-8 py-6 whitespace-nowrap text-base font-bold ${index === 0 ? 'text-[#d4af37]' : 'text-[#f5f7fa]'
                                        }`}>
                                        {member.name}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-[#b3b8c5]">
                                        {member.squadronName}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-xl font-black text-[#f5f7fa]">
                                        ★ {member.totalStars}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}