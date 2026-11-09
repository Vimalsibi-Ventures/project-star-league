'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LeagueCurrency from '@/components/LeagueCurrency';

export default function HouseManagement() {
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [meetings, setMeetings] = useState([]);

    const [selectedSquadronId, setSelectedSquadronId] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [starsDelta, setStarsDelta] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Edit Transaction State
    const [editingTxId, setEditingTxId] = useState(null);
    const [editAgentValue, setEditAgentValue] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [filterSquadronId, setFilterSquadronId] = useState('all');

    const fetchData = async () => {
        try {
            const [sqRes, memRes, txRes, mtgRes] = await Promise.all([
                fetch('/api/squadrons'),
                fetch('/api/members'),
                fetch('/api/transactions'),
                fetch('/api/meetings')
            ]);
            const [sqData, memData, txData, mtgData] = await Promise.all([
                sqRes.json(),
                memRes.json(),
                txRes.json(),
                mtgRes.json()
            ]);
            setSquadrons(Array.isArray(sqData) ? sqData.filter(s => s.isActive !== false) : []);
            setMembers(Array.isArray(memData) ? memData.filter(m => m.isActive !== false) : []);
            setTransactions(
                Array.isArray(txData)
                    ? [...txData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    : []
            );
            setMeetings(Array.isArray(mtgData) ? mtgData : []);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter members belonging to the selected squadron
    const squadronMembers = members.filter(m => m.squadronId === selectedSquadronId);

    const handleSquadronChange = (e) => {
        setSelectedSquadronId(e.target.value);
        setSelectedMemberId(''); // Reset member selection when squadron changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSquadronId || !starsDelta || !reason) {
            return alert('Please fill in all required fields.');
        }

        const chosenMember = members.find(m => m.id === selectedMemberId);
        const agentPayload = chosenMember ? chosenMember.name : 'Squadron Level';

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/manual-adjustment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    squadronId: selectedSquadronId,
                    memberId: chosenMember ? chosenMember.id : null,
                    agent: agentPayload,
                    starsDelta: parseInt(starsDelta, 10),
                    reason: reason
                })
            });

            if (res.ok) {
                alert('Ledger updated successfully!');
                setSelectedSquadronId('');
                setSelectedMemberId('');
                setStarsDelta('');
                setReason('');
                await fetchData();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to update ledger'}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating the ledger.');
        } finally {
            setIsLoading(false);
        }
    };

    const resolveTxAgentName = (tx) => {
        const mem = members.find(
            m => m.id === tx.memberId || m.id === tx.agent || (tx.agent && m.name && m.name.toLowerCase() === tx.agent.toLowerCase())
        );
        if (mem) return mem.name;
        if (tx.agent) return tx.agent;
        return tx.memberId ? 'Unknown Agent' : 'Squadron Level';
    };

    const resolveTxMemberId = (tx) => {
        const mem = members.find(
            m => m.id === tx.memberId || m.id === tx.agent || (tx.agent && m.name && m.name.toLowerCase() === tx.agent.toLowerCase())
        );
        return mem ? mem.id : '';
    };

    const startEditingTx = (tx) => {
        setEditingTxId(tx.id);
        setEditAgentValue(resolveTxMemberId(tx));
    };

    const cancelEditingTx = () => {
        setEditingTxId(null);
        setEditAgentValue('');
    };

    const saveTransactionAgent = async (tx) => {
        setIsSavingEdit(true);
        try {
            const chosenMember = members.find(m => m.id === editAgentValue);
            const agentString = chosenMember ? chosenMember.name : 'Squadron Level';

            const res = await fetch('/api/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: tx.id,
                    memberId: chosenMember ? chosenMember.id : null,
                    agent: agentString
                })
            });

            if (res.ok) {
                setEditingTxId(null);
                setEditAgentValue('');
                await fetchData();
            } else {
                const err = await res.json();
                alert(`Failed to update transaction: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error updating transaction.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const visibleTransactions = filterSquadronId === 'all'
        ? transactions
        : transactions.filter(t => t.squadronId === filterSquadronId);

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                            <span className="text-[#fbbf24]">🏛️</span> House Management
                        </h1>
                        <p className="text-gray-400 text-sm uppercase mt-1">Manual Ledger Adjustments & Transaction Log</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/transactions" className="px-5 py-2 bg-white/5 border border-white/10 text-[#fbbf24] font-bold uppercase text-xs rounded-md hover:bg-white/10 transition-colors flex items-center">
                            Full Ledger View
                        </Link>
                        <Link href="/admin/dashboard" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20 transition-colors">
                            ← Back to Command
                        </Link>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-8 border-t-4 border-t-[#fbbf24] mb-12 max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Assign Stars</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. SQUADRON SELECTION */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Squadron</label>
                            <select 
                                value={selectedSquadronId} 
                                onChange={handleSquadronChange} 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors" 
                                required
                            >
                                <option value="">Select Squadron...</option>
                                {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* 1B. SPECIFIC MEMBER (OPTIONAL) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Specific Member (Optional)</label>
                            <select 
                                value={selectedMemberId} 
                                onChange={(e) => setSelectedMemberId(e.target.value)} 
                                disabled={!selectedSquadronId}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors disabled:opacity-50"
                            >
                                <option value="">Squadron Level (Default)</option>
                                {squadronMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. STAR AMOUNT (ALLOWS NEGATIVE) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Star Adjustment (Use - for penalties)</label>
                            <input 
                                type="number" 
                                value={starsDelta} 
                                onChange={(e) => setStarsDelta(e.target.value)} 
                                placeholder="e.g., 50 or -20" 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors" 
                                required 
                            />
                        </div>

                        {/* 3. CUSTOM REASON */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason / Description</label>
                            <input 
                                type="text" 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                placeholder="e.g., House Event Victory Bonus, Disciplinary Fine, etc." 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors" 
                                required 
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#fbbf24] text-black font-black py-4 rounded-lg uppercase tracking-wider hover:bg-[#f59e0b] transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Authorize Ledger Update'}
                        </button>
                    </form>
                </div>

                {/* ADMIN TRANSACTION LOG */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 bg-[#0a0c10]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide">Admin Transaction Log</h2>
                            <p className="text-xs text-gray-400 mt-1">Reassign transaction agents without altering Squadron star totals.</p>
                        </div>
                        <select
                            value={filterSquadronId}
                            onChange={(e) => setFilterSquadronId(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold uppercase text-white focus:outline-none focus:border-[#fbbf24]"
                        >
                            <option value="all">All Squadrons</option>
                            {squadrons.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#2a2f3a]">
                            <thead className="bg-[#0a0c10]/60">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Squadron</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#fbbf24] uppercase tracking-wider">Agent</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Impact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2f3a]">
                                {visibleTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-8 text-center text-gray-500">No transactions found</td>
                                    </tr>
                                ) : (
                                    visibleTransactions.map((tx, idx) => {
                                        const sq = squadrons.find(s => s.id === tx.squadronId);
                                        const sqMembers = members.filter(m => m.squadronId === tx.squadronId);
                                        const isEditing = editingTxId === tx.id;
                                        const agentDisplay = resolveTxAgentName(tx);

                                        return (
                                            <tr key={tx.id} className={`hover:bg-[#1f2430]/80 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#1a1e26]/30'}`}>
                                                <td className="px-6 py-4 text-sm text-[#f5f7fa] font-mono whitespace-nowrap">
                                                    {new Date(tx.timestamp).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase text-gray-300 whitespace-nowrap">
                                                    {sq ? sq.name : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded bg-[#1f2430]/80 border border-[#2a2f3a] text-xs font-bold uppercase text-[#b3b8c5]">
                                                        {tx.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-white">
                                                    {isEditing ? (
                                                        <select
                                                            value={editAgentValue}
                                                            onChange={(e) => setEditAgentValue(e.target.value)}
                                                            className="bg-black/60 border border-[#fbbf24] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                                                        >
                                                            <option value="">Squadron Level</option>
                                                            {sqMembers.map(m => (
                                                                <option key={m.id} value={m.id}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        agentDisplay
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 text-base font-bold whitespace-nowrap ${tx.starsDelta >= 0 ? 'text-[#f5c518]' : 'text-[#ef4444]'}`}>
                                                    {tx.starsDelta >= 0 ? '+' : ''}{tx.starsDelta}<LeagueCurrency />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#b3b8c5]">
                                                    {tx.description}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {isEditing ? (
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() => saveTransactionAgent(tx)}
                                                                disabled={isSavingEdit}
                                                                className="px-3 py-1 bg-[#fbbf24] text-black text-xs font-bold uppercase rounded hover:bg-[#f59e0b] disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEditingTx}
                                                                className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-bold uppercase rounded hover:bg-white/20"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditingTx(tx)}
                                                            className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 hover:text-[#fbbf24] hover:border-[#fbbf24]/50 text-xs font-bold uppercase rounded transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}