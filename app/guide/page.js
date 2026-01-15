'use client';

import Link from 'next/link';

export default function GuidePage() {
    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Star League <span className="text-[#fbbf24]">Member Guide</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">
                            The Authoritative Source of Truth
                        </p>
                    </div>
                    <Link href="/" className="hidden md:block text-gray-400 text-sm font-bold uppercase hover:text-white">
                        ← Back to Arena
                    </Link>
                </div>

                <div className="space-y-12">

                    {/* 1. Core Philosophy */}
                    <section className="glass-card p-8 rounded-2xl border-l-4 border-l-[#fbbf24]">
                        <h2 className="text-2xl font-bold text-white uppercase mb-4">1. Core Philosophy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-2">Star League Is NOT:</h3>
                                <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                                    <li>An individual XP system</li>
                                    <li>A per-role farming system</li>
                                    <li>A quantity-over-quality system</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-green-400 font-bold uppercase text-xs tracking-widest mb-2">Star League IS:</h3>
                                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                                    <li>A <strong>Squadron-based economy</strong></li>
                                    <li>Evaluated <strong>per meeting</strong></li>
                                    <li>Designed to reward fair rotation & teamwork</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10 text-center font-bold text-white text-lg">
                            Individuals Perform. <span className="text-gray-500 mx-2">|</span>
                            Squadrons Earn. <span className="text-gray-500 mx-2">|</span>
                            Seasons Remember.
                        </div>
                    </section>

                    {/* 2 & 3. Ownership & Calculation */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                                <span className="text-[#fbbf24]">2.</span> Ownership of Stars
                            </h2>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li>✔️ <strong>Only Squadrons own stars.</strong></li>
                                <li>❌ Individuals never have a personal balance.</li>
                                <li>🏆 Leaderboards rank Squadrons only.</li>
                                <li>👤 Individuals are tracked for Awards & Hall of Fame.</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                                <span className="text-[#fbbf24]">3.</span> Calculation Timing
                            </h2>
                            <p className="text-sm text-gray-300 mb-2">
                                Stars are evaluated <strong>ONCE per meeting</strong>. Not per role, not per speech.
                            </p>
                            <p className="text-xs text-gray-500 italic">
                                Even if a squadron performs multiple roles or dominates activities, bonuses like Attendance/Rotation apply only once. This prevents hoarding and inflation.
                            </p>
                        </div>
                    </section>

                    {/* 4. Base Role Contributions */}
                    <section>
                        <h2 className="text-2xl font-bold text-white uppercase mb-6">4. Base Role Rewards</h2>
                        <div className="overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-black/40 text-gray-400 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="p-4">Role Category</th>
                                        <th className="p-4">Specific Role</th>
                                        <th className="p-4 text-right">Squadron Stars</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-white/5">
                                    <tr>
                                        <td className="p-4 font-bold text-blue-400">Speaking</td>
                                        <td className="p-4 text-white">Speaker</td>
                                        <td className="p-4 text-right font-mono text-[#fbbf24] font-bold">+10★</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-green-400">Evaluation</td>
                                        <td className="p-4 text-white">Evaluator</td>
                                        <td className="p-4 text-right font-mono text-[#fbbf24] font-bold">+5★</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-purple-400">Functionary</td>
                                        <td className="p-4 text-white">TMOD, TTM, GE, Tag Team</td>
                                        <td className="p-4 text-right font-mono text-[#fbbf24] font-bold">+5★</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            * Note: GE earns stars but cannot win "Best Performer" awards.
                        </p>
                    </section>

                    {/* 5. Auction Costs */}
                    <section className="bg-red-900/10 p-6 rounded-xl border border-red-500/20">
                        <h2 className="text-xl font-bold text-red-400 uppercase mb-4">5. Auction Costs (Spending)</h2>
                        <p className="text-sm text-gray-300 mb-4">
                            Before a meeting, Squadrons spend stars to acquire rights to roles.
                        </p>
                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg">
                            <span className="text-white font-bold text-sm">Standard Deduction</span>
                            <span className="font-mono text-red-400 font-bold">-10★ per role purchased</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Deductions are permanent once the meeting closes. If a meeting is cancelled, stars are refunded.
                        </p>
                    </section>

                    {/* 6. Attendance */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h2 className="text-lg font-bold text-white uppercase mb-2">6. Attendance</h2>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Per Member</span>
                                <span className="text-[#fbbf24] font-bold font-mono">+5★</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <span className="text-green-400 font-bold text-sm">Perfect Bonus</span>
                                <span className="text-green-400 font-bold font-mono">+20★</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Perfect Bonus applies only if 100% of the squadron attends.</p>
                        </div>

                        {/* 7. Rotation */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h2 className="text-lg font-bold text-white uppercase mb-2">7. Rotation (Anti-Farming)</h2>
                            <ul className="text-sm text-gray-300 space-y-2">
                                <li><strong>Cooldown:</strong> Speakers enter a 2-meeting cooldown.</li>
                                <li><strong>Breaking Rotation:</strong> Speaking during cooldown is allowed, but resets the streak.</li>
                                <li><strong>Rotation Bonus:</strong> <span className="text-[#fbbf24] font-bold">+5★</span> if fair order is respected.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 8. Table Topics */}
                    <section className="glass-card p-8 rounded-2xl border-t-4 border-t-pink-500">
                        <h2 className="text-2xl font-bold text-white uppercase mb-6">8. Table Topics (Advanced Scoring)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-2">Participation</h4>
                                <ul className="text-xs text-gray-400 space-y-1">
                                    <li>• Unlimited participants</li>
                                    <li>• Guests allowed (0 stars)</li>
                                    <li>• Any order</li>
                                </ul>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-2">Individual Rewards</h4>
                                <div className="flex justify-between text-sm text-gray-300 mb-1">
                                    <span>1st Member</span>
                                    <span className="text-[#fbbf24] font-bold">+15★</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-300">
                                    <span>Others</span>
                                    <span className="text-[#fbbf24] font-bold">+10★</span>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-2">Synergy Bonus</h4>
                                <p className="text-white font-bold text-sm mb-1">Multiplier Active</p>
                                <p className="text-gray-400 text-xs">
                                    Squadron earns <strong>5★ × (Member Count)</strong> on top of individual earnings.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 9 & 10. Awards & Synergy */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase mb-4">9. Awards System</h2>
                            <p className="text-sm text-gray-400 mb-3">Recognition tools, not farming tools.</p>
                            <ul className="text-sm text-gray-300 space-y-1 mb-3">
                                <li>🏅 Best Speaker</li>
                                <li>🏅 Best Evaluator</li>
                                <li>🏅 Best TT Speaker</li>
                                <li>🏅 Best Role Player</li>
                            </ul>
                            <div className="bg-white/5 p-3 rounded text-sm flex justify-between">
                                <span>Star Reward</span>
                                <span className="text-[#fbbf24] font-bold">+5★ per award</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase mb-4">10. Synergy Bonus</h2>
                            <p className="text-sm text-gray-400 mb-3">
                                Awarded for active team presence.
                            </p>
                            <p className="text-sm text-gray-300 mb-4">
                                If a squadron has multiple active members performing roles in a meeting, an additional <strong>Synergy Bonus</strong> is calculated once per meeting.
                            </p>
                            <p className="text-xs text-gray-500 italic">Encourages distributed effort.</p>
                        </div>
                    </section>

                    {/* 11. Penalties */}
                    <section className="bg-red-950/30 p-6 rounded-xl border border-red-500/30">
                        <h2 className="text-xl font-bold text-red-500 uppercase mb-4">11. Penalties</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded flex justify-between items-center">
                                <span className="text-white text-sm font-bold">Late Arrival</span>
                                <span className="text-red-500 font-mono font-bold">-5★</span>
                            </div>
                            <div className="bg-black/40 p-4 rounded flex justify-between items-center">
                                <span className="text-white text-sm font-bold">Speaker No-Show</span>
                                <span className="text-red-500 font-mono font-bold">-20★</span>
                            </div>
                        </div>
                        <p className="text-xs text-red-400/60 mt-4">Penalties are locked permanently upon meeting closure.</p>
                    </section>

                    {/* 12, 13, 14. Lifecycle & Meta */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 p-6 rounded-xl">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">12. Seasons</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Seasons conclude periodically. Winners are archived in the <strong>Hall of Fame</strong>, and star counts reset to 100★ for the next season. History is preserved forever.
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">13. Leaderboards</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Rankings are squadron-based. <strong>Ties are shared.</strong> If two squadrons have equal stars, they share the rank. No artificial tie-breakers.
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl">
                            <h3 className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest mb-2">14. Transparency</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                You can view everything: Leaderboards, Season Number, Hall of Fame, and Past Meeting details. You cannot edit scores or lifecycle states.
                            </p>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-12 border-t border-white/10">
                        <Link href="/" className="px-8 py-3 bg-[#fbbf24] text-black font-bold uppercase rounded-full hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                            Enter the Arena
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}