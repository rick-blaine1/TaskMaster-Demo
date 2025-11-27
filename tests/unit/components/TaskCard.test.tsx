import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../../../src/components/TaskCard';
import { Task } from '../../../src/types/task';
import { vi } from 'vitest';

// Create a mock task factory for the component's Task type
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  is_completed: false,
  created_at: '2025-11-27T20:00:00.000Z',
  completed_at: undefined,
  due_date: '2025-12-01T10:00:00.000Z',
  category: 'Work',
  ...overrides,
});

describe('TaskCard', () => {
  const mockProps = {
    onToggleComplete: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('should render task information correctly', () => {
      const task = createMockTask({
        title: 'Test Task',
        description: 'Test Description',
        category: 'Work',
        due_date: '2025-12-01T10:00:00Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render completed task with proper styling', () => {
      const task = createMockTask({
        title: 'Completed Task',
        is_completed: true,
        completed_at: '2025-11-27T10:00:00Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      const title = screen.getByText('Completed Task');
      expect(title).toHaveClass('line-through', 'text-gray-500');
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    });

    it('should render task without optional fields', () => {
      const task = createMockTask({
        title: 'Simple Task',
        description: undefined,
        category: undefined,
        due_date: undefined,
      });

      render(<TaskCard task={task} {...mockProps} />);

      expect(screen.getByText('Simple Task')).toBeInTheDocument();
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Personal')).not.toBeInTheDocument();
    });

    it('should display category with correct styling', () => {
      const categories = [
        { category: 'Work', expectedClass: 'bg-blue-100 text-blue-600' },
        { category: 'Personal', expectedClass: 'bg-green-100 text-green-600' },
        { category: 'Shopping', expectedClass: 'bg-purple-100 text-purple-600' },
        { category: 'Health', expectedClass: 'bg-red-100 text-red-600' },
      ] as const;

      categories.forEach(({ category, expectedClass }) => {
        const task = createMockTask({ category });
        const { unmount } = render(<TaskCard task={task} {...mockProps} />);
        
        const categoryElement = screen.getByText(category);
        expect(categoryElement).toHaveClass(expectedClass);
        
        unmount();
      });
    });

    it('should format dates correctly', () => {
      const task = createMockTask({
        created_at: '2025-11-27T14:30:00Z',
        due_date: '2025-12-01T09:00:00Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      // Check that dates are formatted (exact format may vary by locale)
      expect(screen.getByText(/Nov 27, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/Dec 1, 2025/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onToggleComplete when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ is_completed: false });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByRole('checkbox'));

      expect(mockProps.onToggleComplete).toHaveBeenCalledWith(task.id, true);
    });

    it('should call onToggleComplete with false for completed task', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ is_completed: true });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByRole('checkbox'));

      expect(mockProps.onToggleComplete).toHaveBeenCalledWith(task.id, false);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask();

      render(<TaskCard task={task} {...mockProps} />);

      const deleteButton = screen.getByLabelText(`Delete task "${task.title}"`);
      await user.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith(task.id);
    });

    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Edit Me' });

      render(<TaskCard task={task} {...mockProps} />);

      const editButton = screen.getByLabelText(`Edit task "${task.title}"`);
      await user.click(editButton);

      // Should show edit form
      expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should populate edit form with current task data', async () => {
      const user = userEvent.setup();
      const task = createMockTask({
        title: 'Original Title',
        description: 'Original Description',
        category: 'Work',
        due_date: '2025-12-01T10:00:00Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));

      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-12-01T10:00')).toBeInTheDocument();
    });

    it('should validate required title field', async () => {
      const user = userEvent.setup();
      const task = createMockTask();

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      const titleInput = screen.getByDisplayValue(task.title);
      await user.clear(titleInput);
      await user.click(screen.getByText('Save'));

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('should validate title length', async () => {
      const user = userEvent.setup();
      const task = createMockTask();

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      const titleInput = screen.getByDisplayValue(task.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'a'.repeat(201));
      
      // Wait for validation to trigger
      await waitFor(async () => {
        await user.click(screen.getByText('Save'));
      });

      await waitFor(() => {
        expect(screen.getByText('Title must be 200 characters or less')).toBeInTheDocument();
      });
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('should validate description length', async () => {
      const user = userEvent.setup();
      const task = createMockTask();

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      const descriptionInput = screen.getByDisplayValue(task.description || '');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'a'.repeat(1001));
      
      // Wait for validation to trigger
      await waitFor(async () => {
        await user.click(screen.getByText('Save'));
      });

      await waitFor(() => {
        expect(screen.getByText('Description must be 1000 characters or less')).toBeInTheDocument();
      });
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('should save valid edits', async () => {
      const user = userEvent.setup();
      const task = createMockTask({
        title: 'Original',
        description: 'Original desc',
        due_date: '2025-12-01T10:00:00.000Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      const titleInput = screen.getByDisplayValue('Original');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const descriptionInput = screen.getByDisplayValue('Original desc');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');

      await user.click(screen.getByText('Save'));

      expect(mockProps.onEdit).toHaveBeenCalledWith({
        ...task,
        title: 'Updated Title',
        description: 'Updated description',
        due_date: '2025-12-01T10:00', // datetime-local format
      });
    });

    it('should handle empty optional fields correctly', async () => {
      const user = userEvent.setup();
      const task = createMockTask({
        description: 'Some description',
        category: 'Work',
        due_date: '2025-12-01T10:00:00Z',
      });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      // Clear optional fields
      await user.clear(screen.getByDisplayValue('Some description'));
      await user.selectOptions(screen.getByDisplayValue('Work'), '');
      await user.clear(screen.getByDisplayValue('2025-12-01T10:00'));

      await user.click(screen.getByText('Save'));

      expect(mockProps.onEdit).toHaveBeenCalledWith({
        ...task,
        description: undefined,
        category: undefined,
        due_date: undefined,
      });
    });

    it('should cancel edit and restore original values', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Original Title' });

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      const titleInput = screen.getByDisplayValue('Original Title');
      await user.clear(titleInput);
      await user.type(titleInput, 'Changed Title');

      await user.click(screen.getByText('Cancel'));

      // Should exit edit mode and not call onEdit
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('should clear validation errors when canceling', async () => {
      const user = userEvent.setup();
      const task = createMockTask();

      render(<TaskCard task={task} {...mockProps} />);

      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));
      
      // Create validation error
      const titleInput = screen.getByDisplayValue(task.title);
      await user.clear(titleInput);
      await user.click(screen.getByText('Save'));

      expect(screen.getByText('Title is required')).toBeInTheDocument();

      // Cancel should clear errors
      await user.click(screen.getByText('Cancel'));
      await user.click(screen.getByLabelText(`Edit task "${task.title}"`));

      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      const task = createMockTask({ title: 'Accessible Task' });

      render(<TaskCard task={task} {...mockProps} />);

      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-label',
        'Mark task "Accessible Task" as complete'
      );
      expect(screen.getByLabelText('Edit task "Accessible Task"')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete task "Accessible Task"')).toBeInTheDocument();
    });

    it('should have proper checkbox state attributes', () => {
      const completedTask = createMockTask({ is_completed: true });
      const incompleteTask = createMockTask({ is_completed: false });

      const { rerender } = render(<TaskCard task={completedTask} {...mockProps} />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');

      rerender(<TaskCard task={incompleteTask} {...mockProps} />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
  });
});