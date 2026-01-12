'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">★ Star League</span>
                    </Link>

                    {/* External Links */}
                    <div className="flex items-center space-x-6">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://example.com/signup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Role Signup
                        </a>
                        <a
                            href="https://example.com/feedback"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Feedback Poll
                        </a>
                        <Link
                            href="/admin"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}