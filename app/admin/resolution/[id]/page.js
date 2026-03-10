'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROLE_TEMPLATES } from '@/lib/roleTemplates';
import TableTopicsManager from '@/components/TableTopicsManager';

const GUEST_EXTERNAL_KEY = 'GUEST_EXTERNAL_OVERRIDE';
const COOLDOWN_DURATION = 2;

export default function RoleResolutionPage({ params }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState(null);
    const [auctionItems, setAuctionItems] = useState([]);
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [currentMeetingIndex, setCurrentMeetingIndex] = useState(0);

    const [ttParticipants, setTtParticipants] = useState([]);
    const [ttLocked, setTtLocked] = useState(false); 

    useEffect(() => {
        const loadData = async () => {
            const [mRes, sRes, memRes, aRes] = await Promise.all([
                fetch('/api/meetings').then(r => r.json()),
                fetch('/api/squadrons').then(r => r.json()),
                fetch('/api/members').then(r => r.json()),
                fetch('/api/auctions').then(r => r.json())
            ]);

            const closedCount = mRes.filter(m => m.status === 'closed').length;
            setCurrentMeetingIndex(closedCount + 1);

            const currentMeeting = mRes.find(m => m.id === params.id);
            setMeeting(currentMeeting);
            setSquadrons(sRes);
            setMembers(memRes);

            if (currentMeeting && currentMeeting.tableTopics) {
                setTtParticipants(currentMeeting.tableTopics.participants || []);
                setTtLocked(!!currentMeeting.tableTopics.locked);
            }

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
                        substitutionFee: saved && saved.substitutionFee ? saved.substitutionFee : 0
                    };
                });
                setAssignments(initial);
            }
        };
        loadData();
    }, [params.id]);

    const handleAssignmentChange = (itemId, field, value) => {
        setAssignments(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
    };

    const handleFeeChange = (itemId, value) => {
        setAssignments(prev => ({
            ...prev, [itemId]: { ...prev[itemId], substitutionFee: value }
        }));
    };

    const handleLockTT = async () => {
        if (!confirm('Lock Table Topics? This will freeze the participant list.')) return;

        const res = await fetch('/api/meetings/roles/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingId: params.id,
                roleAssignments: getRolePayload(),
                tableTopics: { participants: ttParticipants },
                ttLocked: true 
            })
        });

        if (res.ok) {
            setTtLocked(true);
        }
    };

    const getAvailableMembers = (currentItemId, squadMembers) => {
        const speakerMemberIds = auctionItems
            .filter(i => (i.roleTemplateId === 'speaker' || i.title.toLowerCase().includes('speaker')) && i.id !== currentItemId)
            .map(i => assignments[i.id]?.memberId)
            .filter(id => id && id !== GUEST_EXTERNAL_KEY);
        return squadMembers.filter(m => !speakerMemberIds.includes(m.id));
    };

    const getRolePayload = () => {
        return auctionItems.map(item => {
            const assignment = assignments[item.id];
            const isGuest = assignment.memberId === GUEST_EXTERNAL_KEY;

            let assigneeSquadronId = null;
            let assigneeSquadronName = '';
            if (!isGuest && assignment.memberId) {
                const m = members.find(x => x.id === assignment.memberId);
                if (m) {
                    assigneeSquadronId = m.squadronId;
                    assigneeSquadronName = m.squadronName;
                }
            }

            return {
                auctionItemId: item.id,
                roleName: item.title,
                winningSquadronId: item.winningSquadronId,
                squadronId: assigneeSquadronId || item.winningSquadronId,
                squadronName: assigneeSquadronName,
                memberId: isGuest ? null : assignment.memberId,
                status: assignment.status,
                fulfilledExternally: isGuest,
                substitutionFee: parseInt(assignment.substitutionFee || 0)
            };
        });
    };

    const handleSaveAssignments = async () => {
        const res = await fetch('/api/meetings/roles/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingId: params.id,
                roleAssignments: getRolePayload(),
                tableTopics: { participants: ttParticipants },
                ttLocked: ttLocked 
            })
        });
        if (res.ok) router.push('/admin/dashboard');
        else alert('Error saving assignments');
    };

    const handleCloseMeeting = async () => {
        if (!confirm('Award stars, Log to Sheets, and CLOSE?')) return;

        await fetch('/api/meetings/roles/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingId: params.id,
                roleAssignments: getRolePayload(),
                tableTopics: { participants: ttParticipants },
                ttLocked: ttLocked
            })
        });

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

    const getRotationWarning = (item, memberId) => {
        const isSpeaker = item.roleTemplateId === 'speaker' || item.title.toLowerCase().includes('speaker');
        if (!isSpeaker || !memberId || memberId === GUEST_EXTERNAL_KEY) return null;
        
        const member = members.find(m => m.id === memberId);
        if (!member) return null;
        
        const lastIdx = member.lastSpeechMeetingIndex || -10;
        const meetingsSinceSpeech = currentMeetingIndex - lastIdx;
        const onCooldown = meetingsSinceSpeech <= COOLDOWN_DURATION;
        
        if (onCooldown) {
            const meetsRemaining = (COOLDOWN_DURATION - meetingsSinceSpeech) + 1;
            return `⚠️ Cooldown Warning: Member must sit out for ${meetsRemaining} more meeting(s). The +5★ Rotation Bonus will be forfeited!`;
        }
        
        return `✅ Valid Speaker: Cooldown cleared! Will earn the +5★ Rotation Bonus.`;
    };

    if (!meeting) return <div className="p-10 text-white">Loading...</div>;

    const isPreMeeting = ['auction_finalized', 'role_resolution'].includes(meeting.status);
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

                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wide">Table Topics</h3>
                    {!ttLocked ? (
                        <button onClick={handleLockTT} className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase rounded hover:bg-indigo-400">
                            Lock / Finalize TT
                        </button>
                    ) : (
                        <span className="text-xs text-green-400 font-bold uppercase border border-green-500 px-2 py-1 rounded">TT Finalized ✓</span>
                    )}
                </div>

                {!ttLocked ? (
                    <TableTopicsManager members={members} initialData={ttParticipants} onChange={setTtParticipants} />
                ) : (
                    <div className="opacity-50 pointer-events-none grayscale">
                        <TableTopicsManager members={members} initialData={ttParticipants} onChange={setTtParticipants} />
                    </div>
                )}

                <div className="glass-card rounded-2xl p-8 mb-8 mt-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Assignments</h2>

                    {auctionItems.map(item => {
                        const winningSquadron = squadrons.find(s => s.id === item.winningSquadronId);
                        const squadMembers = members.filter(m => m.squadronId === item.winningSquadronId);
                        const guestAllowed = getGuestAllowed(item);
                        const isUnowned = !winningSquadron;
                        const isSpeaker = item.roleTemplateId === 'speaker' || item.title.toLowerCase().includes('speaker');
                        const currentMemberId = assignments[item.id]?.memberId;
                        const availableMembers = getAvailableMembers(item.id, squadMembers);
                        const rotationWarning = getRotationWarning(item, currentMemberId);

                        const assignedMember = members.find(m => m.id === currentMemberId);
                        const isSubstitution = assignedMember && winningSquadron && assignedMember.squadronId !== winningSquadron.id;

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

                                <select value={assignments[item.id]?.memberId || ''} onChange={(e) => handleAssignmentChange(item.id, 'memberId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white mb-2">
                                    <option value="">-- Assign Entity --</option>
                                    {winningSquadron && availableMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                    {guestAllowed && <option value={GUEST_EXTERNAL_KEY} className="text-orange-300">Guest / Non-Member</option>}
                                </select>

                                {rotationWarning && (
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 p-2 rounded border ${rotationWarning.includes('Warning') ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20'}`}>
                                        {rotationWarning}
                                    </div>
                                )}

                                {isSubstitution && !isSpeaker && (
                                    <div className="mt-2 mb-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex items-center gap-4">
                                        <span className="text-indigo-300 text-xs font-bold uppercase tracking-wide">Mercenary Fee:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={assignments[item.id]?.substitutionFee || 0}
                                            onChange={(e) => handleFeeChange(item.id, e.target.value)}
                                            className="w-20 bg-black/50 border border-indigo-500/50 rounded px-2 py-1 text-white text-sm"
                                        />
                                        <span className="text-gray-500 text-xs">Stars (from {winningSquadron.name} to {assignedMember.squadronName})</span>
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
                            className="flex-1 py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
                        >
                            Finalize, Log & Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}