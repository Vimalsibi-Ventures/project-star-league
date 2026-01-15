'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const [confirmText, setConfirmText] = useState('');

    // Existing Reset Handlers
    const handleReset = async (type) => {
        if (confirmText !== 'RESET STAR LEAGUE') {
            alert('Please type the confirmation phrase exactly.');
            return;
        }

        if (!confirm(`Are you absolutely sure you want to perform a ${type.toUpperCase()} RESET?`)) return;

        const res = await fetch('/api/admin/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        });

        if (res.ok) {
            alert('Reset Successful');
            window.location.href = '/admin/dashboard';
        }
    };

    // NEW: End Season Handler
    const handleEndSeason = async () => {
        if (!confirm("⚠️ FINAL WARNING ⚠️\n\nThis will:\n1. Archive current rankings to Hall of Fame\n2. Wipe all meetings and auctions\n3. Reset everyone to 100 Stars\n4. Start the next Season\n\nThis cannot be undone.")) return;

        const nextSeason = prompt("Enter Next Season Number (e.g. 2):");
        if (!nextSeason) return;

        try {
            const res = await fetch('/api/admin/season/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nextSeasonNumber: nextSeason })
            });

            if (res.ok) {
                alert("Season Concluded. Welcome to the new era.");
                router.push('/hall-of-fame'); // Redirect to show the result
            } else {
                alert("Error ending season.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to connect.");
        }
    };

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight">System Settings</h1>
                    <Link href="/admin/dashboard" className="text-gray-400 text-sm font-bold uppercase hover:text-white">← Back</Link>
                </div>

                <div className="space-y-8">
                    {/* Season Management Card */}
                    <div className="glass-card p-8 rounded-2xl border-l-4 border-l-[#fbbf24]">
                        <h2 className="text-xl font-bold text-white uppercase mb-4">Season Management</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Conclude the current competitive season. This archives the winners to the Hall of Fame and resets the arena for a fresh start.
                        </p>
                        <button
                            onClick={handleEndSeason}
                            className="w-full py-4 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all shadow-lg"
                        >
                            🏆 End Season & Archive Champions
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-10">
                        <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2">Danger Zone</h2>
                        <p className="text-gray-400 mb-8">Irreversible actions. Proceed with extreme caution.</p>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Confirmation Phrase</label>
                            <input
                                type="text"
                                placeholder="Type: RESET STAR LEAGUE"
                                className="w-full bg-black/40 border border-red-500/30 rounded px-4 py-3 text-red-500 placeholder:text-red-500/30 font-mono"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleReset('soft')}
                                className="p-6 border border-white/10 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors group"
                            >
                                <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] mb-2">Soft Reset (New Term)</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Clears all meetings, auctions, and transactions.
                                    <br />
                                    <strong className="text-white">Keeps Squadrons & Members.</strong>
                                    <br />
                                    Re-seeds wallets with 100★.
                                </p>
                            </button>

                            <button
                                onClick={() => handleReset('hard')}
                                className="p-6 border border-red-500/20 bg-red-500/10 rounded-xl text-left hover:bg-red-500/20 transition-colors"
                            >
                                <h3 className="text-lg font-bold text-red-500 mb-2">Hard Reset (Wipe)</h3>
                                <p className="text-xs text-red-400/70 leading-relaxed">
                                    Deletes EVERYTHING.
                                    <br />
                                    Squadrons, Members, History.
                                    <br />
                                    <strong className="text-red-400">System returns to Day 0.</strong>
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}