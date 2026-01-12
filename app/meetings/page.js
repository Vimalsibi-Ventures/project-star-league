import { getMeetings, getSquadron } from '@/lib/data';
import Link from 'next/link';

export default function MeetingsPage() {
    const meetings = getMeetings();

    // Sort meetings by date (newest first)
    const sortedMeetings = [...meetings].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
                ← Back to Home
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Meetings</h1>

            {sortedMeetings.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
                    No meetings yet
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {new Date(meeting.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Type: {meeting.type} | Status: {meeting.finalized ? 'Finalized' : 'Draft'}
                                    </p>
                                </div>
                            </div>

                            {meeting.roles && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Role Assignments</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(meeting.roles).map(([role, memberName]) => (
                                            <div key={role} className="text-sm text-gray-600">
                                                <span className="font-medium">{role}:</span> {memberName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {meeting.auction && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Auction Result</h3>
                                    <p className="text-sm text-gray-600">
                                        Winner: {meeting.auction.winner} | Bid: {meeting.auction.bid}★
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}