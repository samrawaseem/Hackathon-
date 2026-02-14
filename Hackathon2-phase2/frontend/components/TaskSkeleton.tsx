/**
 * TaskSkeleton Component
 * Loading placeholder for TaskItem components
 * Uses animate-pulse with neon-cyan shades placeholders matching TaskItem layout
 */

export default function TaskSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 glass-panel border-neon-cyan/10">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0 w-full animate-pulse">
        <div className="flex flex-wrap items-start gap-2 md:gap-3">
          <div className="h-7 w-48 bg-neon-cyan/10 rounded-sm" />
          <div className="h-6 w-20 bg-neon-cyan/10 rounded-sm" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-neon-cyan/5 rounded-sm" />
            <div className="h-5 w-16 bg-neon-cyan/5 rounded-sm" />
          </div>
          <div className="h-3 w-32 bg-neon-cyan/5 rounded-sm" />
        </div>
      </div>

      <div className="flex gap-3 mt-4 md:mt-0 md:ml-4">
        <div className="w-8 h-8 border border-neon-cyan/10 bg-neon-cyan/5 rounded-sm animate-pulse" />
        <div className="w-8 h-8 border border-neon-magenta/10 bg-neon-magenta/5 rounded-sm animate-pulse" />
      </div>
    </div>
  );
}