import { FileText } from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, isLoading, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading tasks">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-32 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600 mb-6">Get started by adding your first task above</p>
      </div>
    );
  }

  return (
    <div className="space-y-0" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <div key={task.id} role="listitem" className="animate-fadeIn">
          <TaskCard
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
