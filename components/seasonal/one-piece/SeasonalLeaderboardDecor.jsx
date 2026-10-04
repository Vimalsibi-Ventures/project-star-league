import React from 'react';

export default function SeasonalLeaderboardDecor({ squadrons, members, activeTab }) {
    // Deterministically assign factions to squadrons based on ID string length or char code
    const getFaction = (id) => {
        const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return sum % 2 === 0 ? 'Pirate' : 'Marine';
    };

    const getBounty = (stars) => `฿${(stars || 0) * 1000000}`; // Example bounty format

    if (activeTab === 'individual') {
        const sortedMembers = [...members].sort((a, b) => (b.totalStars || 0) - (a.totalStars || 0));
        const pirateMembers = sortedMembers.filter(m => {
            const squad = squadrons.find(s => s.id === m.squadronId);
            return squad ? getFaction(squad.id) === 'Pirate' : false;
        });
        const marineMembers = sortedMembers.filter(m => {
            const squad = squadrons.find(s => s.id === m.squadronId);
            return squad ? getFaction(squad.id) === 'Marine' : false;
        });

        return (
            <div className="p-6 space-y-12 bg-slate-900/70 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl">
                {/* Pirate Faction */}
                <div>
                    <h3 className="text-3xl font-serif font-black text-[#fbbf24] uppercase text-center mb-8 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        The Pirate Faction
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pirateMembers.map((member, idx) => {
                            const isYonko = idx < 4;
                            return (
                                <div key={member.id} className={`relative p-6 rounded-lg ${isYonko ? 'bg-amber-950/70 backdrop-blur-md border-4 border-[#fbbf24]/50 shadow-2xl text-gray-100' : 'bg-amber-950/40 backdrop-blur-md border border-[#fbbf24]/30 text-gray-100'}`}>
                                    {isYonko && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-800 text-[#fbbf24] px-4 py-1 font-serif font-black text-xs uppercase tracking-widest border-2 border-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Yonko</div>}
                                    <div className="text-center mt-4">
                                        <div className={`text-xl font-serif font-black uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isYonko ? 'text-[#fbbf24]' : 'text-white'}`}>{member.name}</div>
                                        <div className={`text-xs font-bold uppercase tracking-widest mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isYonko ? 'text-amber-500' : 'text-gray-100'}`}>{member.squadronName}</div>
                                        <div className={`text-2xl font-serif font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isYonko ? 'text-red-500' : 'text-[#fbbf24]'}`}>{getBounty(member.totalStars)}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isYonko ? 'text-gray-100' : 'text-gray-300'}`}>Active Bounty</div>
                                    </div>
                                </div>
                            );
                        })}
                        {pirateMembers.length === 0 && <p className="text-gray-500 italic col-span-full text-center">No pirates found.</p>}
                    </div>
                </div>

                {/* Marine Faction */}
                <div>
                    <h3 className="text-3xl font-serif font-black text-red-600 uppercase text-center mb-8 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        The Marine Headquarters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {marineMembers.map((member, idx) => {
                            const isAdmiral = idx === 0;
                            const isViceAdmiral = idx > 0 && idx < 4;
                            const isHighRank = isAdmiral || isViceAdmiral;
                            return (
                                <div key={member.id} className={`relative p-6 rounded-lg ${isHighRank ? 'bg-blue-950/70 backdrop-blur-md border-4 border-red-600/50 shadow-2xl text-gray-100' : 'bg-blue-950/40 backdrop-blur-md border border-blue-600/30 text-gray-100'}`}>
                                    {isAdmiral && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-4 py-1 font-serif font-black text-xs uppercase tracking-widest border-2 border-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Admiral</div>}
                                    {isViceAdmiral && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-800 text-white px-3 py-1 font-serif font-black text-[10px] uppercase tracking-widest border border-[#fbbf24] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Vice Admiral</div>}
                                    
                                    <div className="text-center mt-4">
                                        <div className={`text-xl font-serif font-black uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isHighRank ? 'text-white' : 'text-white'}`}>{member.name}</div>
                                        <div className={`text-xs font-bold uppercase tracking-widest mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isHighRank ? 'text-blue-300' : 'text-gray-100'}`}>{member.squadronName}</div>
                                        <div className={`text-2xl font-serif font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isHighRank ? 'text-[#fbbf24]' : 'text-red-400'}`}>{getBounty(member.totalStars)}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isHighRank ? 'text-gray-100' : 'text-gray-300'}`}>Active Bounty</div>
                                    </div>
                                </div>
                            );
                        })}
                        {marineMembers.length === 0 && <p className="text-gray-500 italic col-span-full text-center">No marines found.</p>}
                    </div>
                </div>
            </div>
        );
    }

    // Squadron Tab
    const sortedSquadrons = [...squadrons].sort((a, b) => (b.stars || 0) - (a.stars || 0));
    return (
        <div className="p-6 bg-slate-900/70 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl">
            <h3 className="text-3xl font-serif font-black text-white uppercase text-center mb-8 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                Grand Line <span className="text-[#fbbf24]">Fleet Rankings</span>
            </h3>
            <div className="space-y-4">
                {sortedSquadrons.map((squad, idx) => {
                    const faction = getFaction(squad.id);
                    const isPirate = faction === 'Pirate';
                    return (
                        <div key={squad.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${isPirate ? 'bg-amber-950/70 border-l-[#fbbf24] border-y border-r border-[#fbbf24]/20' : 'bg-blue-950/70 border-l-red-600 border-y border-r border-red-600/20'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`text-2xl font-serif font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isPirate ? 'text-[#fbbf24]' : 'text-red-500'}`}>
                                    #{idx + 1}
                                </div>
                                <div>
                                    <div className="text-lg font-serif font-bold text-white uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{squad.name}</div>
                                    <div className={`text-xs font-bold uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isPirate ? 'text-amber-500' : 'text-blue-400'}`}>
                                        {faction} Faction
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xl font-serif font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isPirate ? 'text-[#fbbf24]' : 'text-red-500'}`}>
                                    {getBounty(squad.stars)}
                                </div>
                                <div className="text-[10px] font-bold text-gray-100 uppercase tracking-widest mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Total Bounty</div>
                            </div>
                        </div>
                    );
                })}
                {sortedSquadrons.length === 0 && <p className="text-gray-500 italic text-center">No fleets found.</p>}
            </div>
        </div>
    );
}
