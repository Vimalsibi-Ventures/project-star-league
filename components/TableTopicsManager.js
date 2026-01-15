'use client';

import { useState, useEffect } from 'react';

export default function TableTopicsManager({ members, initialData, onChange }) {
    const [participants, setParticipants] = useState(initialData || []);
    const [selectedMemberId, setSelectedMemberId] = useState('');

    // Propagate changes to parent
    useEffect(() => {
        onChange(participants);
    }, [participants, onChange]);

    const handleAddMember = () => {
        if (!selectedMemberId) return;
        const member = members.find(m => m.id === selectedMemberId);

        const newParticipant = {
            orderIndex: participants.length + 1,
            memberId: member.id,
            name: member.name,
            squadronId: member.squadronId,
            isGuest: false
        };

        setParticipants([...participants, newParticipant]);
        setSelectedMemberId('');
    };

    const handleAddGuest = () => {
        const guestName = prompt("Enter Guest Name (Optional):") || "Guest";

        const newParticipant = {
            orderIndex: participants.length + 1,
            memberId: null,
            name: `${guestName} (Guest)`,
            squadronId: null,
            isGuest: true
        };

        setParticipants([...participants, newParticipant]);
    };

    const handleRemove = (index) => {
        const newJson = participants.filter((_, i) => i !== index);
        // Re-index order
        const reIndexed = newJson.map((p, i) => ({ ...p, orderIndex: i + 1 }));
        setParticipants(reIndexed);
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newArr = [...participants];
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
        // Re-index
        const reIndexed = newArr.map((p, i) => ({ ...p, orderIndex: i + 1 }));
        setParticipants(reIndexed);
    };

    return (
        <div className="glass-card p-6 rounded-xl border border-white/10 mb-8">
            <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wide mb-4">
                Table Topics Participation (Temporal Order)
            </h3>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                    <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    >
                        <option value="">-- Select Member --</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddMember}
                        className="px-4 py-2 bg-white/10 text-white font-bold uppercase text-xs rounded hover:bg-white/20"
                    >
                        Add Member
                    </button>
                </div>
                <button
                    onClick={handleAddGuest}
                    className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase text-xs rounded hover:bg-indigo-500/30"
                >
                    Add Guest
                </button>
            </div>

            <div className="space-y-2">
                {participants.length === 0 && (
                    <div className="text-gray-500 text-xs italic text-center py-4">
                        No participants added yet.
                    </div>
                )}

                {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-mono text-xs font-bold w-6">#{p.orderIndex}</span>
                            <div>
                                <span className={`block font-bold text-sm ${p.isGuest ? 'text-indigo-300' : 'text-white'}`}>
                                    {p.name}
                                </span>
                                {!p.isGuest && (
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                        {members.find(m => m.id === p.memberId)?.squadronName || 'Unknown Squad'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30">↑</button>
                            <button onClick={() => handleRemove(idx)} className="p-1 text-red-400 hover:text-red-300 text-xs uppercase font-bold">✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}