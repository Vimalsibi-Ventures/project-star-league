'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAuctionPage() {
    const [meetings, setMeetings] = useState([]);
    const [squadrons, setSquadrons] = useState([]);

    const [selectedMeetingId, setSelectedMeetingId] = useState('');
    const [auctionStatus, setAuctionStatus] = useState('new'); // new, draft, finalized
    const [items, setItems] = useState([
        { id: '1', title: 'Speaker Slot #1', winningSquadronId: '', starsSpent: 0 },
        { id: '2', title: 'Speaker Slot #2', winningSquadronId: '', starsSpent: 0 },
        { id: '3', title: 'Evaluator Choice', winningSquadronId: '', starsSpent: 0 }
    ]);

    useEffect(() => {
        Promise.all([
            fetch('/api/meetings').then(res => res.json()),
            fetch('/api/squadrons').then(res => res.json())
        ]).then(([mRes, sRes]) => {
            // Only show upcoming meetings (draft or finalized)
            setMeetings(mRes.sort((a, b) => new Date(a.date) - new Date(b.date)));
            setSquadrons(sRes);
        });
    }, []);

    const handleSaveDraft = async () => {
        if (!selectedMeetingId) return alert('Select a meeting');

        const res = await fetch('/api/auctions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: selectedMeetingId, items })
        });
        if (res.ok) alert('Draft Saved');
    };

    const handleFinalize = async () => {
        if (!confirm('This will DEDUCT stars from squadrons. Cannot be undone. Proceed?')) return;

        const res = await fetch('/api/auctions/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: selectedMeetingId })
        });

        if (res.ok) {
            alert('Auction Finalized & Transactions Logged!');
            setAuctionStatus('finalized');
        } else {
            const err = await res.json();
            alert('Validation Error: ' + err.error);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), title: '', winningSquadronId: '', starsSpent: 0 }]);
    };

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Auction House</h1>
                        <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Resource Allocation</p>
                    </div>
                    <Link href="/admin/dashboard" className="text-gray-400 hover:text-white text-sm font-bold uppercase">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <div className="mb-8">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Select Meeting</label>
                        <select
                            value={selectedMeetingId}
                            onChange={(e) => setSelectedMeetingId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white"
                        >
                            <option value="">-- Choose Upcoming Session --</option>
                            {meetings.map(m => (
                                <option key={m.id} value={m.id}>{m.date} ({m.type}) - {m.status}</option>
                            ))}
                        </select>
                    </div>

                    {selectedMeetingId && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#fbbf24] uppercase">Auction Items</h2>
                                {auctionStatus !== 'finalized' && (
                                    <button onClick={addItem} className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded hover:bg-white/20">
                                        + Add Item
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="p-4 bg-white/5 rounded border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateItem(idx, 'title', e.target.value)}
                                            placeholder="Item Name (e.g. Slot 1)"
                                            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                                            disabled={auctionStatus === 'finalized'}
                                        />

                                        <select
                                            value={item.winningSquadronId}
                                            onChange={(e) => updateItem(idx, 'winningSquadronId', e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white w-full md:w-48"
                                            disabled={auctionStatus === 'finalized'}
                                        >
                                            <option value="">-- No Winner --</option>
                                            {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[#fbbf24] font-bold">COST:</span>
                                            <input
                                                type="number"
                                                value={item.starsSpent}
                                                onChange={(e) => updateItem(idx, 'starsSpent', e.target.value)}
                                                className="w-20 bg-black/40 border border-white/10 rounded px-2 py-2 text-white text-right"
                                                disabled={auctionStatus === 'finalized'}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 border-t border-white/10 pt-6">
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={auctionStatus === 'finalized'}
                                    className="px-6 py-3 bg-white/10 text-white font-bold uppercase rounded hover:bg-white/20 disabled:opacity-50"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    disabled={auctionStatus === 'finalized'}
                                    className="flex-1 px-6 py-3 bg-[#fbbf24] text-black font-bold uppercase rounded shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:grayscale"
                                >
                                    {auctionStatus === 'finalized' ? 'Auction Closed' : 'Finalize & Deduct Stars'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}