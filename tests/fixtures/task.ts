import type { Task, TaskCreateInput, TaskUpdateInput, TaskDbRecord } from '../../schema/unified-schema';
import { TaskCategory, TaskPriority } from '../../schema/unified-schema';

/**
 * Mock task for testing - represents a complete task object
 */
export const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'This is a test task description',
  is_completed: false,
  created_at: '2025-11-27T20:00:00.000Z',
  completed_at: undefined,
  due_date: '2025-12-01T10:00:00.000Z',
  category: TaskCategory.WORK,
  priority: TaskPriority.MEDIUM,
  user_id: undefined,
  updated_at: '2025-11-27T20:00:00.000Z'
};

/**
 * Mock completed task
 */
export const mockCompletedTask: Task = {
  id: 2,
  title: 'Completed Task',
  description: 'This task is already completed',
  is_completed: true,
  created_at: '2025-11-26T10:00:00.000Z',
  completed_at: '2025-11-27T15:30:00.000Z',
  due_date: '2025-11-28T10:00:00.000Z',
  category: TaskCategory.PERSONAL,
  priority: TaskPriority.HIGH,
  user_id: undefined,
  updated_at: '2025-11-27T15:30:00.000Z'
};

/**
 * Mock overdue task
 */
export const mockOverdueTask: Task = {
  id: 3,
  title: 'Overdue Task',
  description: 'This task is overdue',
  is_completed: false,
  created_at: '2025-11-20T10:00:00.000Z',
  completed_at: undefined,
  due_date: '2025-11-25T10:00:00.000Z',
  category: TaskCategory.HEALTH,
  priority: TaskPriority.URGENT,
  user_id: undefined,
  updated_at: '2025-11-20T10:00:00.000Z'
};

/**
 * Mock task without optional fields
 */
export const mockMinimalTask: Task = {
  id: 4,
  title: 'Minimal Task',
  description: undefined,
  is_completed: false,
  created_at: '2025-11-27T20:00:00.000Z',
  completed_at: undefined,
  due_date: undefined,
  category: undefined,
  priority: TaskPriority.MEDIUM,
  user_id: undefined,
  updated_at: '2025-11-27T20:00:00.000Z'
};

/**
 * Mock database record - with nullable fields
 */
export const mockTaskDbRecord: TaskDbRecord = {
  id: 1,
  title: 'Test Task',
  description: 'This is a test task description',
  is_completed: false,
  created_at: '2025-11-27T20:00:00.000Z',
  completed_at: null,
  due_date: '2025-12-01T10:00:00.000Z',
  category: TaskCategory.WORK,
  priority: TaskPriority.MEDIUM,
  user_id: null,
  updated_at: '2025-11-27T20:00:00.000Z'
};

/**
 * Mock task creation input
 */
export const mockTaskCreateInput: TaskCreateInput = {
  title: 'New Task',
  description: 'This is a new task',
  due_date: '2025-12-01T10:00:00.000Z',
  category: TaskCategory.WORK,
  priority: TaskPriority.MEDIUM,
  user_id: undefined
};

/**
 * Mock task update input
 */
export const mockTaskUpdateInput: TaskUpdateInput = {
  title: 'Updated Task',
  description: 'This task has been updated',
  is_completed: true,
  completed_at: '2025-11-27T21:00:00.000Z'
};

/**
 * Factory function to create mock tasks with overrides
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    ...mockTask,
    ...overrides
  };
}

/**
 * Factory function to create mock database records with overrides
 */
export function createMockTaskDbRecord(overrides: Partial<TaskDbRecord> = {}): TaskDbRecord {
  return {
    ...mockTaskDbRecord,
    ...overrides
  };
}

/**
 * Factory function to create mock task creation input with overrides
 */
export function createMockTaskCreateInput(overrides: Partial<TaskCreateInput> = {}): TaskCreateInput {
  return {
    ...mockTaskCreateInput,
    ...overrides
  };
}

/**
 * Factory function to create mock task update input with overrides
 */
export function createMockTaskUpdateInput(overrides: Partial<TaskUpdateInput> = {}): TaskUpdateInput {
  return {
    ...mockTaskUpdateInput,
    ...overrides
  };
}

/**
 * Array of mock tasks for list testing
 */
export const mockTaskList: Task[] = [
  mockTask,
  mockCompletedTask,
  mockOverdueTask,
  mockMinimalTask
];

/**
 * Mock tasks by category
 */
export const mockTasksByCategory = {
  [TaskCategory.WORK]: [mockTask],
  [TaskCategory.PERSONAL]: [mockCompletedTask],
  [TaskCategory.HEALTH]: [mockOverdueTask],
  [TaskCategory.SHOPPING]: []
};

/**
 * Mock tasks by priority
 */
export const mockTasksByPriority = {
  [TaskPriority.LOW]: [],
  [TaskPriority.MEDIUM]: [mockTask, mockMinimalTask],
  [TaskPriority.HIGH]: [mockCompletedTask],
  [TaskPriority.URGENT]: [mockOverdueTask]
};

/**
 * Mock invalid task data for validation testing
 */
export const mockInvalidTaskData = {
  emptyTitle: { title: '', description: 'Valid description' },
  longTitle: { title: 'a'.repeat(201), description: 'Valid description' },
  longDescription: { title: 'Valid title', description: 'a'.repeat(1001) },
  invalidCategory: { title: 'Valid title', category: 'InvalidCategory' },
  invalidPriority: { title: 'Valid title', priority: 'InvalidPriority' },
  invalidDate: { title: 'Valid title', due_date: 'invalid-date' },
  pastDueDate: { title: 'Valid title', due_date: '2020-01-01T10:00:00.000Z' }
};