"use client";

/**
 * TagBadge Component
 * Displays a pill-shaped chip for task tags
 * Follows design system with bg-primary-50, hover states, and rounded-full shape
 */

interface TagBadgeProps {
  name: string;
  onRemove?: () => void;
}

export default function TagBadge({ name, onRemove }: TagBadgeProps) {
  return (
    <span
      className="
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm
        bg-neon-cyan/10 text-neon-cyan text-[10px] font-robot font-bold
        border border-neon-cyan/30 shadow-[0_0_8px_rgba(0,243,255,0.2)]
        transition-all duration-200 uppercase tracking-widest
      "
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-neon-magenta transition-colors duration-200"
          aria-label={`Purge ${name} designation`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
