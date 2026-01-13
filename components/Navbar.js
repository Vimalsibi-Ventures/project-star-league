'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e1117]/80 backdrop-blur-md border-b border-[#2a3245]">
            <div className="w-full px-8">
                <div className="flex justify-between items-center h-[72px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <span className="text-xl font-bold text-[#e6e9f0] tracking-widest uppercase group-hover:text-[#4f8cff] transition-colors">
                            ORATIO STAR LEAGUE
                        </span>
                    </Link>

                    {/* External Links */}
                    <div className="flex items-center space-x-8">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9aa4bf] hover:text-[#4f8cff] transition-colors text-sm relative group"
                        >
                            Instagram
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4f8cff] group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9aa4bf] hover:text-[#4f8cff] transition-colors text-sm relative group"
                        >
                            LinkedIn
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4f8cff] group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <a
                            href="https://tmoratio.netlify.app/tmforms.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9aa4bf] hover:text-[#4f8cff] transition-colors text-sm relative group"
                        >
                            Role Signup
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4f8cff] group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <a
                            href="https://oratiofb.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9aa4bf] hover:text-[#4f8cff] transition-colors text-sm relative group"
                        >
                            Feedback
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4f8cff] group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <Link
                            href="/admin"
                            className="text-[#9aa4bf] hover:text-[#4f8cff] transition-colors text-sm font-medium relative group"
                        >
                            Admin
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4f8cff] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
