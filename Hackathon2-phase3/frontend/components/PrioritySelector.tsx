"use client";

/**
 * PrioritySelector Component
 * Dropdown selector for choosing task priority (high/medium/low)
 * Used in task creation and editing forms
 */

interface PrioritySelectorProps {
  value: "high" | "medium" | "low";
  onChange: (priority: "high" | "medium" | "low") => void;
  disabled?: boolean;
}

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  return (
    <div className="relative group/priority">
      <select
        id="priority"
        value={value}
        onChange={(e) => onChange(e.target.value as "high" | "medium" | "low")}
        disabled={disabled}
        className="input-neon appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
      >
        <option value="high" className="bg-dark-bg text-neon-pink">URGENT: High Priority</option>
        <option value="medium" className="bg-dark-bg text-neon-purple">STABLE: Medium Priority</option>
        <option value="low" className="bg-dark-bg text-neon-cyan">MINIMAL: Low Priority</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 group-hover/priority:text-neon-cyan transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
