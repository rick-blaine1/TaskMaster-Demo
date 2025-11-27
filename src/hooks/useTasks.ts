import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { api } from '../utils/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTasks();
      setTasks(data);
      setIsConnected(true);
    } catch (err) {
      setError('Failed to load tasks');
      setIsConnected(false);
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'completed_at' | 'is_completed'>) => {
    try {
      const newTask = await api.createTask({
        ...taskData,
        is_completed: false,
      });
      setTasks((prev) => [newTask, ...prev]);
      setIsConnected(true);
      return { success: true };
    } catch (err) {
      setError('Failed to add task');
      setIsConnected(false);
      console.error('Error adding task:', err);
      return { success: false, error: 'Failed to add task' };
    }
  };

  const toggleTaskComplete = async (id: number, isCompleted: boolean) => {
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : undefined,
            }
          : task
      )
    );

    try {
      await api.updateTask(id, {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : undefined,
      });
      setIsConnected(true);
      return { success: true };
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to update task');
      setIsConnected(false);
      console.error('Error updating task:', err);
      return { success: false, error: 'Failed to update task' };
    }
  };

  const updateTask = async (updatedTask: Task) => {
    const previousTasks = [...tasks];

    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));

    try {
      await api.updateTask(updatedTask.id, updatedTask);
      setIsConnected(true);
      return { success: true };
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to update task');
      setIsConnected(false);
      console.error('Error updating task:', err);
      return { success: false, error: 'Failed to update task' };
    }
  };

  const deleteTask = async (id: number) => {
    const previousTasks = [...tasks];

    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await api.deleteTask(id);
      setIsConnected(true);
      return { success: true };
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to delete task');
      setIsConnected(false);
      console.error('Error deleting task:', err);
      return { success: false, error: 'Failed to delete task' };
    }
  };

  return {
    tasks,
    isLoading,
    error,
    isConnected,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
  };
}
