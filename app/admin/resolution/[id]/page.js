'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROLE_TEMPLATES } from '@/lib/roleTemplates';

// CONSTANT FOR INTERNAL STATE MANAGEMENT
const GUEST_EXTERNAL_KEY = 'GUEST_EXTERNAL_OVERRIDE';

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

            const auction = aRes.find(a => a.meetingId === params.id);
            if (auction) {
                setAuctionItems(auction.items || []);

                // RESTORE STATE LOGIC
                const savedAssignments = currentMeeting.roleAssignments || [];
                const initial = {};

                auction.items.forEach(item => {
                    const saved = savedAssignments.find(a => a.auctionItemId === item.id);

                    // Logic: If saved record says fulfilledExternally, set UI to GUEST KEY
                    let memberValue = '';
                    if (saved) {
                        if (saved.fulfilledExternally) {
                            memberValue = GUEST_EXTERNAL_KEY;
                        } else {
                            memberValue = saved.memberId || '';
                        }
                    }

                    initial[item.id] = {
                        memberId: memberValue,
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

    // CONSTRUCT PAYLOAD - STRICT COMPLIANCE
    const getRolePayload = () => {
        return auctionItems.map(item => {
            const assignment = assignments[item.id];
            const isGuest = assignment.memberId === GUEST_EXTERNAL_KEY;

            if (isGuest) {
                // GUEST PATH: Override and Nullify Associations
                return {
                    auctionItemId: item.id,
                    roleName: item.title,
                    squadronId: null, // Ignore team association
                    memberId: null,   // Ignore member ID
                    status: assignment.status,
                    fulfilledExternally: true // AUDIT FLAG
                };
            }

            // STANDARD MEMBER PATH
            return {
                auctionItemId: item.id,
                roleName: item.title,
                squadronId: item.winningSquadronId, // Respect Auction Ownership
                memberId: assignment.memberId,
                status: assignment.status,
                fulfilledExternally: false
            };
        });
    };

    const handleSaveAssignments = async () => {
        const res = await fetch('/api/meetings/roles/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, roleAssignments: getRolePayload() })
        });
        if (res.ok) router.push('/admin/dashboard');
        else alert('Error saving assignments');
    };

    const handleCloseMeeting = async () => {
        if (!confirm('This will award stars (for Members) and CLOSE the meeting. Guests generate no stars. Continue?')) return;
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

    const getGuestAllowed = (item) => {
        const tmpl = ROLE_TEMPLATES.find(t => t.id === item.roleTemplateId);
        if (tmpl) return tmpl.guestAllowed;
        return !item.title.toLowerCase().includes('speaker');
    };

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

                        const guestAllowed = getGuestAllowed(item);
                        const isUnowned = !winningSquadron;

                        // Constraint: If unowned and no guests allowed, skip (Must be bought in Secondary Market)
                        if (isUnowned && !guestAllowed) return null;

                        return (
                            <div key={item.id} className="p-6 bg-white/5 rounded-xl border border-white/5 mb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-[#fbbf24] font-bold text-lg">{item.title}</h3>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider">
                                            {winningSquadron ? `Owner: ${winningSquadron.name}` : 'UNSOLD (Open/Guest)'}
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

                                    {/* MEMBER OPTIONS: Only if Squadron Owned */}
                                    {winningSquadron && squadMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}

                                    {/* GUEST OPTION: Only if Template allows */}
                                    {guestAllowed && (
                                        <option value={GUEST_EXTERNAL_KEY} className="text-orange-300">
                                            Guest / Non-Member (No Stars)
                                        </option>
                                    )}
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