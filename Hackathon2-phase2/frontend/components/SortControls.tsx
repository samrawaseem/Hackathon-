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
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest">Sort_By:</span>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="input-cyber py-1 px-3 text-xs w-auto border-neon-cyan/20 cursor-pointer"
      >
        <option value="created_at" className="bg-black">ARCHIVE_DATE</option>
        <option value="priority" className="bg-black">PRIORITY_RANK</option>
        <option value="title" className="bg-black">COMMAND_NAME</option>
      </select>

      <button
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="p-1.5 border border-neon-cyan/20 hover:border-neon-cyan text-neon-cyan/60 hover:text-neon-cyan transition-all"
        aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
        title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
      >
        {sortOrder === 'asc' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>
    </div>
  );
}
