import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../../src/hooks/useTasks';
import { vi } from 'vitest';

// Mock the API module
const mockApi = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
};

vi.mock('../../../src/utils/api', () => ({
  api: mockApi,
}));

describe('useTasks', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    is_completed: false,
    created_at: '2025-11-27T20:00:00.000Z',
    due_date: '2025-12-01T10:00:00.000Z',
    category: 'Work' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getTasks.mockResolvedValue([mockTask]);
    mockApi.createTask.mockResolvedValue({ ...mockTask, id: 2 });
    mockApi.updateTask.mockResolvedValue(undefined);
    mockApi.deleteTask.mockResolvedValue(undefined);
  });

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useTasks());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.isConnected).toBe(true);
    });

    it('should load tasks on mount', async () => {
      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApi.getTasks).toHaveBeenCalledTimes(1);
      expect(result.current.tasks).toEqual([mockTask]);
      expect(result.current.error).toBe(null);
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle loading error', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBe('Failed to load tasks');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Add Task', () => {
    it('should add task optimistically', async () => {
      const { result } = renderHook(() => useTasks());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newTaskData = {
        title: 'New Task',
        description: 'New Description',
      };

      let addResult: any;
      await act(async () => {
        addResult = await result.current.addTask(newTaskData);
      });

      expect(addResult.success).toBe(true);
      expect(mockApi.createTask).toHaveBeenCalledWith({
        ...newTaskData,
        is_completed: false,
      });
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0]).toEqual({ ...mockTask, id: 2 });
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle add task failure', async () => {
      mockApi.createTask.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let addResult: any;
      await act(async () => {
        addResult = await result.current.addTask({ title: 'Failed Task' });
      });

      expect(addResult.success).toBe(false);
      expect(addResult.error).toBe('Failed to add task');
      expect(result.current.error).toBe('Failed to add task');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Toggle Task Complete', () => {
    it('should toggle task completion optimistically', async () => {
      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let toggleResult: any;
      await act(async () => {
        toggleResult = await result.current.toggleTaskComplete(1, true);
      });

      expect(toggleResult.success).toBe(true);
      expect(mockApi.updateTask).toHaveBeenCalledWith(1, {
        is_completed: true,
        completed_at: expect.any(String),
      });

      const updatedTask = result.current.tasks.find(t => t.id === 1);
      expect(updatedTask?.is_completed).toBe(true);
      expect(updatedTask?.completed_at).toBeDefined();
    });

    it('should rollback on toggle failure', async () => {
      mockApi.updateTask.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalTasks = [...result.current.tasks];

      let toggleResult: any;
      await act(async () => {
        toggleResult = await result.current.toggleTaskComplete(1, true);
      });

      expect(toggleResult.success).toBe(false);
      expect(toggleResult.error).toBe('Failed to update task');
      expect(result.current.tasks).toEqual(originalTasks);
      expect(result.current.error).toBe('Failed to update task');
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle uncomplete task', async () => {
      const completedTask = { ...mockTask, is_completed: true, completed_at: '2025-11-27T21:00:00.000Z' };
      mockApi.getTasks.mockResolvedValue([completedTask]);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTaskComplete(1, false);
      });

      expect(mockApi.updateTask).toHaveBeenCalledWith(1, {
        is_completed: false,
        completed_at: undefined,
      });

      const updatedTask = result.current.tasks.find(t => t.id === 1);
      expect(updatedTask?.is_completed).toBe(false);
      expect(updatedTask?.completed_at).toBeUndefined();
    });
  });

  describe('Update Task', () => {
    it('should update task optimistically', async () => {
      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedTask = { ...mockTask, title: 'Updated Title' };

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateTask(updatedTask);
      });

      expect(updateResult.success).toBe(true);
      expect(mockApi.updateTask).toHaveBeenCalledWith(1, updatedTask);
      expect(result.current.tasks[0].title).toBe('Updated Title');
    });

    it('should rollback on update failure', async () => {
      mockApi.updateTask.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalTasks = [...result.current.tasks];
      const updatedTask = { ...mockTask, title: 'Failed Update' };

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateTask(updatedTask);
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Failed to update task');
      expect(result.current.tasks).toEqual(originalTasks);
      expect(result.current.error).toBe('Failed to update task');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Delete Task', () => {
    it('should delete task optimistically', async () => {
      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteTask(1);
      });

      expect(deleteResult.success).toBe(true);
      expect(mockApi.deleteTask).toHaveBeenCalledWith(1);
      expect(result.current.tasks).toHaveLength(0);
    });

    it('should rollback on delete failure', async () => {
      mockApi.deleteTask.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalTasks = [...result.current.tasks];

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteTask(1);
      });

      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toBe('Failed to delete task');
      expect(result.current.tasks).toEqual(originalTasks);
      expect(result.current.error).toBe('Failed to delete task');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Connection State Management', () => {
    it('should reset connection state on successful operation', async () => {
      // Start with a failed state
      mockApi.getTasks.mockRejectedValue(new Error('Initial failure'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      // Reset mock to succeed
      mockApi.createTask.mockResolvedValue({ ...mockTask, id: 2 });

      await act(async () => {
        await result.current.addTask({ title: 'Recovery Task' });
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should maintain error state until successful operation', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load tasks');
        expect(result.current.isConnected).toBe(false);
      });

      // Another failed operation should maintain error state
      mockApi.createTask.mockRejectedValue(new Error('Still failing'));

      await act(async () => {
        await result.current.addTask({ title: 'Still Failing' });
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Failed to add task');
    });
  });

  describe('Optimistic UI Patterns', () => {
    it('should update UI immediately before API call', async () => {
      let apiCallMade = false;
      mockApi.createTask.mockImplementation(async () => {
        apiCallMade = true;
        return { ...mockTask, id: 2 };
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const promise = result.current.addTask({ title: 'Optimistic Task' });
        
        // UI should update immediately, before API call completes
        expect(result.current.tasks).toHaveLength(2);
        expect(apiCallMade).toBe(false);
        
        await promise;
      });

      expect(apiCallMade).toBe(true);
    });

    it('should preserve optimistic updates on success', async () => {
      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTaskComplete(1, true);
      });

      // Task should remain completed after API success
      const task = result.current.tasks.find(t => t.id === 1);
      expect(task?.is_completed).toBe(true);
      expect(task?.completed_at).toBeDefined();
    });

    it('should rollback optimistic updates on failure', async () => {
      mockApi.updateTask.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalTask = result.current.tasks.find(t => t.id === 1);
      expect(originalTask?.is_completed).toBe(false);

      await act(async () => {
        await result.current.toggleTaskComplete(1, true);
      });

      // Should rollback to original state
      const rolledBackTask = result.current.tasks.find(t => t.id === 1);
      expect(rolledBackTask?.is_completed).toBe(false);
      expect(rolledBackTask?.completed_at).toBeUndefined();
    });
  });
});