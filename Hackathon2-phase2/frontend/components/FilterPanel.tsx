"use client";

/**
 * FilterPanel Component
 * Provides filtering controls for tasks
 * Filters by status, priority, and date ranges
 */

interface FilterPanelProps {
  status: string;
  priority: string;
  datePreset: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDatePresetChange: (preset: string) => void;
}

import { useState } from 'react';

export function FilterPanel({
  status,
  priority,
  datePreset,
  onStatusChange,
  onPriorityChange,
  onDatePresetChange
}: FilterPanelProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const handleReset = () => {
    onStatusChange("all");
    onPriorityChange("all");
    onDatePresetChange("all");
  };

  const hasActiveFilters = status !== "all" || priority !== "all" || datePreset !== "all";

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        className="md:hidden w-full glass-panel bg-black/40 p-4 border-neon-cyan/30 mb-3 flex items-center justify-between text-neon-cyan font-robot text-xs uppercase tracking-widest transition-all hover:border-neon-cyan"
        onClick={() => setShowMobileFilters(true)}
        aria-label="Open filters"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Matrix_Filter
        </span>
        {hasActiveFilters && (
          <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-sm border border-neon-cyan/40">
            ACTIVE
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 glass-panel bg-black border-t-neon-cyan/50 rounded-t-sm rounded-b-none p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-robot text-neon-cyan tracking-tighter uppercase">Adjustment_Matrix</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-neon-magenta/40 hover:text-neon-magenta p-2"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {hasActiveFilters && (
              <div className="mb-8">
                <button
                  onClick={handleReset}
                  className="w-full py-2 text-xs font-robot text-neon-magenta border border-neon-magenta/30 hover:bg-neon-magenta/10 transition-all uppercase tracking-widest"
                >
                  Reset_Matrix_State
                </button>
              </div>
            )}

            {/* Filters Content */}
            <div className="space-y-8">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-[10px] font-robot text-neon-cyan/40 mb-3 uppercase tracking-widest">
                  Neural_Status
                </label>
                <select
                  id="status-filter"
                  value={status}
                  onChange={(e) => {
                    onStatusChange(e.target.value);
                  }}
                  className="input-cyber"
                >
                  <option value="all">ALL_SEQUENCES</option>
                  <option value="active">ACTIVE_SIGNALS</option>
                  <option value="completed">CLOSED_LOOPS</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-filter" className="block text-[10px] font-robot text-neon-cyan/40 mb-3 uppercase tracking-widest">
                  Severity_Level
                </label>
                <select
                  id="priority-filter"
                  value={priority}
                  onChange={(e) => {
                    onPriorityChange(e.target.value);
                  }}
                  className="input-cyber"
                >
                  <option value="all">ALL_LEVELS</option>
                  <option value="high">CRITICAL</option>
                  <option value="medium">STANDARD</option>
                  <option value="low">MINOR</option>
                </select>
              </div>

              {/* Date Preset Filter */}
              <div>
                <label htmlFor="date-filter" className="block text-[10px] font-robot text-neon-cyan/40 mb-3 uppercase tracking-widest">
                  TemporalRange
                </label>
                <select
                  id="date-filter"
                  value={datePreset}
                  onChange={(e) => {
                    onDatePresetChange(e.target.value);
                  }}
                  className="input-cyber"
                >
                  <option value="all">ARCHIVE_TOTAL</option>
                  <option value="today">CYCLE_CURRENT</option>
                  <option value="this_week">CYCLE_WEEKLY</option>
                  <option value="this_month">CYCLE_MONTHLY</option>
                  <option value="overdue">DELAYED_RESPONSES</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Panel */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-robot text-neon-cyan/40 uppercase tracking-[0.3em]">Refine_Signal</h3>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-[10px] font-robot text-neon-magenta hover:text-white transition-colors uppercase tracking-widest"
            >
              Reset_All
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter-desktop" className="block text-[10px] font-robot text-neon-cyan/60 mb-2 uppercase tracking-widest ml-1">
              Neural_Status
            </label>
            <div className="relative">
              <select
                id="status-filter-desktop"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="input-cyber appearance-none cursor-pointer pr-10"
              >
                <option value="all" className="bg-black">ALL_SEQUENCES</option>
                <option value="active" className="bg-black">ACTIVE_SIGNALS</option>
                <option value="completed" className="bg-black">CLOSED_LOOPS</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neon-cyan/40">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="priority-filter-desktop" className="block text-[10px] font-robot text-neon-cyan/60 mb-2 uppercase tracking-widest ml-1">
              Severity_Level
            </label>
            <div className="relative">
              <select
                id="priority-filter-desktop"
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="input-cyber appearance-none cursor-pointer pr-10"
              >
                <option value="all" className="bg-black">ALL_LEVELS</option>
                <option value="high" className="bg-black">CRITICAL</option>
                <option value="medium" className="bg-black">STANDARD</option>
                <option value="low" className="bg-black">MINOR</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neon-cyan/40">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Preset Filter */}
          <div>
            <label htmlFor="date-filter-desktop" className="block text-[10px] font-robot text-neon-cyan/60 mb-2 uppercase tracking-widest ml-1">
              Temporal_Range
            </label>
            <div className="relative">
              <select
                id="date-filter-desktop"
                value={datePreset}
                onChange={(e) => onDatePresetChange(e.target.value)}
                className="input-cyber appearance-none cursor-pointer pr-10"
              >
                <option value="all" className="bg-black">ARCHIVE_TOTAL</option>
                <option value="today" className="bg-black">CYCLE_CURRENT</option>
                <option value="this_week" className="bg-black">CYCLE_WEEKLY</option>
                <option value="this_month" className="bg-black">CYCLE_MONTHLY</option>
                <option value="overdue" className="bg-black">DELAYED_RESPONSES</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neon-cyan/40">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
