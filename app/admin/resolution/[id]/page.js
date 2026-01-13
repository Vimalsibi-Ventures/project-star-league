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
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        const loadData = async () => {
            const [mRes, sRes, memRes, aRes] = await Promise.all([
                fetch('/api/meetings').then(r => r.json()),
                fetch('/api/squadrons').then(r => r.json()),
                fetch('/api/members').then(r => r.json()),
                fetch('/api/auctions').then(r => r.json())
            ]);

            const currentMeeting = mRes.find(m => m.id === params.id);
            setMeeting(currentMeeting);
            setSquadrons(sRes);
            setMembers(memRes);

            // Load Auction Items
            const auction = aRes.find(a => a.meetingId === params.id);
            if (auction) {
                setAuctionItems(auction.items || []);

                // Pre-fill with existing assignments if any, else init
                const savedAssignments = currentMeeting.roleAssignments || [];
                const initial = {};

                auction.items.forEach(item => {
                    const saved = savedAssignments.find(a => a.auctionItemId === item.id);
                    initial[item.id] = {
                        memberId: saved ? saved.memberId : '',
                        status: saved ? saved.status : 'completed'
                    };
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

    const getRolePayload = () => {
        return auctionItems.map(item => {
            const assignment = assignments[item.id];
            return {
                auctionItemId: item.id,
                roleName: item.title,
                squadronId: item.winningSquadronId,
                memberId: assignment.memberId,
                status: assignment.status
            };
        });
    };

    const handleSaveAssignments = async () => {
        // Saves metadata and sets status to MEETING_LIVE
        const res = await fetch('/api/meetings/roles/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, roleAssignments: getRolePayload() })
        });
        if (res.ok) router.push('/admin/dashboard');
        else alert('Error saving assignments');
    };

    const handleCloseMeeting = async () => {
        if (!confirm('This will award stars and CLOSE the meeting permanently. Continue?')) return;
        const res = await fetch('/api/meetings/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, roleAssignments: getRolePayload() })
        });
        if (res.ok) router.push('/admin/dashboard');
        else alert('Error closing meeting');
    };

    if (!meeting) return <div className="p-10 text-white">Loading...</div>;

    const isPreMeeting = ['auction_finalized', 'role_resolution'].includes(meeting.status);
    const isAttendanceDone = meeting.status === 'attendance_finalized';

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Role Management</h1>
                        <p className="text-[#fbbf24] text-sm uppercase tracking-widest mt-1">
                            {meeting.status.replace('_', ' ')}
                        </p>
                    </div>
                    <Link href="/admin/dashboard" className="text-gray-400 text-xs font-bold uppercase hover:text-white">Cancel</Link>
                </div>

                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Auctioned Roles</h2>

                    {auctionItems.map(item => {
                        const winningSquadron = squadrons.find(s => s.id === item.winningSquadronId);
                        const squadMembers = members.filter(m => m.squadronId === item.winningSquadronId);
                        if (!winningSquadron) return null;

                        return (
                            <div key={item.id} className="p-6 bg-white/5 rounded-xl border border-white/5 mb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-[#fbbf24] font-bold text-lg">{item.title}</h3>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider">
                                            Owner: <span className="text-white">{winningSquadron.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['completed', 'no-show'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => handleAssignmentChange(item.id, 'status', st)}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${assignments[item.id]?.status === st ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]' : 'border-white/10 text-gray-500'}`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <select
                                    value={assignments[item.id]?.memberId || ''}
                                    onChange={(e) => handleAssignmentChange(item.id, 'memberId', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white"
                                >
                                    <option value="">-- Assign Member --</option>
                                    {squadMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4">
                    {isPreMeeting && (
                        <button
                            onClick={handleSaveAssignments}
                            className="flex-1 py-4 bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/20"
                        >
                            Save Assignments & Go Live
                        </button>
                    )}
                    {isAttendanceDone && (
                        <button
                            onClick={handleCloseMeeting}
                            className="flex-1 py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                        >
                            Award Stars & Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}