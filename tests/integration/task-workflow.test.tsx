import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { vi } from 'vitest';

// Mock the API module for integration testing
vi.mock('../../src/utils/api', () => ({
  api: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

// Import the mocked API after mocking
import { api } from '../../src/utils/api';
const mockApi = vi.mocked(api);

describe('Task Workflow Integration', () => {
  const mockTask = {
    id: 1,
    title: 'Integration Test Task',
    description: 'Test Description',
    is_completed: false,
    created_at: '2025-11-27T20:00:00.000Z',
    due_date: '2025-12-01T10:00:00.000Z',
    category: 'Work' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getTasks.mockResolvedValue([]);
    mockApi.createTask.mockResolvedValue(mockTask);
    mockApi.updateTask.mockResolvedValue(undefined);
    mockApi.deleteTask.mockResolvedValue(undefined);
  });

  describe('Complete Task Lifecycle', () => {
    it('should create, complete, and delete task', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Create task
      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Integration Test Task');
      await user.type(screen.getByLabelText(/Description/), 'Test Description');
      await user.selectOptions(screen.getByLabelText(/Category/), 'Work');
      await user.click(screen.getByText('Add Task'));

      // Verify task creation
      await waitFor(() => {
        expect(mockApi.createTask).toHaveBeenCalledWith({
          title: 'Integration Test Task',
          description: 'Test Description',
          due_date: undefined,
          category: 'Work',
          is_completed: false,
        });
      });

      // Complete task
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalledWith(1, {
          is_completed: true,
          completed_at: expect.any(String),
        });
      });

      // Delete task
      const deleteButton = screen.getByLabelText(/Delete task/);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockApi.deleteTask).toHaveBeenCalledWith(1);
      });
    });

    it('should handle task creation with all optional fields', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Complete Task');
      await user.type(screen.getByLabelText(/Description/), 'Full description');
      await user.type(screen.getByLabelText(/Due Date/), '2025-12-01T10:00');
      await user.selectOptions(screen.getByLabelText(/Category/), 'Personal');
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(mockApi.createTask).toHaveBeenCalledWith({
          title: 'Complete Task',
          description: 'Full description',
          due_date: '2025-12-01T10:00',
          category: 'Personal',
          is_completed: false,
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API failures gracefully', async () => {
      mockApi.createTask.mockRejectedValue(new Error('API Error'));
      
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Failed Task');
      await user.click(screen.getByText('Add Task'));

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(mockApi.createTask).toHaveBeenCalled();
      });

      // App should still be functional
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    it('should handle network connectivity issues', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Network error'));
      
      render(<App />);

      // Should handle initial load failure
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // App should still render basic UI
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates Simulation', () => {
    it('should handle optimistic updates correctly', async () => {
      const user = userEvent.setup();
      mockApi.getTasks.mockResolvedValue([mockTask]);
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
      });

      // Simulate optimistic update
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Should immediately show as completed (optimistic)
      expect(checkbox).toBeChecked();

      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalled();
      });
    });

    it('should rollback on API failure', async () => {
      const user = userEvent.setup();
      mockApi.getTasks.mockResolvedValue([mockTask]);
      mockApi.updateTask.mockRejectedValue(new Error('Update failed'));
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      // Should rollback to unchecked state
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('User Experience Integration', () => {
    it('should provide immediate feedback for user actions', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Form should expand immediately
      await user.click(screen.getByText('Add New Task'));
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();

      // Form should collapse immediately on cancel
      await user.click(screen.getByText('Cancel'));
      expect(screen.queryByLabelText(/Title/)).not.toBeInTheDocument();
    });

    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup();
      mockApi.getTasks.mockResolvedValue([mockTask]);
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
      });

      // Rapid clicks should be handled gracefully
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      // Should handle multiple rapid state changes
      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalled();
      });
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across operations', async () => {
      const user = userEvent.setup();
      const tasks = [
        { ...mockTask, id: 1, title: 'Task 1' },
        { ...mockTask, id: 2, title: 'Task 2', is_completed: true },
      ];
      mockApi.getTasks.mockResolvedValue(tasks);
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });

      // Verify initial state consistency
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked(); // Task 1
      expect(checkboxes[1]).toBeChecked();     // Task 2

      // Update one task
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalledWith(1, {
          is_completed: true,
          completed_at: expect.any(String),
        });
      });

      // Other task should remain unchanged
      expect(checkboxes[1]).toBeChecked();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large task lists efficiently', async () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTask,
        id: i + 1,
        title: `Task ${i + 1}`,
      }));
      mockApi.getTasks.mockResolvedValue(largeTasks);
      
      const startTime = performance.now();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 1000ms)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle rapid API calls without race conditions', async () => {
      const user = userEvent.setup();
      mockApi.getTasks.mockResolvedValue([mockTask]);
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
      });

      // Simulate rapid operations
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(user.click(screen.getByRole('checkbox')));
      }

      await Promise.all(promises);

      // Should handle all operations without errors
      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalled();
      });
    });
  });
});