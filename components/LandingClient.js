'use client';

import { useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';
import IndividualLeaderboard from '@/components/IndividualLeaderboard';

export default function LandingClient({ leaderboardData, memberData }) {
    const [activeTab, setActiveTab] = useState('squadron');

    return (
        <div className="min-h-screen pt-[80px] pb-20">
            {/* HERO SECTION */}
            <section className="w-full py-20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 px-6">
                    <div className="inline-flex items-center px-4 py-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-full mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 bg-[#fbbf24] rounded-full mr-2 animate-pulse shadow-[0_0_10px_#fbbf24]"></span>
                        <span className="text-[#fbbf24] font-bold text-xs uppercase tracking-[0.2em]">Season Live</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-2xl">
                        Oratio <span className="text-gradient-gold">Star League</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The ultimate competitive arena. Rise through the ranks, claim your stars, and dominate the leaderboard.
                    </p>
                </div>
            </section>

            {/* LEADERBOARD SECTION */}
            <section className="max-w-6xl mx-auto px-6 mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#facc15] to-[#f59e0b] rounded-full"></span>
                            Standings
                        </h2>
                    </div>

                    {/* Neon Tabs */}
                    <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
                        {['squadron', 'individual'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === tab
                                        ? 'bg-[#fbbf24] text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transform scale-105'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab}s
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden p-1">
                    {activeTab === 'squadron' && <LeaderboardTable squadrons={leaderboardData} />}
                    {activeTab === 'individual' && <IndividualLeaderboard members={memberData} />}
                </div>
            </section>

            {/* NEXT MEETING SLOTS - HUD STYLE */}
            <section className="max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-gradient-to-b from-[#facc15] to-[#f59e0b] rounded-full"></span>
                        Next Encounter
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Speaker Panel */}
                    <div className="glass-card rounded-2xl p-8 hover-glow group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24]">🎤</div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Speaker Slots</h3>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(slot => (
                                <div key={slot} className="flex justify-between items-center p-4 rounded-lg bg-black/20 border border-white/5 group-hover:border-white/10 transition-all">
                                    <span className="text-gray-400 font-medium text-sm">Speaker {slot}</span>
                                    <span className="px-3 py-1 bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-bold uppercase rounded-full tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                        Open Slot
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evaluator Panel */}
                    <div className="glass-card rounded-2xl p-8 hover-glow group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8]">📝</div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Evaluator Slots</h3>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(slot => (
                                <div key={slot} className="flex justify-between items-center p-4 rounded-lg bg-black/20 border border-white/5 group-hover:border-white/10 transition-all">
                                    <span className="text-gray-400 font-medium text-sm">Evaluator {slot}</span>
                                    <span className="px-3 py-1 bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-[10px] font-bold uppercase rounded-full tracking-wider shadow-[0_0_10px_rgba(56,189,248,0.1)]">
                                        Open Slot
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}