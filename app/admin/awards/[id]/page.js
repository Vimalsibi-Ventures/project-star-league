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
    const [attendance, setAttendance] = useState([]);
    const [selections, setSelections] = useState({});

    useEffect(() => {
        const loadData = async () => {
            const [mRes, memRes] = await Promise.all([
                fetch('/api/meetings').then(r => r.json()),
                fetch('/api/members').then(r => r.json())
            ]);
            const current = mRes.find(m => m.id === params.id);
            setMeeting(current);
            // SOURCE OF TRUTH: Finalized Role Assignments
            setAssignments(current?.roleAssignments || []);
            setMembers(memRes);

            if (current && current.scoringData) {
                const presentIds = [];
                Object.values(current.scoringData).forEach(sqData => {
                    if (sqData.attendedMemberIds) presentIds.push(...sqData.attendedMemberIds);
                });
                setAttendance(presentIds);
            }
        };
        loadData();
    }, [params.id]);

    const handleSelection = (awardId, value) => {
        setSelections(prev => ({ ...prev, [awardId]: value }));
    };

    // PATCH-3: Enhanced Display Labels & Strict Filtering
    const getCandidates = (filterType) => {
        // 1. Table Topics: Attendance + Guest (Special Case)
        if (filterType === 'tt_all') {
            const presentMembers = members
                .filter(m => attendance.includes(m.id))
                .map(m => ({ id: m.id, name: `${m.name} — Attendance`, isGuest: false }));
            // Always append Guest option for TT
            return [...presentMembers, { id: 'guest', name: 'Guest — External Speaker', isGuest: true }];
        }

        // 2. Standard Awards: Source ONLY from Finalized Assignments
        return assignments
            .filter(a => {
                // Must be completed to be eligible
                if (a.status !== 'completed') return false;

                const title = a.roleName.toLowerCase();

                // Explicit Filters
                if (filterType === 'speaker') return title.includes('speaker');
                // Exclude 'general evaluator' from Best Evaluator pool
                if (filterType === 'evaluator') return title.includes('evaluator') && !title.includes('general');
                // Best Role Player: Only TMOD and TTM
                if (filterType === 'role_player') return ['toastmaster', 'topics master'].some(t => title.includes(t));
                // Best TAG: Timer, Ah-Counter, Grammarian
                if (filterType === 'tag') return ['timer', 'ah-counter', 'grammarian'].some(t => title.includes(t));

                return false;
            })
            .map(a => {
                // Handle Guests (fulfilledExternally)
                if (a.fulfilledExternally) {
                    return { id: 'guest', name: `Guest — ${a.roleName}`, isGuest: true };
                }

                // Handle Members
                const mem = members.find(m => m.id === a.memberId);
                return {
                    id: a.memberId,
                    // PATCH-3 FORMAT: Name — Role
                    name: mem ? `${mem.name} — ${a.roleName}` : `Unknown — ${a.roleName}`,
                    isGuest: false
                };
            });
    };

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