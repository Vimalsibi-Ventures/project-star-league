'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            router.push('/admin/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* BACKGROUND IMAGE - Lightened overlay for better visibility */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(10, 12, 16, 0.6), rgba(10, 12, 16, 0.8)),
                        url('/images/login-bg.jpg')
                    `,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="glass-card rounded-2xl p-10 border-t border-white/20">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-[#fbbf24] rounded-xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_#fbbf24]">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                            Command Center
                        </h1>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 text-white border border-white/10 rounded-lg placeholder:text-gray-600 focus:border-[#fbbf24] focus:shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all outline-none"
                                placeholder="USERNAME"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 text-white border border-white/10 rounded-lg placeholder:text-gray-600 focus:border-[#fbbf24] focus:shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all outline-none"
                                placeholder="PASSWORD"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center font-bold uppercase tracking-wide">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#fbbf24] text-black py-3.5 rounded-lg hover:bg-[#f59e0b] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] font-bold uppercase tracking-wide transition-all transform active:scale-95"
                        >
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}