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
    high: "bg-neon-pink/10 text-neon-pink ring-neon-pink/30 shadow-[0_0_10px_rgba(255,0,127,0.1)]",
    medium: "bg-neon-purple/10 text-neon-purple ring-neon-purple/30 shadow-[0_0_10px_rgba(188,19,254,0.1)]",
    low: "bg-neon-cyan/10 text-neon-cyan ring-neon-cyan/30 shadow-[0_0_10px_rgba(0,243,255,0.1)]",
  };

  const labels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${styles[priority].replace('bg-neon', 'bg-neon').replace('ring-neon', 'ring-neon')} hover:border-neon-cyan/30 hover:text-neon-cyan transition-colors duration-300`}
    >
      {labels[priority]}
    </span>
  );
}
