'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Settings, MessageSquare, LogOut, User } from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Task Registry', href: '/dashboard/todos', icon: CheckSquare },
        { name: 'Neural Chat', href: '/dashboard/chat', icon: MessageSquare },
        { name: 'Control Center', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className={twMerge("flex flex-col h-full bg-dark-bg/60 backdrop-blur-xl border-r border-white/10 relative z-30", className)}>
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-transform hover:rotate-12">
                    T
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Neural <span className="text-neon-cyan">Core</span>
                    </h1>
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.4em]">Node Active</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-neon-cyan/10 text-neon-cyan font-medium border border-neon-cyan/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-neon-cyan rounded-r-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />}
                            <item.icon
                                className={clsx(
                                    "w-5 h-5 transition-colors duration-300",
                                    isActive ? "text-neon-cyan filter drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]" : "text-gray-500 group-hover:text-gray-300"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await signOut();
                        window.location.href = '/login';
                    }}
                    className="w-full h-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white/5 hover:bg-neon-pink/10 hover:text-neon-pink rounded-xl transition-all border border-white/10 hover:border-neon-pink/30 group shadow-lg"
                >
                    <LogOut className="w-4 h-4 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(255,0,127,0.5)]" />
                    Terminate Session
                </button>
            </div>
        </div >
    );
}
