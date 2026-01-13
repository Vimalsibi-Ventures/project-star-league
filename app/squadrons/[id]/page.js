import { getSquadron, getMembersBySquadron, getTransactionsBySquadron, getSquadronStars, getMeetings } from '@/lib/data';
import Link from 'next/link';

export default function SquadronDetailPage({ params }) {
    const squadron = getSquadron(params.id);

    if (!squadron) {
        return (
            <div className="min-h-screen bg-[#0e1117] pt-[72px]">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <p className="text-[#e6e9f0]">Squadron not found</p>
                </div>
            </div>
        );
    }

    const members = getMembersBySquadron(params.id);
    const transactions = getTransactionsBySquadron(params.id);
    const totalStars = getSquadronStars(params.id);
    const meetings = getMeetings();

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    return (
        <div className="min-h-screen bg-[#0e1117] pt-[72px]">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <Link href="/" className="text-[#9aa4bf] hover:text-[#4f8cff] mb-6 inline-block transition-colors">
                    ← Back to Leaderboard
                </Link>

                <div className="bg-[#151a23] border border-[#2a3245] rounded-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-[#e6e9f0] mb-4">{squadron.name}</h1>
                    <p className="text-xl text-[#9aa4bf] mb-4">
                        Total Stars: <span className="font-bold text-[#4f8cff]">★ {totalStars}</span>
                    </p>

                    <h2 className="text-xl font-semibold text-[#e6e9f0] mb-3">Members</h2>
                    <ul className="space-y-2">
                        {members.map(member => (
                            <li key={member.id} className="text-[#9aa4bf]">
                                • {member.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#151a23] border border-[#2a3245] rounded-lg overflow-hidden">
                    <div className="px-8 py-4 border-b border-[#2a3245] bg-[#0e1117]">
                        <h2 className="text-xl font-semibold text-[#e6e9f0]">Transaction History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#2a3245]">
                            <thead className="bg-[#0e1117]">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase">Date</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase">Meeting</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase">Category</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase">Stars</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-[#9aa4bf] uppercase">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#151a23] divide-y divide-[#2a3245]">
                                {sortedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-5 text-center text-[#9aa4bf]">
                                            No transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTransactions.map((transaction, index) => {
                                        const meeting = meetings.find(m => m.id === transaction.meetingId);
                                        return (
                                            <tr key={transaction.id} className={`hover:shadow-[0_0_8px_rgba(79,140,255,0.2)] transition-all ${
                                                index % 2 === 0 ? 'bg-[#151a23]' : 'bg-[#1a1f2e]'
                                            }`}>
                                                <td className="px-8 py-5 whitespace-nowrap text-base text-[#e6e9f0]">
                                                    {new Date(transaction.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-base text-[#9aa4bf]">
                                                    {meeting ? `Meeting ${meeting.date}` : 'N/A'}
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-base text-[#9aa4bf]">
                                                    {transaction.category}
                                                </td>
                                                <td className={`px-8 py-5 whitespace-nowrap text-base font-medium ${transaction.starsDelta >= 0 ? 'text-[#38e8ff]' : 'text-[#ef4444]'}`}>
                                                    {transaction.starsDelta >= 0 ? '+' : ''}{transaction.starsDelta}★
                                                </td>
                                                <td className="px-8 py-5 text-base text-[#9aa4bf]">
                                                    {transaction.description}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
