import React from 'react';

export default function SeasonalHomeHero({ currentSeasonIsland = 1 }) {
    const islands = [
        { id: 1, name: 'Alabasta' },
        { id: 2, name: 'Skypiea' },
        { id: 3, name: 'Water 7' },
        { id: 4, name: 'Thriller Bark' },
    ];

    return (
        <section className="w-full pt-[120px] pb-16 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-900/70 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#fbbf24] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 px-6">
                <div className="inline-flex items-center px-6 py-2 bg-black/60 border border-[#dc2626] rounded-full mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    <span className="w-2 h-2 bg-[#dc2626] rounded-full mr-3 animate-pulse"></span>
                    <span className="text-[#dc2626] font-black text-xs uppercase tracking-[0.3em]">
                        The Paramount War Initiated
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-4 tracking-tight uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Pirates vs Marines
                </h1>
                
                <p className="text-lg md:text-xl text-[#fbbf24] max-w-3xl mx-auto font-medium leading-relaxed mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    The Grand Line Voyage has commenced. Sail the perilous waters, claim your bounties, and prepare for the ultimate showdown.
                </p>

                <div className="flex justify-center items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    {islands.map((island, index) => {
                        const isActive = island.id === currentSeasonIsland;
                        const isPast = island.id < currentSeasonIsland;
                        const isFuture = island.id > currentSeasonIsland;
                        
                        let islandColor = "text-white/40";
                        let barColor = "bg-white/20";
                        let opacityClass = "opacity-50";

                        if (isActive) {
                            islandColor = "text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]";
                            barColor = "bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.8)]";
                            opacityClass = "opacity-100";
                        } else if (isPast) {
                            islandColor = "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                            barColor = "bg-white shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
                            opacityClass = "opacity-100";
                        }

                        return (
                            <React.Fragment key={island.id}>
                                <div className={`flex flex-col items-center transition-all duration-300 ${opacityClass} ${islandColor}`}>
                                    <span className={`w-8 h-1 mb-2 rounded-full ${barColor}`}></span>
                                    <span className="flex items-center gap-1">
                                        {isPast && <span className="text-[#fbbf24]">✓</span>}
                                        {island.name}
                                    </span>
                                </div>
                                {index < islands.length - 1 && (
                                    <span className={island.id < currentSeasonIsland ? "text-[#fbbf24]/50" : "text-gray-600"}>→</span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* Wave animation bottom border */}
            <style>{`
                @keyframes gentleWave {
                    0% { transform: translateX(0) translateY(0); }
                    50% { transform: translateX(-25%) translateY(5px); }
                    100% { transform: translateX(0) translateY(0); }
                }
            `}</style>
            <div className="absolute bottom-0 left-0 w-[200%] h-[40px] md:h-[60px] opacity-80" style={{ animation: 'gentleWave 12s ease-in-out infinite' }}>
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="rgba(251, 191, 36, 0.15)"></path>
                    <path d="M0,60 C300,0 900,120 1200,60 L1200,120 L0,120 Z" fill="rgba(251, 191, 36, 0.3)"></path>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></div>
        </section>
    );
}
