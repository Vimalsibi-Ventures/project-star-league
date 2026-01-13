'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleResolutionPage({ params }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState(null);
    const [auctionItems, setAuctionItems] = useState([]);
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [assignments, setAssignments] = useState({}); // { [itemId]: { memberId, status } }

    useEffect(() => {
        const loadData = async () => {
            const [mRes, sRes, memRes, aRes] = await Promise.all([
                fetch('/api/meetings').then(r => r.json()),
                fetch('/api/squadrons').then(r => r.json()),
                fetch('/api/members').then(r => r.json()),
                fetch('/api/auctions').then(r => r.json()) // Need to filter client side or add specific endpoint
            ]);

            const currentMeeting = mRes.find(m => m.id === params.id);
            setMeeting(currentMeeting);
            setSquadrons(sRes);
            setMembers(memRes);

            // Find auction items for this meeting
            const auction = aRes.find(a => a.meetingId === params.id);
            if (auction) {
                setAuctionItems(auction.items || []);
                // Initialize state
                const initial = {};
                auction.items.forEach(item => {
                    initial[item.id] = { memberId: '', status: 'completed' };
                });
                setAssignments(initial);
            }
        };
        loadData();
    }, [params.id]);

    const handleAssignmentChange = (itemId, field, value) => {
        setAssignments(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };

    const handleCloseMeeting = async () => {
        if (!confirm('This will award stars and CLOSE the meeting permanently. Continue?')) return;

        // Prepare payload
        const roleAssignments = auctionItems.map(item => {
            const assignment = assignments[item.id];
            return {
                auctionItemId: item.id,
                roleName: item.title,
                squadronId: item.winningSquadronId,
                memberId: assignment.memberId,
                status: assignment.status
            };
        });

        const res = await fetch('/api/meetings/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, roleAssignments })
        });

        if (res.ok) {
            router.push('/admin/dashboard');
        } else {
            alert('Error closing meeting');
        }
    };

    if (!meeting) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Role Resolution</h1>
                        <p className="text-[#fbbf24] text-sm uppercase tracking-widest mt-1">
                            {meeting.date} | {meeting.type}
                        </p>
                    </div>
                    <Link href="/admin/dashboard" className="text-gray-400 text-xs font-bold uppercase hover:text-white">Cancel</Link>
                </div>

                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Auctioned Roles</h2>

                    {auctionItems.length === 0 ? (
                        <p className="text-gray-500">No auction items found for this meeting.</p>
                    ) : (
                        <div className="space-y-6">
                            {auctionItems.map(item => {
                                const winningSquadron = squadrons.find(s => s.id === item.winningSquadronId);
                                const squadMembers = members.filter(m => m.squadronId === item.winningSquadronId);

                                if (!winningSquadron) return null; // Skip unassigned items

                                return (
                                    <div key={item.id} className="p-6 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-[#fbbf24] font-bold text-lg">{item.title}</h3>
                                                <div className="text-gray-400 text-xs uppercase tracking-wider">
                                                    Won by: <span className="text-white">{winningSquadron.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAssignmentChange(item.id, 'status', 'completed')}
                                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${assignments[item.id]?.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/10 text-gray-500'}`}
                                                >
                                                    Completed
                                                </button>
                                                <button
                                                    onClick={() => handleAssignmentChange(item.id, 'status', 'no-show')}
                                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${assignments[item.id]?.status === 'no-show' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 text-gray-500'}`}
                                                >
                                                    No-Show
                                                </button>
                                            </div>
                                        </div>

                                        {assignments[item.id]?.status === 'completed' && (
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Performed By</label>
                                                <select
                                                    value={assignments[item.id]?.memberId || ''}
                                                    onChange={(e) => handleAssignmentChange(item.id, 'memberId', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white"
                                                >
                                                    <option value="">-- Select Member --</option>
                                                    {squadMembers.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleCloseMeeting}
                    className="w-full py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-[1.01] transition-transform"
                >
                    Finalize Roles & Close Meeting
                </button>
            </div>
        </div>
    );
}