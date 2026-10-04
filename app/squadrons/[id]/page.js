import { getSquadron, getMembersBySquadron, getTransactionsBySquadron, getSquadronStars, getMeetings, getMembers } from '@/lib/data';
import { getDb } from '@/lib/db';
import Link from 'next/link';
import SquadronHistory from '@/components/SquadronHistory';
import LeagueCurrency from '@/components/LeagueCurrency';

export default async function SquadronDetailPage({ params }) {
    const squadron = await getSquadron(params.id);
    const db = await getDb();
    const isSeasonal = db.isSeasonalThemeEnabled || false;

    if (!squadron) {
        return (
            <div className="min-h-screen pt-[100px] flex items-center justify-center">
                <p className="text-gray-400 bg-white/5 px-6 py-4 rounded-xl border border-white/10">Squadron not found</p>
            </div>
        );
    }

    const roster = await getMembersBySquadron(params.id);
    const transactions = await getTransactionsBySquadron(params.id);
    const totalStars = await getSquadronStars(params.id);
    const meetings = await getMeetings();
    const allMembers = await getMembers();

    // Use the dynamic logoUrl if available, otherwise fallback to the original slug system
    const imageSlug = squadron.name.toLowerCase().trim().replace(/\s+/g, '-');
    const fallbackLogoPath = `/images/squadrons/${imageSlug}.jpeg`;
    const finalLogo = squadron.logoUrl || fallbackLogoPath;

    // Faction Styling Logic
    let cardClasses = "glass-card rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden group";
    let titleClasses = "text-5xl md:text-6xl font-black text-white mb-2 uppercase tracking-tight";
    let borderClasses = "border-4 border-[#fbbf24]/80"; // Default avatar border

    if (isSeasonal) {
        if (squadron.faction === 'pirate') {
            cardClasses += " backdrop-blur-md bg-amber-950/70 border border-[#fbbf24]/50 shadow-2xl";
            titleClasses += " font-serif text-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
        } else if (squadron.faction === 'marine') {
            cardClasses += " backdrop-blur-md bg-blue-950/70 border border-red-600/50 shadow-2xl";
            borderClasses = "border-4 border-red-600";
            titleClasses += " font-serif text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
        }
    }

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#fbbf24] mb-8 uppercase tracking-widest transition-colors">
                    <span className="mr-2">←</span> Back to Arena
                </Link>

                {/* SQUADRON HEADER CARD */}
                <div className={cardClasses}>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#fbbf24] opacity-[0.03] blur-[100px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>

                    {/* Flexbox Layout to separate Left (Text) and Right (Logo) */}
                    <div className="relative z-10 flex flex-col-reverse md:flex-row justify-between items-center md:items-start gap-10">
                        
                        {/* LEFT SIDE: Information */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <h1 className={titleClasses}>{squadron.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                                <span className="text-3xl font-bold text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                    <LeagueCurrency /> {totalStars}
                                </span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Stars</span>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Active Roster</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {roster.map(member => (
                                        <Link key={member.id} href={`/members/${member.id}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-gray-300 hover:border-[#fbbf24] hover:text-[#fbbf24] transition-all">
                                            {member.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: The Glowing Logo */}
                        <div className="flex-shrink-0 relative">
                            {/* Inner Golden Border & Drop Shadow */}
                            <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full p-1.5 bg-black/40 shadow-[0_0_30px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-all duration-500 ${borderClasses}`}>
                                {/* The Actual Image */}
                                <img
                                    src={finalLogo}
                                    alt={`${squadron.name} Crest`}
                                    className="w-full h-full object-cover rounded-full bg-[#0a0c10]"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* TRANSACTION HISTORY */}
                <SquadronHistory transactions={transactions} meetings={meetings} members={allMembers} />
            </div>
        </div>
    );
}