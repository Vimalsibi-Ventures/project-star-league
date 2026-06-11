'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Standardized Toastmasters Roles for the dropdown
const ROLE_OPTIONS = [
    "Attendee", "Speaker", "Evaluator", "Toastmaster", "Table Topics Master",
    "General Evaluator", "Timer", "Ah-Counter", "Grammarian"
];

export default function ExpeditionsDashboard() {
    const [expeditions, setExpeditions] = useState([]);
    const [squadrons, setSquadrons] = useState([]);
    const [members, setMembers] = useState([]);

    // Form State: Dispatch
    const [clubName, setClubName] = useState('');
    const [roleName, setRoleName] = useState('');
    const [cost, setCost] = useState(0);
    const [selectedSquadronId, setSelectedSquadronId] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');

    // Form State: Debriefing
    const [selectedGroupKey, setSelectedGroupKey] = useState('');
    const [attendees, setAttendees] = useState([]);
    const [lateMembers, setLateMembers] = useState([]);
    const [roleStatuses, setRoleStatuses] = useState({}); // { expeditionId: 'completed' | 'no-show' }
    const [bestPerformers, setBestPerformers] = useState([]); // Array of expeditionIds
    const [ttParticipants, setTtParticipants] = useState([]); 
    const [bestTTSpeakerId, setBestTTSpeakerId] = useState(''); // Tracks Best TT Speaker

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [expRes, sqRes, memRes] = await Promise.all([
            fetch('/api/admin/expeditions'),
            fetch('/api/squadrons'),
            fetch('/api/members')
        ]);
        
        const expData = expRes.ok ? await expRes.json() : [];
        setExpeditions(Array.isArray(expData) ? expData : []);
        setSquadrons(await sqRes.json());
        setMembers(await memRes.json());
    };

    const handleDispatch = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/admin/expeditions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubName, roleName, cost, squadronId: selectedSquadronId, memberId: selectedMemberId })
        });

        if (response.ok) {
            alert('Expedition Dispatched!');
            setClubName('');
            setRoleName('');
            setCost(0);
            setSelectedSquadronId('');
            setSelectedMemberId('');
            fetchData();
        } else {
            alert('Failed to dispatch expedition.');
        }
    };

    // Group active expeditions by "ClubName - SquadronName"
    const activeExpeditions = expeditions.filter(e => e.status === 'assigned');
    const groupedExpeditions = {};
    activeExpeditions.forEach(exp => {
        const sq = squadrons.find(s => s.id === exp.squadronId);
        const sqName = sq ? sq.name : 'Unknown Squadron';
        const key = `${exp.clubName} - ${sqName}`;
        
        if (!groupedExpeditions[key]) {
            groupedExpeditions[key] = {
                clubName: exp.clubName,
                squadronId: exp.squadronId,
                squadronName: sqName,
                expeditions: []
            };
        }
        groupedExpeditions[key].expeditions.push(exp);
    });

    // Handle 1-Hour Undo Feature
    const finalizedExpeditions = expeditions.filter(e => {
        if (e.status !== 'finalized' || !e.finalizedAt) return false;
        const finalizedTime = new Date(e.finalizedAt).getTime();
        const now = new Date().getTime();
        return (now - finalizedTime) <= 60 * 60 * 1000; // 1 hour window
    });

    // Group the undoable expeditions by their exact finalized timestamp batch
    const undoGroups = finalizedExpeditions.reduce((acc, exp) => {
        const sq = squadrons.find(s => s.id === exp.squadronId);
        const key = `${exp.clubName} - ${sq?.name || 'Unknown'} (${new Date(exp.finalizedAt).toLocaleTimeString()})`;
        if (!acc[key]) acc[key] = { ids: [], label: key };
        acc[key].ids.push(exp.id);
        return acc;
    }, {});

    const handleUndo = async (expeditionIds) => {
        if (!confirm('Are you sure you want to undo this debrief? All stars and attendance records for this expedition will be revoked.')) return;
        
        const res = await fetch('/api/admin/expeditions/undo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expeditionIds })
        });
        
        if (res.ok) {
            alert('Debriefing reversed successfully. The expedition is back in the active queue.');
            fetchData();
        } else {
            alert('Failed to undo debriefing.');
        }
    };

    const handleFinalize = async () => {
        if (!selectedGroupKey) return alert('Select an expedition group to debrief.');
        
        const activeGroup = groupedExpeditions[selectedGroupKey];
        if (!activeGroup) return;

        const sqMembers = members.filter(m => m.squadronId === activeGroup.squadronId);

        // Map role status updates from state
        const roleUpdates = activeGroup.expeditions.map(exp => ({
            memberId: exp.memberId,
            roleName: exp.roleName,
            status: roleStatuses[exp.id] || 'completed',
            isBestPerformer: bestPerformers.includes(exp.id)
        }));

        const payload = {
            expeditionIds: activeGroup.expeditions.map(e => e.id),
            clubName: activeGroup.clubName,
            squadronId: activeGroup.squadronId,
            totalMembersCount: sqMembers.length,
            roleUpdates,
            bestTTSpeakerId,
            attendanceData: { attended: attendees, late: lateMembers },
            ttData: {
                participants: ttParticipants.map((memberId, index) => ({
                    memberId,
                    squadronId: activeGroup.squadronId,
                    orderIndex: index,
                    isGuest: false
                }))
            }
        };

        const res = await fetch('/api/admin/expeditions/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Debriefing Complete. Stars Awarded!');
            setSelectedGroupKey('');
            setAttendees([]);
            setLateMembers([]);
            setRoleStatuses({});
            setBestPerformers([]);
            setTtParticipants([]);
            setBestTTSpeakerId('');
            fetchData();
        } else {
            alert('Failed to finalize expedition.');
        }
    };

    // Toggle Helpers
    const toggleAttendee = (id) => setAttendees(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleLateMember = (id) => setLateMembers(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleBestPerformer = (expId) => setBestPerformers(p => p.includes(expId) ? p.filter(x => x !== expId) : [...p, expId]);
    
    // Custom TT Participant Toggle with safety clear for Best TT
    const toggleTTParticipant = (id) => {
        setTtParticipants(p => {
            if (p.includes(id)) {
                if (bestTTSpeakerId === id) setBestTTSpeakerId(''); // Clear winner if they are deselected
                return p.filter(x => x !== id);
            } else {
                return [...p, id];
            }
        });
    };

    // UI Helpers
    const activeGroup = groupedExpeditions[selectedGroupKey];
    const debriefMembers = activeGroup ? members.filter(m => m.squadronId === activeGroup.squadronId) : [];
    const availableMembersForDispatch = members.filter(m => m.squadronId === selectedSquadronId);

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                            <span className="text-[#fbbf24]">🌍</span> Expeditions
                        </h1>
                        <p className="text-gray-400 text-sm uppercase mt-1">External Operations & Diplomacy</p>
                    </div>
                    <Link href="/admin/dashboard" className="px-6 py-2 bg-white/10 text-white font-bold uppercase rounded-md hover:bg-white/20">
                        ← Back to Command
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* DISPATCH BOARD */}
                    <div className="glass-card rounded-2xl p-8 border-t-4 border-t-[#fbbf24]">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Dispatch Board (Assign)</h2>
                        <form onSubmit={handleDispatch} className="space-y-4">
                            
                            <select value={selectedSquadronId} onChange={(e) => { setSelectedSquadronId(e.target.value); setSelectedMemberId(''); }} className="w-full bg-black/40 border-white/10 rounded px-4 py-2 text-white" required>
                                <option value="">1. Select Squadron...</option>
                                {squadrons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

                            <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full bg-black/40 border-white/10 rounded px-4 py-2 text-white" disabled={!selectedSquadronId} required>
                                <option value="">2. Select Member to Dispatch...</option>
                                {availableMembersForDispatch.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Target Club (e.g., Sophrosyne VIT)" className="bg-black/40 border-white/10 rounded px-4 py-2 text-white" required />
                                <select value={roleName} onChange={(e) => setRoleName(e.target.value)} className="bg-black/40 border-white/10 rounded px-4 py-2 text-white" required>
                                    <option value="">Select Role...</option>
                                    {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>
                            
                            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Star Cost (Default: 0)" className="w-full bg-black/40 border-white/10 rounded px-4 py-2 text-white" min="0" required />
                            
                            <button type="submit" className="w-full bg-[#fbbf24] text-black font-bold py-3 rounded uppercase hover:bg-[#f59e0b] transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                                Authorize Dispatch
                            </button>
                        </form>
                    </div>

                    {/* ACTIVE MISSIONS LIST */}
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Active Deployments</h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {activeExpeditions.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No active expeditions.</p>
                            ) : (
                                activeExpeditions.map(exp => {
                                    const sq = squadrons.find(s => s.id === exp.squadronId);
                                    const mem = members.find(m => m.id === exp.memberId);
                                    return (
                                        <div key={exp.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-[#fbbf24] font-bold text-sm uppercase">{exp.clubName}</h3>
                                                <span className="text-xs font-mono bg-black/50 px-2 py-1 rounded text-gray-300 border border-white/5">
                                                    Cost: {exp.cost}★
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-1">Role: <span className="text-white font-bold">{exp.roleName}</span></p>
                                            <p className="text-xs text-gray-400 mb-2">Agent: <span className="text-white">{mem ? mem.name : 'Unknown'}</span></p>
                                            <div className="text-[10px] font-bold text-white bg-white/10 inline-block px-2 py-1 rounded uppercase">
                                                Squadron: {sq ? sq.name : 'Unknown'}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* THE DEBRIEFING ROOM */}
                <div className="glass-card rounded-2xl p-8 border-l-4 border-l-[#fbbf24]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#fbbf24] rounded-full animate-pulse"></span>
                            Debriefing Room (Finalize)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <select 
                                value={selectedGroupKey} 
                                onChange={(e) => {
                                    setSelectedGroupKey(e.target.value);
                                    setAttendees([]); setLateMembers([]); setRoleStatuses({}); 
                                    setBestPerformers([]); setTtParticipants([]); setBestTTSpeakerId('');
                                }} 
                                className="w-full bg-black/40 border-white/10 rounded px-4 py-3 text-white mb-4 focus:outline-none focus:border-[#fbbf24]"
                            >
                                <option value="">Select Active Expedition...</option>
                                {Object.keys(groupedExpeditions).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                            
                            {activeGroup && (
                                <div className="space-y-4">
                                    {activeGroup.expeditions.map(exp => {
                                        const agent = members.find(m => m.id === exp.memberId);
                                        return (
                                            <div key={exp.id} className="p-4 bg-black/30 border border-[#fbbf24]/20 rounded-lg">
                                                <h3 className="text-[#fbbf24] font-bold text-sm uppercase mb-2">Agent Status</h3>
                                                <p className="text-sm font-bold text-white mb-1">{agent?.name || 'Unknown Agent'}</p>
                                                <p className="text-xs text-gray-400 mb-3">Assigned: <span className="text-white font-bold">{exp.roleName}</span></p>
                                                
                                                <select 
                                                    value={roleStatuses[exp.id] || 'completed'} 
                                                    onChange={(e) => setRoleStatuses({...roleStatuses, [exp.id]: e.target.value})} 
                                                    className="w-full bg-black/40 border-white/10 rounded px-2 py-2 text-white text-sm mb-4"
                                                >
                                                    <option value="completed">Role Completed Successfully</option>
                                                    <option value="no-show">No-Show / Failed</option>
                                                </select>

                                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded border border-white/10 hover:border-[#fbbf24]/50 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={bestPerformers.includes(exp.id)} 
                                                        onChange={() => toggleBestPerformer(exp.id)} 
                                                        className="accent-[#fbbf24] w-4 h-4" 
                                                    />
                                                    <span className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider">🌟 Best Performer</span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* RECENT DEBRIEFS (UNDO FEATURE) */}
                            {Object.keys(undoGroups).length > 0 && (
                                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        Recent Debriefs (Undo)
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(undoGroups).map(([label, group]) => (
                                            <div key={label} className="flex justify-between items-center bg-black/30 p-2 rounded">
                                                <span className="text-[10px] text-gray-300 truncate pr-2" title={label}>{label}</span>
                                                <button 
                                                    onClick={() => handleUndo(group.ids)}
                                                    className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500 hover:text-black transition-colors"
                                                >
                                                    UNDO
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-gray-500 uppercase mt-2 text-center">Window closes 1 hour after finalization</p>
                                </div>
                            )}
                        </div>

                        {activeGroup && (
                            <div className="col-span-2 space-y-6">
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-bold text-white uppercase mb-3 border-b border-white/10 pb-2">1. Squad Attendance Support</h3>
                                    <div className="space-y-2">
                                        {debriefMembers.map(m => {
                                            const isAgent = activeGroup.expeditions.some(e => e.memberId === m.id);
                                            return (
                                                <div key={m.id} className="flex justify-between items-center bg-black/20 p-2 rounded">
                                                    <span className="text-sm text-gray-200">
                                                        {m.name} {isAgent && <span className="text-[#fbbf24] text-[10px] ml-2 uppercase">(Agent)</span>}
                                                    </span>
                                                    <div className="flex gap-4 items-center">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="checkbox" checked={attendees.includes(m.id)} onChange={() => toggleAttendee(m.id)} className="accent-[#fbbf24]" />
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Present</span>
                                                        </label>
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="checkbox" checked={lateMembers.includes(m.id)} onChange={() => toggleLateMember(m.id)} className="accent-red-500" />
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Late</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col">
                                    <h3 className="text-sm font-bold text-white uppercase mb-3 border-b border-white/10 pb-2">2. External Table Topics / Activity</h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {debriefMembers.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => toggleTTParticipant(m.id)}
                                                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${ttParticipants.includes(m.id) ? 'bg-[#fbbf24] text-black' : 'bg-black/40 text-gray-400 border border-white/10 hover:border-[#fbbf24]/50'}`}
                                            >
                                                {m.name} {ttParticipants.includes(m.id) && `#${ttParticipants.indexOf(m.id) + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase mb-4">Select in the order they spoke to properly award Leader/Synergy points.</p>

                                    {/* Best TT Dropdown */}
                                    {ttParticipants.length > 0 && (
                                        <div className="mt-auto pt-4 border-t border-white/10">
                                            <label className="text-xs font-bold text-[#fbbf24] uppercase mb-2 block flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
                                                Award Best Table Topics
                                            </label>
                                            <select 
                                                value={bestTTSpeakerId} 
                                                onChange={(e) => setBestTTSpeakerId(e.target.value)} 
                                                className="w-full bg-black/40 border-white/10 rounded px-3 py-2 text-white text-sm"
                                            >
                                                <option value="">None / Did Not Win</option>
                                                {ttParticipants.map(participantId => {
                                                    const participant = members.find(m => m.id === participantId);
                                                    return (
                                                        <option key={participantId} value={participantId}>
                                                            🌟 Best TT: {participant?.name || 'Unknown'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleFinalize} className="w-full bg-green-500 text-black font-black py-3 rounded uppercase hover:bg-green-400 shadow-lg transition-transform active:scale-95">
                                    Finalize Debrief & Award Stars
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}