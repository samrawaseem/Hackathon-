'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      {/* Cybernetic Overlays */}
      <div className="scanline-overlay" />
      <div className="scanline-beam" />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-cyan/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2000ms' }} />
      </div>

      {/* Navbar */}
      <nav className="px-6 py-8 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-transform group-hover:rotate-12">
            T
          </div>
          <div>
            <span className="font-black text-2xl text-white tracking-tighter uppercase italic block leading-none">
              Neural <span className="text-neon-cyan">Core</span>
            </span>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Task OS v3.0</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-[10px] font-black text-gray-400 hover:text-neon-cyan uppercase tracking-widest transition-all">
            Access Terminal
          </Link>
          <Link
            href="/signup"
            className="btn-neon text-[10px] px-8 py-3 font-black"
          >
            Create Entity
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-[10px] font-black tracking-[0.3em] uppercase animate-glow">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-flicker" />
            Neural Synchronization Active
          </div>

          <h1 className="text-6xl sm:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9] uppercase italic">
            Automate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]">
              Digital Life.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-16 max-w-3xl mx-auto leading-loose font-bold uppercase tracking-widest opacity-60">
            Experience the next generation of cybernetic task orchestration.
            Synchronize neural pathways for maximum output efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              href="/signup"
              className="btn-neon group flex items-center gap-4 px-12 py-5 text-sm font-black"
            >
              Initialize Node
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-12 py-5 rounded-2xl border border-white/5 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all glass-panel group"
            >
              Access <span className="text-neon-cyan group-hover:text-white transition-colors">Interface</span>
            </Link>
          </div>

          {/* Technical Stats Overlay */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-12">
            {[
              { label: 'Uptime', value: '99.99%' },
              { label: 'Latency', value: '0.4ms' },
              { label: 'Encryption', value: 'AES-GCM' },
              { label: 'Neural Link', value: 'Stable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center relative z-10">
        <div className="h-px w-full max-w-7xl mx-auto bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />
        <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} Neural Core • All Rights Reserved • System Status: <span className="text-neon-cyan">Optimal</span>
        </p>
      </footer>
    </div>
  );
}