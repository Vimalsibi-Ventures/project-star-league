'use client';

import { useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';
import IndividualLeaderboard from '@/components/IndividualLeaderboard';

// Accept seasonNumber prop
export default function LandingClient({ leaderboardData, memberData, upcomingMeeting, auctionData, meetingAssignments, seasonNumber }) {
    const [activeTab, setActiveTab] = useState('squadron');

    const getSlotDisplay = (item) => {
        if (!upcomingMeeting) return { main: 'Unknown', sub: '' };

        // 1. Check Assignments FIRST (Resolved Roles)
        const assignment = (meetingAssignments || []).find(a => a.auctionItemId === item.id);

        if (assignment) {
            if (assignment.fulfilledExternally) {
                return { main: 'Guest', sub: 'External Speaker' };
            }
            const member = memberData.find(m => m.id === assignment.memberId);
            if (member) {
                return { main: member.name, sub: member.squadronName };
            }
        }

        // 2. Fallback: Auction Result (Ownership)
        // If not assigned yet, we show who BOUGHT it.
        if (item.winningSquadronId) {
            return { main: item.winnerName, sub: 'Squadron Right (Pending)' };
        }

        // 3. PATCH 4: Unsold / Open State
        // Instead of hiding or generic text, clearly indicate availability
        return { main: 'Open Slot', sub: 'To Be Assigned' };
    };

    return (
        <div className="min-h-screen pt-[80px] pb-20">
            {/* HERO & LEADERBOARD (Unchanged) */}
            <section className="w-full py-20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 px-6">
                    <div className="inline-flex items-center px-4 py-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-full mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 bg-[#fbbf24] rounded-full mr-2 animate-pulse shadow-[0_0_10px_#fbbf24]"></span>
                        {/* UPDATE DISPLAY: Dynamic Season Number */}
                        <span className="text-[#fbbf24] font-bold text-xs uppercase tracking-[0.2em]">
                            Season {seasonNumber} Live
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-2xl">
                        Oratio's <span className="text-gradient-gold">Star League</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The ultimate competitive arena. Rise through the ranks, claim your stars, and dominate the leaderboard.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#facc15] to-[#f59e0b] rounded-full"></span>
                            Standings
                        </h2>
                    </div>
                    <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
                        {['squadron', 'individual'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-[#fbbf24] text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transform scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{tab}s</button>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-2xl overflow-hidden p-1">
                    {activeTab === 'squadron' && <LeaderboardTable squadrons={leaderboardData} />}
                    {activeTab === 'individual' && <IndividualLeaderboard members={memberData} />}
                </div>
            </section>

            {/* NEXT MEETING PREVIEW - SIMPLIFIED */}
            <section className="max-w-4xl mx-auto px-6">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wide flex items-center justify-center md:justify-start gap-3">
                        <span className="w-1.5 h-8 bg-gradient-to-b from-[#facc15] to-[#f59e0b] rounded-full"></span>
                        Upcoming Encounter
                    </h2>
                </div>

                {upcomingMeeting ? (
                    <div className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center border-t-4 border-t-[#fbbf24]">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Upcoming Session</h3>

                        {/* PATCH 1: Time Display */}
                        <div className="text-4xl font-black text-white mb-2">
                            {new Date(upcomingMeeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {upcomingMeeting.time && <span className="block text-xl text-gray-400 mt-1">@ {upcomingMeeting.time}</span>}
                        </div>

                        <div className="px-3 py-1 bg-white/10 rounded text-xs font-bold uppercase text-[#fbbf24] mb-6">
                            {upcomingMeeting.type} Arena
                        </div>

                        <div className="w-full max-w-2xl border-t border-white/10 pt-6 mt-2">
                            <h4 className="text-[#fbbf24] font-bold uppercase text-sm mb-4">
                                {upcomingMeeting.status === 'auction_finalized' ? 'Auction Results (Rights)' : 'Official Role Call'}
                            </h4>

                            {/* PATCH 4: Iterate ALL items, do not filter by winner */}
                            {auctionData && auctionData.items.length > 0 ? (
                                <div className="space-y-3">
                                    {auctionData.items.map((item, i) => {
                                        const display = getSlotDisplay(item);
                                        return (
                                            <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded border border-white/5">
                                                <div className="text-left">
                                                    <span className="text-sm text-gray-300 font-medium block">{item.title}</span>
                                                    {item.slotLabel && <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.slotLabel}</span>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-[#fbbf24] uppercase">{display.main}</div>
                                                    <div className="text-[10px] text-gray-500">{display.sub}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-xs italic">No roles configured for this meeting.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-gray-500">
                        No upcoming meetings scheduled.
                    </div>
                )}
            </section>
        </div>
    );
}