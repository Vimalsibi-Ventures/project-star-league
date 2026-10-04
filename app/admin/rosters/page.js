'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RostersPage() {
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [draggedMemberId, setDraggedMemberId] = useState(null);
    const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(false);

    // Creation State
    const [newSquadronName, setNewSquadronName] = useState('');
    const [newSquadronLogo, setNewSquadronLogo] = useState(null);
    const [newSquadronFaction, setNewSquadronFaction] = useState('unaligned');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberSquadronId, setNewMemberSquadronId] = useState('');

    const fetchData = async () => {
        try {
            const [sqRes, memRes, themeRes] = await Promise.all([
                fetch('/api/squadrons'),
                fetch('/api/members'),
                fetch('/api/admin/theme')
            ]);
            const sqData = await sqRes.json();
            const memData = await memRes.json();
            const themeData = await themeRes.json();
            
            setIsSeasonalThemeEnabled(themeData.isSeasonalThemeEnabled);
            setSquadrons(sqData.filter(s => s.isActive !== false));
            setMembers(memData.filter(m => m.isActive !== false));
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- CREATION HANDLERS ---
    const handleCreateSquadron = async (e) => { 
        e.preventDefault(); 
        setIsLoading(true);
        let logoUrl = null;
        if (newSquadronLogo) {
            const formData = new FormData();
            formData.append('file', newSquadronLogo);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (uploadData.success) logoUrl = uploadData.url;
            else {
                alert('Upload failed: ' + uploadData.error);
                setIsLoading(false);
                return;
            }
        }

        await fetch('/api/squadrons', { method: 'POST', body: JSON.stringify({ name: newSquadronName, logoUrl, faction: newSquadronFaction }) }); 
        setNewSquadronName('');
        setNewSquadronLogo(null);
        setNewSquadronFaction('unaligned');
        await fetchData(); 
        setIsLoading(false);
    };

    const handleCreateMember = async (e) => { 
        e.preventDefault(); 
        setIsLoading(true);
        await fetch('/api/members', { method: 'POST', body: JSON.stringify({ name: newMemberName, squadronId: newMemberSquadronId }) }); 
        setNewMemberName(''); 
        await fetchData(); 
        setIsLoading(false);
    };

    // --- EDIT HANDLERS ---
    const handleEditSquadronName = async (id, currentName) => {
        const newName = prompt("Enter new squadron name:", currentName);
        if (!newName || newName === currentName) return;
        await fetch('/api/squadrons', { method: 'PUT', body: JSON.stringify({ id, name: newName }) });
        fetchData();
    };

    const handleEditSquadronFaction = async (id, faction) => {
        await fetch('/api/squadrons', { method: 'PUT', body: JSON.stringify({ id, faction }) });
        fetchData();
    };

    const handleEditSquadronLogo = async (id, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
            await fetch('/api/squadrons', { method: 'PUT', body: JSON.stringify({ id, logoUrl: uploadData.url }) });
            fetchData();
        } else {
            alert('Logo upload failed: ' + uploadData.error);
        }
    };

    const handleEditMemberName = async (memberId, currentName) => {
        const newName = prompt("Enter new agent name:", currentName);
        if (!newName || newName === currentName) return;
        await fetch('/api/members', { method: 'PUT', body: JSON.stringify({ memberId, name: newName }) });
        fetchData();
    };

    // --- DRAG AND DROP HANDLERS ---
    const handleDragStart = (e, memberId) => {
        setDraggedMemberId(memberId);
        e.dataTransfer.setData('memberId', memberId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetSquadronId) => {
        e.preventDefault();
        const memberId = e.dataTransfer.getData('memberId');
        
        if (!memberId) return;

        // Optimistic UI Update
        setMembers(prev => prev.map(m => 
            m.id === memberId ? { ...m, squadronId: targetSquadronId } : m
        ));
        setDraggedMemberId(null);

        // API Update
        try {
            const res = await fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, targetSquadronId })
            });

            if (!res.ok) {
                fetchData();
                alert('Failed to update roster.');
            }
        } catch (error) {
            console.error(error);
            fetchData();
        }
    };

    // Unassigned members logic
    const unassignedMembers = members.filter(m => !m.squadronId || !squadrons.find(s => s.id === m.squadronId));

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                            <span className="text-[#fbbf24]">📋</span> Roster Management
                        </h1>
                        <p className="text-gray-400 text-sm uppercase mt-1">Manage Squadrons, Agents, and Roster Assignments</p>
                    </div>
                    <Link href="/admin/dashboard" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20 transition-colors">
                        ← Back to Command
                    </Link>
                </div>

                {/* CREATION PANELS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-[#fbbf24]">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Create Squadron</h2>
                        <form onSubmit={handleCreateSquadron} className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={newSquadronName} onChange={(e) => setNewSquadronName(e.target.value)} placeholder="Squadron Name" className="flex-1 bg-black/40 border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#fbbf24]" required />
                            <input type="file" accept="image/*" onChange={(e) => setNewSquadronLogo(e.target.files[0])} className="w-full sm:w-48 text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors" />
                            {isSeasonalThemeEnabled && (
                                <select value={newSquadronFaction} onChange={(e) => setNewSquadronFaction(e.target.value)} className="bg-black/40 border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#fbbf24]">
                                    <option value="unaligned">Unaligned</option>
                                    <option value="pirate">Pirate</option>
                                    <option value="marine">Marine</option>
                                </select>
                            )}
                            <button type="submit" disabled={isLoading} className="bg-white/10 text-white font-bold px-6 py-2 rounded uppercase text-sm border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50">Add</button>
                        </form>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-[#fbbf24]">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Add Agent</h2>
                        <form onSubmit={handleCreateMember} className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Agent Name" className="flex-1 bg-black/40 border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#fbbf24]" required />
                            <select value={newMemberSquadronId} onChange={(e) => setNewMemberSquadronId(e.target.value)} className="bg-black/40 border-white/10 rounded px-3 py-2 text-white sm:w-40 focus:outline-none focus:border-[#fbbf24]">
                                <option value="">Unassigned</option>
                                {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="submit" disabled={isLoading} className="bg-white/10 text-white font-bold px-6 py-2 rounded uppercase text-sm border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50">Add</button>
                        </form>
                    </div>
                </div>

                {/* ROSTERS (DND) */}
                <div className="flex gap-8 overflow-x-auto pb-4">
                    {/* Unassigned Pool */}
                    <div 
                        className="glass-card rounded-2xl p-6 min-w-[300px] border-t-4 border-t-gray-500 flex flex-col"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, null)}
                    >
                        <h2 className="text-xl font-bold text-white mb-4 uppercase">Unassigned Pool</h2>
                        <div className="flex-1 flex flex-col gap-3 min-h-[200px] bg-black/20 p-3 rounded-lg border border-white/5">
                            {unassignedMembers.map(m => (
                                <div 
                                    key={m.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, m.id)}
                                    className={`bg-white/10 p-3 rounded cursor-move hover:bg-white/20 transition-colors border border-white/10 text-white font-semibold flex justify-between items-center group ${draggedMemberId === m.id ? 'opacity-50' : ''}`}
                                >
                                    <span>{m.name}</span>
                                    <button onClick={() => handleEditMemberName(m.id, m.name)} className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" title="Edit Name">✎</button>
                                </div>
                            ))}
                            {unassignedMembers.length === 0 && (
                                <div className="text-gray-500 text-sm italic text-center mt-4">No unassigned members</div>
                            )}
                        </div>
                    </div>

                    {/* Squadrons */}
                    {squadrons.map(sq => (
                        <div 
                            key={sq.id}
                            className="glass-card rounded-2xl p-6 min-w-[300px] border-t-4 border-t-[#fbbf24] flex flex-col"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, sq.id)}
                        >
                            <div className="flex items-center gap-3 mb-4 group">
                                <label className="cursor-pointer relative" title="Click to upload new logo">
                                    {sq.logoUrl ? <img src={sq.logoUrl} alt="" className="w-8 h-8 object-contain rounded-full bg-white/5 group-hover:ring-2 ring-[#fbbf24] transition-all" /> : <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] group-hover:ring-2 ring-[#fbbf24] transition-all">N/A</div>}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleEditSquadronLogo(sq.id, e.target.files[0])} />
                                </label>
                                <h2 
                                    className="text-xl font-bold text-white uppercase cursor-pointer hover:text-[#fbbf24] transition-colors flex-1"
                                    onClick={() => handleEditSquadronName(sq.id, sq.name)}
                                    title="Click to edit name"
                                >
                                    {sq.name}
                                </h2>
                                {isSeasonalThemeEnabled && (
                                    <select 
                                        value={sq.faction || 'unaligned'} 
                                        onChange={(e) => handleEditSquadronFaction(sq.id, e.target.value)}
                                        className="ml-2 bg-black/40 border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer"
                                        title="Change Faction"
                                    >
                                        <option value="unaligned">Unaligned</option>
                                        <option value="pirate">Pirate</option>
                                        <option value="marine">Marine</option>
                                    </select>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-3 min-h-[200px] bg-black/20 p-3 rounded-lg border border-white/5">
                                {members.filter(m => m.squadronId === sq.id).map(m => (
                                    <div 
                                        key={m.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, m.id)}
                                        className={`bg-white/10 p-3 rounded cursor-move hover:bg-white/20 transition-colors border border-[#fbbf24]/30 text-white font-semibold flex justify-between items-center group ${draggedMemberId === m.id ? 'opacity-50' : ''}`}
                                    >
                                        <span>{m.name}</span>
                                        <button onClick={() => handleEditMemberName(m.id, m.name)} className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#fbbf24]" title="Edit Name">✎</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
