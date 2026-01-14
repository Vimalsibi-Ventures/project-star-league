'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROLE_TEMPLATES } from '@/lib/roleTemplates';

const GUEST_EXTERNAL_KEY = 'GUEST_EXTERNAL_OVERRIDE';

export default function RoleResolutionPage({ params }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState(null);
    const [auctionItems, setAuctionItems] = useState([]);
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [missingDetails, setMissingDetails] = useState([]);

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
                const savedAssignments = currentMeeting.roleAssignments || [];
                const initial = {};

                auction.items.forEach(item => {
                    const saved = savedAssignments.find(a => a.auctionItemId === item.id);
                    let memberValue = '';
                    if (saved) {
                        memberValue = saved.fulfilledExternally ? GUEST_EXTERNAL_KEY : (saved.memberId || '');
                    }
                    initial[item.id] = {
                        memberId: memberValue,
                        status: saved ? saved.status : 'completed',
                        pathways: saved && saved.pathwaysProgress ? saved.pathwaysProgress : {
                            pathwayName: '', level: '', projectName: '', speechTitle: ''
                        }
                    };
                });
                setAssignments(initial);
            }
        };
        loadData();
    }, [params.id]);

    // Validation Effect
    useEffect(() => {
        const errors = [];
        auctionItems.forEach(item => {
            const assign = assignments[item.id];
            if (!assign) return;

            const isSpeaker = item.roleTemplateId === 'speaker' || item.title.toLowerCase().includes('speaker');
            const isMember = assign.memberId && assign.memberId !== GUEST_EXTERNAL_KEY;

            if (isSpeaker && isMember) {
                const pw = assign.pathways || {};
                const missingFields = [];
                if (!pw.pathwayName) missingFields.push('Pathway Name');
                if (!pw.level) missingFields.push('Level');
                if (!pw.projectName) missingFields.push('Project');
                if (!pw.speechTitle) missingFields.push('Title');

                if (missingFields.length > 0) {
                    errors.push(`${item.title}: Missing ${missingFields.join(', ')}`);
                }
            }
        });
        setMissingDetails(errors);
    }, [assignments, auctionItems]);

    const handleAssignmentChange = (itemId, field, value) => {
        setAssignments(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };

    const handlePathwaysChange = (itemId, field, value) => {
        setAssignments(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                pathways: { ...prev[itemId].pathways, [field]: value }
            }
        }));
    };

    // PATCH-C: Speaker Exclusivity Filter
    const getAvailableMembers = (currentItemId, squadMembers) => {
        // Find all members currently assigned to a SPEAKER role
        const speakerMemberIds = auctionItems
            .filter(i => (i.roleTemplateId === 'speaker' || i.title.toLowerCase().includes('speaker')) && i.id !== currentItemId)
            .map(i => assignments[i.id]?.memberId)
            .filter(id => id && id !== GUEST_EXTERNAL_KEY);

        // If current item IS a speaker slot, we must exclude members who are already speakers elsewhere
        const isCurrentSpeaker = auctionItems.find(i => i.id === currentItemId)?.roleTemplateId === 'speaker';

        return squadMembers.filter(m => {
            // If this member is already a speaker elsewhere, they cannot take ANY other role
            if (speakerMemberIds.includes(m.id)) return false;
            return true;
        });
    };

    const getRolePayload = () => {
        return auctionItems.map(item => {
            const assignment = assignments[item.id];
            const isGuest = assignment.memberId === GUEST_EXTERNAL_KEY;
            const isSpeaker = item.roleTemplateId === 'speaker' || item.title.toLowerCase().includes('speaker');

            let pathwaysProgress = null;
            if (isSpeaker && !isGuest && assignment.memberId) {
                pathwaysProgress = assignment.pathways;
            }

            if (isGuest) {
                return {
                    auctionItemId: item.id,
                    roleName: item.title,
                    squadronId: null,
                    memberId: null,
                    status: assignment.status,
                    fulfilledExternally: true
                };
            }
            return {
                auctionItemId: item.id,
                roleName: item.title,
                squadronId: item.winningSquadronId,
                memberId: assignment.memberId,
                status: assignment.status,
                fulfilledExternally: false,
                pathwaysProgress: pathwaysProgress
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
        if (missingDetails.length > 0) return alert('Cannot close: Missing Speaker details.');
        // PATCH-E: Close button here is only for Attendance Finalized -> Awards flow? 
        // Actually, this page is reused. If status is Awards Assigned, we can close.
        if (!confirm('Award stars, Log to Sheets, and CLOSE?')) return;

        const res = await fetch('/api/meetings/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, roleAssignments: getRolePayload() })
        });
        if (res.ok) router.push('/admin/dashboard');
        else alert('Error closing meeting');
    };

    const getGuestAllowed = (item) => {
        const tmpl = ROLE_TEMPLATES.find(t => t.id === item.roleTemplateId);
        if (tmpl) return tmpl.guestAllowed;
        return !item.title.toLowerCase().includes('speaker');
    };

    if (!meeting) return <div className="p-10 text-white">Loading...</div>;

    const isPreMeeting = ['auction_finalized', 'role_resolution'].includes(meeting.status);
    // PATCH-E: This page handles Role Assignment. Final Close happens in Dashboard or here depending on flow.
    // Dashboard redirects here for final close.
    const isAwardsDone = meeting.status === 'awards_assigned';

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Role Resolution</h1>
                        <p className="text-[#fbbf24] text-sm uppercase tracking-widest mt-1">
                            {meeting.status.replace('_', ' ')}
                        </p>
                    </div>
                    <Link href="/admin/dashboard" className="text-gray-400 text-xs font-bold uppercase hover:text-white">Cancel</Link>
                </div>

                {/* PATCH-G: Warning Banner */}
                {missingDetails.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
                        <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2">Required: Speaker Details</h3>
                        <ul className="list-disc list-inside text-xs text-red-400/80 space-y-1">
                            {missingDetails.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Assignments & Pathways</h2>

                    {auctionItems.map(item => {
                        const winningSquadron = squadrons.find(s => s.id === item.winningSquadronId);
                        const squadMembers = members.filter(m => m.squadronId === item.winningSquadronId);
                        const guestAllowed = getGuestAllowed(item);
                        const isUnowned = !winningSquadron;
                        const isSpeaker = item.roleTemplateId === 'speaker' || item.title.toLowerCase().includes('speaker');
                        const currentMemberId = assignments[item.id]?.memberId;
                        const isMemberSelected = currentMemberId && currentMemberId !== GUEST_EXTERNAL_KEY;

                        // PATCH-C: Filter Members
                        const availableMembers = getAvailableMembers(item.id, squadMembers);

                        if (isUnowned && !guestAllowed) return null;

                        return (
                            <div key={item.id} className="p-6 bg-white/5 rounded-xl border border-white/5 mb-4 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-[#fbbf24] font-bold text-lg">{item.title}</h3>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider">
                                            {winningSquadron ? `Owner: ${winningSquadron.name}` : 'UNSOLD (Open/Guest)'}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['completed', 'no-show'].map(st => (
                                            <button key={st} onClick={() => handleAssignmentChange(item.id, 'status', st)} className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${assignments[item.id]?.status === st ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]' : 'border-white/10 text-gray-500'}`}>{st}</button>
                                        ))}
                                    </div>
                                </div>

                                <select value={assignments[item.id]?.memberId || ''} onChange={(e) => handleAssignmentChange(item.id, 'memberId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white mb-4">
                                    <option value="">-- Assign Entity --</option>
                                    {winningSquadron && availableMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                    {guestAllowed && <option value={GUEST_EXTERNAL_KEY} className="text-orange-300">Guest / Non-Member</option>}
                                </select>

                                {isSpeaker && isMemberSelected && (
                                    <div className="bg-black/20 p-4 rounded-lg border border-white/5 mt-2">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Pathways Progress (Mandatory)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input type="text" placeholder="Pathway Name" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs" value={assignments[item.id]?.pathways?.pathwayName || ''} onChange={(e) => handlePathwaysChange(item.id, 'pathwayName', e.target.value)} />
                                            <input type="text" placeholder="Level" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs" value={assignments[item.id]?.pathways?.level || ''} onChange={(e) => handlePathwaysChange(item.id, 'level', e.target.value)} />
                                            <input type="text" placeholder="Project Name" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs" value={assignments[item.id]?.pathways?.projectName || ''} onChange={(e) => handlePathwaysChange(item.id, 'projectName', e.target.value)} />
                                            <input type="text" placeholder="Speech Title" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs" value={assignments[item.id]?.pathways?.speechTitle || ''} onChange={(e) => handlePathwaysChange(item.id, 'speechTitle', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4">
                    {isPreMeeting && (
                        <button onClick={handleSaveAssignments} className="flex-1 py-4 bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/20">
                            Save Assignments & Go Live
                        </button>
                    )}
                    {isAwardsDone && (
                        <button
                            onClick={handleCloseMeeting}
                            disabled={missingDetails.length > 0}
                            className="flex-1 py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            {missingDetails.length > 0 ? 'Pending Speaker Details...' : 'Finalize, Log & Close'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}