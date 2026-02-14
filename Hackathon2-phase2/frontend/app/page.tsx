'use client';

import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, Task, apiRequest } from '@/lib/api';
import useApi from '@/lib/useApi';
import TaskItem from '@/components/TaskItem';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { PrioritySelector } from '@/components/PrioritySelector';
import { TagInput } from '@/components/TagInput';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { SortControls } from '@/components/SortControls';
import TaskSkeleton from '@/components/TaskSkeleton';

export default function Home() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [datePresetFilter, setDatePresetFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Use the custom API hook for better error handling
  const tasksApi = useApi<Task[]>();
  const createApi = useApi<Task>();

  // Get authentication state using the correct Better Auth client
  const { data: session, isPending } = useSession();

  // Load tasks and tags when filters change (only if authenticated)
  useEffect(() => {
    const loadData = async () => {
      if (session) {
        await tasksApi.execute(() => getTasks(searchQuery, statusFilter, priorityFilter, datePresetFilter, sortBy, sortOrder));
        // Load available tags
        try {
          const tags = await apiRequest<Array<{ name: string }>>('/api/tags');
          setAvailableTags(tags.map(t => t.name));
        } catch (error) {
          console.error('Failed to load tags:', error);
        }
      }
    };

    loadData();
  }, [session, searchQuery, statusFilter, priorityFilter, datePresetFilter, sortBy, sortOrder]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    const newTask = await createApi.execute(() =>
      apiRequest<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          tags: newTaskTags
        }),
      })
    );

    if (newTask && !createApi.error) {
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskTitle('');
      setNewTaskPriority("medium");
      setNewTaskTags([]); // Reset tags

      // Refresh available tags
      try {
        const tags = await apiRequest<Array<{ name: string }>>('/api/tags');
        setAvailableTags(tags.map(t => t.name));
      } catch (error) {
        console.error('Failed to refresh tags:', error);
      }
    }
  };

  const [tasks, setTasks] = useState<Task[]>(tasksApi.data || []);

  // Update tasks when API data changes
  useEffect(() => {
    if (tasksApi.data) {
      setTasks(tasksApi.data);
    }
  }, [tasksApi.data]);

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-950 font-robot">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full"></div>
          <div className="inline-block animate-spin rounded-sm h-12 w-12 border-2 border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-4"></div>
          <p className="text-neon-cyan font-robot tracking-widest uppercase">Initializing Neural Link...</p>
        </div>
      </div>
    );
  }

  // Show auth prompt if not authenticated
  if (!session) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden backdrop-blur-sm">
          <main className="w-full max-w-4xl mx-auto relative z-10">
            <div className="glass-panel p-8 sm:p-12 text-center border-neon-cyan/30">
              <div className="hud-corner top-0 left-0 border-r-0 border-b-0"></div>
              <div className="hud-corner top-0 right-0 border-l-0 border-b-0"></div>
              <div className="hud-corner bottom-0 left-0 border-r-0 border-t-0"></div>
              <div className="hud-corner bottom-0 right-0 border-l-0 border-t-0"></div>

              <h1 className="text-5xl sm:text-7xl font-bold text-gradient-neon mb-6 font-robot tracking-tighter">
                ROBO<span className="text-foreground">TODO</span>
              </h1>
              <p className="text-xl text-neon-cyan/80 mb-10 max-w-2xl mx-auto leading-relaxed font-robot uppercase tracking-wide">
                Neural Interface for Advanced Task Optimization.
                <br /><span className="text-sm opacity-60">Status: Mission Ready. System: Online.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/login"
                  className="btn-cyan min-w-[240px] text-lg bg-neon-cyan/10"
                >
                  Authorize System
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 rounded-sm border border-neon-magenta/50 text-neon-magenta font-robot uppercase tracking-widest hover:bg-neon-magenta/10 transition-all min-w-[240px] shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                >
                  Access Archives
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-12 font-sans relative">
        {/* Navbar / Header */}
        <header className="glass-panel sticky top-4 mx-4 mb-8 z-10 px-8 py-4 flex justify-between items-center bg-black/40 border-neon-cyan/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-neon-cyan flex items-center justify-center text-black font-robot font-bold text-xl shadow-[0_0_15px_rgba(0,243,255,0.6)]">
              R
            </div>
            <h1 className="text-2xl font-bold font-robot text-neon-cyan tracking-widest uppercase">System_Core</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right border-r border-neon-cyan/20 pr-6">
              <p className="text-xs font-robot text-neon-cyan/60 uppercase">Operator</p>
              <p className="text-sm font-robot text-white tracking-wider">
                {session.user?.name || 'Unknown_Entity'}
              </p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = '/login';
              }}
              className="px-4 py-2 text-xs font-robot text-neon-magenta border border-neon-magenta/30 hover:bg-neon-magenta/10 hover:border-neon-magenta transition-all uppercase tracking-widest"
            >
              Terminate_Session
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar / Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Add Task Panel */}
              <div className="glass-panel p-6 border-neon-cyan/20 bg-black/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-robot text-neon-cyan uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-neon-cyan animate-pulse"></span>
                    Task_Injection
                  </h2>
                  <span className="text-[10px] font-robot text-neon-cyan/40">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter Command Data..."
                      className="input-cyber"
                      aria-label="New task title"
                      disabled={createApi.loading}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-robot text-neon-cyan/60 uppercase tracking-[0.2em] ml-1">Priority_Level</label>
                    <PrioritySelector
                      value={newTaskPriority}
                      onChange={setNewTaskPriority}
                      disabled={createApi.loading}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-robot text-neon-cyan/60 uppercase tracking-[0.2em] ml-1">Classification_Tags</label>
                    <TagInput
                      value={newTaskTags}
                      onChange={setNewTaskTags}
                      availableTags={availableTags}
                      disabled={createApi.loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn-cyan w-full flex justify-center items-center ${createApi.loading ? 'opacity-50' : ''}`}
                    disabled={createApi.loading}
                  >
                    {createApi.loading ? 'Processing...' : 'Execute_Create'}
                  </button>
                </form>
              </div>

              {/* Filters Panel */}
              <div className="glass-panel p-6 border-neon-magenta/20 bg-black/60">
                <h2 className="text-sm font-robot text-neon-magenta uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-neon-magenta animate-pulse"></span>
                  Matrix_Filter
                </h2>
                <FilterPanel
                  status={statusFilter}
                  priority={priorityFilter}
                  datePreset={datePresetFilter}
                  onStatusChange={setStatusFilter}
                  onPriorityChange={setPriorityFilter}
                  onDatePresetChange={setDatePresetFilter}
                />
              </div>
            </div>

            {/* Main Content / List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Search & Sort HUD */}
              <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-neon-cyan/30 bg-black/50">
                <div className="w-full sm:w-2/3">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search Database..."
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <SortControls
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortByChange={setSortBy}
                    onSortOrderChange={setSortOrder}
                  />
                </div>
              </div>

              {/* Tasks Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-robot text-neon-cyan uppercase tracking-[0.3em]">Neural_Tasks_Pool</h2>
                  <div className="h-px bg-neon-cyan/20 flex-grow mx-4"></div>
                  <span className="text-[10px] font-robot text-neon-cyan/60">{tasks.length} ENTRIES</span>
                </div>

                {tasksApi.loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TaskSkeleton key={`skeleton-${index}`} />
                  ))
                ) : tasks.length === 0 ? (
                  <div className="glass-panel p-16 text-center border-dashed border-neon-cyan/20 bg-black/40">
                    <div className="w-24 h-24 border border-neon-cyan/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neon-cyan/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-robot text-neon-cyan mb-2 tracking-widest uppercase">Database_Empty</h3>
                    <p className="text-neon-cyan/40 font-robot text-xs uppercase tracking-tighter">
                      {searchQuery || statusFilter !== 'all'
                        ? "Criteria match failed. Adjust matrix parameters."
                        : "No data found. Inject new tasks into the neural network."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onTaskUpdated={handleTaskUpdated}
                        onTaskDeleted={handleTaskDeleted}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}