import { getSquadron, getMembersBySquadron, getTransactionsBySquadron, getSquadronStars, getMeetings } from '@/lib/data';
import Link from 'next/link';
import SquadronHistory from '@/components/SquadronHistory'; // Import the new component

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

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#fbbf24] mb-8 uppercase tracking-widest transition-colors">
                    <span className="mr-2">←</span> Back to Arena
                </Link>

                {/* SQUADRON HEADER CARD */}
                <div className="glass-card rounded-2xl p-10 mb-8 relative overflow-hidden group">
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

                {/* TRANSACTION HISTORY (New Component) */}
                <SquadronHistory transactions={transactions} meetings={meetings} />
            </div>
        </div>
    );
}