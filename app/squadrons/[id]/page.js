import { getSquadron, getMembersBySquadron, getTransactionsBySquadron, getSquadronStars, getMeetings } from '@/lib/data';
import Link from 'next/link';

export default function SquadronDetailPage({ params }) {
    const squadron = getSquadron(params.id);

    if (!squadron) {
        return (
            <div className="min-h-screen pt-[100px] flex items-center justify-center">
                <p className="text-gray-400 bg-white/5 px-6 py-4 rounded-xl border border-white/10">Squadron not found</p>
            </div>
        );
    }

    const members = getMembersBySquadron(params.id);
    const transactions = getTransactionsBySquadron(params.id);
    const totalStars = getSquadronStars(params.id);
    const meetings = getMeetings();

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#fbbf24] mb-8 uppercase tracking-widest transition-colors">
                    <span className="mr-2">←</span> Back to Arena
                </Link>

                {/* SQUADRON HEADER CARD */}
                <div className="glass-card rounded-2xl p-10 mb-8 relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#fbbf24] opacity-[0.03] blur-[80px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-700"></div>

                    <div className="relative z-10">
                        <h1 className="text-5xl font-black text-white mb-2 uppercase tracking-tight">{squadron.name}</h1>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-3xl font-bold text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                ★ {totalStars}
                            </span>
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Stars</span>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Active Roster</h2>
                            <div className="flex flex-wrap gap-3">
                                {members.map(member => (
                                    <div key={member.id} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-gray-300 hover:border-[#fbbf24]/50 hover:text-white transition-all">
                                        {member.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION HISTORY */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#fbbf24] rounded-full shadow-[0_0_10px_#fbbf24]"></div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Transaction Log</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Impact</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-gray-500 text-sm">
                                            No activity recorded yet
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTransactions.map((transaction) => {
                                        const meeting = meetings.find(m => m.id === transaction.meetingId);
                                        const isPositive = transaction.starsDelta >= 0;

                                        return (
                                            <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-4 text-sm text-gray-300 font-mono">
                                                    {new Date(transaction.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-4 text-sm text-gray-400">
                                                    {meeting ? `Meeting ${meeting.date}` : 'System Admin'}
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-gray-400">
                                                        {transaction.category}
                                                    </span>
                                                </td>
                                                <td className={`px-8 py-4 text-sm font-bold ${isPositive ? 'text-[#fbbf24]' : 'text-red-400'}`}>
                                                    {isPositive ? '+' : ''}{transaction.starsDelta} ★
                                                </td>
                                                <td className="px-8 py-4 text-sm text-gray-500">
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