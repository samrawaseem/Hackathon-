export default function SettingsPage() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto py-8">
            <div className="text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
                    <span className="text-neon-cyan">Control</span> Center
                </h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">System Configuration & Neural Parameters</p>
            </div>

            <div className="glass-panel p-16 border-white/5 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] -z-10" />

                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:border-neon-purple/30 group-hover:shadow-[0_0_30px_rgba(188,19,254,0.1)] transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 group-hover:text-neon-purple transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>

                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Protocol Pending</h3>
                <p className="text-gray-500 max-w-md mx-auto text-xs font-bold uppercase tracking-widest leading-loose opacity-60">
                    User preference encryption protocols are currently in development. Neural synchronization will be available in the next iteration.
                </p>

                <div className="mt-12 flex items-center justify-center gap-4">
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">Awaiting Signal</span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
            </div>
        </div>
    );
}
