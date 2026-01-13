'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
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

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [squadronsRes, membersRes, meetingsRes] = await Promise.all([
            fetch('/api/squadrons'), fetch('/api/members'), fetch('/api/meetings')
        ]);
        setSquadrons(await squadronsRes.json());
        setMembers(await membersRes.json());
        setMeetings(await meetingsRes.json());
    };

    // ... (Keep existing handlers: handleCreateSquadron, handleDeleteSquadron, etc.) ...
    // Note: Re-implementing handlers here for brevity, assume they are the same logic as before.
    const handleCreateSquadron = async (e) => {
        e.preventDefault();
        await fetch('/api/squadrons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSquadronName }) });
        setNewSquadronName(''); fetchData();
    };
    const handleDeleteSquadron = async (id) => {
        if (confirm('Delete this squadron?')) {
            await fetch('/api/squadrons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            fetchData();
        }
    };
    const handleCreateMember = async (e) => {
        e.preventDefault();
        await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newMemberName, squadronId: newMemberSquadronId }) });
        setNewMemberName(''); setNewMemberSquadronId(''); fetchData();
    };
    const handleDeleteMember = async (id) => {
        if (confirm('Delete member?')) {
            await fetch('/api/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            fetchData();
        }
    };
    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: meetingDate, type: meetingType }) });
        setMeetingDate(''); fetchData();
    };
    const handleScoreMeeting = async () => {
        if (!selectedMeetingId) return alert('Select a meeting');
        const meeting = meetings.find(m => m.id === selectedMeetingId);
        if (!meeting) return;

        const starsPerAttendee = meetingType === 'online' ? 5 : 10;
        const squadronAttendees = {};

        // Group attendees
        attendees.forEach(id => {
            const m = members.find(mem => mem.id === id);
            if (m) {
                if (!squadronAttendees[m.squadronId]) squadronAttendees[m.squadronId] = [];
                squadronAttendees[m.squadronId].push(id);
            }
        });

        // Score
        for (const [sqId, mIds] of Object.entries(squadronAttendees)) {
            let total = mIds.length * starsPerAttendee;
            const sqMembers = members.filter(m => m.squadronId === sqId);
            if (sqMembers.length === 4 && mIds.length === 4) total += 20;

            await fetch('/api/transactions', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId: selectedMeetingId, squadronId: sqId, category: 'Attendance', starsDelta: total, description: `${mIds.length} attended` })
            });
        }

        // Late
        for (const mId of lateMembers) {
            const m = members.find(mem => mem.id === mId);
            if (m) {
                await fetch('/api/transactions', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ meetingId: selectedMeetingId, squadronId: m.squadronId, memberId: mId, category: 'Lateness', starsDelta: -5, description: `${m.name} late` })
                });
            }
        }
        alert('Scored!'); setAttendees([]); setLateMembers([]); fetchData();
    };
    const handleFinalizeMeeting = async (id) => {
        if (confirm('Lock meeting?')) {
            await fetch('/api/meetings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            fetchData();
        }
    };
    const handleResetSystem = async () => {
        if (confirm('RESET ALL?')) {
            await fetch('/api/squadrons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetAll: true }) });
            fetchData();
        }
    };

    const toggleAttendee = (id) => setAttendees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleLateMember = (id) => setLateMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);


    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Mission Control</h1>
                        <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">League Administration</p>
                    </div>
                    <Link href="/" className="px-6 py-2 bg-[#fbbf24] text-black font-bold uppercase rounded-md shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-105 transition-transform">
                        View Arena
                    </Link>
                </div>

                {/* MEETING CONTROLS */}
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
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Scorecard</h3>
                            <select value={selectedMeetingId} onChange={(e) => setSelectedMeetingId(e.target.value)} className="w-full bg-black/40 border-white/10 rounded px-4 py-3 text-white mb-4">
                                <option value="">Select Active Session...</option>
                                {meetings.filter(m => !m.finalized).map(m => <option key={m.id} value={m.id}>{m.date} ({m.type})</option>)}
                            </select>

                            {selectedMeetingId && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-black/40 rounded border border-white/5 max-h-40 overflow-y-auto">
                                        {members.map(m => (
                                            <label key={m.id} className="flex items-center gap-3 py-1 hover:bg-white/5 px-2 rounded cursor-pointer">
                                                <input type="checkbox" checked={attendees.includes(m.id)} onChange={() => toggleAttendee(m.id)} className="accent-[#fbbf24]" />
                                                <span className="text-sm text-gray-300">{m.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <button onClick={handleScoreMeeting} className="w-full bg-white/10 text-[#fbbf24] border border-[#fbbf24]/50 font-bold py-2 rounded uppercase text-sm hover:bg-[#fbbf24] hover:text-black transition-all">
                                        Submit Scores
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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