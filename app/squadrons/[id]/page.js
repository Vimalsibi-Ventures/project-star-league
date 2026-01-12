import { getSquadron, getMembersBySquadron, getTransactionsBySquadron, getSquadronStars, getMeetings } from '@/lib/data';
import Link from 'next/link';

export default function SquadronDetailPage({ params }) {
    const squadron = getSquadron(params.id);

    if (!squadron) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <p>Squadron not found</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
                ← Back to Leaderboard
            </Link>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{squadron.name}</h1>
                <p className="text-xl text-gray-600 mb-4">
                    Total Stars: <span className="font-bold text-blue-600">★ {totalStars}</span>
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-3">Members</h2>
                <ul className="space-y-2">
                    {members.map(member => (
                        <li key={member.id} className="text-gray-700">
                            • {member.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stars</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No transactions yet
                                    </td>
                                </tr>
                            ) : (
                                sortedTransactions.map(transaction => {
                                    const meeting = meetings.find(m => m.id === transaction.meetingId);
                                    return (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {meeting ? `Meeting ${meeting.date}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.category}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.starsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.starsDelta >= 0 ? '+' : ''}{transaction.starsDelta}★
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
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
    );
}