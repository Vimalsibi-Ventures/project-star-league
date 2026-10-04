import Link from 'next/link';
import { getDb } from '@/lib/db';
import SeasonalGuideTheme from '@/components/seasonal/one-piece/SeasonalGuideTheme';

export const dynamic = 'force-dynamic';

export default async function GuidePage() {
    const db = await getDb();
    const isSeasonalThemeEnabled = db.isSeasonalThemeEnabled || false;

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                {isSeasonalThemeEnabled && <SeasonalGuideTheme />}
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                            Star League <span className="text-gradient-gold">Guide</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">
                            The Official Rulebook
                        </p>
                    </div>
                    <Link href="/" className="hidden md:block text-gray-400 text-sm font-bold uppercase hover:text-white border border-white/10 px-6 py-2 rounded-full hover:bg-white/5 transition-all">
                        ← Arena
                    </Link>
                </div>

                {/* 1. Welcome to the Arena & Core Glossary */}
                <section className="glass-card p-8 md:p-10 rounded-2xl border-l-4 border-l-[#fbbf24]">
                    <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                        <span className="text-[#fbbf24] text-3xl">1</span> Welcome to the Arena & Core Glossary
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Star League is a grueling <strong>10-meeting sprint</strong>. Every Squadron begins the season with a <strong>100 Star seed fund</strong>. Survival requires strategy, rotation, and unrelenting execution.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">Apex Predator</h3>
                            <p className="text-gray-400 text-sm">The single most valuable player in the entire club who earns the most individual stars.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">Expeditions</h3>
                            <p className="text-gray-400 text-sm">Roles taken in external Toastmasters clubs.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">ExCom</h3>
                            <p className="text-gray-400 text-sm">The executive officers operating the league.</p>
                        </div>
                    </div>
                </section>

                {/* 2. The Star Economy */}
                <section>
                    <h2 className="text-3xl font-black text-white uppercase mb-8 flex items-center gap-3">
                        <span className="text-[#fbbf24] text-3xl">2</span> The Star Economy
                    </h2>

                    <div className="space-y-8">
                        {/* Side Quests */}
                        <div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-500/20">
                            <h3 className="text-xl font-bold text-blue-400 uppercase mb-4">Side Quests</h3>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg">
                                <span className="text-gray-300 font-medium">Foreign Expeditions (External Club Roles)</span>
                                <span className="text-[#fbbf24] font-mono font-bold">Varies</span>
                            </div>
                        </div>

                        {/* Meeting Quests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white uppercase mb-4 text-center border-b border-white/10 pb-4">Meeting Quests (Individual)</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Attendance (Offline)</span><span className="text-[#fbbf24] font-mono font-bold">+10</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Attendance (Online)</span><span className="text-[#fbbf24] font-mono font-bold">+5</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">The Main Stage (Speaker)</span><span className="text-[#fbbf24] font-mono font-bold">+10</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">The Critic & Crew (Eval/TAG/Func)</span><span className="text-[#fbbf24] font-mono font-bold">+5</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Unbounded Arena (1st TT)</span><span className="text-[#fbbf24] font-mono font-bold">+15</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Unbounded Arena (Subsequent TT)</span><span className="text-[#fbbf24] font-mono font-bold">+10</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Ribbon Winner (Best Award)</span><span className="text-[#fbbf24] font-mono font-bold">+5</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Vocabulary Vanguard (WOTD/POTD)</span><span className="text-[#fbbf24] font-mono font-bold">+10</span></li>
                                </ul>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white uppercase mb-4 text-center border-b border-white/10 pb-4">Meeting Quests (Squadron)</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Perfect Attendance (All members)</span><span className="text-[#fbbf24] font-mono font-bold">+20</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Synergy (Per unique active member)</span><span className="text-[#fbbf24] font-mono font-bold">+5</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">The Clean Sweep (Speak+Eval+Func)</span><span className="text-[#fbbf24] font-mono font-bold">+15</span></li>
                                    <li className="flex justify-between"><span className="text-gray-400 text-sm">Table Topics Blitz (3+ in TT)</span><span className="text-[#fbbf24] font-mono font-bold">+15</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Season Quests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h3 className="text-lg font-bold text-[#fbbf24] uppercase mb-4 border-b border-white/10 pb-4">Season Quests (Individual)</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">The Full Spectrum (2x Spk, Eval, Func)</span><span className="text-[#fbbf24] font-mono font-bold">+50</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">The Iron Orator (3 Prepared Speeches)</span><span className="text-[#fbbf24] font-mono font-bold">+40</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">The Marathoner (8/10 Attendance)</span><span className="text-[#fbbf24] font-mono font-bold">+25</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">Table Topics Terror (3 Consecutive TTs)</span><span className="text-[#fbbf24] font-mono font-bold">+20</span></li>
                                </ul>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h3 className="text-lg font-bold text-[#fbbf24] uppercase mb-4 border-b border-white/10 pb-4">Season Quests (Squadron)</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">Vanguard Streak (3 mems, 3 consec meets)</span><span className="text-[#fbbf24] font-mono font-bold">+30</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">Unbreakable Phalanx (3 mems, 5 consec)</span><span className="text-[#fbbf24] font-mono font-bold">+50</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">The Board Sweepers (2+ Ribbons in 1 meet)</span><span className="text-[#fbbf24] font-mono font-bold">+25</span></li>
                                    <li className="flex justify-between"><span className="text-gray-300 text-sm">The Grand Arsenal (5 Speeches & 5 Evals)</span><span className="text-[#fbbf24] font-mono font-bold">+40</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. The Price of Defeat & The Market */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-950/30 p-6 rounded-2xl border border-red-500/30">
                        <h2 className="text-xl font-bold text-red-500 uppercase mb-4 flex items-center gap-3"><span className="text-red-500 text-3xl">3</span> Penalties</h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center bg-black/40 p-3 rounded"><span className="text-gray-300 text-sm">Lateness</span><span className="text-red-500 font-mono font-bold">-5</span></li>
                            <li className="flex justify-between items-center bg-black/40 p-3 rounded"><span className="text-gray-300 text-sm">Role Lateness</span><span className="text-red-500 font-mono font-bold">-5 (Additional)</span></li>
                            <li className="flex justify-between items-center bg-black/40 p-3 rounded border border-red-500/30"><span className="text-red-400 font-bold text-sm">The Ultimate Sin (Speaker No-Show)</span><span className="text-red-500 font-mono font-black">-20</span></li>
                        </ul>
                    </div>
                    <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30">
                        <h3 className="text-xl font-bold text-purple-400 uppercase mb-4">The Market</h3>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center bg-black/40 p-3 rounded"><span className="text-gray-300 text-sm">Live Auction Role Cost</span><span className="text-purple-400 font-mono font-bold">+15</span></li>
                            <li className="flex justify-between items-center bg-black/40 p-3 rounded"><span className="text-gray-300 text-sm">Premium Fallback (Manual Buy)</span><span className="text-purple-400 font-mono font-bold">+25</span></li>
                        </ul>
                    </div>
                </section>

                {/* 4. The Season Cycle & The Great Draft */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-2xl font-black text-white uppercase mb-4 flex items-center gap-3">
                            <span className="text-[#fbbf24] text-3xl">4</span> Season Cycle & Hall of Fame
                        </h2>
                        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                            <p><strong>The Season:</strong> Concludes definitively after meeting 10. The Champion Squadron and Apex Predator are immortalized in the Hall of Fame.</p>
                            <p><strong>The Great Reset:</strong> Individual counts drop to zero, bank accounts reset to 100 Stars, and cooldowns are erased.</p>
                        </div>
                    </section>

                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-2xl font-black text-white uppercase mb-4 flex items-center gap-3">
                            <span className="text-[#fbbf24] text-3xl"></span> The Great Draft
                        </h2>
                        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                            <p><strong>Succession:</strong> Captains handpick their successors and can choose to rebrand.</p>
                            <p><strong>Snake Draft:</strong> The club uses a Snake Draft from a free-agent pool (Last place picks first, Champion picks last, and the order reverses at the ends).</p>
                        </div>
                    </section>
                </div>

                {/* 5. Champion Rewards */}
                <section className="relative overflow-hidden rounded-3xl border border-[#fbbf24]/30 bg-gradient-to-br from-black to-[#fbbf24]/5 p-10 md:p-14">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fbbf24] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white uppercase mb-8 flex items-center gap-3">
                            <span className="text-[#fbbf24] text-4xl drop-shadow-[0_0_15px_#fbbf24]">5</span> The Spoils of War
                        </h2>
                        <p className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-8">Exclusive Champion Rewards</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-black/60 p-6 rounded-xl border border-[#fbbf24]/20 backdrop-blur-sm">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-2">Legislative Veto</h4>
                                <p className="text-gray-400 text-sm">Right to propose or edit one league rule.</p>
                            </div>
                            <div className="bg-black/60 p-6 rounded-xl border border-[#fbbf24]/20 backdrop-blur-sm">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-2">ExCom Feast</h4>
                                <p className="text-gray-400 text-sm">A fully funded meal by the ExCom.</p>
                            </div>
                            <div className="bg-black/60 p-6 rounded-xl border border-[#fbbf24]/20 backdrop-blur-sm">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-2">Meeting Takeover</h4>
                                <p className="text-gray-400 text-sm">Dictate the theme and WOTD for the first meet of the next season.</p>
                            </div>
                            <div className="bg-black/60 p-6 rounded-xl border border-[#fbbf24]/20 backdrop-blur-sm">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-2">Social Glory</h4>
                                <p className="text-gray-400 text-sm">Exclusive spotlight feature on the Instagram page.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-12 pb-8">
                    <Link href="/" className="px-10 py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-full hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                        Acknowledge & Return
                    </Link>
                </div>

            </div>
        </div>
    );
}