'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [meetings, setMeetings] = useState([]);

    // Squadron form
    const [newSquadronName, setNewSquadronName] = useState('');

    // Member form
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberSquadronId, setNewMemberSquadronId] = useState('');

    // Meeting form
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingType, setMeetingType] = useState('offline');
    const [selectedMeetingId, setSelectedMeetingId] = useState('');

    const [attendees, setAttendees] = useState([]);
    const [lateMembers, setLateMembers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [squadronsRes, membersRes, meetingsRes] = await Promise.all([
            fetch('/api/squadrons'),
            fetch('/api/members'),
            fetch('/api/meetings')
        ]);

        setSquadrons(await squadronsRes.json());
        setMembers(await membersRes.json());
        setMeetings(await meetingsRes.json());
    };

    const handleCreateSquadron = async (e) => {
        e.preventDefault();
        await fetch('/api/squadrons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSquadronName })
        });
        setNewSquadronName('');
        fetchData();
    };

    const handleDeleteSquadron = async (id) => {
        if (confirm('Delete this squadron and all its members?')) {
            await fetch('/api/squadrons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchData();
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newMemberName, squadronId: newMemberSquadronId })
        });
        setNewMemberName('');
        setNewMemberSquadronId('');
        fetchData();
    };

    const handleDeleteMember = async (id) => {
        if (confirm('Delete this member?')) {
            await fetch('/api/members', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchData();
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: meetingDate, type: meetingType })
        });
        setMeetingDate('');
        fetchData();
    };

    const handleScoreMeeting = async () => {
        if (!selectedMeetingId) {
            alert('Please select a meeting');
            return;
        }

        // Calculate scores based on attendance
        const meeting = meetings.find(m => m.id === selectedMeetingId);
        if (!meeting) return;

        const starsPerAttendee = meetingType === 'online' ? 5 : 10;

        // Group attendees by squadron
        const squadronAttendees = {};
        attendees.forEach(memberId => {
            const member = members.find(m => m.id === memberId);
            if (member) {
                if (!squadronAttendees[member.squadronId]) {
                    squadronAttendees[member.squadronId] = [];
                }
                squadronAttendees[member.squadronId].push(memberId);
            }
        });

        // Create transactions for each squadron
        for (const [squadronId, memberIds] of Object.entries(squadronAttendees)) {
            let totalStars = memberIds.length * starsPerAttendee;

            // Check if all 4 members attended
            const squadronMembers = members.filter(m => m.squadronId === squadronId);
            if (squadronMembers.length === 4 && memberIds.length === 4) {
                totalStars += 20;
                // Perfect attendance bonus
            }

            // Create attendance transaction
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingId: selectedMeetingId,
                    squadronId,
                    category: 'Attendance',
                    starsDelta: totalStars,
                    description: `${memberIds.length} members attended (${meetingType})`
                })
            });
        }

        // Deduct stars for lateness
        for (const memberId of lateMembers) {
            const member = members.find(m => m.id === memberId);
            if (member) {
                await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        meetingId: selectedMeetingId,
                        squadronId: member.squadronId,
                        memberId: memberId,
                        category: 'Lateness',
                        starsDelta: -5,
                        description: `${member.name} was late`
                    })
                });
            }
        }

        alert('Meeting scored!');
        setAttendees([]);
        setLateMembers([]);
        fetchData();
    };

    const handleFinalizeMeeting = async (id) => {
        if (confirm('Finalize this meeting? It will be locked.')) {
            await fetch('/api/meetings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchData();
        }
    };

    const handleResetSystem = async () => {
        if (confirm('RESET ENTIRE SYSTEM? This cannot be undone!')) {
            await fetch('/api/squadrons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetAll: true })
            });
            fetchData();
        }
    };

    const toggleAttendee = (memberId) => {
        setAttendees(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleLateMember = (memberId) => {
        setLateMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0e1117] via-[#151a23] to-[#0e1117] pt-[72px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#e6e9f0]">Admin Dashboard</h1>
                    <Link href="/" className="text-[#4f8cff] hover:text-[#38e8ff] transition-colors">
                        View Public Site →
                    </Link>
                </div>

                {/* Meetings & Scoring */}
                <section className="mb-12 bg-[#151a23] border border-[#2a3245] rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-[#e6e9f0] mb-6">Meetings & Scoring</h2>

                    <form onSubmit={handleCreateMeeting} className="mb-6">
                        <h3 className="text-lg font-medium text-[#e6e9f0] mb-3">Create New Meeting</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                className="px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                                required
                            />
                            <select
                                value={meetingType}
                                onChange={(e) => setMeetingType(e.target.value)}
                                className="px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                            >
                                <option value="offline">Offline</option>
                                <option value="online">Online</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-[#4f8cff] text-white px-4 py-2 rounded-md hover:bg-[#3b7ae8] hover:shadow-[0_0_12px_rgba(79,140,255,0.5)] transition-all"
                            >
                                Create Meeting
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-[#2a3245] pt-6">
                        <h3 className="text-lg font-medium text-[#e6e9f0] mb-3">Score Meeting</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#9aa4bf] mb-2">
                                Select Meeting
                            </label>
                            <select
                                value={selectedMeetingId}
                                onChange={(e) => setSelectedMeetingId(e.target.value)}
                                className="w-full px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                            >
                                <option value="">-- Select a meeting --</option>
                                {meetings.filter(m => !m.finalized).map(meeting => (
                                    <option key={meeting.id} value={meeting.id}>
                                        {meeting.date} ({meeting.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMeetingId && (
                            <>
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-[#9aa4bf] mb-2">Mark Attendance</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {members.map(member => {
                                            const squadron = squadrons.find(s => s.id === member.squadronId);
                                            return (
                                                <label key={member.id} className="flex items-center text-[#e6e9f0] hover:text-[#38e8ff] transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={attendees.includes(member.id)}
                                                        onChange={() => toggleAttendee(member.id)}
                                                        className="mr-2 w-4 h-4 text-[#4f8cff] bg-[#1c2333] border-[#2a3245] rounded focus:ring-[#4f8cff]"
                                                    />
                                                    <span className="text-sm">
                                                        {member.name} ({squadron?.name})
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-[#9aa4bf] mb-2">Mark Late Members</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {attendees.map(memberId => {
                                            const member = members.find(m => m.id === memberId);
                                            return (
                                                <label key={memberId} className="flex items-center text-[#e6e9f0] hover:text-[#38e8ff] transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={lateMembers.includes(memberId)}
                                                        onChange={() => toggleLateMember(memberId)}
                                                        className="mr-2 w-4 h-4 text-[#4f8cff] bg-[#1c2333] border-[#2a3245] rounded focus:ring-[#4f8cff]"
                                                    />
                                                    <span className="text-sm">{member?.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={handleScoreMeeting}
                                    className="bg-[#4f8cff] text-white px-6 py-2 rounded-md hover:bg-[#3b7ae8] hover:shadow-[0_0_12px_rgba(79,140,255,0.5)] transition-all"
                                >
                                    Calculate & Save Scores
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-t border-[#2a3245] pt-6 mt-6">
                        <h3 className="text-lg font-medium text-[#e6e9f0] mb-3">Meetings List</h3>
                        <div className="space-y-0">
                            {meetings.map(meeting => (
                                <div key={meeting.id} className="flex justify-between items-center p-3 border-b border-[#2a3245] hover:bg-[#1c2333] hover:shadow-[0_0_8px_rgba(79,140,255,0.2)] transition-all">
                                    <span className="text-sm text-[#e6e9f0]">
                                        {meeting.date} - {meeting.type}
                                        {meeting.finalized && ' (Finalized)'}
                                    </span>
                                    {!meeting.finalized && (
                                        <button
                                            onClick={() => handleFinalizeMeeting(meeting.id)}
                                            className="bg-[#4f8cff] text-white px-3 py-1 rounded text-sm hover:bg-[#3b7ae8] hover:shadow-[0_0_8px_rgba(79,140,255,0.4)] transition-all"
                                        >
                                            Finalize
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Squadrons */}
                <section className="mb-12 bg-[#151a23] border border-[#2a3245] rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-[#e6e9f0] mb-6">Squadrons</h2>

                    <form onSubmit={handleCreateSquadron} className="mb-6">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newSquadronName}
                                onChange={(e) => setNewSquadronName(e.target.value)}
                                placeholder="Squadron name"
                                className="flex-1 px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md placeholder:text-[#6b7280] focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-[#4f8cff] text-white px-6 py-2 rounded-md hover:bg-[#3b7ae8] hover:shadow-[0_0_12px_rgba(79,140,255,0.5)] transition-all"
                            >
                                Create Squadron
                            </button>
                        </div>
                    </form>

                    <div className="space-y-0">
                        {squadrons.map((squadron, index) => (
                            <div key={squadron.id} className="flex justify-between items-center p-3 border-b border-[#2a3245] hover:bg-[#1c2333] hover:shadow-[0_0_8px_rgba(79,140,255,0.2)] transition-all">
                                <span className="font-medium text-[#e6e9f0]">{squadron.name}</span>
                                <button
                                    onClick={() => handleDeleteSquadron(squadron.id)}
                                    className="bg-[#ef4444] text-white px-3 py-1 rounded text-sm hover:bg-[#dc2626] hover:shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Members */}
                <section className="mb-12 bg-[#151a23] border border-[#2a3245] rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-[#e6e9f0] mb-6">Members</h2>

                    <form onSubmit={handleCreateMember} className="mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Member name"
                                className="px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md placeholder:text-[#6b7280] focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                                required
                            />
                            <select
                                value={newMemberSquadronId}
                                onChange={(e) => setNewMemberSquadronId(e.target.value)}
                                className="px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                                required
                            >
                                <option value="">Select squadron</option>
                                {squadrons.map(squadron => (
                                    <option key={squadron.id} value={squadron.id}>
                                        {squadron.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-[#4f8cff] text-white px-6 py-2 rounded-md hover:bg-[#3b7ae8] hover:shadow-[0_0_12px_rgba(79,140,255,0.5)] transition-all"
                            >
                                Add Member
                            </button>
                        </div>
                    </form>

                    <div className="space-y-0">
                        {members.map((member, index) => {
                            const squadron = squadrons.find(s => s.id === member.squadronId);
                            return (
                                <div key={member.id} className="flex justify-between items-center p-3 border-b border-[#2a3245] hover:bg-[#1c2333] hover:shadow-[0_0_8px_rgba(79,140,255,0.2)] transition-all">
                                    <span className="text-[#e6e9f0]">
                                        {member.name} - <span className="text-[#9aa4bf]">{squadron?.name}</span>
                                    </span>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="bg-[#ef4444] text-white px-3 py-1 rounded text-sm hover:bg-[#dc2626] hover:shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* System Reset */}
                <section className="bg-[#151a23] border border-[#2a3245] rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-[#e6e9f0] mb-4">Danger Zone</h2>
                    <p className="text-[#9aa4bf] mb-4">
                        This will delete ALL squadrons, members, meetings, and transactions.
                        This cannot be undone!
                    </p>
                    <button
                        onClick={handleResetSystem}
                        className="bg-[#ef4444] text-white px-6 py-2 rounded-md hover:bg-[#dc2626] hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
                    >
                        Reset Entire System
                    </button>
                </section>
            </div>
        </div>
    );
}
