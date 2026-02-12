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
      {/* Error display for update operations */}
      {updateApi.error && (
        <div className="mb-2 p-3 bg-error-50 border border-error-100 rounded-xl text-error-700 text-sm">
          {updateApi.error.message}
        </div>
      )}

      {/* Error display for delete operations */}
      {deleteApi.error && (
        <div className="mb-2 p-3 bg-error-50 border border-error-100 rounded-xl text-error-700 text-sm">
          {deleteApi.error.message}
        </div>
      )}

      <div className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl transition-all duration-500 ${isCompleted
        ? 'bg-neon-cyan/5 border border-neon-cyan/20'
        : 'glass-panel hover:border-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] hover:-translate-y-1'
        }`}>
        <div className="flex items-start md:items-center gap-4 flex-1 w-full">
          <button
            onClick={handleToggleCompletion}
            disabled={isUpdating}
            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1 md:mt-0 ${isCompleted
              ? 'bg-neon-cyan border-transparent shadow-[0_0_15px_rgba(0,243,255,0.6)]'
              : 'border-white/20 hover:border-neon-cyan/50 bg-white/5'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && (
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </svg>
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
              className="flex-1 input-neon py-2 w-full"
              aria-label="Edit task title"
            />
          ) : (
            <div className="flex-1 flex flex-col gap-1.5 min-w-0 w-full">
              <div className="flex flex-wrap items-start gap-2 md:gap-3">
                <h3
                  className={`text-lg font-semibold leading-snug cursor-pointer transition-colors break-words ${isCompleted ? 'line-through text-gray-500' : 'text-white hover:text-neon-cyan'
                    }`}
                  onClick={handleEditStart}
                >
                  {task.title}
                </h3>
                <PriorityBadge priority={task.priority} />
              </div>
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <TaskTags tags={task.tags} />
                </div>
              )}
              <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 md:mt-0 md:ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 self-end md:self-auto">
          {isEditing ? (
            <>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className={`w-9 h-9 flex items-center justify-center bg-neon-cyan text-black rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(0,243,255,0.3)] ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                  }`}
                aria-label="Save changes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isUpdating}
                className={`w-9 h-9 flex items-center justify-center bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                aria-label="Cancel edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => !isUpdating && setShowDeleteConfirm(true)}
              disabled={isUpdating}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-neon-pink hover:bg-neon-pink/10 transition-all duration-300 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300 border-neon-pink/20">
              <h3 className="text-xl font-bold text-white mb-2">Terminate Entity?</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                This action will permanently purge this task from the neural network. Do you wish to proceed?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteApi.loading}
                  className="px-6 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold uppercase tracking-widest text-xs"
                >
                  Abort
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteApi.loading}
                  className="px-6 py-2.5 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl hover:bg-neon-pink hover:text-white transition-all font-semibold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(255,0,127,0.2)]"
                >
                  {deleteApi.loading ? 'Purging...' : 'Confirm Purge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}