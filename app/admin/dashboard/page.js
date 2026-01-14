'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    // ... (Keep state vars: squadrons, members, meetings, forms, etc.)
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [newSquadronName, setNewSquadronName] = useState('');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberSquadronId, setNewMemberSquadronId] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingType, setMeetingType] = useState('offline');
    const [selectedMeetingId, setSelectedMeetingId] = useState('');
    const [attendees, setAttendees] = useState([]);
    const [lateMembers, setLateMembers] = useState([]);
    const [manualAdjustments, setManualAdjustments] = useState({});

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [sq, mem, mtg] = await Promise.all([
            fetch('/api/squadrons'), fetch('/api/members'), fetch('/api/meetings')
        ]);
        setSquadrons(await sq.json());
        setMembers(await mem.json());
        setMeetings(await mtg.json());
    };

    // ... (Keep CRUD Handlers exactly as is)
    const handleCreateSquadron = async (e) => { e.preventDefault(); await fetch('/api/squadrons', { method: 'POST', body: JSON.stringify({ name: newSquadronName }) }); fetchData(); };
    const handleCreateMember = async (e) => { e.preventDefault(); await fetch('/api/members', { method: 'POST', body: JSON.stringify({ name: newMemberName, squadronId: newMemberSquadronId }) }); fetchData(); };
    const handleCreateMeeting = async (e) => { e.preventDefault(); await fetch('/api/meetings', { method: 'POST', body: JSON.stringify({ date: meetingDate, type: meetingType }) }); fetchData(); };
    const handleDeleteSquadron = async (id) => { if (confirm('Delete?')) { await fetch('/api/squadrons', { method: 'DELETE', body: JSON.stringify({ id }) }); fetchData(); } };
    const handleDeleteMember = async (id) => { if (confirm('Delete?')) { await fetch('/api/members', { method: 'DELETE', body: JSON.stringify({ id }) }); fetchData(); } };

    // ... (Keep handleScoreMeeting, handleResetSystem, toggles)
    const handleScoreMeeting = async () => {
        if (!selectedMeetingId) return alert('Select a meeting');
        const scoringData = {};
        squadrons.forEach(sq => {
            const sqMembers = members.filter(m => m.squadronId === sq.id);
            const sqMemberIds = sqMembers.map(m => m.id);
            scoringData[sq.id] = {
                attendedMemberIds: attendees.filter(id => sqMemberIds.includes(id)),
                lateMemberIds: lateMembers.filter(id => sqMemberIds.includes(id)),
                rolesCount: 0, speechesCount: 0, awardsCount: 0,
                manualAdjustment: parseInt(manualAdjustments[sq.id] || 0)
            };
        });
        const res = await fetch('/api/meetings/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: selectedMeetingId, scoringData })
        });
        if (res.ok) {
            alert('Attendance Scored! Now finalize roles.');
            setAttendees([]); setLateMembers([]); setSelectedMeetingId('');
            fetchData();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    };

    const handleResetSystem = async () => {
        if (confirm('RESET ALL? Irreversible!')) {
            await fetch('/api/admin/reset', { method: 'POST', body: JSON.stringify({ type: 'hard' }) });
            fetchData();
        }
    };

    const toggleAttendee = (id) => setAttendees(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleLateMember = (id) => setLateMembers(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const updateManual = (sqId, val) => setManualAdjustments(p => ({ ...p, [sqId]: val }));

    // PATCH-B: Helper to check for missing speaker details
    const hasMissingDetails = (meeting) => {
        if (!meeting.roleAssignments) return false;
        return meeting.roleAssignments.some(assign => {
            const isSpeaker = assign.roleName && assign.roleName.toLowerCase().includes('speaker');
            const isMember = assign.memberId && !assign.fulfilledExternally;
            if (isSpeaker && isMember) {
                const pw = assign.pathwaysProgress || {};
                return !pw.pathwayName || !pw.level || !pw.projectName || !pw.speechTitle;
            }
            return false;
        });
    };

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* ... (Keep Header & Nav) ... */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase">Mission Control</h1>
                        <p className="text-gray-400 text-sm uppercase mt-1">League Administration</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/auction" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20">Auction House</Link>
                        <Link href="/admin/settings" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20">Settings</Link>
                        <Link href="/" className="px-6 py-2 bg-[#fbbf24] text-black font-bold uppercase rounded-md shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-105 transition-transform">
                            View Arena
                        </Link>
                    </div>
                </div>

                {/* ... (Keep Scorecard Section) ... */}
                <div className="glass-card rounded-2xl p-8 mb-8 border-l-4 border-l-[#fbbf24]">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 bg-[#fbbf24] rounded-full animate-pulse"></span>
                        Live Operations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* CREATE MEETING */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Initialize Session</h3>
                            <form onSubmit={handleCreateMeeting} className="flex gap-3">
                                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="bg-black/40 border-white/10 rounded px-3 py-2 text-white w-full" required />
                                <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)} className="bg-black/40 border-white/10 rounded px-3 py-2 text-white w-full">
                                    <option value="offline">Offline</option>
                                    <option value="online">Online</option>
                                </select>
                                <button type="submit" className="bg-[#fbbf24] text-black font-bold px-4 py-2 rounded uppercase text-sm hover:bg-[#f59e0b]">Create</button>
                            </form>
                        </div>

                        {/* SCORECARD */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Attendance Scorecard</h3>
                            <select value={selectedMeetingId} onChange={(e) => setSelectedMeetingId(e.target.value)} className="w-full bg-black/40 border-white/10 rounded px-4 py-3 text-white mb-4">
                                <option value="">Select LIVE Session...</option>
                                {/* Hardening: Only show MEETING_LIVE sessions for attendance scoring */}
                                {meetings.filter(m => m.status === 'meeting_live').map(m => <option key={m.id} value={m.id}>{m.date} ({m.type})</option>)}
                            </select>

                            {selectedMeetingId && (
                                <div className="space-y-6">
                                    <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                                        {squadrons.map(sq => {
                                            const sqMembers = members.filter(m => m.squadronId === sq.id);
                                            if (sqMembers.length === 0) return null;

                                            return (
                                                <div key={sq.id} className="p-3 bg-black/20 rounded border border-white/5">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-[#fbbf24] text-xs font-bold uppercase">{sq.name}</h4>
                                                        <input
                                                            type="number"
                                                            placeholder="Adj"
                                                            className="w-16 bg-black/40 border border-white/10 text-white text-xs px-2 py-1 rounded"
                                                            onChange={(e) => updateManual(sq.id, e.target.value)}
                                                        />
                                                    </div>
                                                    {sqMembers.map(m => (
                                                        <div key={m.id} className="flex justify-between items-center py-1">
                                                            <span className="text-sm text-gray-300">{m.name}</span>
                                                            <div className="flex gap-2">
                                                                <label className="flex items-center gap-1 cursor-pointer">
                                                                    <input type="checkbox" checked={attendees.includes(m.id)} onChange={() => toggleAttendee(m.id)} className="accent-[#fbbf24]" />
                                                                    <span className="text-[10px] uppercase text-gray-500">P</span>
                                                                </label>
                                                                <label className="flex items-center gap-1 cursor-pointer">
                                                                    <input type="checkbox" checked={lateMembers.includes(m.id)} onChange={() => toggleLateMember(m.id)} className="accent-red-500" />
                                                                    <span className="text-[10px] uppercase text-gray-500">L</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button onClick={handleScoreMeeting} className="w-full bg-[#fbbf24] text-black font-bold py-3 rounded uppercase text-sm shadow-lg hover:bg-[#f59e0b]">
                                        Score Attendance
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SESSION LOGS - PATCHED BUTTONS & DELETE */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Session Lifecycle</h3>
                        <div className="space-y-2">
                            {meetings.sort((a, b) => new Date(b.date) - new Date(a.date)).map(meeting => {
                                const detailsMissing = hasMissingDetails(meeting);
                                return (
                                    <div key={meeting.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded hover:border-[#fbbf24]/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-mono text-sm">
                                                {meeting.date} <span className="text-gray-500">|</span>
                                                <span className="uppercase text-xs font-bold tracking-wider ml-2">{meeting.status}</span>
                                            </span>
                                            {/* PATCH-H: Delete Button */}
                                            {meeting.status !== 'closed' && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete meeting?')) {
                                                            await fetch('/api/meetings', { method: 'DELETE', body: JSON.stringify({ id: meeting.id }) });
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="text-red-500 text-[10px] font-bold uppercase hover:text-red-400"
                                                >
                                                    [DEL]
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {['auction_finalized', 'role_resolution'].includes(meeting.status) && (
                                                <button onClick={() => router.push(`/admin/resolution/${meeting.id}`)} className="px-3 py-1 bg-white/10 text-white text-xs font-bold uppercase rounded hover:bg-white/20">
                                                    Assign Roles (Pre) →
                                                </button>
                                            )}

                                            {meeting.status === 'attendance_finalized' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => router.push(`/admin/resolution/${meeting.id}`)} className="px-3 py-1 bg-white/10 text-white text-xs font-bold uppercase rounded hover:bg-white/20">
                                                        Edit Roles
                                                    </button>
                                                    <button onClick={() => router.push(`/admin/awards/${meeting.id}`)} className="px-3 py-1 bg-[#fbbf24] text-black text-xs font-bold uppercase rounded hover:bg-[#f59e0b]">
                                                        Awards →
                                                    </button>
                                                </div>
                                            )}

                                            {meeting.status === 'awards_assigned' && (
                                                <button
                                                    onClick={() => router.push(`/admin/resolution/${meeting.id}`)}
                                                    className={`px-3 py-1 text-black text-xs font-bold uppercase rounded ${detailsMissing ? 'bg-red-400 hover:bg-red-300' : 'bg-green-500 hover:bg-green-400'}`}
                                                >
                                                    {detailsMissing ? 'Pending Speaker Details' : 'Finalize & Close System'}
                                                </button>
                                            )}

                                            {meeting.status === 'closed' && <span className="text-xs text-gray-500 px-2 py-1">LOCKED</span>}
                                            {meeting.status === 'draft' && <span className="text-xs text-gray-500 px-2 py-1 italic">DRAFT</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ... (Keep Squadrons/Members/Danger Zone sections) ... */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* SQUADRONS */}
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Squadrons</h2>
                        <form onSubmit={handleCreateSquadron} className="flex gap-2 mb-6">
                            <input type="text" value={newSquadronName} onChange={(e) => setNewSquadronName(e.target.value)} placeholder="New Squadron Name" className="flex-1 bg-black/40 border-white/10 rounded px-4 py-2 text-white" required />
                            <button type="submit" className="bg-white/10 text-white font-bold px-4 py-2 rounded uppercase text-sm border border-white/20 hover:bg-white/20">Add</button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {squadrons.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                                    <span className="font-bold text-white">{s.name}</span>
                                    <button onClick={() => handleDeleteSquadron(s.id)} className="text-red-400 text-[10px] font-bold uppercase hover:text-red-300">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MEMBERS */}
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Agents</h2>
                        <form onSubmit={handleCreateMember} className="flex gap-2 mb-6">
                            <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Agent Name" className="flex-1 bg-black/40 border-white/10 rounded px-4 py-2 text-white" required />
                            <select value={newMemberSquadronId} onChange={(e) => setNewMemberSquadronId(e.target.value)} className="bg-black/40 border-white/10 rounded px-2 py-2 text-white w-32" required>
                                <option value="">Squadron</option>
                                {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="submit" className="bg-white/10 text-white font-bold px-4 py-2 rounded uppercase text-sm border border-white/20 hover:bg-white/20">Add</button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {members.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                                    <span className="text-gray-300 text-sm">{m.name}</span>
                                    <button onClick={() => handleDeleteMember(m.id)} className="text-red-400 text-[10px] font-bold uppercase hover:text-red-300">Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DANGER ZONE */}
                <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm">Nuclear Option</h3>
                        <p className="text-red-400/60 text-xs mt-1">This action wipes all database records. Irreversible.</p>
                    </div>
                    <button onClick={handleResetSystem} className="bg-red-500/10 text-red-500 border border-red-500/50 px-6 py-2 rounded font-bold uppercase text-xs hover:bg-red-500 hover:text-black transition-all">
                        Reset System
                    </button>
                </div>
            </div>
        </div>
    );
}