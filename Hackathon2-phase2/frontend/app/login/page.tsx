'use client';

import { useState, useEffect } from 'react';
import { signIn, signUp, getSession, type Session } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
      if (currentSession) {
        router.push('/');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length === 0) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Sign in with email and password
        const result = await signIn(email, password);

        if (!result) {
          // This block might not be reached if signIn throws, but good as a fallback
          throw new Error('Sign in failed. Please check your credentials.');
        } else {
          // Session created, redirect to home
          router.push('/');
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const result = await signUp(email, password, name || email.split('@')[0]);

        if (!result) {
          throw new Error('Sign up failed. Please try again.');
        } else {
          // Auto-login after registration
          router.push('/');
        }
      }
    } catch (err: any) {
      // Extract error message
      let message = 'An unexpected error occurred';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err.detail) {
        message = err.detail;
      }

      setError(message);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8 relative overflow-hidden backdrop-blur-sm">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 border-neon-cyan/30 shadow-[0_0_50px_rgba(0,243,255,0.1)] relative z-10">
        <div className="hud-corner top-0 left-0 border-r-0 border-b-0"></div>
        <div className="hud-corner top-0 right-0 border-l-0 border-b-0"></div>
        <div className="hud-corner bottom-0 left-0 border-r-0 border-t-0"></div>
        <div className="hud-corner bottom-0 right-0 border-l-0 border-t-0"></div>

        <div className="text-center mb-10">
          <div className="inline-block w-16 h-1 bg-neon-cyan mb-6 shadow-[0_0_10px_rgba(0,243,255,0.8)]"></div>
          <h2 className="text-3xl font-robot font-bold text-gradient-neon mb-4 tracking-tighter uppercase">
            {isLogin ? 'Access_Port' : 'Initialize_Unit'}
          </h2>
          <p className="text-[10px] font-robot text-neon-cyan/60 uppercase tracking-[0.2em]">
            {isLogin ? 'Verifying neural credentials...' : 'Calibrating new system identity...'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-neon-magenta/10 border border-neon-magenta text-neon-magenta text-[10px] font-robot uppercase tracking-widest animate-pulse">
            System_Error: {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email-address" className="block text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest ml-1">
              Neural_ID (Email)
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-cyber"
              placeholder="operator@system.io"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest ml-1">
              Access_Key (Password)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-cyber"
              placeholder="••••••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest ml-1">
                Entity_Designation (Name)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-cyber"
                placeholder="Unit-772"
              />
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest ml-1">
                Confirm_Access_Key
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-cyber"
                placeholder="••••••••••••"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`btn-cyan w-full flex justify-center items-center ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin mr-3"></div>
              ) : null}
              {loading ? 'Processing...' : (isLogin ? 'Enter_Matrix' : 'Register_Unit')}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center space-y-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[10px] font-robot text-neon-cyan/60 hover:text-neon-cyan transition-colors uppercase tracking-[0.2em]"
          >
            {isLogin
              ? "No Designation? Initialize_Unit"
              : "Identity_Confirmed? Access_Port"}
          </button>

          <div className="block pt-2">
            <Link href="/" className="text-[10px] font-robot text-neon-magenta/60 hover:text-neon-magenta transition-colors inline-flex items-center uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return_To_Node
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}