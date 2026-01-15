'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AWARD_CATEGORIES = [
    { id: 'best_speaker', label: 'Best Speaker', filter: 'speaker' },
    { id: 'best_evaluator', label: 'Best Evaluator', filter: 'evaluator' },
    { id: 'best_tt', label: 'Best Table Topics Speaker', filter: 'tt_all' },
    { id: 'best_role', label: 'Best Role Player', filter: 'role_player' },
    { id: 'best_tag', label: 'Best TAG Player', filter: 'tag' }
];

export default function AwardsPage({ params }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [members, setMembers] = useState([]);
    // Removed attendance state dependency for TT
    const [selections, setSelections] = useState({});

    useEffect(() => {
        const loadData = async () => {
            const [mRes, memRes] = await Promise.all([
                fetch('/api/meetings').then(r => r.json()),
                fetch('/api/members').then(r => r.json())
            ]);
            const current = mRes.find(m => m.id === params.id);
            setMeeting(current);
            setAssignments(current?.roleAssignments || []);
            setMembers(memRes);
        };
        loadData();
    }, [params.id]);

    const handleSelection = (awardId, value) => {
        setSelections(prev => ({ ...prev, [awardId]: value }));
    };

    // PATCH-3.2.1: TT Source Update
    const getCandidates = (filterType) => {
        // 1. Table Topics: Source from meeting.tableTopics.participants (Strict)
        if (filterType === 'tt_all') {
            const ttParticipants = meeting?.tableTopics?.participants || [];

            return ttParticipants.map(p => {
                if (p.isGuest) {
                    return { id: 'guest', name: `${p.name} — External`, isGuest: true };
                }
                const mem = members.find(m => m.id === p.memberId);
                return {
                    id: p.memberId,
                    name: mem ? `${mem.name} — TT Speaker` : `${p.name} — TT Speaker`,
                    isGuest: false
                };
            });
        }

        // 2. Standard Awards (Unchanged)
        return assignments
            .filter(a => {
                if (a.status !== 'completed') return false;
                const title = a.roleName.toLowerCase();

                if (filterType === 'speaker') return title.includes('speaker');
                if (filterType === 'evaluator') return title.includes('evaluator') && !title.includes('general');
                if (filterType === 'role_player') return ['toastmaster', 'topics master'].some(t => title.includes(t));
                if (filterType === 'tag') return ['timer', 'ah-counter', 'grammarian'].some(t => title.includes(t));

                return false;
            })
            .map(a => {
                if (a.fulfilledExternally) {
                    return { id: 'guest', name: `Guest — ${a.roleName}`, isGuest: true };
                }
                const mem = members.find(m => m.id === a.memberId);
                return {
                    id: a.memberId,
                    name: mem ? `${mem.name} — ${a.roleName}` : `Unknown — ${a.roleName}`,
                    isGuest: false
                };
            });
    };

    // ... (Rest of file: isFormComplete, handleSubmit, JSX matches previous) ...
    // Copy/paste previous logic for submit/render, unchanged except for getCandidates
    const isFormComplete = () => {
        return AWARD_CATEGORIES.every(cat => selections[cat.id] && selections[cat.id] !== '');
    };

    const handleSubmit = async () => {
        if (!isFormComplete()) {
            alert('Please determine a result (Winner or "Not Awarded") for ALL categories.');
            return;
        }

        const payload = AWARD_CATEGORIES.map(cat => {
            const selectedId = selections[cat.id];
            if (selectedId === 'none') return null;

            if (selectedId === 'guest') {
                return { title: cat.label, memberId: null, squadronId: null, isGuest: true };
            }

            const member = members.find(m => m.id === selectedId);
            return {
                title: cat.label,
                memberId: member.id,
                squadronId: member.squadronId,
                isGuest: false
            };
        }).filter(Boolean);

        const res = await fetch('/api/meetings/awards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: params.id, awards: payload })
        });

        if (res.ok) router.push('/admin/dashboard');
        else alert('Error saving awards');
    };

    if (!meeting) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase">Awards Ceremony</h1>
                        <p className="text-[#fbbf24] text-sm uppercase tracking-widest mt-1">{meeting.date}</p>
                    </div>
                    <Link href="/admin/dashboard" className="text-gray-400 text-xs font-bold uppercase hover:text-white">Cancel</Link>
                </div>

                <div className="glass-card rounded-2xl p-8 mb-8">
                    <p className="text-sm text-gray-400 mb-6">
                        Select winners based on finalized roles. Guests receive recognition but no stars.
                        <br /><strong>All fields are required. Select "Not Awarded" if inapplicable.</strong>
                    </p>

                    <div className="space-y-6">
                        {AWARD_CATEGORIES.map(cat => {
                            const candidates = getCandidates(cat.filter);
                            return (
                                <div key={cat.id} className="flex flex-col gap-2">
                                    <label className="text-white font-bold uppercase text-sm">{cat.label}</label>
                                    <select
                                        className="bg-black/40 border border-white/10 rounded px-4 py-3 text-white"
                                        onChange={(e) => handleSelection(cat.id, e.target.value)}
                                        value={selections[cat.id] || ''}
                                    >
                                        <option value="">-- Select Result --</option>
                                        <option value="none">Not Awarded</option>
                                        <optgroup label="Candidates">
                                            {candidates.map((c, i) => (
                                                <option key={`${c.id}-${i}`} value={c.id}>
                                                    {c.name} {c.isGuest ? '(No Stars)' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!isFormComplete()}
                    className="w-full py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:opacity-50 disabled:grayscale transition-all"
                >
                    Confirm Awards & Calculate Synergy
                </button>
            </div>
        </div>
    );
}