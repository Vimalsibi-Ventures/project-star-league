'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0c10]/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-[80px] flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-[#fbbf24] rounded-lg flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:scale-110 transition-transform">
                        O
                    </div>
                    <span className="text-lg font-bold text-white tracking-[0.2em] uppercase group-hover:text-[#fbbf24] transition-colors">
                        Star League
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-8">
                    {/* Socials */}
                    <a href="https://www.instagram.com/oratio.tmi/" target="_blank" className="nav-link text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">
                        Instagram
                    </a>
                    <a href="https://www.linkedin.com/company/oratio-vit/" target="_blank" className="nav-link text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">
                        LinkedIn
                    </a>

                    {/* Operational Links */}
                    <Link
                        href="/analytics"
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
                    >
                        Analytics
                    </Link>

                    {/* NEW LINK: Hall of Fame */}
                    <Link
                        href="/hall-of-fame"
                        className="text-xs font-bold text-[#fbbf24] hover:text-yellow-300 uppercase tracking-wider transition-colors"
                    >
                        Hall of Fame
                    </Link>

                    <a
                        href="https://tmoratio.netlify.app/tmforms.html"
                        target="_blank"
                        className="text-xs font-bold text-[#fbbf24] hover:text-[#fcd34d] uppercase tracking-wider transition-colors shadow-glow-sm"
                    >
                        Role Signup
                    </a>
                    <a
                        href="https://oratiofb.netlify.app/"
                        target="_blank"
                        className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
                    >
                        Feedback
                    </a>

                    {/* Admin Button */}
                    <Link
                        href="/admin"
                        className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase rounded-md transition-all hover:border-[#fbbf24]/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    >
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
}