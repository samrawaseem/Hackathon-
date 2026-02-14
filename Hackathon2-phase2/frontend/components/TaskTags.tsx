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
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-robot tracking-widest font-bold border border-neon-cyan/40 text-neon-cyan/60 bg-neon-cyan/5 uppercase"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
