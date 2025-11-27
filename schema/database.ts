/**
 * Database Schema Definition for TaskMaster-Demo
 * 
 * This file contains the SQL schema definitions that match the unified schema.
 * It serves as documentation and validation for database structure.
 */

import type { TaskDbRecord } from './unified-schema';

// ============================================================================
// TABLE DEFINITIONS
// ============================================================================

/**
 * Tasks table SQL definition
 * This matches the TaskDbRecord interface exactly
 */
export const TASKS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT CHECK (length(description) <= 1000),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  category TEXT CHECK (category IN ('Work', 'Personal', 'Shopping', 'Health')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  user_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

/**
 * Indexes for optimal query performance
 */
export const TASKS_INDEXES_SQL = `
-- Index for ordering by creation date (most common query)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at_desc ON tasks (created_at DESC);

-- Composite index for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_composite_filter ON tasks (
  is_completed, 
  category, 
  priority, 
  due_date
);

-- Index for user-specific queries (future multi-user support)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id) WHERE user_id IS NOT NULL;

-- Index for due date queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date) WHERE due_date IS NOT NULL;

-- Index for overdue tasks
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks (due_date, is_completed) 
WHERE due_date IS NOT NULL AND is_completed = FALSE;
`;

/**
 * Triggers for automatic timestamp updates
 */
export const TASKS_TRIGGERS_SQL = `
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row changes
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to set completed_at when task is marked as completed
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If task is being marked as completed and completed_at is not set
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- If task is being marked as incomplete, clear completed_at
  IF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to handle completion timestamps
CREATE TRIGGER handle_tasks_completion 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_task_completion();
`;

/**
 * Row Level Security (RLS) policies for multi-user support
 */
export const TASKS_RLS_SQL = `
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy for public access (demo mode - allows all operations)
CREATE POLICY "Public access for demo" ON tasks
  FOR ALL USING (true)
  WITH CHECK (true);

-- Future user-specific policies (commented out for demo)
/*
-- Policy for authenticated users to see only their tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own tasks
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for authenticated users to delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
*/
`;

// ============================================================================
// COMPLETE SCHEMA SETUP
// ============================================================================

/**
 * Complete database setup script
 */
export const COMPLETE_SCHEMA_SQL = `
${TASKS_TABLE_SQL}

${TASKS_INDEXES_SQL}

${TASKS_TRIGGERS_SQL}

${TASKS_RLS_SQL}
`;

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

/**
 * Database schema metadata for validation
 */
export const DATABASE_SCHEMA = {
  tables: {
    tasks: {
      columns: {
        id: { type: 'BIGSERIAL', nullable: false, primary: true },
        title: { type: 'TEXT', nullable: false, constraints: ['length >= 1', 'length <= 200'] },
        description: { type: 'TEXT', nullable: true, constraints: ['length <= 1000'] },
        is_completed: { type: 'BOOLEAN', nullable: false, default: false },
        created_at: { type: 'TIMESTAMPTZ', nullable: false, default: 'NOW()' },
        completed_at: { type: 'TIMESTAMPTZ', nullable: true },
        due_date: { type: 'TIMESTAMPTZ', nullable: true },
        category: { type: 'TEXT', nullable: true, enum: ['Work', 'Personal', 'Shopping', 'Health'] },
        priority: { type: 'TEXT', nullable: false, default: 'medium', enum: ['low', 'medium', 'high', 'urgent'] },
        user_id: { type: 'UUID', nullable: true },
        updated_at: { type: 'TIMESTAMPTZ', nullable: false, default: 'NOW()' }
      },
      indexes: [
        'idx_tasks_created_at_desc',
        'idx_tasks_composite_filter',
        'idx_tasks_user_id',
        'idx_tasks_due_date',
        'idx_tasks_overdue'
      ],
      triggers: [
        'update_tasks_updated_at',
        'handle_tasks_completion'
      ]
    }
  }
} as const;

/**
 * Type guard to validate database record structure
 */
export function isDatabaseRecord(obj: any): obj is TaskDbRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    (obj.description === null || typeof obj.description === 'string') &&
    typeof obj.is_completed === 'boolean' &&
    typeof obj.created_at === 'string' &&
    (obj.completed_at === null || typeof obj.completed_at === 'string') &&
    (obj.due_date === null || typeof obj.due_date === 'string') &&
    (obj.category === null || typeof obj.category === 'string') &&
    typeof obj.priority === 'string' &&
    (obj.user_id === null || typeof obj.user_id === 'string') &&
    typeof obj.updated_at === 'string'
  );
}

/**
 * Validate that a database record matches the expected schema
 */
export function validateDatabaseRecord(record: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isDatabaseRecord(record)) {
    errors.push('Record does not match TaskDbRecord interface');
    return { valid: false, errors };
  }
  
  // Additional validation
  if (record.title.length === 0 || record.title.length > 200) {
    errors.push('Title must be between 1 and 200 characters');
  }
  
  if (record.description && record.description.length > 1000) {
    errors.push('Description must be no more than 1000 characters');
  }
  
  const validCategories = ['Work', 'Personal', 'Shopping', 'Health'];
  if (record.category && !validCategories.includes(record.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }
  
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(record.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Generate migration SQL for schema changes
 */
export function generateMigrationSQL(changes: string[]): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const filename = `${timestamp}_schema_changes.sql`;
  
  return `-- Migration: ${filename}
-- Generated: ${new Date().toISOString()}

BEGIN;

${changes.join('\n\n')}

COMMIT;
`;
}

/**
 * Sample data for testing and development
 */
export const SAMPLE_DATA_SQL = `
-- Insert sample tasks for development and testing
INSERT INTO tasks (title, description, is_completed, due_date, category, priority) VALUES
  ('Complete project documentation', 'Write comprehensive documentation for the TaskMaster project', false, '2025-12-01 17:00:00+00', 'Work', 'high'),
  ('Buy groceries', 'Milk, bread, eggs, and vegetables for the week', false, '2025-11-28 18:00:00+00', 'Shopping', 'medium'),
  ('Schedule dentist appointment', 'Annual checkup and cleaning', false, '2025-12-15 10:00:00+00', 'Health', 'low'),
  ('Plan weekend trip', 'Research destinations and book accommodation', false, '2025-12-05 12:00:00+00', 'Personal', 'medium'),
  ('Review code changes', 'Review and approve pending pull requests', true, '2025-11-27 16:00:00+00', 'Work', 'urgent'),
  ('Exercise routine', 'Complete 30-minute workout session', true, '2025-11-27 07:00:00+00', 'Health', 'medium');
`;