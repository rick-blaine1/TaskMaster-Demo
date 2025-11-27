/*
  # Create Tasks Table

  1. New Tables
    - `tasks`
      - `id` (bigserial, primary key) - Auto-incrementing task ID
      - `title` (text, not null) - Task title (max 200 chars enforced by constraint)
      - `description` (text, nullable) - Task description (max 1000 chars enforced by constraint)
      - `is_completed` (boolean, default false) - Task completion status
      - `created_at` (timestamptz, default now()) - Creation timestamp
      - `completed_at` (timestamptz, nullable) - Completion timestamp
      - `due_date` (timestamptz, nullable) - Due date
      - `category` (text, nullable) - Task category (Work, Personal, Shopping, Health)
      - `user_id` (uuid, nullable) - User who created the task (for future auth)
  
  2. Security
    - Enable RLS on `tasks` table
    - Add policy for public read access (demo mode)
    - Add policy for public write access (demo mode)
    - Add policy for public update access (demo mode)
    - Add policy for public delete access (demo mode)
  
  3. Indexes
    - Index on `is_completed` for filtering
    - Index on `category` for filtering
    - Index on `due_date` for sorting
  
  4. Constraints
    - Title length: 1-200 characters
    - Description length: max 1000 characters
    - Category: Must be one of the allowed values
*/

CREATE TABLE IF NOT EXISTS tasks (
  id bigserial PRIMARY KEY,
  title text NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description text CHECK (description IS NULL OR char_length(description) <= 1000),
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  due_date timestamptz,
  category text CHECK (category IS NULL OR category IN ('Work', 'Personal', 'Shopping', 'Health')),
  user_id uuid
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

INSERT INTO tasks (title, description, is_completed, created_at, completed_at, due_date, category) VALUES
  ('Complete workshop setup', 'Install VS Code, .NET SDK, and configure AI tools', true, '2025-01-15T10:00:00Z', '2025-01-15T15:30:00Z', '2025-01-15T17:00:00Z', 'Work'),
  ('Build TaskMaster API', 'Create CRUD endpoints', false, '2025-01-15T11:00:00Z', NULL, '2025-01-16T12:00:00Z', 'Work'),
  ('Grocery shopping', 'Buy ingredients for dinner party', false, '2025-01-15T14:00:00Z', NULL, '2025-01-16T18:00:00Z', 'Shopping')
ON CONFLICT DO NOTHING;