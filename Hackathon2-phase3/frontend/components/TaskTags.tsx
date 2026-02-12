"use client";

/**
 * TaskTags Component
 * Displays tags associated with a task as small badges
 * Shows visual indicators for categorization
 */

interface TaskTagsProps {
  tags: string[];
}

export function TaskTags({ tags }: TaskTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10 hover:border-neon-cyan/30 hover:text-neon-cyan transition-all duration-300"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
