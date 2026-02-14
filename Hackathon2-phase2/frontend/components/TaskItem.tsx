'use client';

import { useState } from 'react';
import { updateTask, deleteTask, Task } from '@/lib/api';
import useApi from '@/lib/useApi';
import { taskUpdateQueue } from '@/lib/requestQueue';
import { PriorityBadge } from './PriorityBadge';
import { TaskTags } from './TaskTags';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use the custom API hook for better error handling
  const updateApi = useApi<Task>();
  const deleteApi = useApi<void>();

  const handleToggleCompletion = async () => {
    // Prevent multiple rapid clicks
    if (isUpdating) return;

    setIsUpdating(true);
    const previousState = isCompleted;

    // Optimistic update - update UI immediately
    setIsCompleted(!isCompleted);

    try {
      // Use queue to ensure sequential updates
      const updatedTask = await taskUpdateQueue.enqueue(
        `toggle-${task.id}`,
        () => updateTask(task.id, { is_completed: !previousState })
      );

      setIsCompleted(updatedTask.is_completed);
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Failed to update task completion:', error);
      // Revert the UI state if the API call failed
      setIsCompleted(previousState);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setTitle(task.title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setTitle(task.title);
  };

  const handleEditSave = async () => {
    if (isUpdating || title.trim() === '') {
      // If title is empty, revert to the original title
      setTitle(task.title);
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedTask = await taskUpdateQueue.enqueue(
        `edit-${task.id}`,
        () => updateTask(task.id, { title: title.trim() })
      );

      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task title:', error);
      // Revert to the original title if the API call failed
      setTitle(task.title);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await taskUpdateQueue.enqueue(
        `delete-${task.id}`,
        () => deleteTask(task.id)
      );
      onTaskDeleted(task.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Error display for operations */}
      {(updateApi.error || deleteApi.error) && (
        <div className="mb-2 p-3 bg-error-500/10 border border-error-500 rounded-sm text-error-500 text-[10px] font-robot uppercase tracking-widest">
          {updateApi.error?.message || deleteApi.error?.message}
        </div>
      )}

      <div className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-sm transition-all duration-300 relative ${isCompleted
        ? 'bg-neon-cyan/5 border border-neon-cyan/10 opacity-60'
        : 'glass-panel bg-black/40 border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)]'
        }`}>

        {/* Animated accent line for high priority */}
        {task.priority === 'high' && !isCompleted && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-magenta animate-pulse shadow-[0_0_10px_rgba(255,0,255,0.5)]"></div>
        )}

        <div className="flex items-start md:items-center gap-6 flex-1 w-full relative z-10">
          <button
            onClick={handleToggleCompletion}
            disabled={isUpdating}
            className={`flex-shrink-0 w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all duration-300 mt-1 md:mt-0 ${isCompleted
              ? 'bg-neon-lime border-neon-lime shadow-[0_0_10px_rgba(57,255,20,0.5)]'
              : 'border-neon-cyan/30 hover:border-neon-cyan bg-transparent'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={isCompleted ? 'Deactivate Task' : 'Activate Task'}
          >
            {isCompleted && (
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isUpdating && !isCompleted && (
              <div className="w-3 h-3 border-2 border-neon-cyan border-t-transparent animate-spin"></div>
            )}
          </button>

          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditCancel}
              autoFocus
              className="flex-1 input-cyber py-1.5 w-full text-sm"
              aria-label="Edit command data"
            />
          ) : (
            <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <h3
                  className={`text-base font-robot tracking-widest cursor-pointer transition-all break-words uppercase ${isCompleted ? 'line-through text-neon-cyan/30' : 'text-white hover:text-neon-cyan'
                    }`}
                  onClick={handleEditStart}
                >
                  {task.title}
                </h3>
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {task.tags && task.tags.length > 0 && (
                  <TaskTags tags={task.tags} />
                )}
                <span className="text-[10px] font-robot text-neon-cyan/40 uppercase tracking-widest">
                  Recorded_at: {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).replace(/\d{4}/, '20XX')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4 md:mt-0 md:ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 self-end md:self-auto relative z-10">
          {isEditing ? (
            <>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center border border-neon-lime text-neon-lime hover:bg-neon-lime/10 transition-all"
                aria-label="Confirm update"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center border border-neon-magenta/40 text-neon-magenta/40 hover:text-neon-magenta hover:border-neon-magenta transition-all"
                aria-label="Abort update"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditStart}
                className="w-8 h-8 flex items-center justify-center border border-neon-cyan/20 text-neon-cyan/40 hover:text-neon-cyan hover:border-neon-cyan transition-all"
                aria-label="Edit task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => !isUpdating && setShowDeleteConfirm(true)}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center border border-neon-magenta/20 text-neon-magenta/40 hover:text-neon-magenta hover:border-neon-magenta transition-all"
                aria-label="Purge data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog - Cyberpunk Style */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 max-w-md w-full border-neon-magenta shadow-[0_0_50px_rgba(255,0,255,0.2)]">
              <div className="hud-corner top-0 left-0 border-neon-magenta border-r-0 border-b-0"></div>
              <div className="hud-corner top-0 right-0 border-neon-magenta border-l-0 border-b-0"></div>

              <h3 className="text-2xl font-robot text-neon-magenta mb-4 tracking-tighter uppercase">Confirm_Purge?</h3>
              <p className="text-neon-cyan/60 font-robot text-xs mb-8 uppercase leading-relaxed tracking-wider">
                Warning: This process is irreversible. Target data will be permanently overwritten in the neural archive.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteApi.loading}
                  className="px-6 py-2 border border-neon-cyan/40 text-neon-cyan/40 hover:text-neon-cyan hover:border-neon-cyan transition-all font-robot text-xs uppercase tracking-widest"
                >
                  Abort_Status
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteApi.loading}
                  className="px-6 py-2 bg-neon-magenta/10 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-all font-robot text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                >
                  {deleteApi.loading ? 'Purging...' : 'Execute_Purge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}