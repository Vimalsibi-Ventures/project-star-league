import { getMeetings, getSquadron } from '@/lib/data';
import Link from 'next/link';

export default function MeetingsPage() {
    const meetings = getMeetings();

    // Sort meetings by date (newest first)
    const sortedMeetings = [...meetings].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return (
        <div className="min-h-screen bg-[#0d0f14] pt-[72px]">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <Link href="/" className="text-[#b3b8c5] hover:text-[#f5c518] mb-8 inline-block transition-colors font-medium text-sm uppercase tracking-wide">
                    ← Back to Arena
                </Link>

                <h1 className="text-4xl font-black text-[#f5f7fa] mb-8 uppercase tracking-wide">Past Sessions</h1>

                {sortedMeetings.length === 0 ? (
                    <div className="bg-[#161a22] border border-[#2a2f3a] rounded-xl p-12 text-center text-[#7a8194]">
                        No meeting records found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedMeetings.map(meeting => (
                            <div key={meeting.id} className="bg-[#161a22] border border-[#2a2f3a] rounded-xl p-6 hover:border-[#f5c518]/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#f5f7fa] group-hover:text-[#f5c518] transition-colors">
                                            {new Date(meeting.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </h2>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded bg-[#1f2430] border border-[#2a2f3a] text-xs font-bold uppercase text-[#7a8194]">
                                                {meeting.type}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded border text-xs font-bold uppercase ${meeting.finalized
                                                    ? 'bg-[#1f2430] border-[#f5c518]/30 text-[#f5c518]'
                                                    : 'bg-[#1f2430] border-[#2a2f3a] text-[#7a8194]'
                                                }`}>
                                                {meeting.finalized ? 'Finalized' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {meeting.roles && (
                                    <div className="mt-6 pt-4 border-t border-[#2a2f3a]">
                                        <h3 className="text-xs font-bold text-[#7a8194] uppercase tracking-widest mb-3">Roster</h3>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                            {Object.entries(meeting.roles).map(([role, memberName]) => (
                                                <div key={role} className="flex justify-between text-sm">
                                                    <span className="text-[#b3b8c5]">{role}:</span>
                                                    <span className="text-[#f5f7fa] font-medium">{memberName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}