export default function SeasonalGuideTheme() {
    return (
        <section className="relative overflow-hidden rounded-3xl border-2 border-[#fbbf24] bg-slate-900/70 backdrop-blur-md p-8 md:p-12 mb-12 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#fbbf24] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-[#fbbf24] uppercase tracking-widest mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Current Season Directives</h2>
                <p className="text-gray-100 font-bold tracking-widest uppercase mb-10 border-b border-[#fbbf24]/30 pb-4 text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    The Grand Line Voyage (Special Rules in Effect)
                </p>

                <div className="space-y-10">
                    {/* 1. Log Pose Rule */}
                    <div>
                        <h3 className="text-2xl font-bold text-white uppercase mb-4 flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <span className="text-[#fbbf24]">1.</span> The Log Pose Rule & The Grand Line Voyage
                        </h3>
                        <p className="text-white text-sm mb-6 bg-slate-950/70 p-4 rounded-xl border border-[#fbbf24]/20 shadow-inner">
                            <strong className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Log Pose Rule:</strong> The Grand Line must be sailed in order. Each themed meet unlocks only after the previous island's quest has been successfully completed by any Squadron.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-[#fbbf24]/30">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Island 1: The Sands of Alabasta</h4>
                                <p className="text-gray-100 text-sm">Host and successfully execute a Desert-aesthetic themed meeting (Starting point).</p>
                            </div>
                            <div className="bg-transparent p-4 rounded-xl border border-[#fbbf24]/30">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Island 2: The Knock-Up Stream [Skypiea]</h4>
                                <p className="text-gray-100 text-sm">Host a Sky-aesthetic themed meeting (Unlocked only after Alabasta is completed).</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-[#fbbf24]/30">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Island 3: The Aqua Laguna [Water 7]</h4>
                                <p className="text-gray-100 text-sm">Host a Water/Ocean-aesthetic themed meeting (Unlocked only after Skypiea is completed).</p>
                            </div>
                            <div className="bg-transparent p-4 rounded-xl border border-[#fbbf24]/30">
                                <h4 className="text-[#fbbf24] font-bold uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Island 4: Thriller Bark</h4>
                                <p className="text-gray-100 text-sm">Host a Horror-aesthetic themed meeting (Unlocked only after Water 7 is completed).</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Paramount War */}
                    <div className="bg-[#dc2626]/20 p-6 rounded-2xl border border-[#dc2626]/50 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-[#dc2626] uppercase mb-4 flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <span className="text-[#dc2626]">2.</span> The Paramount War (Season Finale)
                        </h3>
                        <p className="text-white text-sm leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            Regardless of how far the club progresses through the first four islands, the 10th and final meeting of the season is universally locked. It must be a <strong className="text-white">"Pirates vs. Marines"</strong> themed meeting. This finale bypasses the Log Pose rule and serves as the ultimate showdown to end the season.
                        </p>
                    </div>

                    {/* 3. Titles of Power */}
                    <div>
                        <h3 className="text-2xl font-bold text-white uppercase mb-4 flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <span className="text-[#fbbf24]">3.</span> Titles of Power (Individual Quests)
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            These titles are awarded based on individual leaderboard standings exactly after the conclusion of the <strong>6th meeting</strong>.
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pirates */}
                            <div className="bg-amber-950/70 p-6 rounded-2xl border border-[#fbbf24]/20 backdrop-blur-md shadow-2xl">
                                <h4 className="text-lg font-black text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Pirate Faction</h4>
                                <div className="space-y-2">
                                    <h5 className="text-[#fbbf24] font-bold uppercase text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Four Emperors (Yonko)</h5>
                                    <p className="text-white text-xs mb-2">The top 4 highest-scoring individuals belonging to Pirate-aligned Squadrons on the leaderboard are crowned Yonko.</p>
                                    <div className="bg-[#fbbf24]/10 inline-block px-3 py-1 rounded text-[#fbbf24] font-mono font-bold text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Reward: +100 Stars Each</div>
                                </div>
                            </div>
                            {/* Marines */}
                            <div className="bg-blue-950/70 p-6 rounded-2xl border border-[#3b82f6]/30 backdrop-blur-md shadow-2xl">
                                <h4 className="text-lg font-black text-[#60a5fa] uppercase tracking-widest mb-4 border-b border-[#3b82f6]/30 pb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Marine Faction</h4>
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-[#60a5fa] font-bold uppercase text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Admiral</h5>
                                        <p className="text-white text-xs mb-2">The single highest-scoring individual belonging to a Marine-aligned Squadron is promoted to Admiral.</p>
                                        <div className="bg-[#3b82f6]/10 inline-block px-3 py-1 rounded text-[#60a5fa] font-mono font-bold text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Reward: +120 Stars</div>
                                    </div>
                                    <div>
                                        <h5 className="text-[#60a5fa] font-bold uppercase text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">The Vice Admirals</h5>
                                        <p className="text-white text-xs mb-2">The 2nd, 3rd, and 4th highest-scoring Marines on the leaderboard are promoted to Vice Admirals.</p>
                                        <div className="bg-[#3b82f6]/10 inline-block px-3 py-1 rounded text-[#60a5fa] font-mono font-bold text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Reward: +100 Stars Each</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
