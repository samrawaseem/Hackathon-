"use client";

/**
 * PriorityBadge Component
 * Displays a visual indicator for task priority levels (high/medium/low)
 * Uses semantic color-coded badges for quick visual identification
 * Follows design system with rounded-full pill shape and ring styling
 */

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    high: "border-neon-magenta text-neon-magenta bg-neon-magenta/10 shadow-[0_0_8px_rgba(255,0,255,0.3)]",
    medium: "border-neon-yellow text-neon-yellow bg-neon-yellow/10 shadow-[0_0_8px_rgba(255,240,31,0.3)]",
    low: "border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-[0_0_8px_rgba(0,243,255,0.3)]",
  };

  const labels = {
    high: "CRITICAL",
    medium: "STANDARD",
    low: "MINOR",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[9px] font-robot tracking-[0.2em] font-bold ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}
