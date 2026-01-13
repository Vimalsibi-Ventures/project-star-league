'use client';

import { useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';
import IndividualLeaderboard from '@/components/IndividualLeaderboard';
import { getSquadrons, getMembersBySquadron, getSquadronStars, getMembers, getSquadron, getMemberStars } from '@/lib/data';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('squadron');

    const squadrons = getSquadrons();

    // Compute squadron leaderboard data
    const leaderboardData = squadrons.map(squadron => {
        const members = getMembersBySquadron(squadron.id);
        const totalStars = getSquadronStars(squadron.id);

        return {
            id: squadron.id,
            name: squadron.name,
            memberCount: members.length,
            totalStars
        };
    }).sort((a, b) => b.totalStars - a.totalStars);

    // Compute individual leaderboard data
    const members = getMembers();
    const memberData = members.map(member => {
        const squadron = getSquadron(member.squadronId);
        const totalStars = getMemberStars(member.id);

        return {
            ...member,
            squadronName: squadron ? squadron.name : 'Unknown',
            totalStars
        };
    }).sort((a, b) => b.totalStars - a.totalStars);

    return (
        <div className="min-h-screen bg-[#0e1117] pt-[72px]">
            {/* Hero Section */}
            {/* 
                HERO IMAGE PLACEHOLDER:
                Replace /public/images/hero-bg.jpg with your club photo.
                The image will be used as a background with dark overlay.
            */}
            <section
                className="w-full py-24 relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(14, 17, 23, 0.85), rgba(14, 17, 23, 0.85)), url('/images/hero-bg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-7xl font-bold text-[#e6e9f0] mb-4 tracking-tight">
                            ORATIO STAR LEAGUE
                        </h1>
                        <p className="text-xl text-[#9aa4bf] mb-6">
                            A Competitive Toastmasters League System
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-[#151a23] border border-[#2a3245] rounded-full mb-6">
                            <span className="w-2 h-2 bg-[#38e8ff] rounded-full mr-2 animate-pulse"></span>
                            <span className="text-[#e6e9f0] font-semibold text-xs uppercase tracking-wider">SEASON LIVE</span>
                        </div>
                        <p className="text-[#9aa4bf] max-w-2xl mx-auto text-base">
                            Compete, collaborate, and climb to the top. Track your squadron's progress and individual contributions in the ultimate Toastmasters competition.
                        </p>
                    </div>
                </div>
            </section>

            {/* Leaderboard Section */}
            <section className="max-w-7xl mx-auto px-8 py-12">
                <div className="mb-6">
                    <h2 className="text-4xl font-bold text-[#e6e9f0] mb-2">Leaderboards</h2>
                    <p className="text-[#9aa4bf] text-sm">Track squadron and individual performance</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 border-b border-[#2a3245]">
                    <button
                        onClick={() => setActiveTab('squadron')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'squadron'
                            ? 'text-[#4f8cff] border-b-2 border-[#4f8cff]'
                            : 'text-[#9aa4bf] hover:text-[#4f8cff]'
                            }`}
                    >
                        Squadron Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'individual'
                            ? 'text-[#4f8cff] border-b-2 border-[#4f8cff]'
                            : 'text-[#9aa4bf] hover:text-[#4f8cff]'
                            }`}
                    >
                        Individual Leaderboard
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'squadron' && (
                        <LeaderboardTable squadrons={leaderboardData} />
                    )}
                    {activeTab === 'individual' && (
                        <IndividualLeaderboard members={memberData} />
                    )}
                </div>
            </section>

            {/* Next Meeting Preview */}
            <section className="max-w-7xl mx-auto px-8 py-12">
                <div className="mb-6">
                    <h2 className="text-4xl font-bold text-[#e6e9f0] mb-2">Next Meeting Slots</h2>
                    <p className="text-[#9aa4bf] text-sm">Role assignments for upcoming meeting</p>
                </div>

                <div className="bg-[#151a23] border border-[#2a3245] rounded-lg p-8">
                    <div className="grid grid-cols-2 gap-12">
                        {/* Speaker Slots */}
                        <div>
                            <h3 className="text-xl font-bold text-[#e6e9f0] mb-4">Speaker Slots</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 1</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 2</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 3</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                            </div>
                        </div>

                        {/* Evaluator Slots */}
                        <div>
                            <h3 className="text-xl font-bold text-[#e6e9f0] mb-4">Evaluator Slots</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 1</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 2</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3245]">
                                    <span className="text-[#9aa4bf]">Slot 3</span>
                                    <span className="text-[#e6e9f0] text-sm font-medium">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
