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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
                ← Back to Squadron Leaderboard
            </Link>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Individual Leaderboard
                </h1>
                <p className="text-lg text-gray-600">
                    Top contributors across all squadrons
                </p>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Member Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Squadron
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Stars
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {memberData.map((member, index) => (
                            <tr
                                key={member.id}
                                className={index === 0 ? 'bg-yellow-50' : ''}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {index === 0 ? '🥇' : index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {member.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {member.squadronName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ★ {member.totalStars}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}