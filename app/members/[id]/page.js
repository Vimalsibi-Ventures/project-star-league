import { getMembers, getSquadron, getMeetings } from '@/lib/data';
import { getDb } from '@/lib/db'; 
import Link from 'next/link';
import SquadronHistory from '@/components/SquadronHistory';

export default async function MemberDetailPage({ params }) {
    const members = await getMembers();
    const member = members.find(m => m.id === params.id);

    if (!member) {
        return (
            <div className="min-h-screen pt-[100px] flex items-center justify-center">
                <p className="text-gray-400 bg-white/5 px-6 py-4 rounded-xl border border-white/10">Member not found in Arena</p>
            </div>
        );
    }

    const squadron = await getSquadron(member.squadronId);
    
    // Fetch directly from DB for an exact individual filter
    const db = await getDb();
    const memberTransactions = db.transactions.filter(t => t.memberId === params.id);
    const totalStars = memberTransactions.reduce((sum, t) => sum + t.starsDelta, 0);
    
    const meetings = await getMeetings();

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#fbbf24] mb-8 uppercase tracking-widest transition-colors">
                    <span className="mr-2">←</span> Back to Arena
                </Link>

                <div className="glass-card rounded-2xl p-10 mb-8 relative overflow-hidden group border-t-4 border-t-[#fbbf24]">
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black text-white mb-2 uppercase tracking-tight">{member.name}</h1>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                            Squadron: <span className="text-[#fbbf24]">{squadron ? squadron.name : 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                ★ {totalStars}
                            </span>
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Personal Contribution</span>
                        </div>
                    </div>
                </div>

                <SquadronHistory transactions={memberTransactions} meetings={meetings} members={members} />
            </div>
        </div>
    );
}