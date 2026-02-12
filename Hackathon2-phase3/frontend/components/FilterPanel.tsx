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
        className="md:hidden w-full bg-white/5 p-4 rounded-xl border border-white/10 mb-3 flex items-center justify-between text-neon-cyan font-semibold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(0,243,255,0.05)]"
        onClick={() => setShowMobileFilters(true)}
        aria-label="Open filters"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </span>
        {hasActiveFilters && (
          <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/30 animate-pulse">
            Active
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Configuration <span className="text-neon-cyan">Filters</span></h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
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
                  className="w-full py-3 text-xs font-bold uppercase tracking-widest text-neon-pink bg-neon-pink/10 border border-neon-pink/20 rounded-xl hover:bg-neon-pink hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,127,0.1)]"
                >
                  Reset Parameters
                </button>
              </div>
            )}

            {/* Filters Content */}
            <div className="space-y-8">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={status}
                  onChange={(e) => {
                    onStatusChange(e.target.value);
                  }}
                  className="input-neon appearance-none cursor-pointer"
                >
                  <option value="all">All Task Streams</option>
                  <option value="active">Active Processes</option>
                  <option value="completed">Terminated States</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-filter" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                  Urgency
                </label>
                <select
                  id="priority-filter"
                  value={priority}
                  onChange={(e) => {
                    onPriorityChange(e.target.value);
                  }}
                  className="input-neon appearance-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">Critical</option>
                  <option value="medium">Stability</option>
                  <option value="low">Low Energy</option>
                </select>
              </div>

              {/* Date Preset Filter */}
              <div>
                <label htmlFor="date-filter" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                  Temporal Range
                </label>
                <select
                  id="date-filter"
                  value={datePreset}
                  onChange={(e) => {
                    onDatePresetChange(e.target.value);
                  }}
                  className="input-neon appearance-none cursor-pointer"
                >
                  <option value="all">Full Timeline</option>
                  <option value="today">Current Cycle</option>
                  <option value="this_week">Weekly Phase</option>
                  <option value="this_month">Monthly Orbit</option>
                  <option value="overdue">System Delay</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="btn-neon w-full mt-10"
            >
              Apply Filter Set
            </button>
          </div>
        </div>
      )}

      {/* Desktop Filter Panel */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Filter Array</h3>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-[10px] text-neon-pink hover:text-white font-bold uppercase tracking-wider transition-all"
            >
              Full Reset
            </button>
          )}
        </div>

        <div className="space-y-8">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter-desktop" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
              Status
            </label>
            <div className="relative">
              <select
                id="status-filter-desktop"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="input-neon appearance-none cursor-pointer"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="priority-filter-desktop" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
              Priority
            </label>
            <div className="relative">
              <select
                id="priority-filter-desktop"
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="input-neon appearance-none cursor-pointer"
              >
                <option value="all">Total Range</option>
                <option value="high">Critical</option>
                <option value="medium">Medium</option>
                <option value="low">Minimal</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Preset Filter */}
          <div>
            <label htmlFor="date-filter-desktop" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
              Temporal
            </label>
            <div className="relative">
              <select
                id="date-filter-desktop"
                value={datePreset}
                onChange={(e) => onDatePresetChange(e.target.value)}
                className="input-neon appearance-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="overdue">Overdue</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
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
