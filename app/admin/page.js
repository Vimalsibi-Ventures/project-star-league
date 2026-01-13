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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1117] via-[#151a23] to-[#0e1117] pt-[72px]">
            <div className="bg-[#1c2333]/90 backdrop-blur-lg border border-[#2a3245] rounded-xl p-8 w-full max-w-md shadow-2xl">
                <h1 className="text-2xl font-bold text-[#e6e9f0] mb-6 text-center">
                    Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#9aa4bf] mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md placeholder:text-[#6b7280] focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#9aa4bf] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-[#1c2333] text-[#e6e9f0] border border-[#2a3245] rounded-md placeholder:text-[#6b7280] focus:outline-none focus:border-[#4f8cff] focus:shadow-[0_0_0_1px_rgba(79,140,255,0.4)]"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-[#ef4444] text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#4f8cff] text-white py-2 rounded-md hover:bg-[#3b7ae8] hover:shadow-[0_0_12px_rgba(79,140,255,0.5)] font-medium transition-all"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
