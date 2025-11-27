import { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag, Clock } from 'lucide-react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(
    task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''
  );
  const [editCategory, setEditCategory] = useState<'Work' | 'Personal' | 'Shopping' | 'Health' | ''>(
    task.category || ''
  );
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!editTitle.trim()) {
      newErrors.title = 'Title is required';
    } else if (editTitle.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (editDescription && editDescription.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = () => {
    if (!validateForm()) return;

    onEdit({
      ...task,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      due_date: editDueDate || undefined,
      category: editCategory || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
    setEditCategory(task.category || '');
    setErrors({});
    setIsEditing(false);
  };

  const categoryColors = {
    Work: 'bg-blue-100 text-blue-600',
    Personal: 'bg-green-100 text-green-600',
    Shopping: 'bg-purple-100 text-purple-600',
    Health: 'bg-red-100 text-red-600',
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm space-y-3">
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Task title"
            maxLength={200}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Description"
            rows={3}
            maxLength={1000}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="datetime-local"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select category</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all ${
        task.is_completed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id, !task.is_completed)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            task.is_completed
              ? 'bg-blue-600 border-blue-600 flex items-center justify-center'
              : 'border-gray-300 hover:border-blue-600'
          }`}
          aria-checked={task.is_completed}
          role="checkbox"
          aria-label={`Mark task "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
        >
          {task.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold ${
              task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-base mt-2 ${
                task.is_completed ? 'line-through text-gray-500' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
            {task.category && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[task.category]}`}>
                  {task.category}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(task.created_at)}</span>
            </div>
            {task.is_completed && task.completed_at && (
              <div className="flex items-center gap-1 text-green-600">
                <span>Completed: {formatDate(task.completed_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={`Edit task "${task.title}"`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
            aria-label={`Delete task "${task.title}"`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
