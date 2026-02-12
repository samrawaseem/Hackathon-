/**
 * TaskSkeleton Component
 * Loading placeholder for TaskItem components
 * Uses animate-pulse with bg-gray-200 placeholders matching TaskItem layout
 */

export default function TaskSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 glass-panel border-white/5 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl border border-white/10 bg-white/5" />

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-5 bg-white/5 rounded-lg" />
            <div className="h-6 w-16 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="h-5 w-12 bg-white/5 border border-white/10 rounded-lg" />
            <div className="h-5 w-16 bg-white/5 border border-white/10 rounded-lg" />
          </div>

          <div className="h-3 w-32 bg-white/5 rounded" />
        </div>
      </div>

      <div className="flex gap-2 ml-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
      </div>
    </div>
  );
}