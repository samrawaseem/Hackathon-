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
        inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg
        bg-white/5 text-neon-cyan text-[10px] font-bold uppercase tracking-wider
        border border-white/10 hover:border-neon-cyan/30 transition-all duration-300
        hover:shadow-[0_0_10px_rgba(0,243,255,0.1)]
      "
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-neon-pink transition-all duration-300 transform hover:scale-125"
          aria-label={`Remove ${name} tag`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
