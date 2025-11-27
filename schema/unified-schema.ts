/**
 * Unified Schema System for TaskMaster-Demo
 * 
 * This file serves as the single source of truth for all data structures
 * across frontend, backend, API, and database layers.
 */

// ============================================================================
// CORE ENUMS
// ============================================================================

export const TaskCategory = {
  WORK: 'Work',
  PERSONAL: 'Personal', 
  SHOPPING: 'Shopping',
  HEALTH: 'Health'
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const FilterType = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
} as const;

export const SortType = {
  CREATED: 'created',
  DUE: 'due',
  TITLE: 'title',
  PRIORITY: 'priority'
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TaskCategory = typeof TaskCategory[keyof typeof TaskCategory];
export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];
export type FilterType = typeof FilterType[keyof typeof FilterType];
export type SortType = typeof SortType[keyof typeof SortType];

// ============================================================================
// CORE TASK INTERFACE
// ============================================================================

/**
 * Core Task interface - matches database schema exactly
 * This is the complete task structure used across all layers
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  due_date?: string;
  category?: TaskCategory;
  priority: TaskPriority;
  user_id?: string;
  updated_at: string;
}

/**
 * Database record interface - exactly matches PostgreSQL table structure
 * Used for type-safe database operations
 */
export interface TaskDbRecord {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  due_date: string | null;
  category: TaskCategory | null;
  priority: TaskPriority;
  user_id: string | null;
  updated_at: string;
}

// ============================================================================
// INPUT/OUTPUT INTERFACES
// ============================================================================

/**
 * Task creation input - excludes auto-generated fields
 */
export interface TaskCreateInput {
  title: string;
  description?: string;
  due_date?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  user_id?: string;
}

/**
 * Task update input - all fields optional except constraints
 */
export interface TaskUpdateInput {
  title?: string;
  description?: string;
  is_completed?: boolean;
  completed_at?: string;
  due_date?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  user_id?: string;
}

/**
 * Task filter options for querying
 */
export interface TaskFilterOptions {
  category?: TaskCategory;
  priority?: TaskPriority;
  is_completed?: boolean;
  user_id?: string;
  due_before?: string;
  due_after?: string;
}

/**
 * Task sorting options
 */
export interface TaskSortOptions {
  field: SortType;
  direction: 'asc' | 'desc';
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Task operation result
 */
export interface TaskOperationResult extends ApiResponse<Task> {
  task?: Task;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult extends ApiResponse {
  affected: number;
  failed: number;
  errors?: string[];
}

// ============================================================================
// ANALYTICS & STATS INTERFACES
// ============================================================================

/**
 * Task statistics for dashboard/analytics
 */
export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
  completionRate: number;
  averageCompletionTime?: number; // in hours
}

/**
 * Task activity summary
 */
export interface TaskActivity {
  date: string;
  created: number;
  completed: number;
  updated: number;
  deleted: number;
}

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================

/**
 * Field validation constraints - matches database constraints
 */
export const TASK_CONSTRAINTS = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  CATEGORY: {
    ALLOWED_VALUES: Object.values(TaskCategory)
  },
  PRIORITY: {
    ALLOWED_VALUES: Object.values(TaskPriority),
    DEFAULT: TaskPriority.MEDIUM
  }
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility type for creating new tasks (excludes system fields)
 */
export type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  is_completed?: boolean;
};

/**
 * Utility type for task updates (excludes immutable fields)
 */
export type TaskUpdate = Omit<Partial<Task>, 'id' | 'created_at'>;

/**
 * Utility type for task display (frontend optimized)
 */
export type TaskDisplay = Task & {
  isOverdue?: boolean;
  timeUntilDue?: string;
  formattedDueDate?: string;
  priorityColor?: string;
  categoryIcon?: string;
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if value is a valid TaskCategory
 */
export function isTaskCategory(value: any): value is TaskCategory {
  return Object.values(TaskCategory).includes(value);
}

/**
 * Type guard to check if value is a valid TaskPriority
 */
export function isTaskPriority(value: any): value is TaskPriority {
  return Object.values(TaskPriority).includes(value);
}

/**
 * Type guard to check if value is a valid FilterType
 */
export function isFilterType(value: any): value is FilterType {
  return Object.values(FilterType).includes(value);
}

/**
 * Type guard to check if value is a valid SortType
 */
export function isSortType(value: any): value is SortType {
  return Object.values(SortType).includes(value);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new task with default values
 */
export function createTaskDefaults(input: TaskCreateInput): NewTask {
  return {
    title: input.title,
    description: input.description,
    is_completed: false,
    due_date: input.due_date,
    category: input.category,
    priority: input.priority || TaskPriority.MEDIUM,
    user_id: input.user_id
  };
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date || task.is_completed) return false;
  return new Date(task.due_date) < new Date();
}

/**
 * Get priority order for sorting
 */
export function getPriorityOrder(priority: TaskPriority): number {
  const order = {
    [TaskPriority.URGENT]: 4,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1
  };
  return order[priority];
}

/**
 * Format task for API response
 */
export function formatTaskForApi(dbRecord: TaskDbRecord): Task {
  return {
    id: dbRecord.id,
    title: dbRecord.title,
    description: dbRecord.description || undefined,
    is_completed: dbRecord.is_completed,
    created_at: dbRecord.created_at,
    completed_at: dbRecord.completed_at || undefined,
    due_date: dbRecord.due_date || undefined,
    category: dbRecord.category || undefined,
    priority: dbRecord.priority,
    user_id: dbRecord.user_id || undefined,
    updated_at: dbRecord.updated_at
  };
}

/**
 * Format task for database insertion
 */
export function formatTaskForDb(task: TaskCreateInput): Omit<TaskDbRecord, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: task.title,
    description: task.description || null,
    is_completed: false,
    completed_at: null,
    due_date: task.due_date || null,
    category: task.category || null,
    priority: task.priority || TaskPriority.MEDIUM,
    user_id: task.user_id || null
  };
}
