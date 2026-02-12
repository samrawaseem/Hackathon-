"use client";

/**
 * SortControls Component
 * Provides sorting controls for tasks
 * Allows sorting by due date, priority, or title
 */

interface SortControlsProps {
  sortBy: string;
  sortOrder: string;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: string) => void;
}

export function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort:</span>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="text-xs font-semibold bg-transparent text-gray-300 border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
      >
        <option value="created_at" className="bg-dark-bg">Date</option>
        <option value="priority" className="bg-dark-bg">Priority</option>
        <option value="title" className="bg-dark-bg">Alpha</option>
      </select>

      <div className="w-px h-4 bg-white/10" />

      <button
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-neon-cyan transition-all duration-300 hover:rotate-180"
        aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
        title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
      >
        {sortOrder === 'asc' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>
    </div>
  );
}
