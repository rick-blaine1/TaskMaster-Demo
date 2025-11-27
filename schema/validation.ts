/**
 * Zod Validation Schemas for TaskMaster-Demo
 * 
 * This file provides comprehensive validation for all data structures
 * using Zod schemas that match the unified schema definitions.
 */

import { z } from 'zod';
import {
  TaskCategory,
  TaskPriority,
  FilterType,
  SortType,
  TASK_CONSTRAINTS,
  type Task,
  type TaskCreateInput,
  type TaskUpdateInput,
  type TaskDbRecord,
  type TaskFilterOptions,
  type TaskSortOptions,
  type ApiResponse,
  type PaginatedResponse,
  type TaskStats
} from './unified-schema.ts';

// ============================================================================
// ENUM VALIDATION SCHEMAS
// ============================================================================

export const TaskCategorySchema = z.enum([
  TaskCategory.WORK,
  TaskCategory.PERSONAL,
  TaskCategory.SHOPPING,
  TaskCategory.HEALTH
]);

export const TaskPrioritySchema = z.enum([
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT
]);

export const FilterTypeSchema = z.enum([
  FilterType.ALL,
  FilterType.ACTIVE,
  FilterType.COMPLETED
]);

export const SortTypeSchema = z.enum([
  SortType.CREATED,
  SortType.DUE,
  SortType.TITLE,
  SortType.PRIORITY
]);

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

/**
 * ISO 8601 datetime string validation
 */
export const DateTimeSchema = z.string().datetime({ message: 'Must be a valid ISO 8601 datetime string' });

/**
 * Optional ISO 8601 datetime string validation
 */
export const OptionalDateTimeSchema = z.string().datetime().optional();

/**
 * UUID validation for user_id
 */
export const UuidSchema = z.string().uuid({ message: 'Must be a valid UUID' });

/**
 * Task title validation - matches database constraints
 */
export const TaskTitleSchema = z.string()
  .min(TASK_CONSTRAINTS.TITLE.MIN_LENGTH, `Title must be at least ${TASK_CONSTRAINTS.TITLE.MIN_LENGTH} character`)
  .max(TASK_CONSTRAINTS.TITLE.MAX_LENGTH, `Title must be no more than ${TASK_CONSTRAINTS.TITLE.MAX_LENGTH} characters`)
  .trim();

/**
 * Task description validation - matches database constraints
 */
export const TaskDescriptionSchema = z.string()
  .max(TASK_CONSTRAINTS.DESCRIPTION.MAX_LENGTH, `Description must be no more than ${TASK_CONSTRAINTS.DESCRIPTION.MAX_LENGTH} characters`)
  .trim()
  .optional();

// ============================================================================
// TASK VALIDATION SCHEMAS
// ============================================================================

/**
 * Core Task schema - validates complete task structure
 */
export const TaskSchema = z.object({
  id: z.number().int().positive(),
  title: TaskTitleSchema,
  description: TaskDescriptionSchema,
  is_completed: z.boolean(),
  created_at: DateTimeSchema,
  completed_at: OptionalDateTimeSchema,
  due_date: OptionalDateTimeSchema,
  category: TaskCategorySchema.optional(),
  priority: TaskPrioritySchema,
  user_id: UuidSchema.optional(),
  updated_at: DateTimeSchema
}).strict();

/**
 * Database record schema - handles nullable fields from PostgreSQL
 */
export const TaskDbRecordSchema = z.object({
  id: z.number().int().positive(),
  title: TaskTitleSchema,
  description: z.string().max(TASK_CONSTRAINTS.DESCRIPTION.MAX_LENGTH).nullable(),
  is_completed: z.boolean(),
  created_at: DateTimeSchema,
  completed_at: DateTimeSchema.nullable(),
  due_date: DateTimeSchema.nullable(),
  category: TaskCategorySchema.nullable(),
  priority: TaskPrioritySchema,
  user_id: UuidSchema.nullable(),
  updated_at: DateTimeSchema
}).strict();

/**
 * Task creation input schema
 */
export const TaskCreateInputSchema = z.object({
  title: TaskTitleSchema,
  description: TaskDescriptionSchema,
  due_date: OptionalDateTimeSchema,
  category: TaskCategorySchema.optional(),
  priority: TaskPrioritySchema.default(TaskPriority.MEDIUM),
  user_id: UuidSchema.optional()
}).strict();

/**
 * Task update input schema - all fields optional
 */
export const TaskUpdateInputSchema = z.object({
  title: TaskTitleSchema.optional(),
  description: TaskDescriptionSchema,
  is_completed: z.boolean().optional(),
  completed_at: OptionalDateTimeSchema,
  due_date: OptionalDateTimeSchema,
  category: TaskCategorySchema.optional(),
  priority: TaskPrioritySchema.optional(),
  user_id: UuidSchema.optional()
}).strict();

/**
 * Task filter options schema
 */
export const TaskFilterOptionsSchema = z.object({
  category: TaskCategorySchema.optional(),
  priority: TaskPrioritySchema.optional(),
  is_completed: z.boolean().optional(),
  user_id: UuidSchema.optional(),
  due_before: DateTimeSchema.optional(),
  due_after: DateTimeSchema.optional()
}).strict();

/**
 * Task sort options schema
 */
export const TaskSortOptionsSchema = z.object({
  field: SortTypeSchema,
  direction: z.enum(['asc', 'desc'])
}).strict();

// ============================================================================
// API RESPONSE VALIDATION SCHEMAS
// ============================================================================

/**
 * Generic API response schema
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional()
  }).strict();

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema).optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative()
    }).optional()
  }).strict();

/**
 * Task operation result schema
 */
export const TaskOperationResultSchema = ApiResponseSchema(TaskSchema).extend({
  task: TaskSchema.optional()
}).strict();

/**
 * Bulk operation result schema
 */
export const BulkOperationResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  affected: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(z.string()).optional()
}).strict();

// ============================================================================
// ANALYTICS VALIDATION SCHEMAS
// ============================================================================

/**
 * Task statistics schema
 */
export const TaskStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  byCategory: z.record(TaskCategorySchema, z.number().int().nonnegative()),
  byPriority: z.record(TaskPrioritySchema, z.number().int().nonnegative()),
  completionRate: z.number().min(0).max(100),
  averageCompletionTime: z.number().positive().optional()
}).strict();

/**
 * Task activity schema
 */
export const TaskActivitySchema = z.object({
  date: z.string().date(),
  created: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  deleted: z.number().int().nonnegative()
}).strict();

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate task data with detailed error reporting
 */
export function validateTask(data: unknown): { success: true; data: Task } | { success: false; errors: string[] } {
  const result = TaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

/**
 * Validate task creation input
 */
export function validateTaskCreateInput(data: unknown): { success: true; data: TaskCreateInput } | { success: false; errors: string[] } {
  const result = TaskCreateInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

/**
 * Validate task update input
 */
export function validateTaskUpdateInput(data: unknown): { success: true; data: TaskUpdateInput } | { success: false; errors: string[] } {
  const result = TaskUpdateInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

/**
 * Validate database record
 */
export function validateTaskDbRecord(data: unknown): { success: true; data: TaskDbRecord } | { success: false; errors: string[] } {
  const result = TaskDbRecordSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

/**
 * Validate filter options
 */
export function validateTaskFilterOptions(data: unknown): { success: true; data: TaskFilterOptions } | { success: false; errors: string[] } {
  const result = TaskFilterOptionsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

/**
 * Validate sort options
 */
export function validateTaskSortOptions(data: unknown): { success: true; data: TaskSortOptions } | { success: false; errors: string[] } {
  const result = TaskSortOptionsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
  };
}

// ============================================================================
// CROSS-LAYER VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that completed_at is set when is_completed is true
 */
export function validateTaskCompletion(task: Partial<Task>): string[] {
  const errors: string[] = [];
  
  if (task.is_completed === true && !task.completed_at) {
    errors.push('completed_at must be set when task is marked as completed');
  }
  
  if (task.is_completed === false && task.completed_at) {
    errors.push('completed_at must be null when task is not completed');
  }
  
  return errors;
}

/**
 * Validate due date is in the future for new tasks
 */
export function validateDueDate(due_date?: string): string[] {
  const errors: string[] = [];
  
  if (due_date) {
    const dueDate = new Date(due_date);
    const now = new Date();
    
    if (dueDate <= now) {
      errors.push('due_date must be in the future');
    }
  }
  
  return errors;
}

/**
 * Validate task data against database constraints
 */
export function validateDatabaseConstraints(data: Partial<Task>): string[] {
  const errors: string[] = [];
  
  // Title constraints
  if (data.title !== undefined) {
    if (data.title.length < TASK_CONSTRAINTS.TITLE.MIN_LENGTH) {
      errors.push(`Title must be at least ${TASK_CONSTRAINTS.TITLE.MIN_LENGTH} character`);
    }
    if (data.title.length > TASK_CONSTRAINTS.TITLE.MAX_LENGTH) {
      errors.push(`Title must be no more than ${TASK_CONSTRAINTS.TITLE.MAX_LENGTH} characters`);
    }
  }
  
  // Description constraints
  if (data.description !== undefined && data.description.length > TASK_CONSTRAINTS.DESCRIPTION.MAX_LENGTH) {
    errors.push(`Description must be no more than ${TASK_CONSTRAINTS.DESCRIPTION.MAX_LENGTH} characters`);
  }
  
  // Category constraints
  if (data.category !== undefined && !TASK_CONSTRAINTS.CATEGORY.ALLOWED_VALUES.includes(data.category)) {
    errors.push(`Category must be one of: ${TASK_CONSTRAINTS.CATEGORY.ALLOWED_VALUES.join(', ')}`);
  }
  
  // Priority constraints
  if (data.priority !== undefined && !TASK_CONSTRAINTS.PRIORITY.ALLOWED_VALUES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${TASK_CONSTRAINTS.PRIORITY.ALLOWED_VALUES.join(', ')}`);
  }
  
  return errors;
}

/**
 * Comprehensive validation for task operations
 */
export function validateTaskOperation(
  operation: 'create' | 'update',
  data: unknown
): { success: true; data: TaskCreateInput | TaskUpdateInput } | { success: false; errors: string[] } {
  let validationResult;
  let validatedData;
  
  if (operation === 'create') {
    validationResult = validateTaskCreateInput(data);
    if (!validationResult.success) {
      return validationResult;
    }
    validatedData = validationResult.data;
  } else {
    validationResult = validateTaskUpdateInput(data);
    if (!validationResult.success) {
      return validationResult;
    }
    validatedData = validationResult.data;
  }
  
  // Additional business logic validation
  const completionErrors = validateTaskCompletion(validatedData);
  const dueDateErrors = operation === 'create' ? validateDueDate(validatedData.due_date) : [];
  const constraintErrors = validateDatabaseConstraints(validatedData);
  
  const allErrors = [...completionErrors, ...dueDateErrors, ...constraintErrors];
  
  if (allErrors.length > 0) {
    return { success: false, errors: allErrors };
  }
  
  return { success: true, data: validatedData };
}

// ============================================================================
// EXPORT VALIDATION UTILITIES
// ============================================================================

export const validation = {
  // Core schemas
  TaskSchema,
  TaskDbRecordSchema,
  TaskCreateInputSchema,
  TaskUpdateInputSchema,
  TaskFilterOptionsSchema,
  TaskSortOptionsSchema,
  
  // Validation functions
  validateTask,
  validateTaskCreateInput,
  validateTaskUpdateInput,
  validateTaskDbRecord,
  validateTaskFilterOptions,
  validateTaskSortOptions,
  validateTaskOperation,
  
  // Business logic validation
  validateTaskCompletion,
  validateDueDate,
  validateDatabaseConstraints,
  
  // Response schemas
  ApiResponseSchema,
  PaginatedResponseSchema,
  TaskOperationResultSchema,
  BulkOperationResultSchema,
  
  // Analytics schemas
  TaskStatsSchema,
  TaskActivitySchema
};