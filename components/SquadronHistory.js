'use client';

import { useState } from 'react';

export default function SquadronHistory({ transactions, meetings }) {
    const [filter, setFilter] = useState('all');

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'auction') return t.category === 'auction';
        if (filter === 'roles') return ['role', 'speech'].includes(t.category);
        if (filter === 'attendance') return ['attendance', 'penalty'].includes(t.category);
        return true;
    });

    return (
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 bg-[#0a0c10]/60 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">Transaction History</h2>
                <div className="flex bg-black/40 rounded-lg p-1">
                    {['all', 'attendance', 'roles', 'auction'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${filter === f ? 'bg-[#fbbf24] text-black' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2a2f3a]">
                    <thead className="bg-[#0a0c10]/60">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Impact</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2f3a]">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-8 text-center text-gray-500">No records found</td>
                            </tr>
                        ) : (
                            filteredTransactions.map((transaction, index) => {
                                const meeting = meetings.find(m => m.id === transaction.meetingId);
                                return (
                                    <tr key={transaction.id} className={`hover:bg-[#1f2430]/80 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#1a1e26]/30'
                                        }`}>
                                        <td className="px-8 py-5 text-sm text-[#f5f7fa] font-mono">
                                            {new Date(transaction.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-[#b3b8c5]">
                                            {meeting ? `Meeting ${meeting.date}` : 'System'}
                                        </td>
                                        <td className="px-8 py-5 text-sm">
                                            <span className="px-2 py-1 rounded bg-[#1f2430]/80 border border-[#2a2f3a] text-xs font-bold uppercase text-[#b3b8c5]">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 text-base font-bold ${transaction.starsDelta >= 0 ? 'text-[#f5c518]' : 'text-[#ef4444]'}`}>
                                            {transaction.starsDelta >= 0 ? '+' : ''}{transaction.starsDelta}★
                                        </td>
                                        <td className="px-8 py-5 text-sm text-[#b3b8c5]">
                                            {transaction.description}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}