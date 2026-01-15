'use client';

import Link from 'next/link';

export default function GuidePage() {
    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            How to Use <span className="text-[#fbbf24]">Star League</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">
                            The official handbook for earning stars, winning seasons, and becoming a legend.
                        </p>
                    </div>
                    <Link href="/" className="hidden md:block text-gray-400 text-sm font-bold uppercase hover:text-white">
                        ← Back to Arena
                    </Link>
                </div>

                <div className="space-y-12">

                    {/* Section 1: Introduction */}
                    <section className="glass-card p-8 rounded-2xl border-l-4 border-l-[#fbbf24]">
                        <h2 className="text-2xl font-bold text-white uppercase mb-4">1. What is Star League?</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Star League is a competitive scoring system designed to turn our meetings into a team sport.
                            It gamifies participation to make every meeting exciting, fair, and strategic.
                        </p>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                            <p className="font-bold text-white text-lg">
                                🧑‍🤝‍🧑 Individuals Perform <span className="text-gray-500 mx-2">→</span>
                                🛡️ Squadrons Score <span className="text-gray-500 mx-2">→</span>
                                🏆 Legends are Remembered
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Squadrons vs Individuals */}
                    <section>
                        <h2 className="text-2xl font-bold text-white uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">2</span>
                            Squadrons vs. Individuals
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h3 className="text-[#fbbf24] font-bold uppercase tracking-widest text-sm mb-3">🛡️ The Squadron (The Wallet)</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• <strong>Squadrons own the stars.</strong> Your personal wallet is always 0.</li>
                                    <li>• The Leaderboard ranks Squadrons, not people.</li>
                                    <li>• Seasons are won by the team.</li>
                                </ul>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-3">👤 The Individual (The Earner)</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• You earn stars <strong>for</strong> your team by performing roles.</li>
                                    <li>• Individual stats are tracked for "Apex Predator" status.</li>
                                    <li>• You appear in the Hall of Fame for personal excellence.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: The Golden Rule */}
                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white uppercase mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-sm shadow-lg shadow-purple-500/20">3</span>
                            The Golden Rule: Stars Per Meeting
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Stars and bonuses are calculated <strong>once per meeting</strong>.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm bg-black/20 p-4 rounded-xl">
                            <li>Performing multiple roles does not multiply meeting bonuses (like Attendance).</li>
                            <li>This prevents "farming" and ensures consistent participation beats one-time bursts.</li>
                        </ul>
                    </section>

                    {/* Section 4: Earning Stars */}
                    <section>
                        <h2 className="text-2xl font-bold text-white uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-sm shadow-lg shadow-green-500/20">4</span>
                            How to Earn Stars
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl">🎤</div>
                                <div>
                                    <h3 className="font-bold text-white">Role Participation</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        <strong>Speaker:</strong> +10★ <br />
                                        <strong>Evaluator:</strong> +5★ <br />
                                        <strong>Functionary (Timer, etc):</strong> +5★
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl">🔄</div>
                                <div>
                                    <h3 className="font-bold text-white">Rotation Bonus</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        If your squadron avoids repeating speakers back-to-back, the team earns a bonus.
                                        Breaking rotation is allowed but forfeits this bonus.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl">🪑</div>
                                <div>
                                    <h3 className="font-bold text-white">Attendance</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Every attendee adds stars. <br />
                                        <strong>Perfect Attendance:</strong> Massive bonus if 100% of the squadron shows up.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Table Topics */}
                    <section className="glass-card p-8 rounded-2xl border-t-4 border-t-pink-500">
                        <h2 className="text-2xl font-bold text-white uppercase mb-4">5. Table Topics & Activities</h2>
                        <p className="text-gray-300 mb-6">
                            Table Topics are special. Unlike roles, <strong>unlimited members</strong> can join.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-2">Individual Rewards</h4>
                                <p className="text-white font-bold text-sm">1st Participant: <span className="text-[#fbbf24]">+15★</span></p>
                                <p className="text-gray-400 text-sm">Others: +10★ each</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-2">Synergy Bonus</h4>
                                <p className="text-white font-bold text-sm">Multiplier Active</p>
                                <p className="text-gray-400 text-sm">Squadron earns <strong>5★ × (Participant Count)</strong> extra!</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Awards & Leaderboards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase mb-4">6. Awards</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Winning awards (Best Speaker, Best Evaluator, etc.) gives your squadron a star boost.
                                Only actual participants in that role are eligible.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase mb-4">7. Leaderboards</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Rankings are based on <strong>Total Stars</strong>.
                                Ties are shared—if two squadrons have equal stars, they both hold the rank (e.g., Joint 1st Place).
                            </p>
                        </div>
                    </section>

                    {/* Section 8: Seasons */}
                    <section className="glass-card p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent">
                        <h2 className="text-2xl font-bold text-white uppercase mb-4">8. Seasons & Hall of Fame</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Star League operates in Seasons. At the end of a season, the results are frozen.
                            Winners are immortalized in the <strong>Hall of Fame</strong>, and star counts reset for the next season.
                            Your legacy lives on forever in the archives.
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-12 border-t border-white/10">
                        <p className="text-gray-500 text-sm mb-6">
                            Ready to make history? Check the role signup sheet and rally your squadron.
                        </p>
                        <Link href="/" className="px-8 py-3 bg-[#fbbf24] text-black font-bold uppercase rounded-full hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                            Enter the Arena
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}