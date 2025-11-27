import { describe, it, expect } from 'vitest';
import {
  validateTask,
  validateTaskCreateInput,
  validateTaskUpdateInput,
  validateTaskDbRecord,
  validateTaskOperation,
  validateTaskCompletion,
  validateDueDate,
  validateDatabaseConstraints,
} from '../../../schema/validation';
import {
  mockTask,
  mockTaskCreateInput,
  mockTaskUpdateInput,
  mockTaskDbRecord,
  mockInvalidTaskData,
  createMockTask,
} from '../../fixtures/task';
import { TaskCategory, TaskPriority } from '../../../schema/unified-schema';

describe('Schema Validation', () => {
  describe('validateTask', () => {
    it('should validate a valid task', () => {
      const result = validateTask(mockTask);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTask);
      }
    });

    it('should reject task with invalid title', () => {
      const result = validateTask(mockInvalidTaskData.emptyTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('title'))).toBe(true);
      }
    });

    it('should reject task with title too long', () => {
      const result = validateTask(mockInvalidTaskData.longTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('title'))).toBe(true);
      }
    });

    it('should reject task with description too long', () => {
      const result = validateTask(mockInvalidTaskData.longDescription);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('description'))).toBe(true);
      }
    });
  });

  describe('validateTaskCreateInput', () => {
    it('should validate valid task creation input', () => {
      const result = validateTaskCreateInput(mockTaskCreateInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(mockTaskCreateInput.title);
        expect(result.data.priority).toBe(TaskPriority.MEDIUM);
      }
    });

    it('should apply default priority when not provided', () => {
      const input = { ...mockTaskCreateInput };
      delete input.priority;
      
      const result = validateTaskCreateInput(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(TaskPriority.MEDIUM);
      }
    });

    it('should reject invalid category', () => {
      const input = { ...mockTaskCreateInput, category: 'InvalidCategory' as any };
      const result = validateTaskCreateInput(input);
      expect(result.success).toBe(false);
    });
  });

  describe('validateTaskUpdateInput', () => {
    it('should validate valid task update input', () => {
      const result = validateTaskUpdateInput(mockTaskUpdateInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTaskUpdateInput);
      }
    });

    it('should allow partial updates', () => {
      const partialUpdate = { title: 'Updated Title' };
      const result = validateTaskUpdateInput(partialUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Updated Title');
      }
    });
  });

  describe('validateTaskDbRecord', () => {
    it('should validate valid database record', () => {
      const result = validateTaskDbRecord(mockTaskDbRecord);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTaskDbRecord);
      }
    });

    it('should handle nullable fields', () => {
      const recordWithNulls = {
        ...mockTaskDbRecord,
        description: null,
        completed_at: null,
        due_date: null,
        category: null,
        user_id: null,
      };
      
      const result = validateTaskDbRecord(recordWithNulls);
      expect(result.success).toBe(true);
    });
  });

  describe('validateTaskCompletion', () => {
    it('should pass for completed task with completed_at', () => {
      const task = createMockTask({
        is_completed: true,
        completed_at: '2025-11-27T21:00:00.000Z',
      });
      
      const errors = validateTaskCompletion(task);
      expect(errors).toHaveLength(0);
    });

    it('should fail for completed task without completed_at', () => {
      const task = createMockTask({
        is_completed: true,
        completed_at: undefined,
      });
      
      const errors = validateTaskCompletion(task);
      expect(errors).toContain('completed_at must be set when task is marked as completed');
    });

    it('should fail for incomplete task with completed_at', () => {
      const task = createMockTask({
        is_completed: false,
        completed_at: '2025-11-27T21:00:00.000Z',
      });
      
      const errors = validateTaskCompletion(task);
      expect(errors).toContain('completed_at must be null when task is not completed');
    });
  });

  describe('validateDueDate', () => {
    it('should pass for future due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const errors = validateDueDate(futureDate.toISOString());
      expect(errors).toHaveLength(0);
    });

    it('should fail for past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const errors = validateDueDate(pastDate.toISOString());
      expect(errors).toContain('due_date must be in the future');
    });

    it('should pass for undefined due date', () => {
      const errors = validateDueDate(undefined);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateDatabaseConstraints', () => {
    it('should pass for valid task data', () => {
      const errors = validateDatabaseConstraints(mockTask);
      expect(errors).toHaveLength(0);
    });

    it('should fail for title too short', () => {
      const errors = validateDatabaseConstraints({ title: '' });
      expect(errors).toContain('Title must be at least 1 character');
    });

    it('should fail for title too long', () => {
      const errors = validateDatabaseConstraints({ title: 'a'.repeat(201) });
      expect(errors).toContain('Title must be no more than 200 characters');
    });

    it('should fail for description too long', () => {
      const errors = validateDatabaseConstraints({ description: 'a'.repeat(1001) });
      expect(errors).toContain('Description must be no more than 1000 characters');
    });

    it('should fail for invalid category', () => {
      const errors = validateDatabaseConstraints({ category: 'InvalidCategory' as any });
      expect(errors).toContain('Category must be one of: Work, Personal, Shopping, Health');
    });

    it('should fail for invalid priority', () => {
      const errors = validateDatabaseConstraints({ priority: 'InvalidPriority' as any });
      expect(errors).toContain('Priority must be one of: low, medium, high, urgent');
    });
  });

  describe('validateTaskOperation', () => {
    it('should validate create operation', () => {
      const result = validateTaskOperation('create', mockTaskCreateInput);
      expect(result.success).toBe(true);
    });

    it('should validate update operation', () => {
      const result = validateTaskOperation('update', mockTaskUpdateInput);
      expect(result.success).toBe(true);
    });

    it('should fail create operation with past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const input = {
        ...mockTaskCreateInput,
        due_date: pastDate.toISOString(),
      };
      
      const result = validateTaskOperation('create', input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('due_date must be in the future');
      }
    });

    it('should fail operation with completion inconsistency', () => {
      const input = {
        is_completed: true,
        // missing completed_at
      };
      
      const result = validateTaskOperation('update', input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('completed_at must be set when task is marked as completed');
      }
    });
  });
});