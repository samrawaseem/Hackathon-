'use client';

import { useState, useEffect } from 'react';
import { signUp, getSession } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const currentSession = await getSession();
            if (currentSession) {
                router.push('/dashboard');
            }
            setCheckingSession(false);
        };
        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const result = await signUp(email, password, name);

            if (!result) {
                throw new Error('Sign up failed. Please try again.');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            let message = 'An unexpected error occurred';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            } else if (err.detail) {
                message = err.detail;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-dark-bg relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1000ms' }} />
            </div>

            {/* Left Column - Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative z-10">
                <div className="w-full max-w-md glass-panel p-10 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(188,19,254,0.4)] -rotate-3">
                            <span className="text-2xl font-black text-black">T</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Neural <span className="text-neon-purple">Registry</span>
                        </h2>
                        <p className="mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                            Initialize Entity Creation Sequence
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl text-xs font-bold uppercase tracking-wider mb-8 animate-pulse text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Entity Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-neon-purple">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-neon pl-12 h-12"
                                        placeholder="Identification Name..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Neural Contact (Email)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-neon-purple">
                                        <Mail className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-neon pl-12 h-12"
                                        placeholder="Neural Address..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                        Access Key
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-neon-purple">
                                            <Lock className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-neon pl-12 h-12"
                                            placeholder="Min. 8 Chars"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                        Verify Key
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-neon-purple">
                                            <Lock className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            name="confirm-password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-neon pl-12 h-12"
                                            placeholder="Confirm Key..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-neon-purple text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(188,19,254,0.6)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        Initialize Protocol
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-10 p-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Authorized Entity?{' '}
                            <Link href="/login" className="text-neon-cyan hover:text-white transition-colors ml-2">
                                Terminate Registration & Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Decorative */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-16">
                <div className="relative z-10 max-w-lg text-center lg:text-left">
                    <h1 className="text-6xl font-black text-white mb-8 leading-none uppercase italic tracking-tighter">
                        Evolve Your <br />
                        <span className="text-neon-purple drop-shadow-[0_0_15px_rgba(188,19,254,0.5)]">Workflow.</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-bold uppercase tracking-[0.1em] leading-relaxed opacity-60">
                        Join the elite core of productive entities. Transform your daily objectives into high-speed neural milestones.
                    </p>

                    <div className="mt-12 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Quantum Encryption Protocols</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-neon-purple" />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Neural Multi-Layer Security</span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-neon-purple/5 border border-neon-purple/10 rounded-full blur-[40px] -z-10 animate-pulse" />
            </div>
        </div>
    );
}
