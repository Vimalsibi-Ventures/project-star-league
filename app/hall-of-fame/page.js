import { getDb } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HallOfFamePage() {
    const db = getDb();
    const history = db.hallOfFame || [];

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
                        Hall of <span className="text-[#fbbf24]">Fame</span>
                    </h1>
                    <Link href="/" className="text-gray-400 text-sm font-bold uppercase hover:text-white">
                        ← Return to Arena
                    </Link>
                </div>

                {history.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-500 italic">
                        The chronicles are empty. Finish Season 1 to forge history.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {history.map((entry) => (
                            <div key={entry.id} className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                                {/* Season Badge */}
                                <div className="absolute top-0 right-0 bg-[#fbbf24] text-black font-black text-xl px-6 py-4 rounded-bl-3xl z-10">
                                    SEASON {entry.seasonNumber}
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fbbf24] to-transparent"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                    {/* Champions Column */}
                                    <div>
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                                            {new Date(entry.concludedAt).toLocaleDateString()}
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase mb-8">Champions</h2>

                                        <div className="mb-8">
                                            <div className="text-[#fbbf24] text-xs font-bold uppercase tracking-widest mb-2">Winning Squadron</div>
                                            <div className="text-4xl font-black text-white flex items-center gap-3">
                                                <span className="text-4xl">🏆</span> {entry.winningSquadron.name}
                                            </div>
                                            <div className="text-gray-400 font-mono text-sm mt-1">
                                                {entry.winningSquadron.stars} Stars Scored
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Apex Predator</div>
                                            <div className="text-3xl font-black text-white flex items-center gap-3">
                                                <span className="text-3xl">👑</span> {entry.apexPredator.name}
                                            </div>
                                            <div className="text-gray-400 font-mono text-sm mt-1">
                                                {entry.apexPredator.stars} Stars Scored
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leaderboards Column */}
                                    <div className="space-y-8">
                                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                            <h3 className="text-white font-bold uppercase text-sm mb-4 border-b border-white/10 pb-2">Squadron Standings</h3>
                                            {entry.topSquadrons.map((sq, i) => (
                                                <div key={i} className="flex justify-between items-center py-2 text-sm">
                                                    <span className={`font-bold ${i === 0 ? 'text-[#fbbf24]' : 'text-gray-300'}`}>
                                                        #{i + 1} {sq.name}
                                                    </span>
                                                    <span className="font-mono text-gray-500">{sq.stars}★</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                            <h3 className="text-white font-bold uppercase text-sm mb-4 border-b border-white/10 pb-2">Top Agents</h3>
                                            {entry.topMembers.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center py-2 text-sm">
                                                    <span className={`font-bold ${i === 0 ? 'text-purple-400' : 'text-gray-300'}`}>
                                                        #{i + 1} {m.name}
                                                    </span>
                                                    <span className="font-mono text-gray-500">{m.stars}★</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}