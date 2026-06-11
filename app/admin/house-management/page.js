'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HouseManagement() {
    const [squadrons, setSquadrons] = useState([]);
    const [selectedSquadronId, setSelectedSquadronId] = useState('');
    const [starsDelta, setStarsDelta] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch squadrons on load
        fetch('/api/squadrons')
            .then(res => res.json())
            .then(data => setSquadrons(data))
            .catch(err => console.error("Failed to load squadrons", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSquadronId || !starsDelta || !reason) {
            return alert('Please fill in all fields.');
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/manual-adjustment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    squadronId: selectedSquadronId,
                    starsDelta: parseInt(starsDelta, 10),
                    reason: reason
                })
            });

            if (res.ok) {
                alert('Ledger updated successfully!');
                setSelectedSquadronId('');
                setStarsDelta('');
                setReason('');
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

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                            <span className="text-[#fbbf24]">🏛️</span> House Management
                        </h1>
                        <p className="text-gray-400 text-sm uppercase mt-1">Manual Ledger Adjustments</p>
                    </div>
                    <Link href="/admin/dashboard" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20 transition-colors">
                        ← Back to Command
                    </Link>
                </div>

                <div className="glass-card rounded-2xl p-8 border-t-4 border-t-[#fbbf24]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. SQUADRON SELECTION */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Squadron</label>
                            <select 
                                value={selectedSquadronId} 
                                onChange={(e) => setSelectedSquadronId(e.target.value)} 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors" 
                                required
                            >
                                <option value="">Select Squadron...</option>
                                {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
            </div>
        </div>
    );
}