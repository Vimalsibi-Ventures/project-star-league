'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateAuctionSlots } from '@/lib/roleTemplates';

export default function AdminAuctionPage() {
    const [meetings, setMeetings] = useState([]);
    const [squadrons, setSquadrons] = useState([]);

    const [selectedMeetingId, setSelectedMeetingId] = useState('');
    const [auctionStatus, setAuctionStatus] = useState('new'); // new, draft, finalized
    const [items, setItems] = useState([]);

    // Configuration Mode State
    const [speakerCount, setSpeakerCount] = useState(3);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        Promise.all([
            fetch('/api/meetings').then(res => res.json()),
            fetch('/api/squadrons').then(res => res.json()),
            fetch('/api/auctions').then(res => res.json())
        ]).then(([mRes, sRes, aRes]) => {
            setMeetings(mRes.sort((a, b) => new Date(a.date) - new Date(b.date)));
            setSquadrons(sRes);

            // If meeting selected, load its items
            if (selectedMeetingId) {
                const auction = aRes.find(a => a.meetingId === selectedMeetingId);
                if (auction) {
                    setItems(auction.items);
                    setAuctionStatus(auction.status);
                } else {
                    setItems([]);
                    setAuctionStatus('new');
                }
            }
        });
    };

    // Reload when selection changes
    useEffect(() => {
        if (selectedMeetingId) refreshData();
    }, [selectedMeetingId]);

    const handleGenerate = () => {
        if (!confirm('This will replace current draft items. Continue?')) return;
        const newSlots = generateAuctionSlots(speakerCount);
        // Map to item structure
        setItems(newSlots.map(slot => ({
            id: crypto.randomUUID(),
            title: slot.title,
            roleTemplateId: slot.roleTemplateId,
            slotLabel: slot.slotLabel,
            winningSquadronId: '',
            starsSpent: 0
        })));
    };

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
            refreshData();
        } else {
            const err = await res.json();
            alert('Validation Error: ' + err.error);
        }
    };

    const handleManualBuy = async (itemId, squadronId) => {
        if (!confirm(`Buy this role for 10 Stars for ${squadrons.find(s => s.id === squadronId)?.name}?`)) return;
        const res = await fetch('/api/auctions/acquire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: selectedMeetingId, auctionItemId: itemId, squadronId })
        });
        if (res.ok) {
            refreshData();
        } else {
            const err = await res.json();
            alert(err.error);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
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
                            <option value="">-- Choose Session --</option>
                            {meetings.map(m => (
                                <option key={m.id} value={m.id}>{m.date} ({m.type}) - {m.status}</option>
                            ))}
                        </select>
                    </div>

                    {selectedMeetingId && (
                        <div>
                            {/* GENERATOR / MARKET HEADER */}
                            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-[#fbbf24] uppercase">
                                        {auctionStatus === 'finalized' ? 'Post-Auction Market' : 'Auction Configuration'}
                                    </h2>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {auctionStatus === 'finalized'
                                            ? 'Unsold roles can be manually acquired for 10 Stars.'
                                            : 'Configure and generate slots based on meeting structure.'}
                                    </p>
                                </div>

                                {auctionStatus !== 'finalized' && (
                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                        <span className="text-xs text-gray-400 uppercase font-bold px-2">Speakers:</span>
                                        <input
                                            type="number"
                                            min="1" max="10"
                                            value={speakerCount}
                                            onChange={(e) => setSpeakerCount(e.target.value)}
                                            className="w-16 bg-black text-white px-2 py-1 rounded border border-white/20 text-center font-bold"
                                        />
                                        <button
                                            onClick={handleGenerate}
                                            className="px-4 py-1 bg-[#fbbf24] text-black text-xs font-bold uppercase rounded hover:bg-[#f59e0b]"
                                        >
                                            Auto-Generate
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ITEM LIST */}
                            <div className="space-y-4 mb-8">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="p-4 bg-white/5 rounded border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                                        {/* READ ONLY TITLE */}
                                        <div className="flex-1">
                                            <div className="text-white font-bold">{item.title}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.slotLabel || 'Standard Slot'}</div>
                                        </div>

                                        {/* STATUS / ASSIGNMENT */}
                                        {auctionStatus === 'finalized' ? (
                                            <div className="flex items-center gap-4">
                                                {item.winningSquadronId ? (
                                                    <div className="px-4 py-2 bg-black/40 rounded border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-bold uppercase">
                                                        Sold: {squadrons.find(s => s.id === item.winningSquadronId)?.name}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                            onChange={(e) => {
                                                                if (e.target.value) handleManualBuy(item.id, e.target.value);
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="">-- Buy (10★) --</option>
                                                            {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // DRAFT MODE INPUTS
                                            <>
                                                <select
                                                    value={item.winningSquadronId}
                                                    onChange={(e) => updateItem(idx, 'winningSquadronId', e.target.value)}
                                                    className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white w-full md:w-48"
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
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER ACTIONS */}
                            {auctionStatus !== 'finalized' && (
                                <div className="flex gap-4 border-t border-white/10 pt-6">
                                    <button
                                        onClick={handleSaveDraft}
                                        className="px-6 py-3 bg-white/10 text-white font-bold uppercase rounded hover:bg-white/20"
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        onClick={handleFinalize}
                                        className="flex-1 px-6 py-3 bg-[#fbbf24] text-black font-bold uppercase rounded shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-[1.02] transition-transform"
                                    >
                                        Finalize & Deduct Stars
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}