'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const [confirmText, setConfirmText] = useState('');
    const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(false);
    const [currentSeasonIsland, setCurrentSeasonIsland] = useState(1);
    const [meetingsCompleted, setMeetingsCompleted] = useState(0);

    useEffect(() => {
        fetch('/api/admin/theme')
            .then(res => res.json())
            .then(data => {
                setIsSeasonalThemeEnabled(data.isSeasonalThemeEnabled);
                setCurrentSeasonIsland(data.currentSeasonIsland || 1);
                setMeetingsCompleted(data.meetingsCompleted ?? 0);
            });
    }, []);

    const toggleTheme = async () => {
        const newValue = !isSeasonalThemeEnabled;
        setIsSeasonalThemeEnabled(newValue);
        await fetch('/api/admin/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isSeasonalThemeEnabled: newValue })
        });
    };

    const updateIsland = async (e) => {
        const val = parseInt(e.target.value, 10);
        setCurrentSeasonIsland(val);
        await fetch('/api/admin/island', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentSeasonIsland: val })
        });
    };

    const updateMeetingsCompleted = async (e) => {
        const raw = e.target.value;
        const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
        setMeetingsCompleted(val);
        await fetch('/api/admin/island', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingsCompleted: val })
        });
    };

    const handleLockTitles = async () => {
        if (!confirm("⚠️ PERMANENT ACTION ⚠️\n\nThis will:\n1. Permanently lock Yonko / Admiral / Vice Admiral titles to the current top 4 Pirates and top 4 Marines\n2. Award +100 Stars to each of those members (and their squadrons)\n\nThis cannot be undone. Continue?")) return;

        try {
            const res = await fetch('/api/admin/lock-titles', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert(`Titles locked. ${data.bountiesAwarded} bounties disbursed.`);
            } else {
                alert(`Error: ${data.error || 'Failed to lock titles'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to connect.');
        }
    };

    // PATCH: The True Logout Handler
    const handleLogout = async () => {
        // Destroy the session cookie
        await fetch('/api/logout', { method: 'POST' });
        // Hard redirect to the public arena
        window.location.href = '/';
    };

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
                router.push('/hall-of-fame'); 
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
                    <div className="flex gap-4">
                        <Link href="/admin/dashboard" className="text-gray-400 text-sm font-bold uppercase hover:text-white px-4 py-2">
                            ← Dashboard
                        </Link>
                        {/* PATCH: Changed from Link to a Logout Button */}
                        <button 
                            onClick={handleLogout} 
                            className="text-[#fbbf24] text-sm font-bold uppercase hover:text-yellow-400 px-4 py-2 border border-[#fbbf24]/30 rounded bg-[#fbbf24]/10 transition-colors"
                        >
                            Logout & Exit
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* UI Config Card */}
                    <div className="glass-card p-8 rounded-2xl border-l-4 border-l-blue-500 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase mb-1">Seasonal Theme UI</h2>
                            <p className="text-gray-400 text-sm">
                                Enable the global season-specific override for the Rulebook and UI.
                            </p>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isSeasonalThemeEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isSeasonalThemeEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Seasonal Island Progress */}
                    {isSeasonalThemeEnabled && (
                        <div className="glass-card p-8 rounded-2xl border-l-4 border-l-[#fbbf24] space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase mb-1">Grand Line Progress</h2>
                                <p className="text-gray-400 text-sm mb-4">Set the current active island for the season tracker.</p>
                                <select 
                                    value={currentSeasonIsland} 
                                    onChange={updateIsland}
                                    className="w-full bg-black/40 border border-[#fbbf24]/30 rounded px-4 py-3 text-white font-bold"
                                >
                                    <option value={1}>Island 1: Alabasta</option>
                                    <option value={2}>Island 2: Skypiea</option>
                                    <option value={3}>Island 3: Water 7</option>
                                    <option value={4}>Island 4: Thriller Bark</option>
                                    <option value={5}>Island 5: Paramount War</option>
                                </select>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <label className="text-sm font-bold text-white uppercase block mb-1">
                                    Season Meetings Completed
                                </label>
                                <p className="text-gray-400 text-xs mb-3">
                                    Track the number of completed meetings toward the 10-meeting Marineford showdown.
                                </p>
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={meetingsCompleted}
                                    onChange={updateMeetingsCompleted}
                                    className="w-full bg-black/40 border border-[#fbbf24]/30 rounded px-4 py-3 text-white font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {/* Title Locking (Seasonal only) */}
                    {isSeasonalThemeEnabled && (
                        <div className="glass-card p-8 rounded-2xl border-l-4 border-l-red-600">
                            <h2 className="text-xl font-bold text-white uppercase mb-2">Faction Titles</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                After Meeting 6, permanently lock the top 4 Pirates as Yonko and the top 4 Marines as Admiral / Vice Admirals, and award each +100 Stars.
                            </p>
                            <button
                                onClick={handleLockTitles}
                                className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-all shadow-lg"
                            >
                                Lock Faction Titles & Disburse Bounties (Post-Meet 6)
                            </button>
                        </div>
                    )}

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
