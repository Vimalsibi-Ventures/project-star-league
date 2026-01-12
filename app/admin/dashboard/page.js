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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                    View Public Site →
                </Link>
            </div>

            {/* Meetings & Scoring */}
            <section className="mb-12 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meetings & Scoring</h2>

                <form onSubmit={handleCreateMeeting} className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Create New Meeting</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <select
                            value={meetingType}
                            onChange={(e) => setMeetingType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="offline">Offline</option>
                            <option value="online">Online</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Create Meeting
                        </button>
                    </div>
                </form>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Score Meeting</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Meeting
                        </label>
                        <select
                            value={selectedMeetingId}
                            onChange={(e) => setSelectedMeetingId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Mark Attendance</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {members.map(member => {
                                        const squadron = squadrons.find(s => s.id === member.squadronId);
                                        return (
                                            <label key={member.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={attendees.includes(member.id)}
                                                    onChange={() => toggleAttendee(member.id)}
                                                    className="mr-2"
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
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Mark Late Members</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {attendees.map(memberId => {
                                        const member = members.find(m => m.id === memberId);
                                        return (
                                            <label key={memberId} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={lateMembers.includes(memberId)}
                                                    onChange={() => toggleLateMember(memberId)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm">{member?.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleScoreMeeting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            >
                                Calculate & Save Scores
                            </button>
                        </>
                    )}
                </div>

                <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Meetings List</h3>
                    <div className="space-y-2">
                        {meetings.map(meeting => (
                            <div key={meeting.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-sm">
                                    {meeting.date} - {meeting.type}
                                    {meeting.finalized && ' (Finalized)'}
                                </span>
                                {!meeting.finalized && (
                                    <button
                                        onClick={() => handleFinalizeMeeting(meeting.id)}
                                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
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
            <section className="mb-12 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Squadrons</h2>

                <form onSubmit={handleCreateSquadron} className="mb-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newSquadronName}
                            onChange={(e) => setNewSquadronName(e.target.value)}
                            placeholder="Squadron name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Create Squadron
                        </button>
                    </div>
                </form>

                <div className="space-y-2">
                    {squadrons.map(squadron => (
                        <div key={squadron.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">{squadron.name}</span>
                            <button
                                onClick={() => handleDeleteSquadron(squadron.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Members */}
            <section className="mb-12 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Members</h2>

                <form onSubmit={handleCreateMember} className="mb-6">
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Member name"
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <select
                            value={newMemberSquadronId}
                            onChange={(e) => setNewMemberSquadronId(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
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
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Add Member
                        </button>
                    </div>
                </form>

                <div className="space-y-2">
                    {members.map(member => {
                        const squadron = squadrons.find(s => s.id === member.squadronId);
                        return (
                            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span>
                                    {member.name} - <span className="text-gray-600">{squadron?.name}</span>
                                </span>
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* System Reset */}
            <section className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-red-900 mb-4">Danger Zone</h2>
                <p className="text-red-700 mb-4">
                    This will delete ALL squadrons, members, meetings, and transactions.
                    This cannot be undone!
                </p>
                <button
                    onClick={handleResetSystem}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                >
                    Reset Entire System
                </button>
            </section>
        </div>
    );
}