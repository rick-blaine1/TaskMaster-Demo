import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { AddTaskForm } from './components/AddTaskForm';
import { FilterControls } from './components/FilterControls';
import { TaskList } from './components/TaskList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast, ToastType } from './components/Toast';
import { useTasks } from './hooks/useTasks';
import { FilterType, SortType, Task } from './types/task';

interface ToastState {
  message: string;
  type: ToastType;
}

function App() {
  const { tasks, isLoading, isConnected, addTask, toggleTaskComplete, updateTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleAddTask = async (taskData: {
    title: string;
    description?: string;
    due_date?: string;
    category?: 'Work' | 'Personal' | 'Shopping' | 'Health';
  }) => {
    const result = await addTask(taskData);
    if (result.success) {
      showToast('Task added successfully!', 'success');
    } else {
      showToast('Failed to add task. Please try again.', 'error');
    }
  };

  const handleToggleComplete = async (id: number, isCompleted: boolean) => {
    const result = await toggleTaskComplete(id, isCompleted);
    if (result.success) {
      showToast(isCompleted ? 'Task completed!' : 'Task marked as active', 'success');
    } else {
      showToast('Failed to update task. Please try again.', 'error');
    }
  };

  const handleEdit = async (task: Task) => {
    const result = await updateTask(task);
    if (result.success) {
      showToast('Task updated successfully!', 'success');
    } else {
      showToast('Failed to update task. Please try again.', 'error');
    }
  };

  const handleDeleteRequest = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setDeleteConfirm({ id, title: task.title });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      const result = await deleteTask(deleteConfirm.id);
      if (result.success) {
        showToast('Task deleted successfully!', 'success');
      } else {
        showToast('Failed to delete task. Please try again.', 'error');
      }
      setDeleteConfirm(null);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (filter === 'active') {
      filtered = tasks.filter((task) => !task.is_completed);
    } else if (filter === 'completed') {
      filtered = tasks.filter((task) => task.is_completed);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.category?.toLowerCase().includes(searchLower)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sort === 'due') {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return sorted;
  }, [tasks, filter, search, sort]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header totalTasks={tasks.length} isConnected={isConnected} />

      <main className="max-w-5xl mx-auto p-6">
        <AddTaskForm onAddTask={handleAddTask} />
        <FilterControls
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          search={search}
          onSearchChange={setSearch}
        />
        <TaskList
          tasks={filteredAndSortedTasks}
          isLoading={isLoading}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      </main>

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          taskTitle={deleteConfirm.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
