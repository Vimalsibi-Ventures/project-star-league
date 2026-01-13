import { getMeetings, getSquadron } from '@/lib/data';
import Link from 'next/link';

export default function MeetingsPage() {
    const meetings = getMeetings();

    // Sort meetings by date (newest first)
    const sortedMeetings = [...meetings].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return (
        <div className="min-h-screen bg-[#0e1117] pt-[72px]">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <Link href="/" className="text-[#9aa4bf] hover:text-[#4f8cff] mb-6 inline-block transition-colors">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-[#e6e9f0] mb-8">Meetings</h1>

                {sortedMeetings.length === 0 ? (
                    <div className="bg-[#151a23] border border-[#2a3245] rounded-lg p-6 text-center text-[#9aa4bf]">
                        No meetings yet
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedMeetings.map(meeting => (
                            <div key={meeting.id} className="bg-[#151a23] border border-[#2a3245] rounded-lg p-6 hover:shadow-[0_0_12px_rgba(79,140,255,0.15)] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#e6e9f0]">
                                            {new Date(meeting.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </h2>
                                        <p className="text-sm text-[#9aa4bf] mt-1">
                                            Type: {meeting.type} | Status: {meeting.finalized ? 'Finalized' : 'Draft'}
                                        </p>
                                    </div>
                                </div>

                                {meeting.roles && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-[#e6e9f0] mb-2">Role Assignments</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(meeting.roles).map(([role, memberName]) => (
                                                <div key={role} className="text-sm text-[#9aa4bf]">
                                                    <span className="font-medium">{role}:</span> {memberName}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {meeting.auction && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-[#e6e9f0] mb-2">Auction Result</h3>
                                        <p className="text-sm text-[#9aa4bf]">
                                            Winner: {meeting.auction.winner} | Bid: {meeting.auction.bid}★
                                        </p>
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
