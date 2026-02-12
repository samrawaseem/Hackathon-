'use client';

import { useState, useEffect } from 'react';
import { getTasks, Task, apiRequest } from '@/lib/api';
import useApi from '@/lib/useApi';
import TaskItem from '@/components/TaskItem';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PrioritySelector } from '@/components/PrioritySelector';
import { TagInput } from '@/components/TagInput';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { SortControls } from '@/components/SortControls';
import TaskSkeleton from '@/components/TaskSkeleton';
import { Plus, Loader2 } from 'lucide-react';

export default function TodosPage() {
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

    const tasksApi = useApi<Task[]>();
    const createApi = useApi<Task>();

    // Load tasks and tags
    useEffect(() => {
        const loadData = async () => {
            await tasksApi.execute(() => getTasks(searchQuery, statusFilter, priorityFilter, datePresetFilter, sortBy, sortOrder));
            try {
                const tags = await apiRequest<Array<{ name: string }>>('/api/tags');
                setAvailableTags(tags.map(t => t.name));
            } catch (error) {
                console.error('Failed to load tags:', error);
            }
        };

        loadData();
    }, [searchQuery, statusFilter, priorityFilter, datePresetFilter, sortBy, sortOrder]);

    const [tasks, setTasks] = useState<Task[]>(tasksApi.data || []);

    useEffect(() => {
        if (tasksApi.data) {
            setTasks(tasksApi.data);
        }
    }, [tasksApi.data]);

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
            setNewTaskTags([]);

            // Refresh tags
            try {
                const tags = await apiRequest<Array<{ name: string }>>('/api/tags');
                setAvailableTags(tags.map(t => t.name));
            } catch (error) {
                console.error('Failed to refresh tags:', error);
            }
        }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
    };

    const handleTaskDeleted = (taskId: number) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    return (
        <ErrorBoundary>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Task <span className="text-neon-cyan">Management</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Manage and organize your daily tasks in your cyber workspace.</p>
                </div>

                {tasksApi.error && (
                    <div className="p-4 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink rounded-xl shadow-[0_0_15px_rgba(255,0,127,0.1)] backdrop-blur-md">
                        Failed to load tasks: {tasksApi.error.message}. Please refresh the page.
                    </div>
                )}

                {createApi.error && (
                    <div className="p-4 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink rounded-xl shadow-[0_0_15px_rgba(255,0,127,0.1)] backdrop-blur-md">
                        Failed to create task: {createApi.error.message}. Please try again.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar / Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Add Task Panel */}
                        <div className="glass-panel p-6 border-white/5 bg-white/5 border-neon-cyan/10 hover:border-neon-cyan/30 transition-all duration-500">
                            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-neon-cyan animate-pulse" />
                                <span className="text-neon-cyan">New</span> Task
                            </h2>
                            <form onSubmit={handleCreateTask} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        className="input-neon"
                                        disabled={createApi.loading}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Priority</label>
                                    <PrioritySelector
                                        value={newTaskPriority}
                                        onChange={setNewTaskPriority}
                                        disabled={createApi.loading}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Tags</label>
                                    <TagInput
                                        value={newTaskTags}
                                        onChange={setNewTaskTags}
                                        availableTags={availableTags}
                                        disabled={createApi.loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn-neon w-full mt-4 flex justify-center items-center gap-2 ${createApi.loading ? 'opacity-70' : ''}`}
                                    disabled={createApi.loading}
                                >
                                    {createApi.loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Engage Task
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Filters Panel */}
                        <div className="glass-panel p-6 border-white/5 bg-white/5">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Filters</h3>
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
                        {/* Search & Sort */}
                        <div className="glass-panel p-4 border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="w-full sm:w-2/3">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Scouring database..."
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

                        {/* Tasks List */}
                        <div className="space-y-4">
                            {tasksApi.loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TaskSkeleton key={`skeleton-${index}`} />
                                ))
                            ) : tasks.length === 0 ? (
                                <div className="glass-panel p-16 border-white/5 border-dashed text-center">
                                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                        <Plus className="h-12 w-12 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No data signals found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        {searchQuery || statusFilter !== 'all'
                                            ? "The current parameters returned no matching task entities."
                                            : "Initialize your first objective to populate this dashboard."}
                                    </p>
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="mt-6 text-neon-cyan hover:underline text-sm font-semibold uppercase tracking-wider"
                                    >
                                        Create New Objective
                                    </button>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onTaskUpdated={handleTaskUpdated}
                                        onTaskDeleted={handleTaskDeleted}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
