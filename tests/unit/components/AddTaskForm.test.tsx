import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskForm } from '../../../src/components/AddTaskForm';
import { vi } from 'vitest';

describe('AddTaskForm', () => {
  const mockOnAddTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddTask.mockResolvedValue(undefined);
  });

  describe('Form Display', () => {
    it('should render collapsed form initially', () => {
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      expect(screen.getByText('Add New Task')).toBeInTheDocument();
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    });

    it('should expand form when clicked', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));

      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    });

    it('should show required field indicator', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require title field', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('should validate title length', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'a'.repeat(201));
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(screen.getByText('Title must be 200 characters or less')).toBeInTheDocument();
      });
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('should validate description length', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Valid Title');
      await user.type(screen.getByLabelText(/Description/), 'a'.repeat(1001));
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(screen.getByText('Description must be 1000 characters or less')).toBeInTheDocument();
      });
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit valid task with all fields', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'New Task');
      await user.type(screen.getByLabelText(/Description/), 'Task description');
      await user.type(screen.getByLabelText(/Due Date/), '2025-12-01T10:00');
      await user.selectOptions(screen.getByLabelText(/Category/), 'Work');
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(mockOnAddTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Task description',
          due_date: '2025-12-01T10:00',
          category: 'Work',
        });
      });
    });

    it('should submit task with only required fields', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Simple Task');
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(mockOnAddTask).toHaveBeenCalledWith({
          title: 'Simple Task',
          description: undefined,
          due_date: undefined,
          category: undefined,
        });
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Test Task');
      await user.type(screen.getByLabelText(/Description/), 'Test Description');
      await user.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(mockOnAddTask).toHaveBeenCalled();
      });

      // Form should collapse and reset
      expect(screen.queryByLabelText(/Title/)).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnAddTask.mockReturnValue(pendingPromise);

      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Loading Task');
      await user.click(screen.getByText('Add Task'));

      expect(screen.getByText('Adding...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Adding/ })).toBeDisabled();

      resolvePromise!();
      await waitFor(() => {
        expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Cancellation', () => {
    it('should cancel and reset form', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.type(screen.getByLabelText(/Title/), 'Cancel Me');
      await user.type(screen.getByLabelText(/Description/), 'This will be canceled');
      await user.click(screen.getByText('Cancel'));

      // Form should collapse
      expect(screen.queryByLabelText(/Title/)).not.toBeInTheDocument();
      expect(mockOnAddTask).not.toHaveBeenCalled();

      // Expand again to verify fields are reset
      await user.click(screen.getByText('Add New Task'));
      expect(screen.getByLabelText(/Title/)).toHaveValue('');
      expect(screen.getByLabelText(/Description/)).toHaveValue('');
    });

    it('should clear validation errors when canceling', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));
      await user.click(screen.getByText('Add Task')); // Submit without title

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));
      await user.click(screen.getByText('Add New Task'));

      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const expandButton = screen.getByRole('button', { name: /Add New Task/ });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper form labels and required attributes', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      await user.click(screen.getByText('Add New Task'));

      const titleInput = screen.getByLabelText(/Title/);
      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(titleInput).toHaveAttribute('maxLength', '200');

      const descriptionInput = screen.getByLabelText(/Description/);
      expect(descriptionInput).toHaveAttribute('maxLength', '1000');
    });
  });
});